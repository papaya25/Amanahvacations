"use client";

import { useState } from "react";
import { loginAdmin } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (formData: FormData) => {
    setBusy(true);
    setError(null);
    const res = await loginAdmin(formData); // redirects on success
    setBusy(false);
    if (res?.error) setError(res.error);
  };

  return (
    <form action={submit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label
          htmlFor="admin-pass"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest"
        >
          Password
        </label>
        <input
          id="admin-pass"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest"
        />
      </div>
      {error && <p className="text-[13px] font-medium text-terracotta">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-gradient-to-br from-terracotta to-gold px-6 py-3.5 text-[14px] font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)] disabled:opacity-60"
      >
        {busy ? "Checking…" : "Log in to Admin"}
      </button>
    </form>
  );
}
