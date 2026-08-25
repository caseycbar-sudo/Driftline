import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getOrCreateCustomer, updateCustomer } from "../../../db/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.json(await getOrCreateCustomer(user.email, user.displayName));
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const clean = (key: string, limit = 500) => String(body[key] ?? "").trim().slice(0, limit);
  const householdSize = Math.max(1, Math.min(20, Number(body.householdSize) || 1));
  const profile = await updateCustomer(user.email, {
    fullName: clean("fullName", 100) || user.displayName,
    phone: clean("phone", 30), city: clean("city", 80), householdSize,
    serviceFor: clean("serviceFor", 80) || "My household",
    dietaryNeeds: clean("dietaryNeeds"), favoriteFoods: clean("favoriteFoods"), foodsToAvoid: clean("foodsToAvoid"),
    preferredPackage: clean("preferredPackage", 30) || "Weekly",
  });
  return NextResponse.json(profile);
}
