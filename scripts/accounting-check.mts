// Run: node --experimental-strip-types scripts/accounting-check.mts
import assert from "node:assert";
import { countryFromPhone, matchPartner, DEFAULT_PARTNERS, buildBalances, rowMath, partnerTransferRate } from "../src/lib/accounting.ts";
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
console.log("accounting checks OK");
