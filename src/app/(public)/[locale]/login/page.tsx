"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { sendWelcomeEmail } from "./actions";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { locale, dict } = useI18n();
  const L = (href: string) => localizeHref(href, locale);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest";

  const afterLogin = () => {
    const next = params.get("next");
    router.push(L(next && next.startsWith("/account") ? next : "/account/orders"));
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(
            /confirm/i.test(error.message)
              ? dict.login_err_confirm
              : dict.login_err_wrong
          );
          return;
        }
        afterLogin();
      } else {
        if (password.length < 8) {
          setError(dict.login_err_pw_len);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) {
          setError(
            /already registered/i.test(error.message)
              ? dict.login_err_exists
              : error.message
          );
          return;
        }
        sendWelcomeEmail(email, name.trim()).catch(() => {});
        if (data.session) {
          afterLogin();
        } else {
          setConfirmSent(true);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  if (confirmSent) {
    return (
      <main className="flex min-h-[78vh] items-center bg-cream">
        <div className="mx-auto w-full max-w-[440px] px-5">
          <div className="rounded-[24px] border border-sand bg-white p-[clamp(24px,3vw,40px)] text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-[26px]">
              ✉️
            </div>
            <h1 className="font-serif text-[26px] font-semibold text-ink">{dict.login_check_email_title}</h1>
            <p className="mx-auto mt-2 max-w-[340px] text-[13.5px] leading-[1.7] text-sage">
              {dict.login_check_email_pre} <strong className="text-ink">{email}</strong>{dict.login_check_email_post}
            </p>
            <button
              onClick={() => {
                setConfirmSent(false);
                setMode("login");
              }}
              className="mt-6 rounded-full border-[1.5px] border-forest px-6 py-2.5 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
            >
              {dict.login_back_to_login}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[78vh] items-center bg-cream">
      <div className="mx-auto w-full max-w-[440px] px-5 py-[clamp(32px,4vw,64px)]">
        <div className="rounded-[24px] border border-sand bg-white p-[clamp(24px,3vw,40px)]">
          <div className="mb-6 text-center">
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
              Amanah Vacations
            </div>
            <h1 className="font-serif text-[clamp(26px,3vw,34px)] font-semibold text-ink">
              {mode === "login" ? dict.login_welcome_back : dict.login_create_account}
            </h1>
            <p className="mt-2 text-[13px] text-sage">
              {mode === "login" ? dict.login_login_sub : dict.login_signup_sub}
            </p>
          </div>

          <form className="space-y-3.5" onSubmit={submit}>
            {mode === "signup" && (
              <div>
                <label htmlFor="l-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.login_full_name}</label>
                <input id="l-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </div>
            )}
            <div>
              <label htmlFor="l-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.login_email}</label>
              <input id="l-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="l-pw" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.login_password}</label>
              <input id="l-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </div>
            {error && <p className="text-[13px] font-medium text-terracotta">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-gradient-to-br from-terracotta to-gold py-3.5 text-[14px] font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)] disabled:opacity-60"
            >
              {busy ? dict.login_one_moment : mode === "login" ? dict.login_login_btn : dict.login_create_btn}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[1.5px] text-sage">
            <span className="h-px flex-1 bg-sand" /> {dict.login_or} <span className="h-px flex-1 bg-sand" />
          </div>

          <div className="space-y-2.5">
            <button
              disabled
              title="Coming soon"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-full border-[1.5px] border-sand bg-white py-3 text-[13.5px] font-medium text-ink opacity-50"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.700h3.5c2-1.9 3.3-4.7 3.3-7.9Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.3-1.9-6.2-4.6H2.2v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4Z"/></svg>
              {dict.login_google}
            </button>
            <button
              disabled
              title="Coming soon"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-full border-[1.5px] border-sand bg-white py-3 text-[13.5px] font-medium text-ink opacity-50"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2" aria-hidden><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"/></svg>
              {dict.login_facebook}
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-sage">
            {mode === "login" ? `${dict.login_new_here} ` : `${dict.login_have_account} `}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="font-semibold text-forest underline underline-offset-2"
            >
              {mode === "login" ? dict.login_create_link : dict.login_login_link}
            </button>
          </p>
        </div>

        <p className="mt-5 text-center text-[15px] font-medium text-ink">
          {dict.login_guest_pre}{" "}
          <Link href={L("/packages")} className="font-semibold text-forest underline underline-offset-2">
            {dict.login_guest_link}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
