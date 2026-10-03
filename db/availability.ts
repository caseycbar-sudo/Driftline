import { env } from "cloudflare:workers";
import { unavailableDates } from "../app/request-core";
import { listStaff } from "./staff";

function database() {
  if (!env.DB) throw new Error("Availability database unavailable");
  return env.DB;
}

export type BlockedDate = { date: string; note: string };

export async function listBlocked(fromDate: string): Promise<BlockedDate[]> {
  const result = await database().prepare("SELECT date, note FROM blocked_dates WHERE date >= ? ORDER BY date").bind(fromDate).all<{ date: string; note: string }>();
  return result.results.map((r) => ({ date: String(r.date), note: String(r.note ?? "") }));
}

export async function addBlocked(date: string, note: string, createdBy: string) {
  await database()
    .prepare("INSERT INTO blocked_dates (date, note, created_by, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET note = excluded.note")
    .bind(date, note, createdBy.toLowerCase(), new Date().toISOString())
    .run();
}

export async function removeBlocked(date: string) {
  await database().prepare("DELETE FROM blocked_dates WHERE date = ?").bind(date).run();
}

/**
 * Days between two dates a customer cannot pick: blocked by the owner, or every active chef already has a visit.
 * A visit that came from `ignoreRequestId` is not counted, so changing your own request never blocks its own day.
 */
export async function unavailableBetween(fromDate: string, toDate: string, ignoreRequestId = 0): Promise<string[]> {
  const db = database();
  const [blocked, visits, staff] = await Promise.all([
    db.prepare("SELECT date FROM blocked_dates WHERE date >= ? AND date <= ?").bind(fromDate, toDate).all<{ date: string }>(),
    db
      .prepare("SELECT service_date FROM schedule_events WHERE service_date >= ? AND service_date <= ? AND status != 'cancelled' AND chef_response != 'declined' AND (? = 0 OR request_id != ?)")
      .bind(fromDate, toDate, ignoreRequestId, ignoreRequestId)
      .all<{ service_date: string }>(),
    listStaff(),
  ]);
  const chefs = staff.filter((s) => s.role === "chef" && s.status === "active").length;
  return unavailableDates(
    blocked.results.map((r) => String(r.date)),
    visits.results.map((r) => String(r.service_date)),
    chefs,
  );
}
