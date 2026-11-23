import { listTransfers } from "./actions";
import TransfersClient from "./TransfersClient";
import { PageHead } from "../AdminUI";
import { getPartners } from "@/lib/content/partners";

// The queue must always show the latest pushed jobs.
export const dynamic = "force-dynamic";

export default async function TutcasaTransfersPage() {
  const [jobs, partners] = await Promise.all([listTransfers(), getPartners()]);
  return (
    <>
      <PageHead
        eyebrow="Partner"
        title="Airport Transfers"
        desc="Every airport transfer in one queue: TutCasa pushes its jobs here automatically, and you can add any other transfer manually. Confirmed transfers appear on the dashboard calendar, and the day before each one you get a reminder email with a one-tap WhatsApp button. Mark Done after the ride."
      />
      <TransfersClient initialJobs={jobs ?? []} partnerNames={partners.map((p) => p.name)} />
    </>
  );
}
