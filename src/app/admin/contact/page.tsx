"use client";

import { useDbState } from "@/lib/useDbState";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

type ContactInfo = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  formRecipient: string;
};

const DEFAULT: ContactInfo = {
  phone: "+52 984 452 1184",
  whatsapp: "529844521184",
  email: "booking@amanahvacations.com",
  address: "Playa del Carmen, Riviera Maya, Quintana Roo, Mexico",
  instagram: "https://www.instagram.com/amanahvacations/",
  facebook: "https://www.facebook.com/profile.php?id=61591849591722",
  tiktok: "",
  youtube: "",
  formRecipient: "booking@amanahvacations.com",
};

export default function ContactAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState<ContactInfo>("admin_contact", DEFAULT);
  const set = (k: keyof ContactInfo, v: string) => setValue({ ...value, [k]: v });

  return (
    <>
      <PageHead
        eyebrow="Business"
        title="Contact & Social"
        desc="Your contact details and social links — used in the header, footer, contact page, and the WhatsApp/email buttons across the site."
      />

      <div className="space-y-5">
        <Card title="Contact details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display phone" value={value.phone} onChange={(v) => set("phone", v)} />
            <Field
              label="WhatsApp number (digits only)"
              value={value.whatsapp}
              onChange={(v) => set("whatsapp", v)}
              placeholder="529844521184"
            />
            <Field label="Email" value={value.email} onChange={(v) => set("email", v)} />
            <Field label="Address" value={value.address} onChange={(v) => set("address", v)} />
          </div>
        </Card>

        <Card title="Social links" desc="Leave a field blank to hide that icon.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram URL" value={value.instagram} onChange={(v) => set("instagram", v)} />
            <Field label="Facebook URL" value={value.facebook} onChange={(v) => set("facebook", v)} />
            <Field label="TikTok URL" value={value.tiktok} onChange={(v) => set("tiktok", v)} placeholder="https://tiktok.com/@..." />
            <Field label="YouTube URL" value={value.youtube} onChange={(v) => set("youtube", v)} placeholder="(optional)" />
          </div>
        </Card>

        <Card title="Contact form">
          <Field
            label="Send form submissions to"
            value={value.formRecipient}
            onChange={(v) => set("formRecipient", v)}
          />
          <p className="mt-2 text-[12px] text-sage">
            When the backend is connected, contact-form messages are emailed here (and saved to your
            dashboard).
          </p>
        </Card>
      </div>

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}
