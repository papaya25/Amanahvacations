import { PageHead } from "../AdminUI";
import { getAllOrders, getCustomers } from "../dashboard-data";
import CopyEmails from "./CopyEmails";

export const dynamic = "force-dynamic";

export default async function CustomersAdminPage() {
  const [customers, orders] = await Promise.all([getCustomers(), getAllOrders()]);

  const orderCount = new Map<string, number>();
  for (const o of orders) {
    const key = o.user_id ?? `email:${o.customer_email.toLowerCase()}`;
    orderCount.set(key, (orderCount.get(key) ?? 0) + 1);
  }
  const countFor = (id: string, email: string) =>
    (orderCount.get(id) ?? 0) + (orderCount.get(`email:${email.toLowerCase()}`) ?? 0);

  const emails = customers.map((c) => c.email).filter(Boolean);

  return (
    <>
      <PageHead
        eyebrow="Overview"
        title="Customers"
        desc="Everyone with an account on your website — your audience for newsletters and offers. Copy the emails below into your mail tool when you want to send a campaign."
      />

      {customers.length > 0 && (
        <div className="mb-5">
          <CopyEmails emails={emails} />
        </div>
      )}

      {customers.length === 0 ? (
        <div className="rounded-[20px] border border-sand bg-white px-6 py-14 text-center">
          <p className="font-serif text-[22px] font-semibold text-ink">No registered customers yet</p>
          <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-[1.7] text-sage">
            When visitors create an account on your website, they appear here with their email —
            ready for newsletters and special offers.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[18px] border border-sand bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-sand text-[11px] uppercase tracking-[1.5px] text-sage">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Confirmed</th>
                <th className="px-5 py-3 text-right font-semibold">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/70">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-ink">{c.name || "—"}</td>
                  <td className="px-5 py-3">
                    <a href={`mailto:${c.email}`} className="text-forest underline underline-offset-2">
                      {c.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-sage">
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">{c.confirmed ? "✓" : "pending"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">
                    {countFor(c.id, c.email)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
