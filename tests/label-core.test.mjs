import assert from "node:assert/strict";
import test from "node:test";
import { allergenLine, DEFAULT_REHEAT, MAX_REHEAT_CHARS, reheatFontPt, reheatText, reheatTooLong } from "../app/label-core.ts";
import { recipes } from "../app/cookbook/recipes.ts";

test("a dish with no reheating directions still gets a safe 165°F instruction", () => {
  assert.equal(reheatText("   "), DEFAULT_REHEAT);
  assert.match(DEFAULT_REHEAT, /165°F/);
});

test("longer reheating directions use a smaller font, never below 5 points", () => {
  assert.ok(reheatFontPt("x".repeat(100)) > reheatFontPt("x".repeat(250)));
  assert.ok(reheatFontPt("x".repeat(500)) >= 5);
});

test("every meal prep recipe has reheating directions that fit a 3 x 2 inch label", () => {
  for (const r of recipes.filter((r) => r.side === "meal-prep")) {
    assert.ok(r.reheating.trim().length > 0, `${r.title} has no reheating directions`);
    assert.ok(r.reheating.length <= MAX_REHEAT_CHARS, `${r.title} reheating is ${r.reheating.length} characters, too long for the label`);
    if (/\b(chicken|turkey|beef|pork|salmon|fish|rockfish|shrimp|sausage|meatballs?|eggs?)\b/i.test(r.title)) assert.match(r.reheating, /165/, `${r.title} should say to reheat to 165°F`);
  }
});

test("allergens are listed, or flagged as not checked", () => {
  assert.equal(allergenLine(["Milk", "Wheat"], true), "Milk, Wheat");
  assert.match(allergenLine([], false), /Not checked/);
  assert.match(allergenLine([], true), /None/);
  assert.equal(reheatTooLong("x".repeat(MAX_REHEAT_CHARS + 1)), true);
});
