import { NextResponse } from "next/server";
import { getCookbook } from "../../../db/cookbook";

export const dynamic = "force-dynamic";

/** Dish names for the schedule screens, with Casey's edits applied. */
export async function GET() {
  const recipes = await getCookbook();
  return NextResponse.json(
    { recipes: recipes.map((r) => ({ id: r.id, title: r.title, side: r.side, category: r.category, servings: r.servings, active: r.active, total: r.total, image: r.image, ingredients: r.ingredients })) },
    { headers: { "cache-control": "no-store" } },
  );
}
