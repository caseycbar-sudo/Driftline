/**
 * Runs once a day from the Worker's scheduled trigger (about 6pm Oregon time):
 * emails chefs and customers about tomorrow's visits. Records each date so a
 * repeated trigger never sends the same reminders twice.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../../db/index";
import { siteSettings } from "../../db/schema";
import { listForDate } from "../../db/schedule";
import { getCustomer } from "../../db/customers";
import { listNeedingReminder, patchRequest } from "../../db/requests";
import { sendRequestReminder } from "../request-emails";
import { oregonTomorrow, sendDayBeforeReminders } from "../visit-emails";

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
  await db.update(siteSettings).set({ value: `sent ${sent}` }).where(eq(siteSettings.key, key));
  return { date, sent, skipped: false };
}
