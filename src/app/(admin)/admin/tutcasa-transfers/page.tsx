import { listTransfers } from "./actions";
import TransfersClient from "./TransfersClient";
import { PageHead } from "../AdminUI";

// The queue must always show the latest pushed jobs.
export const dynamic = "force-dynamic";

export default async function TutcasaTransfersPage() {
  const jobs = (await listTransfers()) ?? [];
  return (
    <>
      <PageHead
        eyebrow="Partner"
        title="TutCasa Transfers"
        desc="Free arrival transfers included with TutCasa bookings, fulfilled by Amanah. TutCasa pushes each job here (and emails a fallback copy). Work the queue: Confirm when scheduled, ask for details when something's missing (the guest sees your note and re-submits), and mark Done after pickup. Guests message us only via their prefilled WhatsApp link with the TC reference."
      />
      <TransfersClient initialJobs={jobs} />
    </>
  );
}
