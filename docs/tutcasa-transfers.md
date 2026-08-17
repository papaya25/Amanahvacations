# TutCasa airport transfers — spec for the Amanah side

Every TutCasa booking includes a **free ARRIVAL transfer** (departures are
not included) fulfilled by Amanah. TutCasa collects the details (its team or
the guest) and pushes the job here. Amanah works the queue and drives the
status; the guest's only direct channel to Amanah is a prefilled WhatsApp
deep link carrying the `TC-…` ref — no group chats, no TutCasa in the thread,
and any non-transfer question gets redirected to May.

Auth: same shared key as the booking API — header `x-partner-key`
(`TUTCASA_PARTNER_KEY` env on this side). All responses `no-store`.

## 1. BUILD: `POST /api/partner/tutcasa-transfers` (on amanahvacations.com)

TutCasa pushes a job on create AND on every update/resend (upsert by
`transferId`):

```jsonc
{
  "transferId": "a405f736-…",        // TutCasa's id — key for upserts & callbacks
  "ref": "TC-1002",                   // human ref, also used in the guest's WhatsApp
  "fullName": "Sarah Ahmed",
  "travelDate": "2027-07-01",
  "flightNumber": "AM 512",
  "passengers": 3,
  "babySeat": true,
  "note": "2 big suitcases",          // may be null
  "guestPhone": "+15550001111",       // may be null
  "home": "Palma Azul — Playa del Carmen",  // drop-off
  "checkIn": "2027-07-01",
  "status": "requested"
}
```

Respond `200 {"ok":true}`. Store it and show it in a new **admin →
"TutCasa transfers"** queue: one card per job with all fields, newest
travel date first, and the `⚠ resend` case handled by upsert (a resend
after "need details" replaces the fields and the job goes back to
*requested*).

(TutCasa also emails each job to `ADMIN_NOTIFY_EMAIL` as a fallback, so
missing this endpoint never loses a job — but the queue is the workflow.)

## 2. USE: status callback to TutCasa

Each queue card has three actions, each calling
`POST {TUTCASA_API_BASE}/api/partner/transfers/{transferId}/status`
with `x-partner-key`:

- **Confirm** → `{"status":"confirmed"}`
- **Need more details** → `{"status":"need_details","note":"Which terminal?"}`
  — the note is REQUIRED (422 without it); it appears verbatim to the
  TutCasa admin and the guest, and reopens their form. When they fix and
  resend, the job comes back through endpoint 1 as *requested* again.
- **Done** (after pickup) → `{"status":"done"}`

`200 {"ok":true}` on success; `404` if the transfer vanished on the
TutCasa side (treat as closed).

## 3. Guest contact rule (already handled, just honor it)

Guests reach Amanah ONLY via the prefilled WhatsApp link ("About my TutCasa
airport transfer TC-1002 — …"). If a guest asks anything non-transfer there,
reply with the canned redirect to May — do not handle concierge/stay topics.

## Out of scope for now
- Departure transfers (not included in the free offer).
- Automatic WhatsApp notifications (needs WhatsApp Business API — later).
