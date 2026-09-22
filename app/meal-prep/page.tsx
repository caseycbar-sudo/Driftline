import MealPrepClient from "./MealPrepClient";
import { getPricing } from "../../db/pricing";

// Prices come from the owner dashboard, so render per request.
export const dynamic = "force-dynamic";

export default async function MealPrepPage() {
  const pricing = await getPricing();
  const packages = pricing.mealPrep.map((p) => ({
    name: p.name,
    portions: p.portions,
    price: p.priceCents / 100,
    note: p.note,
    featured: p.featured,
  }));
  return <MealPrepClient packages={packages} pantryKit={pricing.pantryKitCents / 100} />;
}
