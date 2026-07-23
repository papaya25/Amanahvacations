/* Hero & home content — written by /admin/hero, read by the home page. */

import { getPublicContent } from "@/lib/content/site";

export type HeroSlide = { image: string; name: string; sub: string };

export type HeroContent = {
  headline: string;
  headlineEm: string;
  tagline: string;
  slides: HeroSlide[];
  dreamTitle: string;
  dreamText: string;
};

export const DEFAULT_HERO: HeroContent = {
  headline: "The Real",
  headlineEm: "Riviera Maya.",
  tagline:
    "Skip the crowds and the noise. Private tours, hidden cenotes, and Caribbean beaches — curated for families and couples who want something more than an ordinary holiday.",
  slides: [
    { image: "/images/hero-cenotes.jpg", name: "Hidden Cenotes", sub: "Sacred underground rivers" },
    { image: "/images/hero-tulum.jpg", name: "Tulum Ruins", sub: "Ancient Mayan civilisation" },
    { image: "/images/hero-dining.jpg", name: "Sunset Dining", sub: "Private beachside experience" },
    { image: "/images/hero-jungle.jpg", name: "Jungle Adventure", sub: "Zip-lines & Mayan ruins" },
    { image: "/images/hero-villas.jpg", name: "Luxury Villas", sub: "Infinity pools & Caribbean views" },
    { image: "/images/hero-beaches.jpg", name: "Private Beaches", sub: "Exclusive cabanas & white sands" },
  ],
  dreamTitle: "Your dream adventure is just around the corner",
  dreamText:
    "Your dream adventure in the Riviera Maya is just around the corner, where lush jungle paths lead to hidden cenotes, turquoise waters stretch endlessly, and every moment is filled with excitement.",
};

export function getHero(): Promise<HeroContent> {
  return getPublicContent<HeroContent>("hero", DEFAULT_HERO);
}
