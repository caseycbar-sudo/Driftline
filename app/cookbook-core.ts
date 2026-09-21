/**
 * Owner edits to the cookbook, kept separate from the database so they can be
 * tested on their own.
 *
 * The recipes in `app/cookbook/recipes.ts` are the base set. Casey can change any
 * of them from the dashboard, hide one, or add a dish of his own. Only the fields
 * he actually changes are stored, so an edited dish keeps the rest of its original
 * wording, and "Reset" simply deletes the row.
 */
import type { Allergen, CookbookSide, Recipe } from "./cookbook/recipes";

/** Dishes Casey adds get ids from here up, well clear of the built-in ones. */
export const CUSTOM_ID_START = 900;

const CASEY_CREDIT = { author: "Chef Casey Barella", source: "Driftline", page: "" };

/** The fields the owner can change. Photos, ids and slugs are not editable. */
export const EDITABLE_TEXT = ["title", "category", "description", "yieldNote", "storage", "reheating", "makeAhead", "safety", "chefNotes"] as const;
export const EDITABLE_LIST = ["tags", "dietary", "ingredients", "directions", "equipment"] as const;
export const ALLERGENS: Allergen[] = ["Milk", "Egg", "Fish", "Shellfish", "Tree nuts", "Peanuts", "Wheat", "Soy", "Sesame"];

export type RecipePatch = Partial<Pick<Recipe, (typeof EDITABLE_TEXT)[number] | (typeof EDITABLE_LIST)[number] | "servings" | "active" | "total" | "allergens" | "image">>;

export type OverrideRow = { recipeId: number; side: string; payload: string; hidden: number; custom: number };

const LIMITS: Record<string, number> = { title: 120, category: 40, description: 400, yieldNote: 160, storage: 600, reheating: 600, makeAhead: 600, safety: 800, chefNotes: 1200 };
const text = (value: unknown, max: number) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const lines = (value: unknown, max = 40) =>
  (Array.isArray(value) ? value : String(value ?? "").split(/\r?\n/))
    .map((line) => String(line).trim().slice(0, 300))
    .filter(Boolean)
    .slice(0, max);

/**
 * Check and clean what the dashboard sent. Returns the fields that were present,
 * so a form that only changes the title doesn't overwrite everything else.
 */
export function parseRecipePatch(body: Record<string, unknown>, { full = false } = {}): { ok: true; patch: RecipePatch } | { ok: false; error: string } {
  const patch: RecipePatch = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);
  for (const key of EDITABLE_TEXT) {
    if (!has(key)) continue;
    const value = text(body[key], LIMITS[key] ?? 400);
    if (key === "title" && !value) return { ok: false, error: "A dish needs a name." };
    (patch as Record<string, unknown>)[key] = value;
  }
  for (const key of EDITABLE_LIST) {
    if (!has(key)) continue;
    (patch as Record<string, unknown>)[key] = lines(body[key], key === "ingredients" || key === "directions" ? 60 : 20);
  }
  if (has("allergens")) {
    const list = (Array.isArray(body.allergens) ? body.allergens : []).map((a) => String(a));
    patch.allergens = ALLERGENS.filter((a) => list.includes(a));
  }
  for (const key of ["servings", "active", "total"] as const) {
    if (!has(key)) continue;
    const n = Math.round(Number(body[key]));
    if (!Number.isFinite(n) || n < 1 || n > (key === "servings" ? 200 : 1440)) return { ok: false, error: `Check the ${key === "servings" ? "yield" : key + " time"} number.` };
    patch[key] = n;
  }
  if (has("image")) {
    const image = text(body.image, 200);
    // Only pictures already on the site: no linking to somewhere else.
    const onSite = /^\/(cookbook|gallery)\/[\w/-]+\.webp$/.test(image);
    const uploaded = /^\/api\/dish-photo\/[\w-]+\.(webp|jpg|jpeg|png)$/i.test(image);
    if (image && !onSite && !uploaded) return { ok: false, error: "Use a photo from the site or one you uploaded." };
    patch.image = image;
  }
  if (full) {
    if (!patch.title) return { ok: false, error: "A dish needs a name." };
    if (!patch.ingredients?.length) return { ok: false, error: "Add at least one ingredient." };
    if (!patch.directions?.length) return { ok: false, error: "Add at least one step." };
  }
  return { ok: true, patch };
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "dish";

/** A dish Casey added, filled out with sensible defaults for everything he didn't set. */
export function customRecipe(id: number, side: CookbookSide, patch: RecipePatch): Recipe {
  const title = patch.title ?? "New dish";
  return {
    id,
    slug: slugify(title),
    side,
    title,
    category: patch.category || (side === "meal-prep" ? "Poultry" : "Mains"),
    description: patch.description ?? "",
    servings: patch.servings ?? (side === "meal-prep" ? 12 : 6),
    yieldNote: patch.yieldNote ?? "",
    active: patch.active ?? 0,
    total: patch.total ?? 0,
    tags: patch.tags ?? [],
    allergens: patch.allergens ?? [],
    dietary: patch.dietary ?? [],
    // No photo until Casey uploads one; the site shows a "photo coming soon" card.
    image: patch.image || "",
    photoCredit: patch.image ? CASEY_CREDIT : { author: "", source: "", page: "" },
    ingredients: patch.ingredients ?? [],
    directions: patch.directions ?? [],
    equipment: patch.equipment ?? [],
    storage: patch.storage ?? "Cool promptly, label, and refrigerate at 40°F or below.",
    reheating: patch.reheating ?? "",
    makeAhead: patch.makeAhead ?? "",
    safety: patch.safety ?? "",
    chefNotes: patch.chefNotes ?? "",
  };
}

function readPayload(row: OverrideRow): RecipePatch {
  try {
    const value = JSON.parse(row.payload || "{}") as RecipePatch;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

/** The cookbook as customers and chefs see it: base recipes, Casey's edits applied. */
export function applyOverrides(base: Recipe[], rows: OverrideRow[]): Recipe[] {
  const byId = new Map(rows.map((row) => [row.recipeId, row]));
  const out: Recipe[] = [];
  for (const recipe of base) {
    const row = byId.get(recipe.id);
    if (!row) {
      out.push(recipe);
      continue;
    }
    if (row.hidden) continue;
    const patch = readPayload(row);
    const ownPhoto = patch.image && patch.image !== recipe.image;
    out.push({
      ...recipe,
      ...patch,
      slug: patch.title ? slugify(patch.title) : recipe.slug,
      // A photo Casey uploads is his, so the stock photographer's credit goes with the old one.
      photoCredit: ownPhoto ? CASEY_CREDIT : patch.image === "" ? { author: "", source: "", page: "" } : recipe.photoCredit,
    });
  }
  for (const row of rows) {
    if (!row.custom || row.hidden) continue;
    if (base.some((r) => r.id === row.recipeId)) continue;
    const side: CookbookSide = row.side === "private-chef" ? "private-chef" : "meal-prep";
    out.push(customRecipe(row.recipeId, side, readPayload(row)));
  }
  return out;
}

/** The next id for a dish Casey adds. */
export function nextCustomId(rows: OverrideRow[]): number {
  const highest = rows.reduce((max, row) => (row.custom && row.recipeId > max ? row.recipeId : max), CUSTOM_ID_START - 1);
  return highest + 1;
}
