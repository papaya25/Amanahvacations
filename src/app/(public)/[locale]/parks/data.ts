/* The parks & experiences catalogue. `id` MUST match the activity ids in the
   add-on catalogue (packages/data.ts ACTIVITIES) — checkout re-prices every
   park line server-side by that id (getActivityLineTotal), and the page pulls
   live prices from the admin Add-ons section by the same id. Prices below are
   the rate-card fallbacks (MXN per person) used when the DB isn't reachable.

   Flat brand logos render "contain" on the park's own brand color; the Xplor
   parks' artwork is photographic and renders "cover" like a tour photo. */

export type Park = {
  id: string;
  name: string;
  sub: string;
  dur: string;
  img: string;
  imgFit: "cover" | "contain";
  imgBg?: string;
  price: number; // MXN per person, ticket + private round-trip transport
  desc: string;
};

export const PARKS: Park[] = [
  {
    id: "xcaret",
    name: "Xcaret Plus",
    sub: "The landmark park of the Riviera Maya",
    dur: "Full day",
    img: "/images/parks/xcaret.jpg",
    imgFit: "contain",
    imgBg: "#00a651",
    price: 3550,
    desc: "Swim underground rivers, wander Maya ruins and meet Mexico's wildlife — then end the night with Xcaret México Espectacular, a 300-performer journey through Mexico's history. Plus admission includes buffet dining, lockers and towels.",
  },
  {
    id: "xelha",
    name: "Xel-Há",
    sub: "All-inclusive natural aquarium",
    dur: "Full day",
    img: "/images/parks/xelha.jpg",
    imgFit: "contain",
    imgBg: "#ffffff",
    price: 2700,
    desc: "A vast natural inlet where river meets sea — snorkel among tropical fish all day, drift the lazy river, cliff-jump, and climb the lighthouse waterslide. Unlimited food and drinks are included, so the whole day is truly carefree.",
  },
  {
    id: "xplor",
    name: "Xplor",
    sub: "Jungle adrenaline, above and below ground",
    dur: "Full day",
    img: "/images/parks/xplor.jpg",
    imgFit: "cover",
    price: 3500,
    desc: "Fly the tallest ziplines in the Riviera, drive amphibious vehicles through jungle and caverns, and paddle rafts across glowing stalactite caves. Includes all circuits and meals — helmets on, phones down, pure adventure.",
  },
  {
    id: "xplorfuego",
    name: "Xplor Fuego",
    sub: "The night edition — jungle by firelight",
    dur: "Evening (5:30 PM – 11:00 PM)",
    img: "/images/parks/fuego.jpg",
    imgFit: "cover",
    price: 3100,
    desc: "The same wild circuits as Xplor — ziplines, amphibious vehicles, underground rivers — completely transformed after dark, lit by torches and firelight. A totally different thrill, and noticeably cooler for the activities.",
  },
  {
    id: "xsenses",
    name: "Xenses",
    sub: "A park that plays with your five senses",
    dur: "Half day",
    img: "/images/parks/xenses.png",
    imgFit: "contain",
    imgBg: "#ffd800",
    price: 1900,
    desc: "Walk a town where nothing is what it seems, slide into underground rivers, float weightless in a salt river and cross the jungle blindfolded. Compact, funny and surprising — brilliant for families and perfect alongside a beach afternoon.",
  },
  {
    id: "monkey",
    name: "Monkey Sanctuary",
    sub: "Rescued wildlife, up close",
    dur: "Half day",
    img: "/images/parks/monkey.png",
    imgFit: "contain",
    imgBg: "#ffffff",
    price: 1700,
    desc: "A protected sanctuary in Akumal caring for spider monkeys, coatis and macaws rescued from the illegal wildlife trade. Walk the shaded jungle paths with a keeper and — under supervision — get remarkably close. The visit children remember most.",
  },
];
