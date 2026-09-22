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
