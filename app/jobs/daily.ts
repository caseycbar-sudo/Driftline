/**
 * Runs once a day from the Worker's scheduled trigger (about 6pm Oregon time):
 * emails chefs and customers about tomorrow's visits. Records each date so a
 * repeated trigger never sends the same reminders twice.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../../db/index";
import { siteSettings } from "../../db/schema";
import { listAwaitingChef, listForDate } from "../../db/schedule";
import { getRequestForEvent } from "../../db/requests";
import { getCustomer } from "../../db/customers";
import { listNeedingReminder, patchRequest } from "../../db/requests";
import { notifyOwnerChefWaiting, notifyStillFindingChef, nudgeChefToAnswer, sendRequestReminder } from "../request-emails";
import { oregonTomorrow, sendDayBeforeReminders } from "../visit-emails";
import { releaseStaleHolds } from "../billing";

export async function runDailyJobs(now = new Date()) {
  const date = oregonTomorrow(now);
  const key = `reminders_sent:${date}`;
  const db = getDb();
  // Claim the date first; if another run already claimed it, stop.
  const claimed = await db
    .insert(siteSettings)
    .values({ key, value: "claimed", updatedAt: now.toISOString(), updatedBy: "cron" })
    .onConflictDoNothing()
    .returning({ key: siteSettings.key });
  if (!claimed.length) return { date, sent: 0, skipped: true };
  const visits = await listForDate(date);
  const sent = await sendDayBeforeReminders(visits);
  // Customer requests the owner hasn't answered in a day get one nudge.
  const overdue = await listNeedingReminder(new Date(now.getTime() - 24 * 3_600_000).toISOString()).catch(() => []);
  const named = await Promise.all(overdue.map(async (request) => ({ request, name: (await getCustomer(request.customerEmail))?.fullName || request.customerEmail })));
  if (await sendRequestReminder(named)) for (const { request } of named) await patchRequest(request.id, { remindedAt: now.toISOString() });
  // Visits where no chef has said yes after a day: nudge the chef, tell the customer once, and list them for the owner.
  await chaseChefAnswers(now, date).catch((error) => console.error("[daily] chef follow-up failed", error));
  // Card holds on cancelled visits, or about to expire, are let go so customers don't see them hanging.
  await releaseStaleHolds(now.getTime()).catch((error) => console.error("[daily] releasing card holds failed", error));
  await db.update(siteSettings).set({ value: `sent ${sent}` }).where(eq(siteSettings.key, key));
  return { date, sent, skipped: false };
}

/** Insert-once guard so each follow-up is sent a single time per visit. */
async function claimOnce(key: string, now: Date) {
  const claimed = await getDb()
    .insert(siteSettings)
    .values({ key, value: "claimed", updatedAt: now.toISOString(), updatedBy: "cron" })
    .onConflictDoNothing()
    .returning({ key: siteSettings.key });
  return claimed.length > 0;
}

async function chaseChefAnswers(now: Date, tomorrow: string) {
  const cutoff = now.getTime() - 24 * 3_600_000;
  const waiting = (await listAwaitingChef()).filter((v) => Date.parse(v.updatedAt) < cutoff);
  if (!waiting.length) return;
  for (const v of waiting) {
    if (v.chefResponse === "pending" && v.chefEmail && (await claimOnce(`chef_nudged:${v.id}:${v.chefEmail}`, now))) await nudgeChefToAnswer(v);
    if (await claimOnce(`customer_still_finding:${v.id}`, now)) {
      const request = await getRequestForEvent(v.id);
      if (request) {
        const customer = await getCustomer(request.customerEmail);
        await notifyStillFindingChef(v, { name: customer?.fullName || request.customerEmail, email: request.customerEmail, phone: customer?.phone ?? "" });
      }
    }
  }
  await notifyOwnerChefWaiting(waiting.map((v) => ({ v, tomorrow: v.serviceDate === tomorrow })));
}
