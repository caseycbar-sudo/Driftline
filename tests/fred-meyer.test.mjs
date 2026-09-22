import test from "node:test";
import assert from "node:assert/strict";
import { searchTerm, suggestQuantity, toStoreProduct, WARRENTON_LOCATION_ID } from "../app/kroger-core.ts";
import { buildGroceryList } from "../app/portal/grocery-list.ts";

test("the Warrenton store is the default", () => {
  assert.equal(WARRENTON_LOCATION_ID, "70100218");
});

test("store searches use plain product words", () => {
  assert.equal(searchTerm("93% lean ground turkey"), "lean ground turkey");
  assert.equal(searchTerm("low-sodium chicken broth"), "low sodium chicken broth");
  assert.equal(searchTerm("asparagus (about 4 bunches)"), "asparagus");
});

test("package counts come from the package size", () => {
  assert.equal(suggestQuantity({ quantity: 5, unit: "lb" }, "3 lb"), 2);
  assert.equal(suggestQuantity({ quantity: 24, unit: "oz" }, "16 oz"), 2);
  assert.equal(suggestQuantity({ quantity: 10, unit: "" }, "12 ct"), 1, "10 eggs is one dozen");
  assert.equal(suggestQuantity({ quantity: 6, unit: "" }, "1 each"), 6, "six peppers");
  assert.equal(suggestQuantity({ quantity: 2, unit: "" }, "2 lb"), 1, "two lemons is one bag");
  assert.equal(suggestQuantity({ quantity: 2, unit: "tbsp" }, "2.6 oz"), 1, "spices start at one jar");
  assert.equal(suggestQuantity({ quantity: null, unit: "" }, ""), 1);
});

test("Kroger product JSON becomes what the screen needs", () => {
  const p = toStoreProduct({
    upc: "0001111041700",
    description: "Kroger® Boneless Skinless Chicken Thighs",
    brand: "Kroger",
    images: [{ perspective: "front", featured: true, sizes: [{ size: "medium", url: "https://www.kroger.com/product/images/medium/front/0001111041700" }] }],
    items: [{ size: "3 lb", price: { regular: 9.99, promo: 7.49 }, inventory: { stockLevel: "HIGH" } }],
    aisleLocations: [{ description: "Meat", number: "12" }],
  });
  assert.deepEqual(
    { upc: p.upc, size: p.size, price: p.priceCents, promo: p.promoCents, stock: p.inStock, aisle: p.aisle, img: Boolean(p.image) },
    { upc: "0001111041700", size: "3 lb", price: 999, promo: 749, stock: true, aisle: "Meat · aisle 12", img: true },
  );
  assert.equal(toStoreProduct({ description: "no upc" }), null);
});

test("the shopping list merges units and skips water", () => {
  const list = buildGroceryList([
    { title: "A", servings: 12, portions: 12, ingredients: ["1 tbsp kosher salt", "1 tsp kosher salt", "4 cups water", "24 bone-in, skin-on chicken thighs (about 8 lb)", "1 lb butter", "8 oz butter"] },
  ]);
  const names = list.map((i) => i.display);
  assert.ok(names.includes("4 tsp kosher salt") || names.includes("1⅓ tbsp kosher salt"), names.join(" | "));
  assert.ok(!names.some((n) => /water/.test(n)), "water isn't on the shopping list");
  assert.ok(names.includes("24 bone-in skin-on chicken thighs"), names.join(" | "));
  assert.ok(names.includes("1½ lb butter"), names.join(" | "));
});

test("the pantry kit is priced with the visit, and old saved prices still work", async () => {
  const { DEFAULT_PRICING, parsePricing, readPricing } = await import("../app/pricing-core.ts");
  assert.equal(DEFAULT_PRICING.pantryKitCents, 900);
  const saved = JSON.stringify({ mealPrep: DEFAULT_PRICING.mealPrep, privateChef: DEFAULT_PRICING.privateChef });
  assert.equal(readPricing(saved).pantryKitCents, 900, "prices saved before the kit existed get the default");
  const ok = parsePricing({ mealPrep: [{ name: "Weekly", portions: 12, price: 235 }], pantryKit: 12, privateChef: { perGuest: 175, minGuests: 6, smallTableMin: 1050 } });
  assert.equal(ok.ok && ok.pricing.pantryKitCents, 1200);
  const off = parsePricing({ mealPrep: [{ name: "Weekly", portions: 12, price: 235 }], pantryKit: 0, privateChef: { perGuest: 175, minGuests: 6, smallTableMin: 1050 } });
  assert.equal(off.ok && off.pricing.pantryKitCents, 0, "$0 turns the kit charge off");
  const bad = parsePricing({ mealPrep: [{ name: "Weekly", portions: 12, price: 235 }], pantryKit: 500, privateChef: { perGuest: 175, minGuests: 6, smallTableMin: 1050 } });
  assert.equal(bad.ok, false);
});

test("the shopping list knows what the household already has", async () => {
  const { buildGroceryList } = await import("../app/portal/grocery-list.ts");
  const list = buildGroceryList([{ title: "A", servings: 12, portions: 12, ingredients: ["4 large eggs", "2 lb chicken thighs"] }], ["count:large eggs"]);
  assert.equal(list.find((i) => i.name === "large eggs").onHand, true);
  assert.equal(list.find((i) => i.name === "chicken thighs").onHand, false);
});

const product = (description, categories, extra = {}) => ({ upc: "0001111000000", categories, description, brand: "", size: "1 each", priceCents: 199, promoCents: null, image: "", inStock: true, aisle: "", ...extra });

test("recipe size words don't leak into the store search", async () => {
  const { searchTerm } = await import("../app/kroger-core.ts");
  assert.equal(searchTerm("medium lemons"), "lemons");
  assert.equal(searchTerm("medium white onions"), "white onions");
  assert.equal(searchTerm("large eggs"), "large eggs", "egg size is what you actually buy");
  assert.equal(searchTerm("small red potatoes"), "red potatoes");
});

test("the store match stays in the right department", async () => {
  const { pickBest, rankProducts } = await import("../app/kroger-core.ts");
  const need = { name: "medium lemons", category: "Produce", unit: "" };
  const candle = product("Yankee Candle Medium Pillar Scented Candle, Lemon Lavender", ["Home Decor"]);
  const lemon = product("Fresh Large Lemon - Each", ["Produce"]);
  assert.equal(pickBest(need, [candle, lemon]).description, "Fresh Large Lemon - Each");
  assert.equal(rankProducts(need, [candle]).length, 0, "a candle is never groceries");

  const peppers = { name: "medium jalapeños", category: "Produce", unit: "" };
  const jar = product("Simple Truth Organic Sliced Jalapeno Peppers", ["Canned & Packaged"]);
  const fresh = product("Jalapeno Pepper - Each", ["Produce"]);
  assert.equal(pickBest(peppers, [jar, fresh]).description, "Jalapeno Pepper - Each", "fresh produce beats a jar");

  const turkey = { name: "93% lean ground turkey", category: "Meat & seafood", unit: "lb" };
  const jerky = product("Turkey Jerky Original", ["Snacks"]);
  const ground = product("Kroger 93/7 Lean Fresh Ground Turkey - 1 LB", ["Meat & Seafood"], { size: "1 lb" });
  assert.equal(pickBest(turkey, [jerky, ground]).description, "Kroger 93/7 Lean Fresh Ground Turkey - 1 LB");
});
