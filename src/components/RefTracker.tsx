"use client";

/* Remembers which partner sent the visitor (?ref=tutcasa on any page) in a
   30-day cookie; checkout stamps it on the order for commission tracking.
   Checkout only honours codes of affiliates listed in admin → Partners. */

import { useEffect } from "react";

export default function RefTracker() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[a-z0-9-]{2,40}$/i.test(ref)) {
        document.cookie = `amanah_ref=${ref.toLowerCase()}; max-age=${30 * 24 * 3600}; path=/; samesite=lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
