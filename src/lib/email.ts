import "server-only";

/* Transactional email via Resend. The amanahvacations.com domain is verified
   in Resend, so sends go from booking@amanahvacations.com to any recipient.
   Every send is best-effort and never breaks the flow that triggered it. */

import { getSavedContent } from "@/lib/content/site";

export const emailConfigured = Boolean(process.env.RESEND_API_KEY);

/* Senders by purpose — customers see and reply to these, matching Maher's
   inbox split (booking@ for bookings, payment@ for payment, info@ for general).
   EMAIL_FROM overrides the booking sender, kept for backward compatibility. */
const SENDER_NAME = "Amanah Vacations";
const sender = (mailbox: string) => `${SENDER_NAME} <${mailbox}@amanahvacations.com>`;

export const FROM_BOOKING = process.env.EMAIL_FROM ?? sender("booking");
export const FROM_INFO = sender("info");
export const FROM_PAYMENT = sender("payment");

/* Where each kind of alert to Maher lands — routed to the matching inbox so
   each address holds its own kind of message. Override any in the environment
   to pool them into one box instead. */
export const NOTIFY_BOOKING = process.env.ADMIN_NOTIFY_BOOKING ?? "booking@amanahvacations.com";
export const NOTIFY_PAYMENT = process.env.ADMIN_NOTIFY_PAYMENT ?? "payment@amanahvacations.com";
export const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY_EMAIL ?? "info@amanahvacations.com";

const LOGO_URL =
  "https://rokrdabaujexuzcaiaum.supabase.co/storage/v1/object/public/images/branding/logo.png";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Wrap plain text (or prebuilt rows) in the branded Amanah email shell —
    logo, site palette, footer. Email-safe HTML (tables + inline styles). */
export function renderBrandedEmail(opts: {
  heading: string;
  bodyText?: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const bodyHtml =
    opts.bodyHtml ??
    (opts.bodyText ?? "")
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 14px;line-height:1.7;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
      .join("");
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto 6px;"><tr><td style="border-radius:999px;background:#c8693a;">
          <a href="${opts.ctaUrl}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(opts.ctaLabel)}</a>
        </td></tr></table>`
      : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f0ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding:6px 0 18px;">
          <img src="${LOGO_URL}" alt="Amanah Vacations" width="64" style="display:block;margin:0 auto 8px;" />
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;letter-spacing:2px;color:#1c2b1e;">AMANAH</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;color:#e8a84b;font-weight:bold;">VACATIONS</div>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #ddd6ca;border-radius:18px;padding:30px 32px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#1c2b1e;">${escapeHtml(opts.heading)}</h1>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#3d4a3e;">${bodyHtml}</div>
          ${cta}
        </td></tr>
        <tr><td align="center" style="padding:20px 10px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:#6b7b6c;">Trust in Adventure · أمانة</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9aa79b;margin-top:6px;">
            Amanah Vacations · Playa del Carmen, Riviera Maya, Mexico<br />
            WhatsApp +52 984 452 1184 · booking@amanahvacations.com
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Sender address; defaults to the booking@ sender. */
  from?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!emailConfigured) return { ok: false, error: "email not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? FROM_BOOKING,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      console.error(`sendEmail to ${opts.to}:`, data?.message ?? res.status);
      return { ok: false, error: data?.message ?? String(res.status) };
    }
    return { ok: true };
  } catch (e) {
    console.error("sendEmail:", e instanceof Error ? e.message : e);
    return { ok: false, error: "network error" };
  }
}

/* ── Templates (written by /admin/emails, stored in site_content "emails") ── */

export type EmailTemplate = { subject: string; body: string };

type EmailsContent = {
  bookingConfirmation: EmailTemplate;
  quoteReply: EmailTemplate;
  welcome: EmailTemplate;
  contactAutoReply: EmailTemplate;
};

const DEFAULT_TEMPLATES: EmailsContent = {
  bookingConfirmation: {
    subject: "Your booking is received — {{order_id}}",
    body: "Hi {{name}},\n\nThank you for booking with Amanah Vacations! We've received your request ({{order_id}}) for {{items}}, totalling {{total}}.\n\nOur team will confirm availability and final details with you within a few hours via WhatsApp or email.\n\nTrust in Adventure,\nThe Amanah Vacations Team",
  },
  quoteReply: {
    subject: "Your personalized quote — Amanah Vacations",
    body: "Hi {{name}},\n\nThank you for your interest! Here are the details of the experience you asked about:\n\n{{summary}}\n\nWe'd love to tailor this to your dates and group. Reply here or message us on WhatsApp and we'll finalize everything.\n\nTrust in Adventure,\nThe Amanah Vacations Team",
  },
  welcome: {
    subject: "Welcome to Amanah Vacations",
    body: "Hi {{name}},\n\nWelcome! Your account is ready.\n\nTrust in Adventure,\nThe Amanah Vacations Team",
  },
  contactAutoReply: {
    subject: "We got your message — Amanah Vacations",
    body: "Hi {{name}},\n\nThanks for reaching out! We've received your message and will reply within a few hours.\n\nFor anything urgent, message us on WhatsApp.\n\nTrust in Adventure,\nThe Amanah Vacations Team",
  },
};

export async function getEmailTemplate(key: keyof EmailsContent): Promise<EmailTemplate> {
  const saved = await getSavedContent<EmailsContent>("emails");
  const tpl = saved?.[key];
  return tpl?.subject && tpl?.body ? tpl : DEFAULT_TEMPLATES[key];
}

/** Replace {{placeholders}} in a template string. */
export function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
}
