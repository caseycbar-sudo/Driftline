import { NextResponse } from "next/server";
import { requireStaffRole } from "../../staff-auth";
import { isLikelySpam, validateInquiry } from "../../inquiry-validation";
import { notifyNewInquiry } from "../../notify";
import {
  createInquiry,
  listInquiries,
  markInquiryNotified,
  recentInquiryCount,
  toAdminInquiry,
  updateInquiry,
} from "../../../db/private-chef";

export const dynamic = "force-dynamic";

const LEAD_STATUSES = ["new", "contacted", "consultation", "proposal sent", "booked", "declined"];
const HOURLY_LIMIT_PER_SOURCE = 10;
const HOURLY_LIMIT_PER_EMAIL = 3;

async function sourceHashFor(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  if (!ip) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`driftline:${ip}`));
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Public: anyone can send a request from the website. */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "We couldn't read that request. Please try again." }, { status: 400 });

  // Bots that fill the hidden field get a normal-looking response and nothing is saved.
  if (isLikelySpam(body)) return NextResponse.json({ ok: true }, { status: 201 });

  const result = validateInquiry(body);
  if (!result.ok) return NextResponse.json({ error: result.error, field: result.field }, { status: 400 });

  const sourceHash = await sourceHashFor(request);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await recentInquiryCount(sourceHash, result.inquiry.email, since);
  if (recent.bySource >= HOURLY_LIMIT_PER_SOURCE || recent.byEmail >= HOURLY_LIMIT_PER_EMAIL) {
    return NextResponse.json(
      { error: "We've already received your request. Casey will be in touch soon." },
      { status: 429 },
    );
  }

  const saved = await createInquiry(result.inquiry, sourceHash);
  if (await notifyNewInquiry(result.inquiry)) await markInquiryNotified(saved.id);
  return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
}

/** Admin: list every inquiry, newest first. */
export async function GET() {
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  return NextResponse.json((await listInquiries()).map(toAdminInquiry));
}

/** Admin: update follow-up status and notes. */
export async function PUT(request: Request) {
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await readJson(request);
  const id = Number(body?.id);
  const status = String(body?.status ?? "");
  const adminNotes = String(body?.adminNotes ?? "").slice(0, 4000);
  if (!id) return NextResponse.json({ error: "Invalid inquiry" }, { status: 400 });
  if (!LEAD_STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const updated = await updateInquiry(id, status, adminNotes);
  if (!updated) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  return NextResponse.json(toAdminInquiry(updated));
}
