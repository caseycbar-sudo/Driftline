import test from "node:test";
import assert from "node:assert/strict";
import { effortOf, entreeLimit, planVisit, packageAllowance, formatMinutes } from "../app/visit-plan.ts";
import { recipes } from "../app/cookbook/recipes.ts";

const byId = (id) => recipes.find((r) => r.id === id);

test("every package is 3 to 5 entrées plus 1 dessert", () => {
  for (const portions of [6, 8, 12, 16, 20, 24, 32]) {
    assert.equal(entreeLimit(portions), 5);
    assert.equal(packageAllowance(portions), "3 to 5 entrées + 1 dessert");
  }
});

test("effort labels", () => {
  assert.equal(effortOf({ active: 35, total: 85 }), "Easy");
  assert.equal(effortOf({ active: 50, total: 110 }), "Medium");
  assert.equal(effortOf({ active: 75, total: 120 }), "Big project");
  assert.equal(effortOf({ active: 50, total: 270 }), "Big project", "a long braise is a big project");
  assert.equal(effortOf(byId(45)), "Big project", "lasagna");
  assert.equal(effortOf(byId(43)), "Big project", "meatballs and spaghetti");
});

test("three easy dishes for 12 portions fit comfortably", () => {
  const plan = planVisit([byId(31), byId(39), byId(36)], 12);
  assert.equal(plan.level, "good");
  assert.ok(plan.minutes <= 180, `${plan.minutes} min`);
  assert.deepEqual(plan.warnings, []);
});

test("three big projects are flagged", () => {
  const plan = planVisit([byId(45), byId(43), byId(8)], 12);
  assert.equal(plan.ok, false);
  assert.ok(plan.warnings.some((w) => /big-project/.test(w)));
  assert.notEqual(plan.level, "good");
});

test("more than 5 entrées is flagged, desserts don't count as entrées", () => {
  const plan = planVisit([byId(31), byId(39), byId(36), byId(46)], 8);
  assert.equal(plan.entrees, 3);
  assert.equal(plan.desserts, 1);
  assert.ok(!plan.warnings.some((w) => /entrées:/.test(w)), plan.warnings.join(" "));
  const five = planVisit([byId(31), byId(39), byId(33), byId(36), byId(32)], 16);
  assert.ok(!five.warnings.some((w) => /entrées:/.test(w)), "5 entrées is allowed");
  const tooMany = planVisit([byId(31), byId(39), byId(33), byId(36), byId(32), byId(34)], 16);
  assert.ok(tooMany.warnings.some((w) => /6 entrées/.test(w)));
  const twoDesserts = planVisit([byId(31), byId(46), byId(47)], 12);
  assert.ok(twoDesserts.warnings.some((w) => /desserts/.test(w)));
});

test("a long braise is called out on its own", () => {
  const plan = planVisit([byId(9)], 12);
  assert.ok(plan.warnings.some((w) => /longer than a visit/.test(w)));
});

test("hand-typed dishes get a cautious estimate", () => {
  const plan = planVisit([{ title: "Grandma's goulash" }], 12);
  assert.deepEqual(plan.unknown, ["Grandma's goulash"]);
  assert.ok(plan.minutes > 0);
  assert.equal(formatMinutes(155), "2 hr 35 min");
  assert.equal(formatMinutes(180), "3 hr");
});
