/**
 * Emails about scheduled visits: to the chef when they're assigned or something
 * they need changes, to the customer when a visit is booked, moved or cancelled,
 * and day-before reminders to both.
 */
import { escapeHtml, publicSiteUrl, sendEmail } from "./notify";
import { SERVICE_TYPES } from "./schedule-core";
import type { ScheduleEvent } from "../db/schedule";

const ZONE = "America/Los_Angeles";

export function prettyVisitDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
}
export function prettyTime(hhmm: string) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}
const when = (v: ScheduleEvent) =>
  `${prettyVisitDate(v.serviceDate)}, ${prettyTime(v.startTime)}${v.endTime ? `–${prettyTime(v.endTime)}` : ""}`;
const serviceLabel = (v: ScheduleEvent) => SERVICE_TYPES.find((t) => t.value === v.serviceType)?.label ?? "Visit";
const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

function layout(title: string, lines: [string, string][], note: string, button?: { href: string; label: string }) {
  const rows = lines
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#596568;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;color:#16232f"><b>${escapeHtml(v)}</b></td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;color:#16232f">
<h2 style="font-family:Georgia,serif;font-weight:400;margin:0 0 14px">${escapeHtml(title)}</h2>
<table style="border-collapse:collapse;margin:0 0 16px">${rows}</table>
<p style="margin:0 0 18px;color:#34454c">${escapeHtml(note)}</p>
${button ? `<p><a href="${escapeHtml(button.href)}" style="background:#7a6032;color:#fff;padding:11px 18px;text-decoration:none;font-weight:bold;display:inline-block">${escapeHtml(button.label)}</a></p>` : ""}
<p style="color:#596568;font-size:13px">Driftline Provisions · Astoria, Oregon</p></div>`;
}
const asText = (title: string, lines: [string, string][], note: string, link?: string) =>
  [title, "", ...lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), "", note, link ?? ""].join("\n").trim();

function chefLines(v: ScheduleEvent): [string, string][] {
  return [
    ["When", when(v)],
    ["Client", v.household],
    ["Service", serviceLabel(v) + (v.guestCount ? ` · ${v.guestCount} guests` : v.packageName ? ` · ${v.packageName}` : "")],
    ["Where", v.address || v.location],
    ["Dishes", v.dishes.join(", ")],
  ];
}

async function emailChef(v: ScheduleEvent, title: string, note: string) {
  if (!v.chefEmail) return false;
  const site = publicSiteUrl();
  const lines = chefLines(v);
  return sendEmail({
    to: v.chefEmail,
    subject: `${title}: ${v.household}, ${prettyVisitDate(v.serviceDate)}`,
    text: asText(title, lines, note, `${site}/chef`),
    html: layout(title, lines, note, { href: `${site}/chef`, label: "Open the chef app" }),
  });
}

async function emailCustomer(v: ScheduleEvent, title: string, note: string) {
  if (!v.customerEmail) return false;
  const site = publicSiteUrl();
  const lines: [string, string][] = [
    ["When", when(v)],
    ["Service", serviceLabel(v)],
    ["Your chef", v.chefEmail ? firstName(v.chef) : "We'll confirm your chef soon"],
    ["Where", v.address || v.location],
  ];
  return sendEmail({
    to: v.customerEmail,
    subject: `${title}: ${prettyVisitDate(v.serviceDate)}`,
    text: asText(`Hi ${firstName(v.contactName || v.household)},`, lines, note, `${site}/account`),
    html: layout(title, lines, note, { href: `${site}/account`, label: "See it in your account" }),
  });
}

const CHEF_FIELDS: (keyof ScheduleEvent)[] = ["serviceDate", "startTime", "endTime", "address", "location", "accessNotes", "dishes", "guestCount", "notes"];
const CUSTOMER_FIELDS: (keyof ScheduleEvent)[] = ["serviceDate", "startTime", "endTime"];
const changed = (a: ScheduleEvent, b: ScheduleEvent, fields: (keyof ScheduleEvent)[]) =>
  fields.some((f) => JSON.stringify(a[f]) !== JSON.stringify(b[f]));

/** Decide who needs to hear about a new or changed visit, and tell them. */
export async function notifyVisitChange(after: ScheduleEvent, before: ScheduleEvent | null, repeatCount = 1) {
  const repeatNote = repeatCount > 1 ? ` This repeats weekly for ${repeatCount} weeks.` : "";
  if (!before) {
    await emailChef(after, "New visit assigned", `You're on this visit.${repeatNote} Full details, access notes and the grocery list are in the chef app.`);
    await emailCustomer(after, "Your Driftline visit is booked", `We're looking forward to it.${repeatNote} Reply to this email if anything needs to change.`);
    return;
  }
  if (after.status === "cancelled" && before.status !== "cancelled") {
    await emailChef(after, "Visit cancelled", "This visit is off your schedule.");
    await emailCustomer(after, "Your visit has been cancelled", "If this is a surprise, reply to this email and Casey will sort it out.");
    return;
  }
  if (after.status === "cancelled") return;
  if (after.chefEmail && after.chefEmail !== before.chefEmail) {
    await emailChef(after, "New visit assigned", "You're on this visit. Full details are in the chef app.");
    if (before.chefEmail) await emailChef(before, "Visit reassigned", "This visit has moved to another chef, so it's off your schedule.");
  } else if (changed(after, before, CHEF_FIELDS)) {
    await emailChef(after, "Visit updated", "Something about this visit changed. Check the chef app before you go.");
  }
  if (changed(after, before, CUSTOMER_FIELDS)) {
    await emailCustomer(after, "Your visit has a new time", "Here are the updated details.");
  }
}

/** Day-before reminders for every scheduled visit on `date`. Returns how many emails went out. */
export async function sendDayBeforeReminders(visits: ScheduleEvent[]) {
  let sent = 0;
  for (const v of visits) {
    if (await emailChef(v, "Tomorrow's visit", "Check the grocery list and access notes in the chef app before you shop.")) sent++;
    if (await emailCustomer(v, "See you tomorrow", "Your chef will arrive in the time window above. Reply if anything's changed.")) sent++;
  }
  return sent;
}

/** Oregon date for tomorrow, YYYY-MM-DD (calendar day after today in Oregon, safe across DST changes). */
export function oregonTomorrow(now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return new Date(Date.parse(`${today}T12:00:00Z`) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
