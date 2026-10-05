import test from "node:test";
import assert from "node:assert/strict";
import { ingredientName, ingredientNames } from "../app/account/plan/dish-info.ts";

test("ingredient lines turn into plain names", () => {
  assert.equal(ingredientName("5 lb ground beef"), "Ground beef");
  assert.equal(ingredientName("2 large yellow onions, finely diced"), "Yellow onions");
  assert.equal(ingredientName("1½ tbsp kosher salt (for the filling)"), "Kosher salt");
  assert.equal(ingredientName("¼ cup flat-leaf parsley, chopped"), "Flat-leaf parsley");
  assert.equal(ingredientName("8 cloves garlic, minced"), "Garlic");
  assert.equal(ingredientName("Salt and pepper"), "Salt and pepper");
});

test("repeated ingredients are listed once", () => {
  assert.deepEqual(ingredientNames(["2 tbsp kosher salt (for the water)", "2 tsp kosher salt (for the mash)", "1 onion"]), ["Kosher salt", "Onion"]);
});
