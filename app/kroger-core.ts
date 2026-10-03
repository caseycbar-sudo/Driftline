/**
 * Fred Meyer (Kroger API) helpers with no network or database, so they can be tested.
 * Fred Meyer is a Kroger store; its products, prices and carts come from the Kroger API.
 */

/** Fred Meyer, 695 S Hwy 101, Warrenton OR (store 701-00218). */
export const WARRENTON_LOCATION_ID = "70100218";
export const KROGER_API = "https://api.kroger.com/v1";
export const KROGER_SCOPES = "cart.basic:write profile.compact product.compact";

/**
 * What to type into the store search. Recipe size words ("2 medium lemons") make the
 * store match product names instead of the food — "medium" once found a Yankee Candle —
 * so they come out, except where the size is part of what you buy ("large eggs").
 */
export function searchTerm(name: string): string {
  const cleaned = name
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(\.\d+)?%\s*/g, "") // "93% lean" -> "lean"
    .replace(/\b(low-sodium|reduced-sodium)\b/gi, "low sodium");
  const keepSize = /\b(egg|eggs)\b/i.test(cleaned);
  return cleaned
    .replace(keepSize ? /\b(medium|small|jumbo|extra[- ]large)\b/gi : /\b(medium|small|large|jumbo|extra[- ]large)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/** Departments that are never groceries for a recipe. */
const OFF_LIST = /home decor|floral|beauty|personal care|health|baby|pet|cleaning|household|kitchen|party|garden|apparel|toys|office|electronics|hardware|auto|tobacco|sports|gift|candle/i;

/** Where each kind of shopping-list item should come from in the store. */
const DEPARTMENT: Record<string, RegExp> = {
  "Meat & seafood": /meat|seafood/i,
  Produce: /produce/i,
  "Dairy & eggs": /dairy|egg|cheese/i,
  "Grains & bakery": /bakery|bread|pasta|grain|rice|tortilla/i,
  Pantry: /pantry|canned|packaged|condiment|sauce|baking|spice|seasoning|oil|international|beverage|snack|breakfast/i,
};

const words = (value: string): string[] => value.toLowerCase().match(/[a-z]{3,}/g) ?? [];

/**
 * How well a store product fits a shopping-list line. Department comes first (fresh
 * jalapeños, not a jar of sliced ones), then how much of the item's name it matches.
 */
export function scoreProduct(need: { name: string; category?: string; unit?: string }, product: StoreProduct): number {
  const categories = (product.categories ?? []).join(" ");
  if (OFF_LIST.test(categories) || OFF_LIST.test(product.description)) return -100;
  let score = 0;
  const wanted = need.category ? DEPARTMENT[need.category] : null;
  if (wanted && categories) score += wanted.test(categories) ? 6 : -4;
  const needWords = words(searchTerm(need.name));
  const found = words(product.description);
  for (const word of needWords) if (found.includes(word)) score += 2;
  if (needWords.length && needWords.every((w) => found.includes(w))) score += 2;
  if (product.inStock) score += 1;
  if ((need.unit === "lb" || need.unit === "oz") && /\b(lb|oz)\b/i.test(product.size)) score += 1;
  return score;
}

/** Units in a package: "18 ct" -> 18, "2 lb" -> 32 oz. */
export function packageUnits(size: string): { count: number | null; ounces: number | null } {
  const count = size.toLowerCase().match(/(\d+)\s*(ct|count|pk|pack|each|ea)\b/);
  return { count: count ? Number(count[1]) : null, ounces: packageOunces(size) };
}

/** What it costs to cover this line with a given product, and how much is left over. */
export function costToCover(need: { quantity: number | null; unit?: string }, product: StoreProduct) {
  const packs = suggestQuantity({ quantity: need.quantity, unit: need.unit ?? "" }, product.size);
  const price = product.promoCents ?? product.priceCents;
  const { count, ounces } = packageUnits(product.size);
  const per = need.unit === "lb" || need.unit === "oz" ? ounces : count;
  const needed = need.quantity ?? 0;
  const have = per ? per * packs : needed;
  const wanted = need.unit === "lb" ? needed * 16 : needed;
  return { packs, totalCents: price === null ? null : price * packs, leftOver: per ? Math.max(0, have - wanted) / (per || 1) : 0 };
}

/**
 * Best product for a shopping-list line: the right thing first, then the cheapest way
 * to cover what the recipe needs. Three eggs shouldn't buy an 18-pack, and 11 lb of
 * chicken shouldn't buy eleven 1-lb trays when a family pack costs less.
 */
export function pickBest(need: { name: string; category?: string; unit?: string; quantity?: number | null }, products: StoreProduct[]): StoreProduct | null {
  const ranked = rankProducts(need, products);
  if (ranked.length < 2) return ranked[0] ?? null;
  const top = scoreProduct(need, ranked[0]);
  // Only compare products that are clearly the same thing; a cheaper wrong item is no bargain.
  const contenders = ranked.filter((p) => scoreProduct(need, p) >= top - 2);
  const priced = contenders.map((product) => ({ product, ...costToCover({ quantity: need.quantity ?? null, unit: need.unit }, product) })).filter((row) => row.totalCents !== null);
  if (!priced.length) return ranked[0];
  priced.sort((a, b) => (a.totalCents! - b.totalCents!) || a.leftOver - b.leftOver || contenders.indexOf(a.product) - contenders.indexOf(b.product));
  return priced[0].product;
}

/** Every product that could fit, best first, with the plainly wrong ones dropped. */
export function rankProducts(need: { name: string; category?: string; unit?: string }, products: StoreProduct[]): StoreProduct[] {
  return products
    .map((product) => ({ product, score: scoreProduct(need, product) }))
    .filter((row) => row.score > -50)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.product);
}

export type StoreProduct = {
  upc: string;
  categories: string[];
  description: string;
  brand: string;
  size: string;
  priceCents: number | null;
  promoCents: number | null;
  image: string;
  inStock: boolean;
  aisle: string;
};

type RawProduct = {
  upc?: string;
  description?: string;
  brand?: string;
  categories?: string[];
  images?: { perspective?: string; featured?: boolean; sizes?: { size?: string; url?: string }[] }[];
  items?: { size?: string; price?: { regular?: number; promo?: number }; inventory?: { stockLevel?: string }; fulfillment?: { curbside?: boolean; inStore?: boolean } }[];
  aisleLocations?: { description?: string; number?: string }[];
};

const cents = (n: unknown) => (typeof n === "number" && n > 0 ? Math.round(n * 100) : null);

/** Kroger's product JSON to the few things the shopping screen shows. */
export function toStoreProduct(raw: RawProduct): StoreProduct | null {
  if (!raw?.upc || !raw.description) return null;
  const item = raw.items?.[0] ?? {};
  const front = raw.images?.find((i) => i.featured) ?? raw.images?.find((i) => i.perspective === "front") ?? raw.images?.[0];
  const image = front?.sizes?.find((s) => s.size === "medium")?.url ?? front?.sizes?.find((s) => s.size === "small")?.url ?? front?.sizes?.[0]?.url ?? "";
  const stock = item.inventory?.stockLevel;
  const aisle = raw.aisleLocations?.[0];
  return {
    upc: raw.upc,
    categories: raw.categories ?? [],
    description: raw.description,
    brand: raw.brand ?? "",
    size: item.size ?? "",
    priceCents: cents(item.price?.regular),
    promoCents: cents(item.price?.promo),
    image,
    inStock: stock !== "TEMPORARILY_OUT_OF_STOCK",
    aisle: aisle?.description ? `${aisle.description}${aisle.number ? ` · aisle ${aisle.number}` : ""}` : "",
  };
}

/** Pounds/ounces in a package size like "1.5 lb", "16 oz", "3 lb bag". */
function packageOunces(size: string): number | null {
  const m = size.toLowerCase().match(/([\d.]+)\s*(lb|lbs|oz)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!n) return null;
  return m[2].startsWith("lb") ? n * 16 : n;
}

/**
 * A sensible number of packages to buy. Weight needs are compared with the package
 * size; counted items are rounded up; spices, oils and anything by the spoon or cup
 * start at 1 (the chef adjusts).
 */
export function suggestQuantity(need: { quantity: number | null; unit: string }, productSize: string): number {
  const q = need.quantity;
  if (q === null || q <= 0) return 1;
  if (need.unit === "lb" || need.unit === "oz") {
    const needOz = need.unit === "lb" ? q * 16 : q;
    const pack = packageOunces(productSize);
    return pack ? Math.min(20, Math.max(1, Math.ceil(needOz / pack - 0.1))) : 1;
  }
  if (!need.unit || need.unit === "can" || need.unit === "bunch" || need.unit === "package") {
    const count = productSize.toLowerCase().match(/(\d+)\s*(ct|count|pk|pack)\b/);
    if (count) return Math.min(24, Math.max(1, Math.ceil(q / Number(count[1]) - 0.05)));
    // "2 lemons" against a 2 lb bag is one bag, not two.
    if (packageOunces(productSize) && packageOunces(productSize)! >= 16) return 1;
    return Math.min(24, Math.max(1, Math.ceil(q - 0.05)));
  }
  return 1;
}
