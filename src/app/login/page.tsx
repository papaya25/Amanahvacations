"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest";

  return (
    <main className="flex min-h-[78vh] items-center bg-cream">
      <div className="mx-auto w-full max-w-[440px] px-5 py-[clamp(32px,4vw,64px)]">
        <div className="rounded-[24px] border border-sand bg-white p-[clamp(24px,3vw,40px)]">
          <div className="mb-6 text-center">
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
              Amanah Vacations
            </div>
            <h1 className="font-serif text-[clamp(26px,3vw,34px)] font-semibold text-ink">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-[13px] text-sage">
              {mode === "login"
                ? "Log in to track your bookings and preferences."
                : "Save your details for faster booking next time."}
            </p>
          </div>

          <form
            className="space-y-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Accounts activate once we connect login — coming in the next phase.");
            }}
          >
            {mode === "signup" && (
              <div>
                <label htmlFor="l-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Full name</label>
                <input id="l-name" className={inputCls} />
              </div>
            )}
            <div>
              <label htmlFor="l-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Email</label>
              <input id="l-email" type="email" className={inputCls} />
            </div>
            <div>
              <label htmlFor="l-pw" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Password</label>
              <input id="l-pw" type="password" className={inputCls} />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-br from-terracotta to-gold py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[1.5px] text-sage">
            <span className="h-px flex-1 bg-sand" /> or <span className="h-px flex-1 bg-sand" />
          </div>

          <div className="space-y-2.5">
            <button className="flex w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] border-sand bg-white py-3 text-[13.5px] font-medium text-ink transition hover:border-forest">
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.700h3.5c2-1.9 3.3-4.7 3.3-7.9Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.3-1.9-6.2-4.6H2.2v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4Z"/></svg>
              Continue with Google
            </button>
            <button className="flex w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] border-sand bg-white py-3 text-[13.5px] font-medium text-ink transition hover:border-forest">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2" aria-hidden><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"/></svg>
              Continue with Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-sage">
            {mode === "login" ? "New to Amanah? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-forest underline underline-offset-2"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-[12.5px] text-sage">
          No account needed to book —{" "}
          <Link href="/packages" className="font-medium text-forest underline underline-offset-2">
            continue as guest
          </Link>
        </p>
      </div>
    </main>
  );
}
