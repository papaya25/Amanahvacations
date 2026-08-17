"use client";

/* Remembers which partner sent the visitor (?ref=tutcasa on any page) in a
   30-day cookie; checkout stamps it on the order for commission tracking.
   Only known partners are accepted. */

import { useEffect } from "react";

const KNOWN_REFS = ["tutcasa"];

export default function RefTracker() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && KNOWN_REFS.includes(ref.toLowerCase())) {
        document.cookie = `amanah_ref=${ref.toLowerCase()}; max-age=${30 * 24 * 3600}; path=/; samesite=lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
