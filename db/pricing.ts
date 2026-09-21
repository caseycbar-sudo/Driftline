import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { siteSettings } from "./schema";
import { DEFAULT_PRICING, readPricing, type Pricing } from "../app/pricing-core";

const KEY = "pricing";

export async function getPricing(): Promise<Pricing> {
  try {
    const rows = await getDb().select().from(siteSettings).where(eq(siteSettings.key, KEY)).limit(1);
    return readPricing(rows[0]?.value);
  } catch {
    return DEFAULT_PRICING;
  }
}

export async function savePricing(pricing: Pricing, byEmail: string) {
  const value = JSON.stringify(pricing),
    updatedAt = new Date().toISOString();
  await getDb()
    .insert(siteSettings)
    .values({ key: KEY, value, updatedAt, updatedBy: byEmail })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt, updatedBy: byEmail } });
}
