import test from "node:test";
import assert from "node:assert/strict";
import { effortOf, entreeLimit, planVisit, packageAllowance, formatMinutes } from "../app/visit-plan.ts";
import { recipes } from "../app/cookbook/recipes.ts";

const byId = (id) => recipes.find((r) => r.id === id);

test("entrée limits follow package size", () => {
  assert.equal(entreeLimit(6), 2);
  assert.equal(entreeLimit(8), 2);
  assert.equal(entreeLimit(12), 3);
  assert.equal(entreeLimit(16), 4);
  assert.equal(entreeLimit(24), 4);
  assert.equal(packageAllowance(12), "Up to 3 entrées + 1 dessert");
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

test("too many entrées for the package is flagged, desserts don't count as entrées", () => {
  const plan = planVisit([byId(31), byId(39), byId(46)], 8);
  assert.equal(plan.entrees, 2);
  assert.equal(plan.desserts, 1);
  assert.ok(plan.ok, plan.warnings.join(" "));
  const tooMany = planVisit([byId(31), byId(39), byId(33)], 8);
  assert.ok(tooMany.warnings.some((w) => /3 entrées/.test(w)));
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
