/**
 * Fred Meyer (Kroger API) helpers with no network or database, so they can be tested.
 * Fred Meyer is a Kroger store; its products, prices and carts come from the Kroger API.
 */

/** Fred Meyer, 695 S Hwy 101, Warrenton OR (store 701-00218). */
export const WARRENTON_LOCATION_ID = "70100218";
export const KROGER_API = "https://api.kroger.com/v1";
export const KROGER_SCOPES = "cart.basic:write profile.compact product.compact";

/** What to type into the store search for a shopping-list item. */
export function searchTerm(name: string): string {
  return name
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(\.\d+)?%\s*/g, "") // "93% lean" -> "lean"
    .replace(/\b(low-sodium|reduced-sodium)\b/gi, "low sodium")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export type StoreProduct = {
  upc: string;
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
    const per = count ? Number(count[1]) : 1;
    return Math.min(24, Math.max(1, Math.ceil(q / per - 0.05)));
  }
  return 1;
}
