import Link from "next/link";
import { PageHead } from "./AdminUI";
import { extractBookingEvents, fmtMXN, getAllOrders, getCustomers, isSale } from "./dashboard-data";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/admin/hero", title: "Hero & Home", desc: "Slideshow images, captions and homepage text." },
  { href: "/admin/packages", title: "Packages", desc: "Names, taglines, prices, what's included and photos." },
  { href: "/admin/tours", title: "Tours", desc: "Tour prices, durations, descriptions and images." },
  { href: "/admin/activities", title: "Activities", desc: "Destination photos and descriptions." },
  { href: "/admin/addons", title: "Add-ons", desc: "Extra experiences, prices, offers and units." },
  { href: "/admin/about", title: "About Page", desc: "Your story, values and closing section." },
  { href: "/admin/faq", title: "FAQ", desc: "Questions & answers on home, tours and packages." },
  { href: "/admin/promos", title: "Promo Codes", desc: "Discount codes shown at checkout." },
  { href: "/admin/currency", title: "Currency & Rates", desc: "Default currency and conversion rates." },
  { href: "/admin/transfers", title: "Airport Transfers", desc: "Transfer pricing, group rates and conditions." },
  { href: "/admin/costs", title: "Costs", desc: "Your cost per item — feeds the Profits section." },
  { href: "/admin/contact", title: "Contact & Social", desc: "Phone, WhatsApp, email, address and social links." },
  { href: "/admin/emails", title: "Emails", desc: "Automated email templates for bookings and quotes." },
  { href: "/admin/legal", title: "Legal Pages", desc: "Terms, Privacy Policy and Liability Waiver." },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[16px] border border-sand bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-sage">{label}</div>
      <div className="mt-1.5 font-serif text-[26px] font-semibold leading-none text-ink">{value}</div>
      {sub && <div className="mt-1.5 text-[12px] text-sage">{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const [orders, customers] = await Promise.all([getAllOrders(), getCustomers()]);

  const sales = orders.filter(isSale);
  const paid = orders.filter((o) => o.status.startsWith("Paid"));
  const pending = orders.filter((o) => o.status.startsWith("Pending"));
  const revenue = sales.reduce((s, o) => s + o.total, 0);
  const avg = sales.length ? Math.round(revenue / sales.length) : 0;

  // Calendar month (defaults to the current month; ?m=YYYY-MM to navigate).
  const now = new Date();
  const [y, mo] = /^\d{4}-\d{2}$/.test(m ?? "")
    ? (m as string).split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const monthKey = `${y}-${String(mo).padStart(2, "0")}`;
  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(y, mo, 0).getDate();
  const firstWeekday = (new Date(y, mo - 1, 1).getDay() + 6) % 7; // Monday-first

  const events = extractBookingEvents(orders);
  const byDay = new Map<number, { orderId: string; label: string }[]>();
  for (const e of events) {
    if (!e.date.startsWith(monthKey)) continue;
    const day = Number(e.date.slice(8));
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push({ orderId: e.orderId, label: e.label });
  }
  const todayKey = now.getFullYear() === y && now.getMonth() + 1 === mo ? now.getDate() : -1;

  const recent = orders.slice(0, 5);

  return (
    <>
      <PageHead
        eyebrow="Overview"
        title="Your business at a glance"
        desc="Live numbers from your website — bookings, revenue and customers update the moment they happen."
      />

      {/* Stats */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Orders" value={String(sales.length)} sub={`${pending.length} pending`} />
        <StatCard label="Revenue" value={fmtMXN(revenue)} sub="excl. cancelled" />
        <StatCard label="Paid orders" value={String(paid.length)} />
        <StatCard label="Avg order" value={sales.length ? fmtMXN(avg) : "—"} />
        <StatCard label="Customers" value={String(customers.length)} sub="registered accounts" />
        <StatCard label="Visitors" value="—" sub="activates at deploy (analytics)" />
      </div>

      {/* Calendar */}
      <div className="mt-6 rounded-[18px] border border-sand bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[20px] font-semibold text-ink">
            Bookings calendar — {MONTHS[mo - 1]} {y}
          </h2>
          <div className="flex gap-2">
            <Link
              href={`/admin?m=${prev}`}
              className="rounded-full border border-sand px-3.5 py-1.5 text-[12.5px] font-medium text-sage transition hover:border-forest hover:text-forest"
            >
              ← {MONTHS[(mo + 10) % 12].slice(0, 3)}
            </Link>
            <Link
              href={`/admin?m=${next}`}
              className="rounded-full border border-sand px-3.5 py-1.5 text-[12.5px] font-medium text-sage transition hover:border-forest hover:text-forest"
            >
              {MONTHS[mo % 12].slice(0, 3)} →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10.5px] font-semibold uppercase tracking-wide text-sage">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="pb-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = byDay.get(day) ?? [];
            return (
              <div
                key={day}
                className={`min-h-[64px] rounded-lg border p-1.5 text-left ${
                  day === todayKey ? "border-forest bg-forest/5" : "border-sand/70 bg-cream/40"
                }`}
              >
                <div className={`text-[11px] font-semibold ${day === todayKey ? "text-forest" : "text-sage"}`}>
                  {day}
                </div>
                {dayEvents.slice(0, 2).map((e, j) => (
                  <Link
                    key={`${e.orderId}-${j}`}
                    href="/admin/orders"
                    title={`${e.orderId} — ${e.label}`}
                    className="mt-0.5 block truncate rounded bg-terracotta/15 px-1 py-0.5 text-[10px] font-medium leading-tight text-terracotta hover:bg-terracotta/25"
                  >
                    {e.label}
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <div className="mt-0.5 text-[9.5px] text-sage">+{dayEvents.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
        {events.length === 0 && (
          <p className="mt-3 text-[12.5px] text-sage">
            No dated bookings yet — when customers book tours or packages with dates, they appear
            here automatically.
          </p>
        )}
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-[18px] border border-sand bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[20px] font-semibold text-ink">Latest orders</h2>
          <Link href="/admin/orders" className="text-[12.5px] font-semibold text-forest underline underline-offset-2">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-[13px] text-sage">
            No orders yet — they&apos;ll show up here the moment someone books.
          </p>
        ) : (
          <div className="divide-y divide-sand">
            {recent.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-[13px]">
                <span className="font-mono font-semibold text-ink">{o.id}</span>
                <span className="text-sage">
                  {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-ink">{o.customer_name}</span>
                <span className="ml-auto font-semibold text-ink">{fmtMXN(o.total)}</span>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10.5px] font-semibold text-[#8a6a1e]">
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content sections */}
      <h2 className="mb-3 mt-8 font-serif text-[20px] font-semibold text-ink">Manage your site</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-[16px] border border-sand bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[0_14px_36px_rgba(28,43,30,0.10)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[19px] font-semibold text-ink">{s.title}</h3>
              <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-sage">{s.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
