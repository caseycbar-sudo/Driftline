import assert from "node:assert/strict";
import test from "node:test";
import { buildGroceryList, scaleIngredients, groceryCategory } from "../app/portal/grocery-list.ts";
import { recipes, SIDES } from "../app/cookbook/recipes.ts";

test("combines matching quantities across dishes", () => {
  const list = buildGroceryList([
    { title: "One", ingredients: ["1½ lb chicken breast", "2 cloves garlic, minced"] },
    { title: "Two", ingredients: ["1¾ lb chicken breast", "3 cloves garlic, minced"] },
    { title: "Three", ingredients: ["¾ lb chicken breast", "1 clove garlic, minced"] },
  ]);
  assert.equal(list.find((i) => i.name === "chicken breast")?.display, "4 lb chicken breast");
  assert.equal(list.find((i) => i.name === "garlic")?.display, "6 cloves garlic");
});

test("keeps incompatible units and different cuts separate", () => {
  const list = buildGroceryList([{ title: "Dinner", ingredients: ["1 lb chicken breast", "2 lb chicken thighs", "1 cup chicken stock", "8 oz chicken stock"] }]);
  assert.equal(list.filter((i) => i.name.includes("chicken")).length, 4);
});

test("scales each dish before consolidating the shopping list", () => {
  const list = buildGroceryList([
    { title: "Chicken one", servings: 12, portions: 14, ingredients: ["1½ lb chicken breast"] },
    { title: "Chicken two", servings: 12, portions: 10, ingredients: ["1½ lb chicken breast"] },
  ]);
  assert.equal(list[0].display, "3 lb chicken breast");
});

test("scaled recipe lines keep their prep notes", () => {
  assert.deepEqual(scaleIngredients(["1½ lb chicken breast", "3 cloves garlic, minced"], 12, 16), ["2 lb chicken breast", "4 cloves garlic, minced"]);
});

test("count items scale too (eggs, onions)", () => {
  assert.deepEqual(scaleIngredients(["4 large eggs", "2 medium yellow onions, diced"], 12, 6), ["2 large eggs", "1 medium yellow onions, diced"]);
  const list = buildGroceryList([{ title: "A", servings: 6, portions: 12, ingredients: ["3 large eggs"] }, { title: "B", ingredients: ["1 large eggs"] }]);
  assert.equal(list.find((i) => i.name === "large eggs")?.display, "7 large eggs");
});

test("tiny volumes switch to the unit a cook would use", () => {
  assert.deepEqual(scaleIngredients(["¼ cup chopped dill", "1 tbsp lemon zest"], 12, 6), ["2 tbsp chopped dill", "1½ tsp lemon zest"]);
});

test("ingredients land in the right aisle", () => {
  const cases = {
    "black pepper": "Pantry", "red bell peppers": "Produce", "low-sodium chicken stock": "Pantry", "boneless skinless chicken thighs": "Meat & seafood",
    "unsalted butter": "Dairy & eggs", "creamy peanut butter": "Pantry", "butternut squash": "Produce", "corn tortillas": "Grains & bakery",
    "fennel seed": "Pantry", "ground turkey": "Meat & seafood", "ground cumin": "Pantry", "full-fat coconut milk": "Pantry", "large eggs": "Dairy & eggs",
  };
  for (const [name, aisle] of Object.entries(cases)) assert.equal(groceryCategory(name), aisle, name);
});

test("cookbook has both sides with the expected shape", () => {
  const mp = recipes.filter((r) => r.side === "meal-prep"), pc = recipes.filter((r) => r.side === "private-chef");
  assert.equal(mp.length, 35);
  assert.equal(pc.length, 20);
  assert.equal(new Set(recipes.map((r) => r.id)).size, recipes.length, "ids are unique");
  assert.equal(new Set(recipes.map((r) => r.title)).size, recipes.length, "titles are unique (chef jobs look dishes up by title)");
  for (const r of recipes) {
    assert.ok(SIDES[r.side].categories.includes(r.category), `${r.title}: category ${r.category}`);
    assert.equal(r.servings, r.side === "meal-prep" ? 12 : 6, r.title);
    assert.ok(r.directions.length >= 7, `${r.title}: needs real steps`);
    assert.ok(/\d{3}°F|advisory|raw/i.test(r.safety) || r.side === "private-chef", `${r.title}: safety temps`);
    // Either a local photo or none yet (the site shows a "photo coming soon" card).
    assert.ok(r.image === "" || r.image.startsWith("/"), r.title);
    if (r.image) assert.ok(r.photoCredit.author, `${r.title} has a photo credit`);
  }
});

test("every recipe scales cleanly across its whole range (no zero or NaN amounts)", () => {
  for (const r of recipes) {
    const side = SIDES[r.side];
    for (let n = side.min; n <= side.max; n += side.step)
      for (const line of scaleIngredients(r.ingredients, r.servings, n)) {
        assert.equal(/NaN|undefined|^0 /.test(line), false, `${r.title} @ ${n}: ${line}`);
      }
  }
});

const ALLERGEN_WORDS = {
  Egg: /\b(eggs?|yolks?|mayonnaise|aioli)\b/i,
  Fish: /\b(salmon|cod|rockfish|halibut|anchov\w*|fish sauce)\b/i,
  Shellfish: /\b(shrimp|prawns?|crab|clams?|scallops?|oysters?(?! mushrooms)|mussels?)\b/i,
  "Tree nuts": /\b(hazelnuts?|walnuts?|almonds?|pecans?|pine nuts|cashews?|pistachios?)\b/i,
  Peanuts: /\bpeanuts?\b/i,
  Sesame: /\b(sesame|tahini)\b/i,
};
test("allergen labels cover what's in the ingredients", () => {
  for (const r of recipes) {
    // Oyster mushrooms are not shellfish.
    const text = r.ingredients.map((line) => (/mushroom/i.test(line) ? line.replace(/\boysters?\b/gi, "") : line)).join(" ");
    for (const [allergen, pattern] of Object.entries(ALLERGEN_WORDS))
      if (pattern.test(text)) assert.ok(r.allergens.includes(allergen), `${r.title} contains ${allergen} but doesn't list it`);
    if (/\b(butter|cream|cheese|parmesan|yogurt|milk|ricotta|feta|gouda|crème)\b/i.test(text.replace(/peanut butter|coconut milk|coconut cream/gi, "")))
      assert.ok(r.allergens.includes("Milk"), `${r.title} contains dairy but doesn't list Milk`);
  }
});
