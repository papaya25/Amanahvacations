import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdminNav from "./AdminNav";
import { logoutAdmin } from "../admin-login/actions";

export const metadata: Metadata = {
  title: "Amanah Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col bg-night px-4 py-6 lg:flex">
          <Link href="/admin" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
              <Image src="/images/logo.png" alt="" width={28} height={28} />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[16px] font-semibold text-white">AMANAH</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[2px] text-gold">
                Admin
              </span>
            </span>
          </Link>
          <div className="flex-1 overflow-y-auto">
            <AdminNav />
          </div>
          <Link
            href="/"
            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-white/60 transition hover:text-white"
          >
            ← View live site
          </Link>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-sand bg-cream/90 px-5 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Image src="/images/logo.png" alt="" width={26} height={26} />
              <span className="font-serif text-[15px] font-semibold text-ink">Admin</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1.5 text-[11px] font-semibold text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                Live — saves update your website
              </div>
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="rounded-full border border-sand px-3.5 py-1.5 text-[11px] font-semibold text-sage transition hover:border-terracotta hover:text-terracotta"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="border-b border-sand bg-night px-3 py-3 lg:hidden">
            <AdminNav />
          </div>

          <div className="px-5 py-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
