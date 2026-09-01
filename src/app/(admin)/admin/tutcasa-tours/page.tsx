import { listTourBookings } from "./actions";
import ToursQueueClient from "./ToursQueueClient";
import { PageHead } from "../AdminUI";

// The queue must always show the latest pushed bookings.
export const dynamic = "force-dynamic";

export default async function TutcasaToursPage() {
  const jobs = await listTourBookings();
  return (
    <>
      <PageHead
        eyebrow="Partner"
        title="TutCasa Tour Bookings"
        desc="Every tour booked on TutCasa lands here the moment it happens (plus the email + WhatsApp fallback). Accept when you can operate it, Deny if not, or Ask for details — your decision shows on TutCasa's admin instantly."
      />
      <ToursQueueClient initialJobs={jobs} />
    </>
  );
}
