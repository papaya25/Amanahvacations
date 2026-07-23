import "server-only";

/* Booking notifications. Called after an order is stored (and again when a
   payment is verified). Every send is best-effort: a failed email never
   breaks checkout. */

import { ADMIN_NOTIFY, fillTemplate, getEmailTemplate, renderBrandedEmail, sendEmail } from "@/lib/email";
import type { CartItem } from "@/lib/cart";

const fmtMXN = (n: number) => `$${n.toLocaleString("en-US")} MXN`;

export type OrderEmailInput = {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  name: string;
  email: string;
  whatsapp?: string;
  notes?: string;
  status: string;
};

/** Customer confirmation (their template) + admin "new booking" notification. */
export async function notifyNewOrder(o: OrderEmailInput): Promise<void> {
  const itemsShort = o.items.map((it) => it.title).join(", ");

  // Customer confirmation — uses the admin-editable template.
  // (Delivers once the domain is verified in Resend; best-effort until then.)
  const tpl = await getEmailTemplate("bookingConfirmation");
  const vars = {
    name: o.name.split(" ")[0] || o.name,
    order_id: o.id,
    items: itemsShort,
    total: fmtMXN(o.total),
  };
  const customerBody = fillTemplate(tpl.body, vars);
  await sendEmail({
    to: o.email,
    subject: fillTemplate(tpl.subject, vars),
    text: customerBody,
    html: renderBrandedEmail({
      heading: `Your booking is received — ${o.id}`,
      bodyText: customerBody,
    }),
    // Customers just hit Reply and reach the booking inbox.
    replyTo: "booking@amanahvacations.com",
  });

  // Admin notification with full details + one-tap WhatsApp link.
  const waDigits = o.whatsapp?.replace(/\D/g, "") ?? "";
  const lines = [
    `New booking on amanahvacations.com — ${o.id}`,
    "",
    ...o.items.map((it) => {
      const details = it.details?.length ? ` (${it.details.join(" · ")})` : "";
      const price = it.total > 0 ? ` — ${fmtMXN(it.total)}` : " — on request";
      return `• ${it.title}${details}${price}`;
    }),
    "",
    `Subtotal: ${fmtMXN(o.subtotal)}`,
    ...(o.discount > 0 ? [`Discount: −${fmtMXN(o.discount)}`] : []),
    `Total: ${fmtMXN(o.total)}`,
    `Payment: ${o.paymentMethod} — status: ${o.status}`,
    "",
    `Customer: ${o.name}`,
    `Email: ${o.email}`,
    ...(o.whatsapp ? [`WhatsApp: ${o.whatsapp}`, `→ Message them now: https://wa.me/${waDigits}`] : []),
    ...(o.notes ? ["", `Notes: ${o.notes}`] : []),
    "",
    "Open your admin: /admin/orders",
  ];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const itemRows = o.items
    .map((it) => {
      const details = it.details?.length ? `<br /><span style="color:#6b7b6c;font-size:12px;">${esc(it.details.join(" · "))}</span>` : "";
      const price = it.total > 0 ? fmtMXN(it.total) : "On request";
      return `<tr>
        <td style="padding:9px 0;border-bottom:1px solid #eee7db;"><strong>${esc(it.title)}</strong>${details}</td>
        <td style="padding:9px 0;border-bottom:1px solid #eee7db;text-align:right;white-space:nowrap;vertical-align:top;">${price}</td>
      </tr>`;
    })
    .join("");
  const adminHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#3d4a3e;">
      ${itemRows}
      <tr><td style="padding:9px 0;">Subtotal</td><td style="text-align:right;">${fmtMXN(o.subtotal)}</td></tr>
      ${o.discount > 0 ? `<tr><td style="padding:2px 0;">Discount</td><td style="text-align:right;color:#c8693a;">−${fmtMXN(o.discount)}</td></tr>` : ""}
      <tr><td style="padding:6px 0;font-weight:bold;color:#1c2b1e;">Total</td><td style="text-align:right;font-weight:bold;color:#1c2b1e;">${fmtMXN(o.total)}</td></tr>
      <tr><td colspan="2" style="padding:14px 0 0;color:#6b7b6c;font-size:13px;">
        Payment: ${esc(o.paymentMethod)} — ${esc(o.status)}<br />
        Customer: <strong>${esc(o.name)}</strong> · <a href="mailto:${esc(o.email)}" style="color:#3a5a3c;">${esc(o.email)}</a>
        ${o.whatsapp ? `<br />WhatsApp: ${esc(o.whatsapp)}` : ""}
        ${o.notes ? `<br /><br />Notes: ${esc(o.notes)}` : ""}
      </td></tr>
    </table>`;
  await sendEmail({
    to: ADMIN_NOTIFY,
    subject: `🌴 New booking ${o.id} — ${fmtMXN(o.total)} (${o.status})`,
    text: lines.join("\n"),
    html: renderBrandedEmail({
      heading: `New booking ${o.id}`,
      bodyHtml: adminHtml,
      ...(waDigits
        ? { ctaLabel: "💬 Message the customer on WhatsApp", ctaUrl: `https://wa.me/${waDigits}` }
        : {}),
    }),
    replyTo: o.email,
  });
}

/** Admin "payment received" notification (after provider verification). */
export async function notifyOrderPaid(orderId: string): Promise<void> {
  const text = `The payment for booking ${orderId} was verified and the order is now marked "Paid (test mode)".\n\nSee it in your admin: /admin/orders`;
  await sendEmail({
    to: ADMIN_NOTIFY,
    subject: `💳 Payment received — ${orderId}`,
    text,
    html: renderBrandedEmail({ heading: `Payment received — ${orderId}`, bodyText: text }),
  });
}
