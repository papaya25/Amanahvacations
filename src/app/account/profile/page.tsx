"use client";

import { useEffect, useState } from "react";

const KEY = "amanah_profile";
type Profile = { name: string; email: string; whatsapp: string; country: string };
const EMPTY: Profile = { name: "", email: "", whatsapp: "", country: "" };

export default function ProfilePage() {
  const [p, setP] = useState<Profile>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setP({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(KEY, JSON.stringify(p));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-cream px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest focus:bg-white";
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP({ ...p, [k]: e.target.value });

  return (
    <form onSubmit={save} className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
      <h2 className="mb-1 font-serif text-[24px] font-semibold text-ink">Profile</h2>
      <p className="mb-6 text-[13px] text-sage">Keep your details up to date for faster booking.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Full name</label>
          <input value={p.name} onChange={set("name")} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Email</label>
          <input type="email" value={p.email} onChange={set("email")} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">WhatsApp</label>
          <input value={p.whatsapp} onChange={set("whatsapp")} className={inputCls} placeholder="+1 ..." />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Country</label>
          <input value={p.country} onChange={set("country")} className={inputCls} />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
        >
          Save Changes
        </button>
        {saved && <span className="text-[13px] font-medium text-forest">✓ Saved</span>}
      </div>
    </form>
  );
}
