"use client";

import { useState } from "react";
import { sendContactMessage } from "./actions";

const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const lines = () => {
    let l = `Name: ${name}\nEmail: ${email}`;
    if (whatsapp) l += `\nWhatsApp: ${whatsapp}`;
    if (subject) l += `\nSubject: ${subject}`;
    l += `\n\n${message}`;
    return l;
  };

  const emailValid = /.+@.+\..+/.test(email);
  const valid = name.trim() && emailValid && message.trim();
  // WhatsApp sending needs the visitor's own number so we know where to answer.
  const waValid = Boolean(valid && whatsapp.trim());

  // Field-level warnings once a field has been visited, so senders see exactly
  // what's missing or mistyped.
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const nameError = touched.name && !name.trim() ? "Please enter your name." : null;
  const emailError =
    touched.email && !emailValid
      ? email.trim()
        ? "This email looks incomplete — it should be like name@email.com"
        : "Please enter your email."
      : null;
  const messageError = touched.message && !message.trim() ? "Please write a short message." : null;

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    setSendError(null);
    const res = await sendContactMessage({
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || undefined,
      subject: subject.trim() || undefined,
      message: message.trim(),
    }).catch(() => ({ ok: false as const, error: "Something went wrong." }));
    setSending(false);
    if (res.ok) {
      setSent(true);
      return;
    }
    setSendError(res.error ?? "We couldn't send your message.");
    // Fallback so no message is ever lost: open the visitor's mail app.
    const subj = encodeURIComponent(subject.trim() || `Website inquiry from ${name}`);
    window.location.href = `mailto:${EMAIL}?subject=${subj}&body=${encodeURIComponent(lines())}`;
  };

  const sendWhatsApp = () => {
    if (!waValid) return;
    const msg = encodeURIComponent(`Hello Amanah Vacations! 👋\n\n${lines()}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  };

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest";

  if (sent) {
    return (
      <div className="rounded-[22px] border border-sand bg-cream p-[clamp(28px,3vw,44px)] text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-[26px]">
          ✓
        </div>
        <p className="font-serif text-[24px] font-semibold text-ink">Message sent!</p>
        <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-[1.7] text-sage">
          Thanks {name.split(" ")[0]} — we&apos;ve got your message and will reply within a few
          hours, same day, every day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={sendEmail} className="rounded-[22px] border border-sand bg-cream p-[clamp(22px,2.5vw,34px)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
            Name *
          </label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            aria-invalid={Boolean(nameError)}
            className={`${inputCls}`}
          />
          {nameError && <p className="mt-1.5 text-[12px] font-medium text-terracotta">{nameError}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
            Email *
          </label>
          <input
            id="c-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            aria-invalid={Boolean(emailError)}
            className={`${inputCls}`}
          />
          {emailError && <p className="mt-1.5 text-[12px] font-medium text-terracotta">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="c-wa" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
            WhatsApp
          </label>
          <input
            id="c-wa"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputCls}
            placeholder="+1 ... — needed for a WhatsApp reply"
          />
        </div>
        <div>
          <label htmlFor="c-subject" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
            Subject
          </label>
          <input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="c-msg" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
          Message *
        </label>
        <textarea
          id="c-msg"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => touch("message")}
          aria-invalid={Boolean(messageError)}
          rows={5}
          className={`${inputCls} resize-y`}
          placeholder="Tell us about your trip — dates, group size, what you're dreaming of..."
        />
        {messageError && <p className="mt-1.5 text-[12px] font-medium text-terracotta">{messageError}</p>}
      </div>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="submit"
          disabled={!valid || sending}
          className="flex-1 rounded-full bg-gradient-to-br from-terracotta to-gold px-6 py-3.5 text-[14px] font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send via Email →"}
        </button>
        <button
          type="button"
          onClick={sendWhatsApp}
          disabled={!waValid}
          title={waValid ? undefined : "Add your WhatsApp number above so we know where to answer you"}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-[14px] font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {WA_ICON} Send via WhatsApp
        </button>
      </div>
      {valid && !waValid && (
        <p className="mt-3 text-center text-[12.5px] text-sage">
          💬 Want a WhatsApp reply? Add your WhatsApp number above to unlock the green button.
        </p>
      )}
      {sendError && (
        <p className="mt-3 text-center text-[12.5px] font-medium text-terracotta">{sendError}</p>
      )}
      <p className="mt-4 text-center text-[12px] text-sage">
        We usually reply within a few hours — same day, every day.
      </p>
    </form>
  );
}
