import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { recipeOverrides } from "./schema";
import { recipes as baseRecipes, type Recipe } from "../app/cookbook/recipes";
import { applyOverrides, customRecipe, nextCustomId, type OverrideRow, type RecipePatch } from "../app/cookbook-core";

export type { Recipe };

export async function listOverrides(): Promise<OverrideRow[]> {
  const rows = await getDb().select().from(recipeOverrides);
  return rows.map((row) => ({ recipeId: row.recipeId, side: row.side, payload: row.payload, hidden: row.hidden, custom: row.custom }));
}

/** The cookbook with Casey's edits applied: what customers and chefs should see. */
export async function getCookbook(): Promise<Recipe[]> {
  try {
    return applyOverrides(baseRecipes, await listOverrides());
  } catch (error) {
    // The cookbook must still render if the edits table can't be read.
    console.error("[cookbook] falling back to the built-in recipes", error);
    return baseRecipes;
  }
}

export async function findCookbookRecipe(id: number): Promise<Recipe | null> {
  return (await getCookbook()).find((r) => r.id === id) ?? null;
}

/** Owner view: every dish plus whether it has been edited or hidden. */
export async function listForOwner() {
  const rows = await listOverrides();
  const byId = new Map(rows.map((row) => [row.recipeId, row]));
  const custom = rows.filter((row) => row.custom && !baseRecipes.some((r) => r.id === row.recipeId));
  const merged = [
    ...baseRecipes.map((recipe) => {
      const row = byId.get(recipe.id);
      let patch: RecipePatch = {};
      try {
        patch = row ? (JSON.parse(row.payload || "{}") as RecipePatch) : {};
      } catch {}
      return { ...recipe, ...patch, edited: Boolean(row && Object.keys(patch).length), hidden: Boolean(row?.hidden), custom: false };
    }),
    ...custom.map((row) => {
      let patch: RecipePatch = {};
      try {
        patch = JSON.parse(row.payload || "{}") as RecipePatch;
      } catch {}
      const side = row.side === "private-chef" ? "private-chef" : "meal-prep";
      return { ...customRecipe(row.recipeId, side, patch), edited: true, hidden: Boolean(row.hidden), custom: true };
    }),
  ];
  return merged;
}

export async function saveOverride(input: { recipeId: number; side: string; patch: RecipePatch; hidden: boolean; custom: boolean; updatedBy: string }) {
  const row = {
    recipeId: input.recipeId,
    side: input.side,
    payload: JSON.stringify(input.patch),
    hidden: input.hidden ? 1 : 0,
    custom: input.custom ? 1 : 0,
    updatedBy: input.updatedBy.toLowerCase(),
    updatedAt: new Date().toISOString(),
  };
  await getDb().insert(recipeOverrides).values(row).onConflictDoUpdate({ target: recipeOverrides.recipeId, set: { ...row } });
  return row;
}

/** Undo every change to one dish (or delete it outright, if Casey added it). */
export async function clearOverride(recipeId: number) {
  await getDb().delete(recipeOverrides).where(eq(recipeOverrides.recipeId, recipeId));
}

export async function newCustomId() {
  return nextCustomId(await listOverrides());
}
