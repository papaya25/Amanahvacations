import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth.server";
import InvoiceSheet from "@/components/InvoiceSheet";
import { docFileName } from "@/lib/invoiceDoc";
import { getDocument } from "../../admin/invoices/actions";
import PrintBar from "./PrintBar";

/* The invoice/quote alone on the page → the browser's "Save as PDF".
   Outside /admin so the admin menu isn't printed; login checked here. */

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const doc = await getDocument((await params).id);
  return { title: doc ? docFileName(doc.kind, doc.folio, doc.data) : "Amanah", robots: { index: false, follow: false } };
}

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) redirect("/admin-login");
  const doc = await getDocument((await params).id);
  if (!doc) notFound();
  return (
    <div className="min-h-screen bg-[#e9e3da] pb-6 print:bg-transparent print:p-0">
      <PrintBar />
      <div className="mx-auto mt-6 w-fit print:mt-0">
        <InvoiceSheet kind={doc.kind} folio={doc.folio} d={doc.data} />
      </div>
    </div>
  );
}
