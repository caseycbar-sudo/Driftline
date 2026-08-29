import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import {
  getEvent,
  listEvents,
  setChefEventStatus,
} from "../../../../db/schedule";
import {
  addMileage,
  listTimeEntries,
  toggleTimeEntry,
} from "../../../../db/timecards";
import { listCustomers } from "../../../../db/customers";
import { getMealPlan } from "../../../../db/meals";
import { recipes } from "../../../cookbook/recipes";
export const dynamic = "force-dynamic";
const allowed = new Set(["day", "break", "shopping", "job"]);
export async function GET(request: Request) {
  const user = await requireStaffRole("chef");
  if (!user)
    return NextResponse.json(
      { error: "Chef access required" },
      { status: 403 },
    );
  const url = new URL(request.url),
    start =
      url.searchParams.get("start") || new Date().toISOString().slice(0, 10),
    end = url.searchParams.get("end") || "2100-01-01",
    email = user.email.toLowerCase();
  const [rawEvents, entries, customers] = await Promise.all([
    listEvents(start, end).then((rows) =>
      rows.filter(
        (row) =>
          row.chefEmail.toLowerCase() === email && row.status !== "cancelled",
      ),
    ),
    listTimeEntries(email, `${start}T00:00:00.000Z`, `${end}T23:59:59.999Z`),
    listCustomers(),
  ]);
  const events = await Promise.all(
    rawEvents.map(async (event) => {
      const customer = customers.find(
          (item) =>
            item.email.toLowerCase() === event.customerEmail.toLowerCase(),
        ),
        plan = event.customerEmail
          ? await getMealPlan(event.customerEmail)
          : { customRecipes: [] };
      const dishDetails = event.dishes.map((title) => {
        const cookbook = recipes.find((recipe) => recipe.title === title);
        if (cookbook)
          return {
            title,
            source: "Driftline cookbook",
            image: cookbook.image,
            ingredients: cookbook.ingredients,
            allergens: cookbook.allergens,
            directions: cookbook.directions,
            equipment: cookbook.equipment,
            storage: cookbook.storage,
            reheating: cookbook.reheating,
            safety: cookbook.safety,
          };
        const custom = plan.customRecipes.find(
          (recipe) => recipe.title === title,
        );
        return {
          title,
          source: custom ? "Customer recipe" : "Special request",
          image: "",
          ingredients: custom
            ? custom.ingredients.split(/\r?\n/).filter(Boolean)
            : [],
          allergens: [],
          directions: custom ? custom.directions.split(/\r?\n/).filter(Boolean) : [],
          equipment: [],
          storage: "Cool promptly, label, and refrigerate at 40°F or below.",
          reheating: "Confirm reheating instructions with operations if they are not included in the customer recipe.",
          safety: "Review the customer’s dietary notes and prevent cross-contact.",
        };
      });
      return {
        ...event,
        dishDetails,
        customer: customer
          ? {
              phone: customer.phone,
              dietaryNeeds: customer.dietaryNeeds,
              foodsToAvoid: customer.foodsToAvoid,
            }
          : null,
      };
    }),
  );
  return NextResponse.json({ events, entries });
}
export async function POST(request: Request) {
  const user = await requireStaffRole("chef");
  if (!user)
    return NextResponse.json(
      { error: "Chef access required" },
      { status: 403 },
    );
  const body = (await request.json()) as Record<string, unknown>,
    action = String(body.action || "");
  if (action === "mileage") {
    const miles = Number(body.miles),
      label = String(body.label || "Approved travel")
        .trim()
        .slice(0, 160);
    if (!Number.isFinite(miles) || miles <= 0 || miles > 1000)
      return NextResponse.json(
        { error: "Enter valid mileage" },
        { status: 400 },
      );
    return NextResponse.json(
      await addMileage(
        user.email,
        label,
        miles,
        String(body.occurredAt || new Date().toISOString()),
      ),
    );
  }
  const activityType = String(body.activityType || ""),
    eventId = Math.max(0, Number(body.scheduleEventId) || 0);
  if (action !== "toggle" || !allowed.has(activityType))
    return NextResponse.json(
      { error: "Invalid timecard action" },
      { status: 400 },
    );
  let label = String(body.label || activityType)
    .trim()
    .slice(0, 160);
  if (eventId) {
    const event = await getEvent(eventId);
    if (!event || event.chefEmail.toLowerCase() !== user.email.toLowerCase())
      return NextResponse.json(
        { error: "This job is not assigned to you" },
        { status: 403 },
      );
    if (activityType === "job" && event.status === "in-progress")
      return NextResponse.json(
        {
          error:
            "Dish photos, a clean-kitchen photo, and the cleanup checklist are required to complete this visit",
        },
        { status: 409 },
      );
    label = `${event.household} · ${activityType}`;
    if (activityType === "shopping")
      await setChefEventStatus(
        eventId,
        user.email,
        event.status === "shopping" ? "confirmed" : "shopping",
      );
    if (activityType === "job")
      await setChefEventStatus(eventId, user.email, "in-progress");
  }
  return NextResponse.json(
    await toggleTimeEntry(user.email, activityType, label, eventId),
  );
}
