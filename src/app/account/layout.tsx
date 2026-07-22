import type { Metadata } from "next";
import AccountNav from "./AccountNav";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-[1100px] px-5 py-[clamp(32px,4vw,64px)] lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            My Account
          </div>
          <h1 className="font-serif text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            Welcome to your <em className="italic text-forest">account</em>
          </h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit min-w-0 lg:sticky lg:top-[108px]">
            <AccountNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
