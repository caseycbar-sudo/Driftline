/**
 * Driftline's prices: one place that feeds the public pages, the chef app's
 * portion counts, and customer charges. The owner edits them from the dashboard.
 * Pure module (no imports) so it can be unit tested.
 */
export type MealPrepPackage = { name: string; portions: number; priceCents: number; note: string; featured: boolean };
export type Pricing = {
  mealPrep: MealPrepPackage[];
  privateChef: { perGuestCents: number; minGuests: number; smallTableMinCents: number };
};

export const DEFAULT_PRICING: Pricing = {
  mealPrep: [
    { name: "Essential", portions: 6, priceCents: 17500, note: "A lighter weekly reset", featured: false },
    { name: "Classic", portions: 8, priceCents: 19500, note: "Our most flexible starter", featured: false },
    { name: "Weekly", portions: 12, priceCents: 23500, note: "A full week made easier", featured: true },
    { name: "Couples", portions: 16, priceCents: 28500, note: "More variety for two", featured: false },
    { name: "Household", portions: 20, priceCents: 32500, note: "Reliable family coverage", featured: false },
    { name: "Family", portions: 24, priceCents: 36500, note: "The most meals per visit", featured: false },
  ],
  privateChef: { perGuestCents: 17500, minGuests: 6, smallTableMinCents: 105000 },
};

const text = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const dollarsToCents = (v: unknown) => Math.round(Number(v) * 100);

/** Validate prices sent from the dashboard (dollars in, cents out). */
export function parsePricing(input: unknown): { ok: true; pricing: Pricing } | { ok: false; error: string } {
  const b = (input ?? {}) as Record<string, unknown>;
  const rawPackages = Array.isArray(b.mealPrep) ? b.mealPrep : [];
  if (rawPackages.length < 1 || rawPackages.length > 8) return { ok: false, error: "Keep between 1 and 8 meal prep packages." };
  const mealPrep: MealPrepPackage[] = [];
  for (const raw of rawPackages as Record<string, unknown>[]) {
    const name = text(raw.name, 30);
    const portions = Math.round(Number(raw.portions));
    const priceCents = dollarsToCents(raw.price);
    if (!name) return { ok: false, error: "Every package needs a name." };
    if (mealPrep.some((p) => p.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: `"${name}" is listed twice.` };
    if (!Number.isInteger(portions) || portions < 1 || portions > 100) return { ok: false, error: `${name}: portions must be 1 to 100.` };
    if (!Number.isFinite(priceCents) || priceCents < 100 || priceCents > 500000) return { ok: false, error: `${name}: price must be $1 to $5,000.` };
    mealPrep.push({ name, portions, priceCents, note: text(raw.note, 60), featured: Boolean(raw.featured) });
  }
  if (mealPrep.filter((p) => p.featured).length > 1) return { ok: false, error: "Only one package can be marked most popular." };
  const pc = (b.privateChef ?? {}) as Record<string, unknown>;
  const perGuestCents = dollarsToCents(pc.perGuest);
  const minGuests = Math.round(Number(pc.minGuests));
  const smallTableMinCents = dollarsToCents(pc.smallTableMin);
  if (!Number.isFinite(perGuestCents) || perGuestCents < 1000 || perGuestCents > 200000) return { ok: false, error: "Private chef price per guest must be $10 to $2,000." };
  if (!Number.isInteger(minGuests) || minGuests < 1 || minGuests > 50) return { ok: false, error: "Minimum guests must be 1 to 50." };
  if (!Number.isFinite(smallTableMinCents) || smallTableMinCents < 0 || smallTableMinCents > 2000000) return { ok: false, error: "Small-table minimum must be $0 to $20,000." };
  return { ok: true, pricing: { mealPrep, privateChef: { perGuestCents, minGuests, smallTableMinCents } } };
}

/** Stored JSON back to Pricing, falling back to defaults for anything missing or broken. */
export function readPricing(json: string | null | undefined): Pricing {
  if (!json) return DEFAULT_PRICING;
  try {
    const v = JSON.parse(json) as Pricing;
    if (!Array.isArray(v.mealPrep) || !v.mealPrep.length || !v.privateChef) return DEFAULT_PRICING;
    return v;
  } catch {
    return DEFAULT_PRICING;
  }
}

export const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function findPackage(pricing: Pricing, name: string) {
  return pricing.mealPrep.find((p) => p.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
}
export const lowestMealPrepCents = (p: Pricing) => Math.min(...p.mealPrep.map((x) => x.priceCents));
