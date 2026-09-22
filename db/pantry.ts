import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import { customerPantry } from "./schema";

export type PantryItem = { itemKey: string; name: string; note: string; updatedAt: string };

/** What this household already has, from the last visit. */
export async function listPantry(email: string): Promise<PantryItem[]> {
  if (!email) return [];
  const rows = await getDb().select().from(customerPantry).where(eq(customerPantry.email, email.toLowerCase()));
  return rows.map((r) => ({ itemKey: r.itemKey, name: r.name, note: r.note, updatedAt: r.updatedAt }));
}

/**
 * Replace the household's pantry with what the chef says is left at the end of a
 * visit. A snapshot, not a running tally: anything not ticked is treated as used up.
 */
export async function savePantry(email: string, items: { itemKey: string; name: string; note?: string }[]) {
  const address = email.toLowerCase();
  const db = getDb();
  const now = new Date().toISOString();
  const clean = items
    .filter((i) => i.itemKey && i.name)
    .slice(0, 120)
    .map((i) => ({ email: address, itemKey: i.itemKey.slice(0, 160), name: i.name.slice(0, 120), note: (i.note ?? "").slice(0, 80), updatedAt: now }));
  await db.delete(customerPantry).where(eq(customerPantry.email, address));
  for (let i = 0; i < clean.length; i += 25) await db.insert(customerPantry).values(clean.slice(i, i + 25));
  return clean.length;
}

/** Take items off the shelf (used up, or thrown out). */
export async function removePantryItems(email: string, keys: string[]) {
  if (!keys.length) return;
  await getDb().delete(customerPantry).where(and(eq(customerPantry.email, email.toLowerCase()), inArray(customerPantry.itemKey, keys.slice(0, 120))));
}
