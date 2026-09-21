import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { clearOverride, listForOwner, newCustomId, saveOverride } from "../../../../db/cookbook";
import { parseRecipePatch } from "../../../cookbook-core";
import { recipes as baseRecipes } from "../../../cookbook/recipes";

export const dynamic = "force-dynamic";
const forbidden = () => NextResponse.json({ error: "Owner access required" }, { status: 403 });

/** Every dish, with Casey's edits applied and flags for edited / hidden / his own. */
export async function GET() {
  if (!(await requireStaffRole("admin"))) return forbidden();
  return NextResponse.json({ recipes: await listForOwner() }, { headers: { "cache-control": "private, no-store" } });
}

/**
 * Save an edit, add a dish, show/hide one, or undo the changes to one.
 * Only the fields sent are stored, so the rest keeps its original wording.
 */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return forbidden();
  const owner = await requireStaffRole("admin");
  if (!owner) return forbidden();

  const action = String(body.action ?? "save");
  const side = body.side === "private-chef" ? "private-chef" : "meal-prep";

  if (action === "add") {
    const parsed = parseRecipePatch(body, { full: true });
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const recipeId = await newCustomId();
    await saveOverride({ recipeId, side, patch: parsed.patch, hidden: false, custom: true, updatedBy: owner.email });
    return NextResponse.json({ ok: true, recipeId });
  }

  const recipeId = Number(body.id);
  if (!Number.isInteger(recipeId) || recipeId <= 0) return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  const base = baseRecipes.find((r) => r.id === recipeId);
  const isCustom = !base;

  if (action === "reset") {
    await clearOverride(recipeId);
    return NextResponse.json({ ok: true, removed: isCustom });
  }

  if (action === "hide" || action === "show") {
    const hidden = action === "hide";
    // Hiding keeps whatever edits were already saved.
    const current = (await listForOwner()).find((r) => r.id === recipeId);
    if (!current) return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    const parsed = parseRecipePatch(isCustom ? (current as unknown as Record<string, unknown>) : {}, { full: false });
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    await saveOverride({ recipeId, side: current.side, patch: parsed.patch, hidden, custom: isCustom, updatedBy: owner.email });
    return NextResponse.json({ ok: true, hidden });
  }

  const parsed = parseRecipePatch(body, { full: isCustom });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const current = (await listForOwner()).find((r) => r.id === recipeId);
  if (!current) return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  await saveOverride({ recipeId, side: current.side, patch: parsed.patch, hidden: current.hidden, custom: isCustom, updatedBy: owner.email });
  return NextResponse.json({ ok: true });
}
