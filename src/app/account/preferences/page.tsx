"use client";

import { useEffect, useState } from "react";

const KEY = "amanah_prefs";
const LANGS = ["English", "Français", "Español", "العربية"];
const CURRENCIES = ["USD", "MXN", "EUR"];
const INTERESTS = [
  "Cenotes & Water",
  "Mayan Ruins & Culture",
  "Beaches & Islands",
  "Adventure & Adrenaline",
  "Honeymoon & Romance",
  "Family Trips",
  "Luxury / VIP",
  "Halal-Friendly",
];

type Prefs = { language: string; currency: string; newsletter: boolean; interests: string[] };
const DEFAULTS: Prefs = { language: "English", currency: "USD", newsletter: true, interests: [] };

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleInterest = (i: string) =>
    setPrefs((p) => ({
      ...p,
      interests: p.interests.includes(i)
        ? p.interests.filter((x) => x !== i)
        : [...p.interests, i],
    }));

  const selectCls =
    "rounded-xl border-[1.5px] border-sand bg-cream px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest focus:bg-white";

  return (
    <div className="space-y-5">
      <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
        <h2 className="mb-1 font-serif text-[24px] font-semibold text-ink">Preferences</h2>
        <p className="mb-6 text-[13px] text-sage">Tailor the site and our recommendations to you.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Language</label>
            <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })} className={selectCls}>
              {LANGS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Currency</label>
            <select value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })} className={selectCls}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
            Travel interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => {
              const on = prefs.interests.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    on ? "border-forest bg-forest text-white" : "border-sand bg-white text-sage hover:border-forest"
                  }`}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.newsletter}
            onChange={(e) => setPrefs({ ...prefs, newsletter: e.target.checked })}
            className="h-4 w-4 accent-forest"
          />
          <span className="text-[13.5px] text-ink">
            Email me trip ideas, seasonal experiences and special offers
          </span>
        </label>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
          >
            Save Preferences
          </button>
          {saved && <span className="text-[13px] font-medium text-forest">✓ Saved</span>}
        </div>
      </section>
    </div>
  );
}
