import { redirect } from "next/navigation";

// Commissions now live in Accounting (with payments and balances).
export default function CommissionsPage() {
  redirect("/admin/accounting");
}
