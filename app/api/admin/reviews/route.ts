import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { allReviews, deleteReview, setReviewStatus } from "../../../../db/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  return NextResponse.json({ reviews: await allReviews() }, { headers: { "cache-control": "private, no-store" } });
}

/** Approve, hide, or delete a review. */
export async function PATCH(request: Request) {
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; action?: unknown };
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Unknown review" }, { status: 400 });
  let ok = false;
  if (body.action === "approve") ok = await setReviewStatus(id, "approved");
  else if (body.action === "hide") ok = await setReviewStatus(id, "hidden");
  else if (body.action === "delete") ok = await deleteReview(id);
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Review not found" }, { status: 404 });
}
