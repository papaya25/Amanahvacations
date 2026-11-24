// Run: node --experimental-strip-types scripts/accounting-check.mts
import assert from "node:assert";
import { countryFromPhone, matchPartner, DEFAULT_PARTNERS, buildBalances, periodStatement, rowMath, partnerTransferRate, seatPax, transferCostId, isBabyAge, parseStripeRef } from "../src/lib/accounting.ts";
assert.equal(countryFromPhone("+1 8196647489")?.name, "Canada");
assert.equal(countryFromPhone("+1 (678) 717-7781")?.name, "USA");
assert.equal(countryFromPhone("+44 7946 472769")?.name, "United Kingdom");
assert.equal(countryFromPhone("+971 50 1234567")?.name, "UAE");
assert.equal(countryFromPhone("8196647489"), null);
assert.equal(matchPartner("JF tours", DEFAULT_PARTNERS)?.id, "jf");
assert.equal(matchPartner("Riviera Tours", DEFAULT_PARTNERS)?.id, "jf");
assert.equal(matchPartner("Azul Riviera", DEFAULT_PARTNERS)?.id, "azul-riviera");
assert.equal(matchPartner("tutcasa", DEFAULT_PARTNERS)?.name, "TutCasa");
const tc = DEFAULT_PARTNERS[0];
assert.equal(partnerTransferRate(tc, 3), 1300); assert.equal(partnerTransferRate(tc, 4), 1500);
const m = rowMath({ charged: 7400, cost: 6400, fee: 0, commission: 370 }, 0);
assert.equal(m.net, 630); assert.equal(m.tax, 0);
assert.equal(rowMath({ charged: 800, cost: 1000, fee: 0, commission: 0 }, 30).net, -200);
// Moussa collected cash & did the ride → owes us the profit; TutCasa billed → owes the price; JF did it → we owe cost.
const base = { key: "", editable: true, phone: null, groupKey: "", groupId: "", country: "", countryIso: "", people: 2, service: "Tour" as const, description: "", source: "", fee: 0, feeExact: false, note: "", stripeRef: "", method: "Cash", name: "x" };
const b = buildBalances([
  { ...base, date: "2026-09-02", provider: "Moussa", collectedBy: "Moussa", charged: 1200, cost: 800, affiliate: null, commission: 0 },
  { ...base, date: "2026-09-03", provider: "JF Tours", collectedBy: "TutCasa", charged: 1300, cost: 1000, affiliate: "TutCasa", commission: 0 },
  { ...base, date: "2026-09-04", provider: "Azul Riviera", collectedBy: "Amanah", charged: 7400, cost: 6400, affiliate: "TutCasa", commission: 370 },
  { ...base, date: "2099-01-01", provider: "Moussa", collectedBy: "Moussa", charged: 5000, cost: 0, affiliate: null, commission: 0 }, // future: not owed yet
], [{ id: "p", date: "2026-09-05", partner: "TutCasa", direction: "received", kind: "settlement", method: "Transfer", amount: 1000, note: "" }], DEFAULT_PARTNERS);
const by = Object.fromEntries(b.map((x) => [x.name, x.balance]));
// Commission (370) is NOT in balances — it lives in the Commissions tab.
assert.deepEqual(by, { TutCasa: 1300 - 1000, Moussa: 400, JF: -1000, "Azul Riviera": -6400 });
// Transfer cost tiers by seated people; babies (under 2) don't take a seat.
assert.deepEqual([1, 2, 3, 4, 6, 7, 9].map(transferCostId), ["transfer-1", "transfer-2", "transfer-3", "transfer-4-6", "transfer-4-6", "transfer-7-8", "transfer-9plus"]);
assert.equal(seatPax({ adults: 2, kids: 2, kids_ages: "1, 6", passengers: 4 }), 3);
assert.equal(seatPax({ adults: 2, kids: 1, kids_ages: "8 months", passengers: 3 }), 2);
assert.equal(seatPax({ adults: null, kids: null, kids_ages: null, passengers: 5 }), 5);
assert.ok(isBabyAge("baby") && isBabyAge("0") && !isBabyAge("2") && !isBabyAge("12"));
// Ahmed: tour 7,850 paid by card on the provider's terminal, cost 6,700 → profit 1,150.
assert.equal(rowMath({ charged: 7850, cost: 6700, fee: 0, commission: 0 }, 0).net, 1150);
console.log("accounting checks OK");

// Stripe ref from a pasted dashboard link
assert.equal(parseStripeRef("https://dashboard.stripe.com/acct_1X/payments/pi_3AbC9xYz?foo=1"), "pi_3AbC9xYz");
assert.equal(parseStripeRef(" ch_123abc "), "ch_123abc");
assert.equal(parseStripeRef("1262"), "");
console.log("stripe ref ok");

// Payments before the opening date: spreadsheet imports are already in the opening
// balance (skipped); a payment typed in later always counts (Moussa paid 850 on Aug 29).
const opened = DEFAULT_PARTNERS.map((p) => ({ ...p, openingDate: "2026-09-01", openingBalance: p.id === "moussa" ? 850 : 0 }));
const pay = (id: string, amount: number, imported?: boolean) => ({ id, date: "2026-08-29", partner: "Moussa", direction: "received" as const, kind: "settlement" as const, method: "Cash", amount, note: "", imported });
const mb = buildBalances([], [pay("y-3", 1000, true), pay("p-1", 850)], opened).find((x) => x.name === "Moussa")!;
assert.equal(mb.balance, 0);
console.log("opening-date payments ok");

// Statements per month or year: each period starts where the last one ended.
const jf = DEFAULT_PARTNERS.map((p) => (p.id === "jf" ? { ...p, openingDate: "2026-09-01", openingBalance: 500 } : p));
const jb = buildBalances([
  { ...base, date: "2026-09-10", provider: "JF", collectedBy: "JF", charged: 7850, cost: 6700, affiliate: null, commission: 0 }, // card on JF's terminal → +1150
  { ...base, date: "2026-10-05", provider: "JF", collectedBy: "Amanah", charged: 9000, cost: 8000, affiliate: null, commission: 0, method: "Stripe" }, // → −8000
], [
  { id: "c", date: "2026-10-06", partner: "JF", direction: "made", kind: "commission", method: "Cash", amount: 99, note: "" }, // ignored here
  { id: "w", date: "2026-10-20", partner: "JF", direction: "made", kind: "settlement", method: "Wise", amount: 3000, note: "" },
], jf).find((x) => x.name === "JF")!;
const sep = periodStatement(jb, "2026-09"), oct = periodStatement(jb, "2026-10");
assert.deepEqual([sep.broughtForward, sep.owesUs, sep.carried], [500, 1150, 1650]);
assert.deepEqual([oct.broughtForward, oct.weOwe, oct.wePaid, oct.carried], [1650, 8000, 3000, 1650 - 8000 + 3000]);
assert.equal(jb.balance, oct.carried);
assert.equal(periodStatement(jb, "2026-08").tracked, false);
const y = periodStatement(jb, "2026");
assert.deepEqual([y.broughtForward, y.owesUs, y.weOwe, y.wePaid, y.carried], [500, 1150, 8000, 3000, jb.balance]);
assert.equal(periodStatement(jb, "2027").broughtForward, jb.balance);
console.log("statements ok");

// Package split between suppliers: JF is owed only its parts, the rest Amanah paid directly.
const ab = buildBalances([
  { ...base, date: "2026-11-03", provider: "Amanah", collectedBy: "Amanah", charged: 26463, cost: 21287, affiliate: null, commission: 0, method: "Stripe",
    parts: [{ partner: "JF", what: "Round-trip transportation", cost: 2000 }, { partner: "JF", what: "Akumal + Tulum", cost: 6250 }, { partner: "Amanah Vacations", what: "Driver expenses", cost: 1000 }] },
], [], DEFAULT_PARTNERS);
assert.equal(ab.find((x) => x.name === "JF")!.balance, -8250);
assert.ok(!ab.some((x) => x.name.toLowerCase() === "amanah"));
console.log("package split ok");
