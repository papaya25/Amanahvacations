"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/I18nProvider";

const KEY = "amanah_profile";
type Profile = { name: string; email: string; whatsapp: string; country: string };
const EMPTY: Profile = { name: "", email: "", whatsapp: "", country: "" };

export default function ProfilePage() {
  const [p, setP] = useState<Profile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const { dict } = useI18n();

  useEffect(() => {
    // Local extras (whatsapp/country), then the real account identity on top.
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setP({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) {
          setP((prev) => ({
            ...prev,
            email: data.user.email ?? prev.email,
            name: (data.user.user_metadata?.name as string) || prev.name,
          }));
        }
      });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(KEY, JSON.stringify(p));
    // Persist the name on the account itself.
    await createClient()
      .auth.updateUser({ data: { name: p.name } })
      .catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-cream px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest focus:bg-white";
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP({ ...p, [k]: e.target.value });

  return (
    <form onSubmit={save} className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
      <h2 className="mb-1 font-serif text-[24px] font-semibold text-ink">{dict.prof_title}</h2>
      <p className="mb-6 text-[13px] text-sage">{dict.prof_sub}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.prof_full_name}</label>
          <input value={p.name} onChange={set("name")} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.prof_email}</label>
          <input type="email" value={p.email} onChange={set("email")} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.prof_whatsapp}</label>
          <input value={p.whatsapp} onChange={set("whatsapp")} className={inputCls} placeholder="+1 ..." />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.prof_country}</label>
          <input value={p.country} onChange={set("country")} className={inputCls} />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
        >
          {dict.prof_save}
        </button>
        {saved && <span className="text-[13px] font-medium text-forest">✓ {dict.prof_saved}</span>}
      </div>
    </form>
  );
}
