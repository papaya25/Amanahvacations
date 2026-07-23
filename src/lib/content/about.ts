/* About-page content — written by /admin/about. The public page keeps its
   richer built-in copy until the admin saves this section; after that the
   admin's fields drive the page (missing fields fall back to these defaults). */

import { getSavedContent } from "@/lib/content/site";

export type ValueCard = { title: string; desc: string };

export type About = {
  headline: string;
  intro: string;
  quote: string;
  story: string;
  values: ValueCard[];
  closingTitle: string;
  closingText: string;
};

export const DEFAULT_ABOUT: About = {
  headline: "We know where to find real adventure",
  intro:
    "The Riviera Maya is more than just a destination — it's a place where nature, culture, and unforgettable experiences come together. At Amanah Vacations, we go beyond simply offering activities — we design complete experiences, taking care of every detail so you can fully enjoy your journey.",
  quote: "We don't believe in one-size-fits-all travel. Every journey is different — and that's exactly how we design it. For you.",
  story:
    "Our journey began with a simple idea: to share the beauty and diversity of the Riviera Maya with the world. We open this incredible destination to a wider audience — welcoming guests from North Africa, the Middle East, and South & East Asia — with a multilingual team and deep attention to detail.",
  values: [
    { title: "Multilingual Team", desc: "English, Français, Español & العربية — we welcome travelers from every corner of the world." },
    { title: "Every Detail Handled", desc: "From first contact to your final day, everything is seamless, organized and tailored." },
    { title: "Private & Luxury", desc: "High-end, private and discreet experiences for those who value comfort and exclusivity." },
    { title: "Halal-Friendly", desc: "Carefully selected stays and activities that respect Muslim travelers' values and lifestyle." },
  ],
  closingTitle: "Turning unforgettable moments into your ultimate adventure",
  closingText:
    "The Riviera Maya offers experiences found nowhere else in the world — magical cenotes, iconic sites like Tulum and Chichén Itzá, and moments that are authentic and deeply immersive. No matter where you come from, once you've experienced the Riviera Maya, a part of Mexico will always live within you.",
};

/** Saved about content merged over defaults, or null if never saved. */
export async function getAbout(): Promise<About | null> {
  const saved = await getSavedContent<About>("about");
  return saved ? { ...DEFAULT_ABOUT, ...saved } : null;
}
