"use client";

import { useState } from "react";

export default function CopyEmails({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(emails.join(", "));
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          alert(emails.join(", "));
        }
      }}
      className="rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-ink"
    >
      {copied ? "✓ Copied!" : `Copy all ${emails.length} emails`}
    </button>
  );
}
