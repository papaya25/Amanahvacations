"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

const inputCls =
  "w-full rounded-xl border-[1.5px] border-sand bg-cream px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest focus:bg-white";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest";

export default function SettingsPage() {
  const { dict } = useI18n();
  const note = () => alert(dict.set_note);
  return (
    <div className="space-y-5">
      {/* Email */}
      <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
        <h2 className="mb-1 font-serif text-[24px] font-semibold text-ink">{dict.set_title}</h2>
        <p className="mb-6 text-[13px] text-sage">{dict.set_sub}</p>
        <div>
          <label className={labelCls}>{dict.set_login_email}</label>
          <input type="email" className={inputCls} placeholder="you@email.com" />
        </div>
        <button
          onClick={note}
          className="mt-4 rounded-full border-[1.5px] border-forest px-6 py-2.5 text-[13.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          {dict.set_update_email}
        </button>
      </section>

      {/* Password */}
      <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
        <h3 className="mb-4 font-serif text-[20px] font-semibold text-ink">{dict.set_password}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>{dict.set_current_pw}</label>
            <input type="password" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{dict.set_new_pw}</label>
            <input type="password" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{dict.set_confirm_pw}</label>
            <input type="password" className={inputCls} />
          </div>
        </div>
        <button
          onClick={note}
          className="mt-4 rounded-full border-[1.5px] border-forest px-6 py-2.5 text-[13.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          {dict.set_change_pw}
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-[20px] border border-[#e7c9c0] bg-[#fbf1ee] p-[clamp(20px,2.5vw,32px)]">
        <h3 className="mb-1 font-serif text-[20px] font-semibold text-[#a8442a]">{dict.set_delete_title}</h3>
        <p className="mb-4 max-w-[520px] text-[13px] leading-[1.7] text-[#8a4a38]">
          {dict.set_delete_desc}
        </p>
        <button
          onClick={note}
          className="rounded-full border-[1.5px] border-[#c8503a] px-6 py-2.5 text-[13.5px] font-semibold text-[#c8503a] transition hover:bg-[#c8503a] hover:text-white"
        >
          {dict.set_delete_btn}
        </button>
      </section>
    </div>
  );
}
