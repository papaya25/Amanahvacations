# Amanah Vacations — amanahvacations.com rebuild

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind 4. Rebuilt from Maher's
Wix site (the Wix iframe embeds killed SEO). Owner: Maher — a business owner, not a
developer: explain things plainly, no jargon walls, and confirm before deviating
from his designs. He works on TutCasa (separate project, `~/Desktop/tutcasa-*`) in
parallel — never mix the two.

## Environment
- Node 22 lives at `~/.local/node22/bin` (no system node/brew). Prefix commands:
  `PATH="$HOME/.local/node22/bin:$PATH"`.
- Dev server: `.claude/launch.json` config "amanah-dev" → port 3010. It's a local
  process; if "the links stop working," it just needs restarting.
- Never run `next build` while `next dev` runs (shared `.next`). Verify with
  `npx tsc --noEmit` + dev server; full builds also work here (project was moved
  OFF the iCloud-synced Desktop to `~/dev` on 2026-07-22 — don't move it back).
- Wix CDN (static.wixstatic.com) 403s curl; fetch images through the in-app
  browser (temp `/api/save-image` route trick — delete the route after).
- Maher's photo/content library: `~/Desktop/Amanah Vacations/` (business plans,
  Price List Tours.xlsx, logos, web photos). Original Wix embed code: `*.docx`
  in repo root + `content/`.

## State (2026-07-22): FRONT-END COMPLETE, flow-first
All ~40 public pages + full booking flow + admin CMS are built and QA'd (tsc +
prod build clean, all routes 200). Everything interactive persists to
localStorage only ("preview mode") — the agreed pattern is **flow first, then
wire backend**. Key libs: `src/lib/cart.tsx` (CartProvider), `src/lib/orders.ts`,
`src/lib/currency.tsx` (base MXN, display USD/MXN/EUR, header switcher),
`src/lib/useLocalState.ts` (admin persistence), `src/lib/seo.ts` + `JsonLd`/`Faq`
components (schema: TravelAgency, Product+Offer, TouristAttraction, FAQPage,
breadcrumbs; sitemap.ts + robots.ts).

Public: home (hero slideshow w/ separate mobile layout, trip picker w/ ?plan=
highlight into /packages), /activities + 24 /destinations/[slug], /packages +
/tours (both with full pricing engines, offer/sale display = strikethrough + red
price + −% badge; demo offers hardcoded: Water Lovers pkg, Chichén tour),
/airport-transfers (footer-linked only — NOT in top menu, Maher's choice),
/vip + /halal (dark-luxe, LuxeIcons line icons — Maher hates emoji icons),
/aboutus, /contact, 3 legal pages (generated from his docx; contain visible
"placeholder — needs your input" callouts: RFC, RNT, jurisdiction), cart /
checkout (promo codes AMANAH10/WELCOME500 demo, Stripe+PayPal+MercadoPago
selector, REQUIRED legal-consent checkbox, airport-transfer add-on) /
thank-you / login / account/{orders,profile,settings,preferences}.

Admin (`/admin`, 15 sections, own chrome via SiteFrame): hero, packages / tours
(incl. itinerary editor) / activities / addons — all with add/remove/hide +
offer-price fields —, about, faq, promos, currency, transfers, costs (per-item
cost + 30% tax rate → future profit calc), contact & social, emails (4 templates
+ custom automations add/remove), legal. **Admin edits do NOT affect the public
pages yet** — that's exactly the backend integration work.

## Decisions locked with Maher
- Payments: Stripe + PayPal + Mercado Pago, all three. He creates the accounts
  and shares TEST keys; never touch card data; build test-mode first.
- Guest checkout + optional accounts.
- One display currency at a time (no dual MXN/USD).
- Accommodation section: POSTPONED until he closes hotel deals. Keep in mind.
- SEO: won long-tail/local/niche angles (private/family/halal). After deploy,
  WALK HIM THROUGH Google Search Console, sitemap submission, indexing, Google
  Business Profile, reviews (he explicitly asked for this guidance).
- Footer TikTok/YouTube links: placeholders — need his real URLs.

## NEXT PHASE (this is the current task): Supabase backend
Create a **separate Amanah Supabase project** (never reuse TutCasa's). Confirm
with Maher before creating cloud resources. Scope, roughly in order:
1. Content layer: admin editors read/write DB; public pages render from DB
   (server-side, keep SEO) — this makes admin edits live everywhere, e.g.
   changing the contact number once updates footer, contact page, legal, etc.
2. Auth: customer accounts (guest checkout stays) + admin login; /admin becomes
   role-protected (profits section extra-restricted).
3. Orders/bookings + promo validation server-side.
4. Payments: Stripe + PayPal + Mercado Pago (test mode).
5. Contact form + automated emails (templates already authored in /admin/emails;
   suggest Resend). Record checkout consent with each order.
6. Real image upload for admin ImagePicker (currently preview-only object URLs).
7. Business dashboard (build WITH real data, per agreement): visitors + sources
   (add Vercel Analytics), orders/packages/abandoned carts/add-ons stats,
   bookings calendar, connected-users list w/ emails (newsletter), password-
   restricted profits (his /admin/costs inputs vs sales → profit before/after
   30% tax, graphs day/month/year).
8. Deploy: GitHub repo "amanah-website" → Vercel → point amanahvacations.com,
   then the Search Console walkthrough.

Contact constants used everywhere until the DB drives them: WhatsApp
529844521184, booking@amanahvacations.com, Playa del Carmen, Q.R., Mexico.
