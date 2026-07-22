"use client";

const note = () =>
  alert("This activates once accounts are connected in the next phase.");

const inputCls =
  "w-full rounded-xl border-[1.5px] border-sand bg-cream px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest focus:bg-white";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      {/* Email */}
      <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
        <h2 className="mb-1 font-serif text-[24px] font-semibold text-ink">Account settings</h2>
        <p className="mb-6 text-[13px] text-sage">Manage your login and security.</p>
        <div>
          <label className={labelCls}>Login email</label>
          <input type="email" className={inputCls} placeholder="you@email.com" />
        </div>
        <button
          onClick={note}
          className="mt-4 rounded-full border-[1.5px] border-forest px-6 py-2.5 text-[13.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          Update Email
        </button>
      </section>

      {/* Password */}
      <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
        <h3 className="mb-4 font-serif text-[20px] font-semibold text-ink">Password</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Current password</label>
            <input type="password" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>New password</label>
            <input type="password" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Confirm new password</label>
            <input type="password" className={inputCls} />
          </div>
        </div>
        <button
          onClick={note}
          className="mt-4 rounded-full border-[1.5px] border-forest px-6 py-2.5 text-[13.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          Change Password
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-[20px] border border-[#e7c9c0] bg-[#fbf1ee] p-[clamp(20px,2.5vw,32px)]">
        <h3 className="mb-1 font-serif text-[20px] font-semibold text-[#a8442a]">Delete account</h3>
        <p className="mb-4 max-w-[520px] text-[13px] leading-[1.7] text-[#8a4a38]">
          Permanently remove your account and its data. Your past bookings remain on record with
          our team as required by law. This can&apos;t be undone.
        </p>
        <button
          onClick={note}
          className="rounded-full border-[1.5px] border-[#c8503a] px-6 py-2.5 text-[13.5px] font-semibold text-[#c8503a] transition hover:bg-[#c8503a] hover:text-white"
        >
          Delete My Account
        </button>
      </section>
    </div>
  );
}
