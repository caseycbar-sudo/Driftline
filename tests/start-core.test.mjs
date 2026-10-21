import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PRICING } from "../app/pricing-core.ts";
import { afterSignupPath } from "../app/start-core.ts";
import { startPick } from "../app/request-core.ts";

const packages = DEFAULT_PRICING.mealPrep;

test("each household size gets the package the plan builder would pick for a 3-dish menu", () => {
  const names = [1, 2, 3, 4, 5].map((n) => startPick(packages, n)?.pkg.name);
  assert.deepEqual(names, ["Essential", "Weekly", "Household", "Family", "Large Family"]);
});

test("a 2 person household sees 12 portions and the Weekly price", () => {
  const pick = startPick(packages, 2);
  assert.equal(pick?.portions, 12);
  assert.equal(pick?.pkg.priceCents, 23500);
});

test("sizes that do not fit any package have no pick", () => {
  assert.equal(startPick(packages, 6), null);
  assert.equal(startPick(packages, 0), null);
});

test("after sign-up the customer lands in the dish picker set to their household", () => {
  assert.equal(afterSignupPath(3), "/account/plan?people=3");
  assert.equal(afterSignupPath(99), "/account/plan?people=2");
  assert.equal(afterSignupPath(Number.NaN), "/account/plan?people=2");
});
