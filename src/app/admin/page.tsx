"use client";

import Link from "next/link";
import { PageHead } from "./AdminUI";

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
  { href: "/admin/costs", title: "Costs", desc: "Your cost per item — feeds the profit dashboard." },
  { href: "/admin/contact", title: "Contact & Social", desc: "Phone, WhatsApp, email, address and social links." },
  { href: "/admin/emails", title: "Emails", desc: "Automated email templates for bookings and quotes." },
  { href: "/admin/legal", title: "Legal Pages", desc: "Terms, Privacy Policy and Liability Waiver." },
];

export default function AdminDashboard() {
  return (
    <>
      <PageHead
        eyebrow="Amanah Admin"
        title="Manage your site — no code needed"
        desc="Everything on the public website is editable here. Pick a section to update text, prices, images and settings."
      />

      <div className="mb-6 rounded-[16px] border border-[#f0dfa0] bg-[#fffdf5] px-5 py-4 text-[13px] leading-[1.65] text-[#7a5a1e]">
        <strong className="text-[#5a3e10]">You&apos;re in preview mode.</strong> Edits you save here
        are stored in this browser so you can lay everything out. Connecting the backend (next phase)
        makes these changes go live on the real site and syncs across devices.
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-[16px] border border-sand bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[0_14px_36px_rgba(28,43,30,0.10)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-[19px] font-semibold text-ink">{s.title}</h2>
              <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-sage">{s.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
