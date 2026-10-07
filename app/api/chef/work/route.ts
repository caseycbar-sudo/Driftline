import { NextResponse } from "next/server";
import { getStaffUser, requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getEvent, listEvents, patchEvent, setChefEventStatus, setChefResponse } from "../../../../db/schedule";
import { getRequestForEvent, patchRequest } from "../../../../db/requests";
import { notifyChefCantMakeIt, notifyChefDeclined, notifyChefRunningLate, notifyConfirmed } from "../../../request-emails";
import { chefMaySeeAddress } from "../../../request-core";
import { addMileage, listTimeEntries, toggleTimeEntry } from "../../../../db/timecards";
import { getCustomer } from "../../../../db/customers";
import { getMealPlan } from "../../../../db/meals";
import { listPantry } from "../../../../db/pantry";
import { getPricing } from "../../../../db/pricing";
import { getCookbook } from "../../../../db/cookbook";
import { findPackage } from "../../../pricing-core";
import { isRealDate, mapsLink, telLink } from "../../../schedule-core";
import { oregonToday } from "../../../oregon-time";

export const dynamic = "force-dynamic";
const allowed = new Set(["day", "break", "shopping", "job"]);

const addDays = (date: string, days: number) =>
  new Date(new Date(`${date}T12:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10);

/**
 * Everything a chef needs for their visits: where, how to get in, who to call,
 * what the household can't eat, what to cook and how many portions.
 */
export async function GET(request: Request) {
  const user = await requireStaffRole("chef");
  if (!user) return NextResponse.json({ error: "Chef access required" }, { status: 403 });
  const url = new URL(request.url);
  const today = oregonToday();
  const start = isRealDate(url.searchParams.get("start") ?? "") ? url.searchParams.get("start")! : addDays(today, -90);
  const end = isRealDate(url.searchParams.get("end") ?? "") ? url.searchParams.get("end")! : addDays(today, 90);
  const email = user.email.toLowerCase();

  const [rawEvents, entries, pricing, recipes] = await Promise.all([
    listEvents(start, end).then((rows) => rows.filter((row) => row.chefEmail.toLowerCase() === email && row.status !== "cancelled")),
    listTimeEntries(email, `${start}T00:00:00.000Z`, `${addDays(end, 1)}T12:00:00.000Z`),
    getPricing(),
    getCookbook(),
  ]);

  const events = await Promise.all(
    rawEvents.map(async (event) => {
      const customer = event.customerEmail ? await getCustomer(event.customerEmail) : null;
      const pantry = event.customerEmail ? await listPantry(event.customerEmail).catch(() => []) : [];
      const plan = event.customerEmail ? await getMealPlan(event.customerEmail) : { customRecipes: [] };
      const pkg = event.serviceType === "meal_prep" ? findPackage(pricing, event.packageName) : null;
      // How many portions to make of each dish: the package's portions spread over the dishes,
      // or one per guest for dinners and catering.
      const dishCount = Math.max(1, event.dishes.length);
      const portionsPerDish = event.guestCount
        ? event.guestCount
        : pkg
          ? Math.max(1, Math.round(pkg.portions / dishCount))
          : 0;

      const dishDetails = event.dishes.map((title) => {
        const cookbook = recipes.find((recipe) => recipe.title === title);
        if (cookbook)
          return {
            title,
            servings: portionsPerDish || cookbook.servings,
            recipeServings: cookbook.servings,
            source: "Driftline cookbook",
            image: cookbook.image,
            ingredients: cookbook.ingredients,
            allergens: cookbook.allergens,
            allergensKnown: true,
            directions: cookbook.directions,
            equipment: cookbook.equipment,
            storage: cookbook.storage,
            reheating: cookbook.reheating,
            safety: cookbook.safety,
          };
        const custom = plan.customRecipes.find((recipe) => recipe.title === title);
        return {
          title,
          servings: portionsPerDish || custom?.servings || 4,
          recipeServings: custom?.servings || 4,
          source: custom ? "Customer recipe" : "Special request",
          image: "",
          ingredients: custom ? custom.ingredients.split(/\r?\n/).filter(Boolean) : [],
          allergens: [],
          // Not a cookbook recipe, so nobody has checked it for allergens.
          allergensKnown: false,
          directions: custom ? custom.directions.split(/\r?\n/).filter(Boolean) : [],
          equipment: [],
          storage: "Cool promptly, label, and refrigerate at 40°F or below.",
          reheating: "Confirm reheating instructions with Casey if they aren't in the customer's recipe.",
          safety: "Allergens for this dish haven't been checked. Compare every ingredient with the household's allergy notes before cooking.",
        };
      });

      // A visit from a customer request shows only the city until the day before, so the full address
      // and door codes aren't sitting in a chef's phone for a visit they might still decline.
      const addressHeld = event.requestId > 0 && (event.chefResponse !== "accepted" || !chefMaySeeAddress(event.serviceDate, today));
      const address = addressHeld ? event.location : event.address || customer?.streetAddress || event.location;
      // Door codes and phone numbers only while the visit is still ahead.
      const active = !addressHeld && event.status !== "completed" && event.serviceDate >= addDays(today, -1);
      const phone = active ? customer?.phone || event.contactPhone : "";
      // Chefs see what they need to cook and get in, never the customer's price or account email.
      // The raw address only reaches the phone through visit.address below, which respects addressHeld.
      const { priceCents: _p, customerEmail: _e, receiptKey: _r, inquiryId: _i, accessNotes: _a, contactPhone: _c, address: _addr, ...shown } = event;
      return {
        ...shown,
        dishDetails,
        pantry: pantry.map((item) => ({ itemKey: item.itemKey, name: item.name, note: item.note })),
        portionsPerDish,
        packagePortions: pkg?.portions ?? 0,
        addressHeld,
        visit: {
          address,
          mapUrl: addressHeld ? "" : mapsLink(address),
          contactName: event.contactName || customer?.fullName || event.household,
          phone,
          telUrl: telLink(phone),
          accessNotes: active ? [event.accessNotes, customer?.accessNotes].filter(Boolean).join("\n") : "",
          kitchenNotes: customer?.kitchenNotes ?? "",
        },
        customer: customer
          ? {
              phone,
              dietaryNeeds: customer.dietaryNeeds,
              foodsToAvoid: customer.foodsToAvoid,
              favoriteFoods: customer.favoriteFoods,
              householdSize: customer.householdSize,
              serviceFor: customer.serviceFor,
            }
          : null,
      };
    }),
  );
  return NextResponse.json({ events, entries }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await requireStaffRole("chef");
  if (!user) {
    // Most often a second tab signed in as someone else (the owner, say) while this page stayed open.
    const other = await getStaffUser();
    const error = other
      ? `You're signed in as ${other.email}, which is not the chef account. Sign out, then sign in with the chef account to answer this visit.`
      : "Your sign-in has ended. Sign in again to answer this visit.";
    return NextResponse.json({ error, signOut: Boolean(other) }, { status: 403 });
  }
  const action = String(body.action || "");
  if (action === "mileage") {
    const miles = Number(body.miles),
      label = String(body.label || "Approved travel").trim().slice(0, 160);
    if (!Number.isFinite(miles) || miles <= 0 || miles > 1000) return NextResponse.json({ error: "Enter valid mileage" }, { status: 400 });
    const occurred = new Date(String(body.occurredAt || ""));
    return NextResponse.json(
      await addMileage(user.email, label, miles, Number.isNaN(occurred.getTime()) ? new Date().toISOString() : occurred.toISOString()),
    );
  }
  if (action === "late") {
    const v = await getEvent(Math.max(0, Number(body.eventId) || 0));
    if (!v || v.chefEmail.toLowerCase() !== user.email.toLowerCase()) return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
    if (v.status === "cancelled" || v.status === "completed" || v.chefResponse === "pending") return NextResponse.json({ error: "You can only send this for a visit you have accepted that is not finished." }, { status: 409 });
    const minutes = [15, 30, 45, 60].includes(Number(body.minutes)) ? Number(body.minutes) : 0;
    if (!minutes) return NextResponse.json({ error: "Choose how late you will be." }, { status: 400 });
    const r = await getRequestForEvent(v.id);
    const c = r ? await getCustomer(r.customerEmail) : v.customerEmail ? await getCustomer(v.customerEmail) : null;
    const email = r?.customerEmail || v.customerEmail;
    await notifyChefRunningLate(v, email ? { name: c?.fullName || email, email, phone: c?.phone ?? "" } : null, minutes);
    return NextResponse.json({ ok: true, minutes });
  }
  if (action === "cantmake") {
    const v = await getEvent(Math.max(0, Number(body.eventId) || 0));
    if (!v || v.chefEmail.toLowerCase() !== user.email.toLowerCase()) return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
    if (v.chefResponse !== "accepted" || !["scheduled", "confirmed"].includes(v.status)) {
      return NextResponse.json({ error: "You can only drop a visit you accepted that has not started. If you are already at the house, call Casey." }, { status: 409 });
    }
    const reason = String(body.reason || "").trim().slice(0, 300);
    // Email first, while the chef's name is still on the visit; then free their calendar.
    await notifyChefCantMakeIt(v, reason);
    await setChefResponse(v.id, "declined");
    await patchEvent(v.id, { chef: "Unassigned", chefEmail: "" });
    const r = await getRequestForEvent(v.id);
    if (r && r.status === "scheduled") await patchRequest(r.id, { status: "awaiting_chef" });
    return NextResponse.json({ ok: true });
  }
  if (action === "respond") {
    const v = await getEvent(Math.max(0, Number(body.eventId) || 0));
    if (!v || v.chefEmail.toLowerCase() !== user.email.toLowerCase()) return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
    if (v.chefResponse !== "pending" || v.status === "cancelled" || v.status === "completed") return NextResponse.json({ error: "There's nothing to answer on this visit." }, { status: 409 });
    const r = await getRequestForEvent(v.id);
    const c = r ? await getCustomer(r.customerEmail) : null;
    if (body.response === "accept") {
      await setChefResponse(v.id, "accepted");
      if (r) {
        await patchRequest(r.id, { status: "scheduled" });
        await notifyConfirmed(v, r, { name: c?.fullName || r.customerEmail, email: r.customerEmail, phone: c?.phone ?? "" });
      }
      return NextResponse.json({ ok: true, response: "accepted" });
    }
    if (body.response === "decline") {
      // Email first, while the chef's name is still on the visit; then free their calendar.
      await notifyChefDeclined(v);
      await setChefResponse(v.id, "declined");
      await patchEvent(v.id, { chef: "Unassigned", chefEmail: "" });
      return NextResponse.json({ ok: true, response: "declined" });
    }
    return NextResponse.json({ error: "Accept or decline." }, { status: 400 });
  }
  const activityType = String(body.activityType || ""),
    eventId = Math.max(0, Number(body.scheduleEventId) || 0);
  if (action !== "toggle" || !allowed.has(activityType)) return NextResponse.json({ error: "Invalid timecard action" }, { status: 400 });
  let label = String(body.label || activityType).trim().slice(0, 160);
  if (eventId) {
    const event = await getEvent(eventId);
    if (!event || event.chefEmail.toLowerCase() !== user.email.toLowerCase())
      return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
    if (event.status === "completed" || event.status === "cancelled")
      return NextResponse.json({ error: `This visit is already ${event.status}.` }, { status: 409 });
    if (activityType === "job" && event.status === "in-progress")
      return NextResponse.json(
        { error: "Dish photos, a clean-kitchen photo, and the cleanup checklist are required to complete this visit" },
        { status: 409 },
      );
    label = `${event.household} · ${activityType}`;
    // Starting a shopping trip moves the visit to "shopping"; finishing it leaves it
    // there until the chef starts the job, rather than resetting it to "confirmed".
    if (activityType === "shopping" && event.status !== "shopping")
      await setChefEventStatus(eventId, user.email, "shopping", ["scheduled", "confirmed"]);
    if (activityType === "job") await setChefEventStatus(eventId, user.email, "in-progress", ["scheduled", "confirmed", "shopping"]);
  }
  return NextResponse.json(await toggleTimeEntry(user.email, activityType, label, eventId));
}
