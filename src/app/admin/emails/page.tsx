"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar, TextArea } from "../AdminUI";

type Template = { subject: string; body: string };
type Emails = {
  senderName: string;
  senderEmail: string;
  bookingConfirmation: Template;
  quoteReply: Template;
  welcome: Template;
  contactAutoReply: Template;
};

const DEFAULT: Emails = {
  senderName: "Amanah Vacations",
  senderEmail: "booking@amanahvacations.com",
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
    body: "Hi {{name}},\n\nWelcome! Your account is ready. You can now track your bookings, save your preferences, and check out faster.\n\nExplore the Riviera Maya with us — private, family-safe, and halal-friendly.\n\nTrust in Adventure,\nThe Amanah Vacations Team",
  },
  contactAutoReply: {
    subject: "We got your message — Amanah Vacations",
    body: "Hi {{name}},\n\nThanks for reaching out! We've received your message and will reply within a few hours.\n\nFor anything urgent, message us on WhatsApp.\n\nTrust in Adventure,\nThe Amanah Vacations Team",
  },
};

const TEMPLATES: { key: keyof Emails; title: string; desc: string }[] = [
  { key: "bookingConfirmation", title: "Booking confirmation", desc: "Sent right after a customer checks out." },
  { key: "quoteReply", title: "Quote reply", desc: "Sent when someone requests a quote or a VIP/on-request experience." },
  { key: "welcome", title: "Welcome email", desc: "Sent when a customer creates an account." },
  { key: "contactAutoReply", title: "Contact auto-reply", desc: "Auto-response to contact-form messages." },
];

export default function EmailsAdmin() {
  const { value, setValue, save, savedAt } = useLocalState<Emails>("admin_emails", DEFAULT);
  const setTpl = (key: keyof Emails, field: keyof Template, v: string) =>
    setValue({ ...value, [key]: { ...(value[key] as Template), [field]: v } });

  return (
    <>
      <PageHead
        eyebrow="Business"
        title="Automated Emails"
        desc="The emails your customers receive automatically. Use variables like {{name}}, {{order_id}}, {{items}}, {{total}} and {{summary}} — they get filled in when the email is sent."
      />

      <div className="space-y-5">
        <Card title="Sender">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From name" value={value.senderName} onChange={(v) => setValue({ ...value, senderName: v })} />
            <Field label="From email" value={value.senderEmail} onChange={(v) => setValue({ ...value, senderEmail: v })} />
          </div>
        </Card>

        {TEMPLATES.map((t) => {
          const tpl = value[t.key] as Template;
          return (
            <Card key={t.key} title={t.title} desc={t.desc}>
              <div className="space-y-4">
                <Field label="Subject" value={tpl.subject} onChange={(v) => setTpl(t.key, "subject", v)} />
                <TextArea label="Body" value={tpl.body} onChange={(v) => setTpl(t.key, "body", v)} rows={8} />
              </div>
            </Card>
          );
        })}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}
