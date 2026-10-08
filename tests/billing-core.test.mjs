import assert from "node:assert/strict";
import test from "node:test";

import {
  GROCERY_REVIEW_CENTS,
  MAX_GROCERY_CENTS,
  isDefiniteSquareRefusal,
  nextVisitChargeKey,
  parseMoneyCents,
  parseSquareEnvironment,
} from "../app/billing-core.ts";

test("money typed by a person parses to exact cents", () => {
  assert.equal(parseMoneyCents("0"), 0);
  assert.equal(parseMoneyCents("84.62"), 8462);
  assert.equal(parseMoneyCents("84.6"), 8460);
  assert.equal(parseMoneyCents(" $84.62 "), 8462);
  assert.equal(parseMoneyCents("$1,084.62"), 108462);
  assert.equal(parseMoneyCents("1084"), 108400);
  assert.equal(parseMoneyCents("0.29"), 29);
  assert.equal(parseMoneyCents("19.99"), 1999);
});

test("money that Number() would accept but a person wouldn't mean is rejected", () => {
  for (const bad of ["", " ", "1e3", "0x10", "Infinity", "NaN", "-5", "+5", "12.345", "1,00", "1,0000", ".5", "5.", "1 000", "１２", null, undefined, {}, "12abc"]) {
    assert.equal(parseMoneyCents(bad), null, String(bad));
  }
});

test("large grocery totals are held for the owner, within the hard cap", () => {
  assert.ok(GROCERY_REVIEW_CENTS > 0 && GROCERY_REVIEW_CENTS < MAX_GROCERY_CENTS);
});

test("a new attempt after a decline gets the next key", () => {
  assert.equal(nextVisitChargeKey(12, "visit-12-1"), "visit-12-2");
  assert.equal(nextVisitChargeKey(12, "visit-12-9"), "visit-12-10");
  assert.equal(nextVisitChargeKey(12, "garbage"), "visit-12-2");
});

test("only a clear refusal counts as no money moved", () => {
  assert.equal(isDefiniteSquareRefusal(400, "CARD_DECLINED"), true);
  assert.equal(isDefiniteSquareRefusal(402, "INSUFFICIENT_FUNDS"), true);
  assert.equal(isDefiniteSquareRefusal(404, "NOT_FOUND"), true);
  // A reused key means Square already has a request under it, possibly a completed charge.
  assert.equal(isDefiniteSquareRefusal(400, "IDEMPOTENCY_KEY_REUSED"), false);
  assert.equal(isDefiniteSquareRefusal(409, "CONFLICT"), false);
  assert.equal(isDefiniteSquareRefusal(429, "RATE_LIMITED"), false);
  assert.equal(isDefiniteSquareRefusal(500, "INTERNAL_SERVER_ERROR"), false);
  assert.equal(isDefiniteSquareRefusal(503, undefined), false);
});

test("the Square environment must be spelled out exactly", () => {
  assert.equal(parseSquareEnvironment("sandbox"), "sandbox");
  assert.equal(parseSquareEnvironment("production"), "production");
  assert.equal(parseSquareEnvironment(" production "), "production");
  for (const bad of [undefined, "", "Production", "prod", "live", "sandbox2"]) {
    assert.equal(parseSquareEnvironment(bad), null, String(bad));
  }
});

test("the grocery hold is the visit price plus $150", async () => {
  const { groceryHoldCents, GROCERY_HOLD_BUFFER_CENTS } = await import("../app/billing-core.ts");
  assert.equal(GROCERY_HOLD_BUFFER_CENTS, 15000);
  assert.equal(groceryHoldCents(24400), 39400);
});

test("a visit is charged from its hold only when the hold is fresh and big enough", async () => {
  const { canChargeFromHold, HOLD_MAX_AGE_MS } = await import("../app/billing-core.ts");
  const now = Date.parse("2026-10-08T12:00:00Z");
  const hold = (amountCents, hoursAgo) => ({ amountCents, createdAt: new Date(now - hoursAgo * 3_600_000).toISOString() });
  assert.equal(canChargeFromHold(hold(39400, 20), 32862, now), true, "typical visit");
  assert.equal(canChargeFromHold(hold(39400, 20), 39400, now), true, "exactly the hold");
  assert.equal(canChargeFromHold(hold(39400, 20), 39401, now), false, "more than the hold");
  assert.equal(canChargeFromHold(hold(39400, 20), 0, now), false, "nothing to charge");
  assert.equal(canChargeFromHold(hold(39400, HOLD_MAX_AGE_MS / 3_600_000 + 1), 30000, now), false, "too old");
  assert.equal(canChargeFromHold(hold(39400, -1), 30000, now), false, "clock in the future");
  assert.equal(canChargeFromHold({ amountCents: 39400, createdAt: "garbage" }, 30000, now), false, "bad date");
});
