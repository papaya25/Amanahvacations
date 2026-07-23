import type { Metadata } from "next";
import AccountNav from "./AccountNav";
import { getSessionUser } from "@/lib/supabase/serverAuth";
import { logoutCustomer } from "./actions";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const firstName = (user?.user_metadata?.name as string | undefined)?.split(" ")[0];
  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-[1100px] px-5 py-[clamp(32px,4vw,64px)] lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
              <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
              My Account
            </div>
            <h1 className="font-serif text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
              Welcome{firstName ? (
                <>
                  , <em className="italic text-forest">{firstName}</em>
                </>
              ) : (
                <>
                  {" "}to your <em className="italic text-forest">account</em>
                </>
              )}
            </h1>
            {user?.email && <p className="mt-1.5 text-[13px] text-sage">{user.email}</p>}
          </div>
          <form action={logoutCustomer}>
            <button
              type="submit"
              className="rounded-full border-[1.5px] border-sand px-5 py-2.5 text-[13px] font-semibold text-sage transition hover:border-terracotta hover:text-terracotta"
            >
              Log out
            </button>
          </form>
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
