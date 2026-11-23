// Run: node --experimental-strip-types scripts/accounting-check.mts
import assert from "node:assert";
import { countryFromPhone, matchPartner, DEFAULT_PARTNERS, buildBalances, rowMath, partnerTransferRate, seatPax, transferCostId, isBabyAge, parseStripeRef } from "../src/lib/accounting.ts";
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
assert.deepEqual(by, { TutCasa: 1300 - 370 - 1000, Moussa: 400, JF: -1000, "Azul Riviera": -6400 });
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
