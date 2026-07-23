import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-[400px] rounded-[22px] border border-sand bg-white p-[clamp(24px,4vw,40px)] shadow-[0_20px_60px_rgba(28,43,30,0.08)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/images/logo.png" alt="" width={48} height={50} />
          <h1 className="mt-3 font-serif text-[26px] font-semibold text-ink">Amanah Admin</h1>
          <p className="mt-1 text-[13px] text-sage">Enter your admin password to continue.</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </main>
  );
}
