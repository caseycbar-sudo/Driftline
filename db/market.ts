import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { siteSettings } from "./schema";
import type { MarketStatus, SavedMarketStatus } from "../app/market-core";
import { oregonDate } from "../app/market-core";

const KEY = "market_status";

export async function getSavedMarketStatus(): Promise<SavedMarketStatus | null> {
  const rows = await getDb().select().from(siteSettings).where(eq(siteSettings.key, KEY)).limit(1);
  if (!rows[0]) return null;
  try {
    const v = JSON.parse(rows[0].value) as Partial<SavedMarketStatus>;
    return { status: (v.status ?? "schedule") as MarketStatus, note: v.note ?? "", date: v.date ?? "", updatedAt: rows[0].updatedAt };
  } catch {
    return null;
  }
}

export async function saveMarketStatus(status: MarketStatus, note: string, byEmail: string) {
  const now = new Date();
  const value = JSON.stringify({ status, note, date: oregonDate(now) });
  const updatedAt = now.toISOString();
  await getDb()
    .insert(siteSettings)
    .values({ key: KEY, value, updatedAt, updatedBy: byEmail })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt, updatedBy: byEmail } });
}
