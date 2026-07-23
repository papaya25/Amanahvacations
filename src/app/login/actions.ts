"use server";

/* Welcome email after signup (best-effort; template editable in /admin/emails).
   Full delivery to any address starts once the domain is verified in Resend. */

import { fillTemplate, getEmailTemplate, renderBrandedEmail, sendEmail } from "@/lib/email";

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  if (!/.+@.+\..+/.test(email)) return;
  const tpl = await getEmailTemplate("welcome");
  const vars = { name: name.split(" ")[0] || name || "traveler" };
  const body = fillTemplate(tpl.body, vars);
  await sendEmail({
    to: email,
    subject: fillTemplate(tpl.subject, vars),
    text: body,
    html: renderBrandedEmail({ heading: "Welcome to Amanah Vacations", bodyText: body }),
    replyTo: "booking@amanahvacations.com",
  });
}
