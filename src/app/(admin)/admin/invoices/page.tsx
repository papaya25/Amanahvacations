import { PageHead } from "../AdminUI";
import { listDocuments } from "./actions";
import InvoicesClient from "./InvoicesClient";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const docs = await listDocuments();
  return (
    <>
      <PageHead
        eyebrow="Sales"
        title="Invoices & Quotes"
        desc="Booking confirmations (AV folio) and quotes in your Amanah layout. Make one from a booking in Orders & Bookings, or from scratch here for customized tours."
      />
      <InvoicesClient docs={docs} />
    </>
  );
}
