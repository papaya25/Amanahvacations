"use client";

import { useEffect } from "react";

/** Opens the print dialog once fonts are in, so the PDF never uses fallback fonts. */
export default function PrintBar() {
  useEffect(() => {
    document.fonts.ready.then(() => setTimeout(() => window.print(), 300));
  }, []);
  return (
    <div className="sticky top-0 z-10 flex items-center justify-center gap-3 bg-ink px-4 py-3 text-[13px] text-cream print:hidden">
      <span className="opacity-75">In the print window choose “Save as PDF”.</span>
      <button className="rounded bg-gold px-4 py-2 font-semibold text-ink" onClick={() => window.print()}>
        Save as PDF
      </button>
    </div>
  );
}
