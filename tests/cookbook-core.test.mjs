import test from "node:test";
import assert from "node:assert/strict";
import { applyOverrides, customRecipe, nextCustomId, parseRecipePatch, CUSTOM_ID_START } from "../app/cookbook-core.ts";

const base = [
  {
    id: 1,
    slug: "chicken-thighs",
    side: "meal-prep",
    title: "Chicken Thighs",
    category: "Poultry",
    description: "Original wording.",
    servings: 12,
    yieldNote: "12 portions",
    active: 40,
    total: 90,
    tags: ["High protein"],
    allergens: ["Wheat"],
    dietary: [],
    image: "/cookbook/mp/a.webp",
    photoCredit: { author: "X", source: "Pexels", page: "https://example.com" },
    ingredients: ["6 lb chicken thighs"],
    directions: ["Roast."],
    equipment: [],
    storage: "Fridge.",
    reheating: "Oven.",
    makeAhead: "",
    safety: "165°F.",
    chefNotes: "",
  },
  { ...{}, id: 2, slug: "cod", side: "meal-prep", title: "Cod", category: "Seafood", description: "", servings: 12, yieldNote: "", active: 20, total: 40, tags: [], allergens: ["Fish"], dietary: [], image: "/cookbook/mp/b.webp", photoCredit: { author: "", source: "", page: "" }, ingredients: [], directions: [], equipment: [], storage: "", reheating: "", makeAhead: "", safety: "", chefNotes: "" },
];

test("an edit changes only the fields it carries", () => {
  const rows = [{ recipeId: 1, side: "meal-prep", payload: JSON.stringify({ title: "Casey's Chicken", ingredients: ["5 lb chicken thighs"] }), hidden: 0, custom: 0 }];
  const merged = applyOverrides(base, rows);
  const dish = merged.find((r) => r.id === 1);
  assert.equal(dish.title, "Casey's Chicken");
  assert.deepEqual(dish.ingredients, ["5 lb chicken thighs"]);
  assert.equal(dish.directions[0], "Roast.", "untouched wording still comes from the recipe file");
  assert.equal(dish.image, "/cookbook/mp/a.webp");
  assert.equal(dish.slug, "caseys-chicken", "the link follows the new name");
});

test("a hidden dish drops out of the cookbook", () => {
  const merged = applyOverrides(base, [{ recipeId: 2, side: "meal-prep", payload: "{}", hidden: 1, custom: 0 }]);
  assert.deepEqual(merged.map((r) => r.id), [1]);
});

test("dishes Casey adds show up, with defaults filled in", () => {
  const rows = [{ recipeId: 900, side: "private-chef", payload: JSON.stringify({ title: "Dungeness Crab Toast", ingredients: ["crab"], directions: ["toast"] }), hidden: 0, custom: 1 }];
  const merged = applyOverrides(base, rows);
  const added = merged.find((r) => r.id === 900);
  assert.equal(added.side, "private-chef");
  assert.equal(added.servings, 6);
  assert.equal(added.image, "", "no photo until Casey uploads one (the site shows a placeholder card)");
  assert.equal(merged.length, 3);
});

test("broken or empty stored edits never break the cookbook", () => {
  const merged = applyOverrides(base, [{ recipeId: 1, side: "meal-prep", payload: "not json", hidden: 0, custom: 0 }]);
  assert.equal(merged[0].title, "Chicken Thighs");
});

test("new dishes get ids clear of the built-in ones", () => {
  assert.equal(nextCustomId([]), CUSTOM_ID_START);
  assert.equal(nextCustomId([{ recipeId: 901, side: "meal-prep", payload: "{}", hidden: 0, custom: 1 }]), 902);
  assert.equal(nextCustomId([{ recipeId: 12, side: "meal-prep", payload: "{}", hidden: 0, custom: 0 }]), CUSTOM_ID_START);
});

test("what gets saved is checked and tidied", () => {
  const ok = parseRecipePatch({ title: "  Spicy   Cod  ", ingredients: "2 lb cod\n\n  1 lemon ", allergens: ["Fish", "Nonsense"], servings: 12 });
  assert.equal(ok.ok, true);
  assert.equal(ok.patch.title, "Spicy Cod");
  assert.deepEqual(ok.patch.ingredients, ["2 lb cod", "1 lemon"]);
  assert.deepEqual(ok.patch.allergens, ["Fish"]);
  assert.equal("directions" in ok.patch, false, "fields the form didn't send stay untouched");

  assert.equal(parseRecipePatch({ title: "   " }).ok, false, "a dish needs a name");
  assert.equal(parseRecipePatch({ servings: 0 }).ok, false);
  assert.equal(parseRecipePatch({ image: "https://evil.example/pic.webp" }).ok, false, "photos must already be on the site");
  assert.equal(parseRecipePatch({ image: "/cookbook/mp/a.webp" }).ok, true);
  assert.equal(parseRecipePatch({ image: "/api/dish-photo/7f0c2f3e-1.jpg" }).ok, true, "Casey's own photo of the dish");
  assert.equal(parseRecipePatch({ image: "/api/dish-photo/../../etc/passwd" }).ok, false);
  assert.equal(parseRecipePatch({ title: "New" }, { full: true }).ok, false, "a new dish needs ingredients and steps");
});

test("a new dish keeps the storage note customers rely on", () => {
  const dish = customRecipe(900, "meal-prep", { title: "Test" });
  assert.match(dish.storage, /40°F/);
});

test("Casey's own uploaded photo takes his credit, not the stock photographer's", () => {
  const rows = [{ recipeId: 1, side: "meal-prep", payload: JSON.stringify({ image: "/api/dish-photo/abc.jpg" }), hidden: 0, custom: 0 }];
  const dish = applyOverrides(base, rows).find((r) => r.id === 1);
  assert.equal(dish.image, "/api/dish-photo/abc.jpg");
  assert.equal(dish.photoCredit.source, "Driftline");
});
