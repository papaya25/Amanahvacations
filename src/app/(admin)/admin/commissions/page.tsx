import { getCommissionData } from "./data";
import CommissionsClient from "./CommissionsClient";
import { PageHead } from "../AdminUI";

// Always compute from the latest orders.
export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const { owedTo, owedBy, rateUSD } = await getCommissionData();
  return (
    <>
      <PageHead
        eyebrow="Commerce"
        title="Partner Commissions"
        desc="What we owe TutCasa (5% on tours & activities for groups up to 2, 10% for 3+) for customers they send us — detected automatically via their ?ref=tutcasa links, plus manual entries for referrals outside the website. And what TutCasa owes us: 10% of every paid TutCasa stay booked here. Grouped by booking month."
      />
      <CommissionsClient owedTo={owedTo} owedBy={owedBy} rateUSD={rateUSD} />
    </>
  );
}
