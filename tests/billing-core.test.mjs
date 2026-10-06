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
