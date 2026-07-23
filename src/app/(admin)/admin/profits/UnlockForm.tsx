"use client";

import { useState } from "react";
import { unlockProfits } from "./actions";

export default function UnlockForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (fd: FormData) => {
    setBusy(true);
    setError(null);
    const res = await unlockProfits(fd); // redirects on success
    setBusy(false);
    if (res?.error) setError(res.error);
  };

  return (
    <div className="mx-auto max-w-[380px] rounded-[20px] border border-sand bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-[24px]">
        🔒
      </div>
      <h2 className="font-serif text-[22px] font-semibold text-ink">Profits are locked</h2>
      <p className="mx-auto mt-1.5 max-w-[280px] text-[13px] leading-[1.65] text-sage">
        This section has its own password on top of your admin login.
      </p>
      <form action={submit} className="mt-5 space-y-3">
        <input
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Profits password"
          className="w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-center text-[14px] text-ink outline-none transition focus:border-forest"
        />
        {error && <p className="text-[12.5px] font-medium text-terracotta">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gradient-to-br from-terracotta to-gold py-3 text-[13.5px] font-semibold text-white transition enabled:hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
