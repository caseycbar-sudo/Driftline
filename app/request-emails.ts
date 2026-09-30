/**
 * Emails for the session request flow: the customer's request, the admin's
 * decision, the chef's assignment and the final confirmation.
 *
 * Nothing here throws. A mail problem must never lose a request or block an approval.
 */
import { ownerEmails, publicSiteUrl, sendEmail } from "./notify";
import { asText, firstName, layout, prettyTime, prettyVisitDate, when } from "./visit-emails";
import { REQUEST_RESPONSE_HOURS, type TimeWindow } from "./request-core";
import type { SessionRequest } from "../db/requests";
import type { ScheduleEvent } from "../db/schedule";

const windowText = (w: TimeWindow) => `${prettyVisitDate(w.date)}, ${prettyTime(w.from)} to ${prettyTime(w.to)}`;
const windowsText = (ws: TimeWindow[]) => ws.map(windowText).join("; ");
const where = (r: { address: string; city: string }) => [r.address, r.city].filter(Boolean).join(", ");

type Who = { name: string; email: string; phone?: string };

async function toCustomer(who: Who, subject: string, title: string, lines: [string, string][], note: string, button = "See it in your account") {
  const site = publicSiteUrl();
  return sendEmail({
    to: who.email,
    subject,
    text: asText(`Hi ${firstName(who.name)},`, [["", title], ...lines], note, `${site}/account`),
    html: layout(title, lines, note, { href: `${site}/account`, label: button }),
  }).catch(() => false);
}

/** After Submit: the customer gets a receipt, the admin gets an alert. */
export async function notifyRequestSubmitted(r: SessionRequest, who: Who, change = false) {
  const lines: [string, string][] = [
    ["Menu", r.dishes.join(", ")],
    ["Plan", `${r.packageName} for ${r.people} ${r.people === 1 ? "person" : "people"}`],
    ["Times that work", windowsText(r.windows)],
  ];
  await toCustomer(
    who,
    change ? "We got your change request" : "We got your request",
    change ? "Your change request is in" : "Your meal prep request is in",
    lines,
    `We'll review it and get back to you within ${REQUEST_RESPONSE_HOURS} hours. Nothing is booked until we confirm a time and a chef.`,
  );
  const site = publicSiteUrl();
  const adminLines: [string, string][] = [["Customer", `${who.name} (${who.email})`], ["Phone", who.phone ?? ""], ...lines, ["Where", where(r)]];
  const title = change ? "Change request from a customer" : "New meal prep request";
  await sendEmail({
    to: ownerEmails(),
    subject: `${title}: ${who.name}`,
    text: asText(title, adminLines, "Open the admin page to schedule it.", `${site}/portal`),
    html: layout(title, adminLines, "Open the admin page to pick a time and a chef.", { href: `${site}/portal`, label: "Review the request" }),
    replyTo: who.email,
  }).catch(() => false);
}

/** The admin couldn't match the times and offered others (or asked for new ones). */
export async function notifyNeedsNewTime(r: SessionRequest, who: Who) {
  const lines: [string, string][] = [["Times we can do", r.suggestedTimes.length ? windowsText(r.suggestedTimes) : "Tell us what else works"], ["A note from Driftline", r.adminNote]];
  await toCustomer(who, "We need a different time", "We couldn't fit your times", lines, "Open your account to choose one of these or send new times. Nothing is booked yet.", "Pick a new time");
}

/** `keep` = it was a change request, so the original visit still stands. */
export async function notifyDeclined(r: SessionRequest, who: Who, keep = false) {
  await toCustomer(
    who,
    keep ? "About your change request" : "About your meal prep request",
    keep ? "We couldn't make that change" : "We can't schedule this one",
    [["A note from Driftline", r.adminNote]],
    keep ? "Your visit is unchanged. Reply to this email if you'd like to talk it through." : "We're sorry. Reply to this email and we'll talk through other options.",
  );
}

/** A chef who had a visit no longer does (the admin picked someone else). */
export async function notifyChefReleased(v: ScheduleEvent) {
  if (!v.chefEmail) return;
  await sendEmail({
    to: v.chefEmail,
    subject: `Visit reassigned: ${v.household}, ${prettyVisitDate(v.serviceDate)}`,
    text: asText("Visit reassigned", [["When", when(v)]], "This visit moved to another chef, so it's off your schedule."),
    html: layout("Visit reassigned", [["When", when(v)]], "This visit moved to another chef, so it's off your schedule."),
  }).catch(() => false);
}

/** Approved: the chef hears first and has to accept before the customer is told. */
export async function notifyChefAssigned(v: ScheduleEvent, reassigned = false) {
  if (!v.chefEmail) return;
  const site = publicSiteUrl();
  const lines: [string, string][] = [
    ["When", when(v)],
    ["Where", v.location],
    ["Dishes", v.dishes.join(", ")],
  ];
  const title = reassigned ? "A visit was reassigned to you" : "You've been scheduled";
  await sendEmail({
    to: v.chefEmail,
    subject: `${title}: ${prettyVisitDate(v.serviceDate)}`,
    text: asText(title, lines, "Please accept or decline in the chef app. The customer hears nothing until a chef accepts.", `${site}/chef`),
    html: layout(title, lines, "Please accept or decline in the chef app. The customer hears nothing until a chef accepts.", { href: `${site}/chef`, label: "Accept or decline" }),
  }).catch(() => false);
}

/** The chef accepted: now the customer is told, with the chef's first name. */
export async function notifyConfirmed(v: ScheduleEvent, r: SessionRequest, who: Who, rescheduled = false) {
  const lines: [string, string][] = [
    ["When", when(v)],
    ["Menu", v.dishes.join(", ")],
    ["Your chef", firstName(v.chef)],
    ["Where", where(r) || v.address || v.location],
  ];
  await toCustomer(
    who,
    rescheduled ? "Your visit has a new time" : "Your Driftline visit is confirmed",
    rescheduled ? "Your visit has a new time" : "You're booked",
    lines,
    "We'll send a reminder the day before. Reply to this email if anything changes.",
  );
}

/** A chef said no: the admin needs to choose someone else. */
export async function notifyChefDeclined(v: ScheduleEvent) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [["Chef", v.chef], ["Client", v.household], ["When", when(v)]];
  await sendEmail({
    to: ownerEmails(),
    subject: `${v.chef} declined: ${v.household}, ${prettyVisitDate(v.serviceDate)}`,
    text: asText("A chef declined a visit", lines, "Choose another chef. The customer hasn't been told anything yet.", `${site}/portal`),
    html: layout("A chef declined a visit", lines, "Choose another chef. The customer hasn't been told anything yet.", { href: `${site}/portal`, label: "Reassign the visit" }),
  }).catch(() => false);
}

/** The customer canceled or changed a scheduled visit. */
export async function notifyCustomerCancelled(v: ScheduleEvent, who: Who, chefKnows = true) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [["Client", who.name], ["When", when(v)]];
  await sendEmail({
    to: ownerEmails(),
    subject: `Customer canceled: ${who.name}, ${prettyVisitDate(v.serviceDate)}`,
    text: asText("A customer canceled a visit", lines, "It's off the schedule.", `${site}/portal`),
    html: layout("A customer canceled a visit", lines, "It's off the schedule.", { href: `${site}/portal`, label: "Open admin" }),
  }).catch(() => false);
  if (v.chefEmail && chefKnows) {
    await sendEmail({
      to: v.chefEmail,
      subject: `Visit canceled: ${v.household}, ${prettyVisitDate(v.serviceDate)}`,
      text: asText("Visit canceled", [["When", when(v)]], "The customer canceled. It's off your schedule."),
      html: layout("Visit canceled", [["When", when(v)]], "The customer canceled. It's off your schedule."),
    }).catch(() => false);
  }
  await toCustomer(who, "Your visit was canceled", "Your visit is canceled", [["Was", when(v)]], "Whenever you're ready, you can book another visit from your account.", "Open your account");
}

/** Requests that have waited a day: one reminder email listing them. Returns how many were included. */
export async function sendRequestReminder(waiting: { request: SessionRequest; name: string }[]) {
  if (!waiting.length) return 0;
  const site = publicSiteUrl();
  const lines: [string, string][] = waiting.map(({ request, name }) => [name, `${request.dishes.length} dishes, ${windowText(request.windows[0] ?? { date: "", from: "", to: "" })}`]);
  const ok = await sendEmail({
    to: ownerEmails(),
    subject: `${waiting.length} meal prep ${waiting.length === 1 ? "request is" : "requests are"} waiting`,
    text: asText("Requests waiting for you", lines, "Customers are told to expect an answer within a day.", `${site}/portal`),
    html: layout("Requests waiting for you", lines, "Customers are told to expect an answer within a day.", { href: `${site}/portal`, label: "Open the inbox" }),
  }).catch(() => false);
  return ok ? waiting.length : 0;
}

