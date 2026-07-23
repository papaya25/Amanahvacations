"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const KEY = "amanah_prefs";
const LANGS = ["English", "Français", "Español", "العربية"];
const CURRENCIES = ["USD", "MXN", "EUR"];
/* Interests are stored by a stable id so a saved selection keeps matching even
   when the visitor switches the site language (the label is display-only). */
const INTERESTS = [
  { id: "cenotes", key: "pref_int_cenotes" },
  { id: "ruins", key: "pref_int_ruins" },
  { id: "beaches", key: "pref_int_beaches" },
  { id: "adventure", key: "pref_int_adventure" },
  { id: "honeymoon", key: "pref_int_honeymoon" },
  { id: "family", key: "pref_int_family" },
  { id: "luxury", key: "pref_int_luxury" },
  { id: "halal", key: "pref_int_halal" },
] as const;

type Prefs = { language: string; currency: string; newsletter: boolean; interests: string[] };
const DEFAULTS: Prefs = { language: "English", currency: "USD", newsletter: true, interests: [] };

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const { dict } = useI18n();

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
        <h2 className="mb-1 font-serif text-[24px] font-semibold text-ink">{dict.pref_title}</h2>
        <p className="mb-6 text-[13px] text-sage">{dict.pref_sub}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.pref_language}</label>
            <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })} className={selectCls}>
              {LANGS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.pref_currency}</label>
            <select value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })} className={selectCls}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
            {dict.pref_interests}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => {
              const on = prefs.interests.includes(i.id);
              return (
                <button
                  key={i.id}
                  onClick={() => toggleInterest(i.id)}
                  className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    on ? "border-forest bg-forest text-white" : "border-sand bg-white text-sage hover:border-forest"
                  }`}
                >
                  {dict[i.key]}
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
            {dict.pref_newsletter}
          </span>
        </label>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
          >
            {dict.pref_save}
          </button>
          {saved && <span className="text-[13px] font-medium text-forest">✓ {dict.pref_saved}</span>}
        </div>
      </section>
    </div>
  );
}
