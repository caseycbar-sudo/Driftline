import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getPicks, krogerConfig, searchProducts } from "../../../kroger";
import { searchTerm, suggestQuantity, type StoreProduct } from "../../../kroger-core";

export const dynamic = "force-dynamic";

type Need = { key: string; name: string; quantity: number | null; unit: string };

/**
 * Match a shopping list to products at Fred Meyer Warrenton. Items chosen before
 * are remembered; everything else gets the store's best match, with a few
 * alternatives to switch to.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { items?: Need[] };
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (!(await requireStaffRole())) return NextResponse.json({ error: "Staff only" }, { status: 403 });
  if (!krogerConfig()) return NextResponse.json({ error: "Fred Meyer isn't connected yet." }, { status: 409 });
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 80).map((i) => ({
    key: String(i.key ?? "").slice(0, 160),
    name: String(i.name ?? "").slice(0, 120),
    quantity: typeof i.quantity === "number" && Number.isFinite(i.quantity) ? i.quantity : null,
    unit: String(i.unit ?? "").slice(0, 12),
  }));
  const picks = await getPicks(items.map((i) => i.key));

  const results: { key: string; product: StoreProduct | null; options: StoreProduct[]; quantity: number; remembered: boolean }[] = [];
  // A few searches at a time, to stay well inside Fred Meyer's limits.
  for (let i = 0; i < items.length; i += 6) {
    const batch = items.slice(i, i + 6);
    const found = await Promise.all(
      batch.map(async (need) => {
        let options: StoreProduct[] = [];
        try {
          options = await searchProducts(searchTerm(need.name), 5);
        } catch {}
        const saved = picks[need.key];
        const product: StoreProduct | null = saved
          ? options.find((o) => o.upc === saved.upc) ?? { upc: saved.upc, description: saved.description, brand: "", size: saved.size, priceCents: null, promoCents: null, image: saved.image, inStock: true, aisle: "" }
          : options.find((o) => o.inStock) ?? options[0] ?? null;
        return { key: need.key, product, options, quantity: product ? suggestQuantity(need, product.size) : 1, remembered: Boolean(saved) };
      }),
    );
    results.push(...found);
  }
  return NextResponse.json({ results }, { headers: { "cache-control": "private, no-store" } });
}
