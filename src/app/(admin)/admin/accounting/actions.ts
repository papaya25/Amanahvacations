"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { PROFITS_COOKIE, verifyProfitsToken } from "@/lib/adminAuth";
import { EMPTY_BOOK, parseStripeRef, type AcctOverrides, type Book, type Expense, type LedgerEntry, type Payment } from "@/lib/accounting";

type Res = { ok: boolean; error?: string };

/** Accounting is behind the admin login AND the Profits password. */
async function allowed(): Promise<boolean> {
  if (!(await isAdminRequest())) return false;
  return verifyProfitsToken((await cookies()).get(PROFITS_COOKIE)?.value);
}

async function readBook(): Promise<Book> {
  const { data } = await createAdminClient().from("site_content").select("data").eq("key", "accounting").maybeSingle();
  return { ...EMPTY_BOOK, ...((data?.data as Partial<Book>) ?? {}) };
}

async function writeBook(book: Book): Promise<Res> {
  const { error } = await createAdminClient().from("site_content").upsert({ key: "accounting", data: book }, { onConflict: "key" });
  revalidatePath("/admin/accounting");
  return error ? { ok: false, error: error.message } : { ok: true };
}

type ListName = "entries" | "payments" | "expenses";
type ListItem = { entries: LedgerEntry; payments: Payment; expenses: Expense };

export async function bookAdd<L extends ListName>(list: L, item: Omit<ListItem[L], "id">): Promise<Res> {
  if (!(await allowed())) return { ok: false, error: "Session expired — unlock Profits again." };
  const book = await readBook();
  (book[list] as ListItem[L][]).push({ ...item, id: `${list[0]}-${Date.now()}` } as ListItem[L]);
  return writeBook(book);
}

export async function bookDelete(list: ListName, id: string): Promise<Res> {
  if (!(await allowed())) return { ok: false, error: "Session expired — unlock Profits again." };
  const book = await readBook();
  book[list] = (book[list] as { id: string }[]).filter((x) => x.id !== id) as never;
  return writeBook(book);
}

export async function bookUpdate(list: "payments" | "expenses", id: string, patch: { receipt: string }): Promise<Res> {
  if (!(await allowed())) return { ok: false, error: "Session expired — unlock Profits again." };
  const book = await readBook();
  book[list] = (book[list] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) as never;
  return writeBook(book);
}

/** Receipt photo/PDF → private "receipts" bucket (viewable only via short-lived admin links). */
const RECEIPT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "application/pdf": "pdf",
};
export async function uploadReceipt(formData: FormData): Promise<Res & { path?: string }> {
  if (!(await allowed())) return { ok: false, error: "Session expired — unlock Profits again." };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  const ext = RECEIPT_TYPES[file.type];
  if (!ext) return { ok: false, error: "Please choose a photo (JPG, PNG, HEIC) or a PDF." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "File too large (max 10 MB)." };
  const path = `${new Date().toISOString().slice(0, 7)}/${Date.now()}.${ext}`;
  const { error } = await createAdminClient().storage.from("receipts").upload(path, file, { contentType: file.type });
  if (error) {
    console.error("uploadReceipt:", error.message);
    return { ok: false, error: "Upload failed. Please try again." };
  }
  return { ok: true, path };
}

export async function setTaxRate(rate: number): Promise<Res> {
  if (!(await allowed())) return { ok: false, error: "Session expired — unlock Profits again." };
  if (!(rate >= 0 && rate <= 100)) return { ok: false, error: "Tax rate must be between 0 and 100." };
  return writeBook({ ...(await readBook()), taxRate: rate });
}

/** Save edits from the log. Keys: o:<order>, t:<transfer>, e:<entry>.
    `null` clears an override (back to the automatic value). */
export async function saveRow(
  key: string,
  patch: Partial<Record<keyof AcctOverrides | keyof LedgerEntry, string | number | null>>
): Promise<Res> {
  if (!(await allowed())) return { ok: false, error: "Session expired — unlock Profits again." };
  const [kind, id] = [key.slice(0, 1), key.slice(2)];

  if (kind === "e") {
    const book = await readBook();
    const i = book.entries.findIndex((e) => e.id === id);
    if (i < 0) return { ok: false, error: "Entry not found." };
    book.entries[i] = { ...book.entries[i], ...(patch as Partial<LedgerEntry>) };
    return writeBook(book);
  }

  const table = kind === "o" ? "orders" : kind === "t" ? "tutcasa_transfers" : null;
  if (!table) return { ok: false, error: "Unknown row." };
  const idCol = kind === "o" ? "id" : "transfer_id";
  const supabase = createAdminClient();
  const { data: row, error: readErr } = await supabase.from(table).select("acct").eq(idCol, id).maybeSingle();
  if (readErr || !row) return { ok: false, error: "Row not found." };

  const acct: Record<string, unknown> = { ...((row.acct as object) ?? {}) };
  const columns: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    // Transfers keep provider / price / method in their own columns (the
    // transfers page shows them) — everything else is an accounting override.
    if (kind === "t" && k === "provider") columns.provider = v || null;
    else if (kind === "t" && k === "charged") columns.price = v || null;
    else if (kind === "t" && k === "method") columns.payment_method = v || null;
    else if (k === "stripeRef" && parseStripeRef(String(v))) acct.stripeRef = parseStripeRef(String(v));
    else if (v === null || v === "") delete acct[k];
    else acct[k] = v;
  }
  // A new Stripe id or a hand-typed fee replaces the fee read from Stripe.
  if ("stripeRef" in patch || "fee" in patch) {
    delete acct.feeExact;
    delete acct.received;
  }
  const { error } = await supabase.from(table).update({ ...columns, acct }).eq(idCol, id);
  revalidatePath("/admin/accounting");
  return error ? { ok: false, error: error.message } : { ok: true };
}
