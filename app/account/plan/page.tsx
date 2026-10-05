import { requireUser } from "../../auth";
import { getOrCreateCustomer } from "../../../db/customers";
import { getCookbook } from "../../../db/cookbook";
import { getPricing } from "../../../db/pricing";
import { getRequest } from "../../../db/requests";
import { smallImage } from "../../site-config";
import { DEFAULT_PEOPLE } from "../../request-core";
import PlanBuilder from "./PlanBuilder";
import { ingredientNames } from "./dish-info";
import { backdropImages } from "../backdrop-images";
import "../account.css";
import "./plan.css";

export const dynamic = "force-dynamic";

export default async function PlanPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("/account/plan");
  const [profile, pricing, cookbook] = await Promise.all([getOrCreateCustomer(user.email, user.displayName), getPricing(), getCookbook()]);
  const dishes = cookbook
    .filter((r) => r.side === "meal-prep")
    .map((r) => ({ id: r.id, title: r.title, category: r.category, description: r.description, image: r.image ? smallImage(r.image) : "", allergens: r.allergens.map(String), dietary: r.dietary, bigImage: r.image, ingredients: ingredientNames(r.ingredients), reheating: r.reheating }));

  // Editing a request starts from its menu; otherwise from any dishes carried over in the link.
  let editId = 0;
  let items: number[] = (params.items ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  let people = Number(params.people) || DEFAULT_PEOPLE;
  const edit = Number(params.edit) || 0;
  if (edit) {
    const existing = await getRequest(edit);
    if (existing && existing.customerEmail === user.email.toLowerCase()) {
      editId = existing.id;
      if (!params.items) items = existing.recipeIds;
      if (!params.people) people = existing.people;
    }
  }
  items = items.filter((id) => dishes.some((d) => d.id === id)).slice(0, 5);

  return (
    <PlanBuilder
      dishes={dishes}
      packages={pricing.mealPrep.map((p) => ({ name: p.name, portions: p.portions, priceCents: p.priceCents }))}
      initialItems={items}
      initialPeople={people}
      editId={editId}
      avoid={[profile.dietaryNeeds, profile.foodsToAvoid].filter(Boolean).join(" ").toLowerCase()}
      backdrop={backdropImages(cookbook)}
      profileReady={Boolean(profile.fullName && profile.phone && profile.streetAddress && profile.city)}
    />
  );
}
