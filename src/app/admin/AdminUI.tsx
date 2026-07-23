"use client";

/* Shared building blocks for the admin editors. */

import { useState } from "react";

export function Card({
  title,
  desc,
  children,
}: {
  title?: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-sand bg-white p-[clamp(18px,2vw,28px)]">
      {title && <h2 className="font-serif text-[22px] font-semibold text-ink">{title}</h2>}
      {desc && <p className="mt-1 text-[13px] leading-[1.6] text-sage">{desc}</p>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border-[1.5px] border-sand bg-cream px-3.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-forest focus:bg-white";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  prefix,
  suffix,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest">
        {label}
      </span>
      <span className="flex items-center gap-1.5 rounded-xl border-[1.5px] border-sand bg-cream px-3.5 py-0 transition focus-within:border-forest focus-within:bg-white">
        {prefix && <span className="text-[13px] text-sage">{prefix}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-[14px] text-ink outline-none"
        />
        {suffix && <span className="whitespace-nowrap text-[13px] text-sage">{suffix}</span>}
      </span>
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y`}
      />
    </label>
  );
}

/* Shows the current image and lets the admin pick a replacement. The file is
   uploaded to storage immediately (with a local preview while it uploads) and
   onPick receives the permanent public URL — saving the editor then makes it
   live everywhere. */
export function ImagePicker({
  label,
  src,
  onPick,
  ratio = "aspect-[4/3]",
}: {
  label: string;
  src: string;
  onPick?: (url: string) => void;
  ratio?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const shown = preview ?? src;

  const pick = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setState("uploading");
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const { uploadImage } = await import("./upload-actions");
    const res = await uploadImage(fd).catch(() => ({ ok: false as const, error: "Upload failed." }));
    if (res.ok) {
      setState("done");
      onPick?.(res.url);
    } else {
      setState("error");
      setError(res.error);
      setPreview(null);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest">
        {label}
      </span>
      <div className={`relative ${ratio} w-full overflow-hidden rounded-xl border border-sand bg-cream`}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-sage">
            No image
          </div>
        )}
        <label className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-ink">
          {state === "uploading" ? "Uploading…" : "Replace"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            disabled={state === "uploading"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pick(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {state === "uploading" && (
        <p className="mt-1.5 text-[11px] text-sage">Uploading your image…</p>
      )}
      {state === "done" && (
        <p className="mt-1.5 text-[11px] font-medium text-forest">
          ✓ Uploaded — click Save changes to make it live.
        </p>
      )}
      {state === "error" && error && (
        <p className="mt-1.5 text-[11px] font-medium text-terracotta">{error}</p>
      )}
    </div>
  );
}

export function SaveBar({
  onSave,
  savedAt,
  label = "Save changes",
  saving = false,
  savedLabel = "✓ Saved — now live on your website",
  idleLabel = "Changes save to your database and update the live site.",
  error,
}: {
  onSave: () => void;
  savedAt: number;
  label?: string;
  saving?: boolean;
  savedLabel?: string;
  idleLabel?: string;
  error?: string | null;
}) {
  const justSaved = savedAt > 0 && Date.now() - savedAt < 4000;
  return (
    <div className="sticky bottom-4 z-10 mt-6 flex items-center gap-4 rounded-full border border-sand bg-white/95 px-4 py-2.5 shadow-[0_10px_30px_rgba(28,43,30,0.12)] backdrop-blur">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-full bg-gradient-to-br from-terracotta to-gold px-6 py-2.5 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(200,105,58,0.42)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {saving ? "Saving…" : label}
      </button>
      <span className={`text-[12px] ${error ? "text-terracotta" : "text-sage"}`}>
        {error ? error : saving ? "Saving your changes…" : justSaved ? savedLabel : idleLabel}
      </span>
    </div>
  );
}

export function PageHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
        {eyebrow}
      </div>
      <h1 className="font-serif text-[clamp(26px,3.2vw,40px)] font-semibold leading-[1.05] tracking-[-0.5px] text-ink">
        {title}
      </h1>
      {desc && <p className="mt-2 max-w-[620px] text-[13.5px] leading-[1.6] text-sage">{desc}</p>}
    </div>
  );
}
