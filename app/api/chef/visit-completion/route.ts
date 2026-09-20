import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getEvent, setChefEventStatus, setGroceries } from "../../../../db/schedule";
import { saveVisitCompletion } from "../../../../db/visits";
import { chargeCompletedVisit } from "../../../billing";

export const dynamic = "force-dynamic";
const MAX_FILE = 8 * 1024 * 1024,
  allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_GROCERY_CENTS = 200_000;

/**
 * The chef finishes a visit: cleanup checklist, dish photos, one clean-kitchen
 * photo, and for meal prep the grocery receipt. Then the customer's saved card
 * is charged (package + groceries) when they have autopay set up.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await requireStaffRole("chef");
  if (!user) return NextResponse.json({ error: "Chef access required" }, { status: 403 });
  if (!form) return NextResponse.json({ error: "Nothing was sent. Try again." }, { status: 400 });

  const eventId = Number(form.get("scheduleEventId")),
    event = Number.isInteger(eventId) && eventId > 0 ? await getEvent(eventId) : null;
  if (!event || event.chefEmail.toLowerCase() !== user.email.toLowerCase())
    return NextResponse.json({ error: "This visit is not assigned to you" }, { status: 403 });
  if (event.status === "completed") return NextResponse.json({ error: "This visit is already completed." }, { status: 409 });
  if (event.status === "cancelled") return NextResponse.json({ error: "This visit was cancelled." }, { status: 409 });

  const checks = ["countersClean", "sinkClean", "trashHandled", "appliancesOff"] as const;
  if (checks.some((key) => form.get(key) !== "true")) return NextResponse.json({ error: "Complete every cleanup confirmation" }, { status: 400 });

  const files = (name: string) => form.getAll(name).filter((v): v is File => v instanceof File && v.size > 0);
  const dishFiles = files("dishPhotos"),
    kitchenFiles = files("kitchenPhotos"),
    receiptFiles = files("receiptPhoto");
  if (dishFiles.length < 1 || dishFiles.length > 8 || kitchenFiles.length !== 1)
    return NextResponse.json({ error: "Add 1–8 dish photos and exactly one clean-kitchen photo" }, { status: 400 });

  // Meal prep: the chef buys the groceries, so the receipt total is required (0 if the customer supplied them).
  let groceryCents = 0;
  if (event.serviceType === "meal_prep") {
    const raw = String(form.get("groceryTotal") ?? "").replace(/[$,\s]/g, "");
    groceryCents = Math.round(Number(raw) * 100);
    if (raw === "" || !Number.isFinite(groceryCents) || groceryCents < 0 || groceryCents > MAX_GROCERY_CENTS)
      return NextResponse.json({ error: "Enter the grocery receipt total (0 if the customer supplied everything)." }, { status: 400 });
    if (groceryCents > 0 && receiptFiles.length !== 1)
      return NextResponse.json({ error: "Add a photo of the grocery receipt." }, { status: 400 });
  }
  const all = [...dishFiles, ...kitchenFiles, ...receiptFiles];
  if (all.some((file) => file.size > MAX_FILE || !allowed.has(file.type)))
    return NextResponse.json({ error: "Photos must be JPEG, PNG, WebP, HEIC, or HEIF and no larger than 8 MB" }, { status: 400 });

  const bucket = (env as unknown as { BUCKET: R2Bucket }).BUCKET;
  if (!bucket) return NextResponse.json({ error: "Photo storage unavailable" }, { status: 503 });

  const stored: { photoType: string; dishTitle: string; objectKey: string; contentType: string }[] = [];
  let receiptKey = "";
  const put = async (file: File, prefix: string) => {
    const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "jpg";
    const key = `${prefix}/${eventId}/${crypto.randomUUID()}.${extension}`;
    await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    return key;
  };
  try {
    for (const file of dishFiles)
      stored.push({ photoType: "dish", dishTitle: String(form.get("dishTitle") || "").slice(0, 160), objectKey: await put(file, "visits"), contentType: file.type });
    for (const file of kitchenFiles) stored.push({ photoType: "kitchen", dishTitle: "", objectKey: await put(file, "visits"), contentType: file.type });
    if (receiptFiles[0]) receiptKey = await put(receiptFiles[0], "receipts");

    await saveVisitCompletion({
      scheduleEventId: eventId,
      customerEmail: event.customerEmail,
      chefEmail: user.email,
      countersClean: true,
      sinkClean: true,
      trashHandled: true,
      appliancesOff: true,
      notes: String(form.get("notes") || "").trim().slice(0, 1000),
      photos: stored,
    });
    if (event.serviceType === "meal_prep") await setGroceries(eventId, groceryCents, receiptKey);
    const done = await setChefEventStatus(eventId, user.email, "completed", ["scheduled", "confirmed", "shopping", "in-progress"]);
    if (!done) return NextResponse.json({ error: "This visit changed while you were finishing. Refresh and try again." }, { status: 409 });
  } catch (error) {
    await Promise.all([...stored.map((p) => bucket.delete(p.objectKey)), receiptKey ? bucket.delete(receiptKey) : null]);
    throw error;
  }

  // Charging never blocks the chef: a failed or skipped charge shows up in Casey's Billing tab.
  const billing = await chargeCompletedVisit(eventId).catch((error) => {
    console.error("[billing] charge after completion failed", error);
    return { outcome: "error" as const, message: "Casey will handle billing for this visit." };
  });
  return NextResponse.json({ ok: true, status: "completed", billing });
}
