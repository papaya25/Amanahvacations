# TutCasa Partner Booking API — spec for the TutCasa side

Amanah Vacations (amanahvacations.com) will sell TutCasa stays **with full
payment taken on Amanah's checkout**. TutCasa remains the single source of
truth for the calendar. To make double-bookings impossible, TutCasa must
expose a server-to-server **hold → confirm → release** flow to Amanah.

This complements the existing public `/api/accommodation` endpoints (which
Amanah already consumes for the catalog and live quotes — keep those as they
are). The new endpoints are private, authenticated, and never called from a
browser.

---

## Authentication

- Every request carries the header `x-partner-key: <PARTNER_KEY>`.
- The key lives in an env var on both sides (suggested name:
  `AMANAH_PARTNER_KEY` on TutCasa). Maher will provide the generated key.
- Wrong/missing key → `401 {"error":"UNAUTHORIZED"}`.
- These routes must be excluded from any public CORS config (server-to-server
  only), and all responses `Cache-Control: no-store`.

## Booking model decision (already made by Maher)

- **Full payment upfront on Amanah — no deposit split.** Partner bookings are
  paid in full at confirmation time. The dueNow/balance schedule does NOT
  apply to partner bookings.
- The **refundable security deposit is NOT collected by Amanah.** TutCasa
  handles it with the guest directly (at/around check-in), exactly as for
  direct bookings. If TutCasa normally emails deposit instructions, keep
  doing that for partner bookings.

---

## 1. `POST /api/partner/holds` — lock dates while the guest pays

Request body:

```jsonc
{
  "slug": "casa-selva",
  "checkIn": "2026-10-05",        // YYYY-MM-DD
  "checkOut": "2026-10-12",       // exclusive, same semantics as /api/accommodation
  "guests": 4,
  "partnerRef": "AMN-483920"      // Amanah's order id — store it
}
```

Behavior (MUST be atomic — see "Race safety" below):

1. Validate the listing exists and is published; validate dates and guests
   (max guests, min stay) with the SAME rules as the public quote endpoint.
2. Check availability against confirmed bookings AND non-expired holds.
3. Compute the price server-side with the full TutCasa pricing model — the
   same number the public quote endpoint would return as `total`.
4. Create a hold that **blocks those dates for 60 minutes**, then return:

```jsonc
// 201
{
  "ok": true,
  "holdId": "hold_9f3k2m…",        // unguessable id
  "expiresAt": "2026-08-14T17:45:00Z",
  "quote": {
    "nights": 7,
    "currency": "USD",
    "total": 2577                   // FULL amount Amanah will charge
  }
}
```

Failures — `409` with `{"ok":false,"error":"DATES_TAKEN"}` (also when blocked
by another live hold), or `422` with `"MIN_STAY_NOT_MET" | "INVALID_DATES" |
"MAX_GUESTS_EXCEEDED"`, or `404 "NOT_FOUND"`.

While a hold is live, the public `/api/accommodation/{slug}` endpoint must
report those dates inside `unavailable` (so both websites show them blocked).

**Race safety:** two overlapping hold/booking attempts must never both
succeed. Enforce at the database level (e.g. a transaction with an exclusion
constraint on the date range, or `SELECT … FOR UPDATE` on the listing's
calendar), not just an application-level check.

**Expiry:** a hold that is neither confirmed nor released frees its dates
automatically after `expiresAt`. Lazy expiry is fine (treat expired holds as
non-blocking when checking availability) — no cron needed.

## 2. `POST /api/partner/holds/{holdId}/confirm` — payment received, make it a real booking

Amanah calls this from its payment webhook after the guest has paid in full.

Request body:

```jsonc
{
  "partnerRef": "AMN-483920",
  "guestName": "Sarah Ahmed",
  "guestEmail": "sarah@example.com",
  "guestWhatsapp": "+15551234567",   // optional
  "amountPaid": 2577,                 // what Amanah charged, in `currency`
  "currency": "USD",
  "notes": "Guest speaks French"      // optional, free text
}
```

Behavior:

1. If the hold exists and is live → convert it into a **confirmed booking**:
   - permanently blocks the dates;
   - appears in TutCasa's admin/calendar like any direct booking, labeled
     with source **"Amanah Vacations"** and the `partnerRef`;
   - marked **paid in full via partner** (no dueNow/balance schedule).
2. Return `200 {"ok":true,"bookingId":"…"}`.
3. **Idempotent:** confirming an already-confirmed hold returns the same
   `bookingId` with `200` (Amanah's webhook may retry).
4. Hold expired or unknown → `410 {"ok":false,"error":"HOLD_EXPIRED"}`.
   (Amanah handles this manually — it means payment took longer than the
   hold TTL. Rare, but must be a distinct error.)

**Emails:** do NOT send TutCasa's own payment/booking-received email for
partner bookings — Amanah sends the confirmation. TutCasa SHOULD still send
its usual pre-arrival/check-in instructions when it normally would.

## 3. `POST /api/partner/holds/{holdId}/release` — free the dates early

Called when payment fails or the guest cancels checkout. No body required
(`partnerRef` optional for logging). Releases the hold immediately.
Idempotent: releasing an expired/unknown/already-released hold returns
`200 {"ok":true}` — never an error.

---

## Out of scope for v1 (note for later)

- Cancellations/refunds of confirmed partner bookings: handled manually by
  Maher in both systems for now. A `DELETE`/cancel endpoint can come later.
- Payouts/settlement between the two businesses: business-side, not API.

## Acceptance checklist (please verify before reporting done)

- [ ] Hold on free dates → 201 with quote total matching the public quote
      endpoint for the same dates/guests.
- [ ] Second overlapping hold while the first is live → 409 DATES_TAKEN.
- [ ] Public availability shows held dates as unavailable during the hold.
- [ ] Hold expires after 60 min → dates free again, confirm returns 410.
- [ ] Confirm on a live hold → booking visible in TutCasa admin with source
      "Amanah Vacations", partnerRef, paid-in-full; dates blocked; repeat
      confirm returns the same bookingId.
- [ ] Release → dates free immediately; repeat release still 200.
- [ ] All three endpoints reject a wrong `x-partner-key` with 401.
- [ ] No TutCasa payment email is sent for a partner booking.

When implemented, reply with: the exact base paths, the env var name you
used for the key, and anything that differs from this spec.
