"use server";

/* Contact-form delivery. Sends the message to Amanah's inbox (Reply-To set to
   the visitor, so hitting Reply answers them directly) and a best-effort
   auto-reply to the visitor (delivers once the domain is verified in Resend). */

import { ADMIN_NOTIFY, fillTemplate, getEmailTemplate, renderBrandedEmail, sendEmail } from "@/lib/email";

export type ContactMessageInput = {
  name: string;
  email: string;
  whatsapp?: string;
  subject?: string;
  message: string;
};

export async function sendContactMessage(
  input: ContactMessageInput
): Promise<{ ok: boolean; error?: string }> {
  const name = input.name?.trim();
  const email = input.email?.trim();
  const message = input.message?.trim();
  if (!name || !/.+@.+\..+/.test(email ?? "") || !message)
    return { ok: false, error: "Please fill in your name, email and message." };
  if (message.length > 5000) return { ok: false, error: "That message is a bit too long." };

  const lines = [
    `New message from the contact form`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    ...(input.whatsapp?.trim()
      ? [`WhatsApp: ${input.whatsapp.trim()} → https://wa.me/${input.whatsapp.replace(/\D/g, "")}`]
      : []),
    ...(input.subject?.trim() ? [`Subject: ${input.subject.trim()}`] : []),
    "",
    message,
  ];
  const waDigits = input.whatsapp?.replace(/\D/g, "") ?? "";
  const res = await sendEmail({
    to: ADMIN_NOTIFY,
    subject: `✉️ ${input.subject?.trim() || `Website message from ${name}`}`,
    text: lines.join("\n"),
    html: renderBrandedEmail({
      heading: `Message from ${name}`,
      bodyText: [
        `From: ${name} (${email})`,
        ...(input.whatsapp?.trim() ? [`WhatsApp: ${input.whatsapp.trim()}`] : []),
        ...(input.subject?.trim() ? [`Subject: ${input.subject.trim()}`] : []),
        "",
        message,
      ].join("\n"),
      ...(waDigits
        ? { ctaLabel: "💬 Reply on WhatsApp", ctaUrl: `https://wa.me/${waDigits}` }
        : {}),
    }),
    replyTo: email,
  });
  if (!res.ok) return { ok: false, error: "We couldn't send your message. Please try WhatsApp instead." };

  // Auto-reply to the visitor (their template) — best-effort, result ignored.
  const tpl = await getEmailTemplate("contactAutoReply");
  const vars = { name: name.split(" ")[0] || name };
  const autoBody = fillTemplate(tpl.body, vars);
  await sendEmail({
    to: email!,
    subject: fillTemplate(tpl.subject, vars),
    text: autoBody,
    html: renderBrandedEmail({
      heading: "We got your message!",
      bodyText: autoBody,
    }),
    // Replying to the auto-reply reaches the booking inbox directly.
    replyTo: "booking@amanahvacations.com",
  });

  return { ok: true };
}
