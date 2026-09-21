/**
 * "Now" for Driftline is Oregon time. The server runs in UTC, so anything that
 * shows today's date must be computed in America/Los_Angeles on both the server
 * and the phone, or they disagree every evening after 5pm.
 */
const ZONE = "America/Los_Angeles";

/** Today's date in Oregon as YYYY-MM-DD. */
export function oregonToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** e.g. "Saturday, September 19" in Oregon time. */
export function oregonLongDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", { timeZone: ZONE, weekday: "long", month: "long", day: "numeric" });
}

/** "morning" | "afternoon" | "evening" by the Oregon clock. */
export function oregonPartOfDay(now = new Date()): "morning" | "afternoon" | "evening" {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", hourCycle: "h23" }).format(now));
  return hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
}
