import { cookies } from "next/headers";
import { PageHead } from "../AdminUI";
import { PROFITS_COOKIE, verifyProfitsToken } from "@/lib/adminAuth";
import UnlockForm from "../profits/UnlockForm";
import { getAccounting } from "./data";
import AccountingClient from "./AccountingClient";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const unlocked = await verifyProfitsToken((await cookies()).get(PROFITS_COOKIE)?.value);
  if (!unlocked) {
    return (
      <>
        <PageHead eyebrow="Restricted" title="Accounting" desc="Every service, what it earned, and who owes whom — for your eyes only." />
        <UnlockForm next="/admin/accounting" title="Accounting is locked" />
      </>
    );
  }
  const data = await getAccounting();
  return (
    <>
      <PageHead
        eyebrow="Restricted"
        title="Accounting"
        desc="Built automatically from your bookings, airport transfers and TutCasa — every service once, with its cost, fees, commission and profit. Edit any line to correct it."
      />
      <AccountingClient {...data} />
    </>
  );
}
