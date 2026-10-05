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
export async function notifyRequestSubmitted(r: SessionRequest, who: Who, change = false, answering?: SessionRequest) {
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
  // When the customer is answering "we need a different time", say so, and show what they were answering.
  const replied = change && answering?.status === "needs_new_time";
  const adminLines: [string, string][] = [
    ["Customer", `${who.name} (${who.email})`],
    ["Phone", who.phone ?? ""],
    ...(replied ? ([["You offered", answering.suggestedTimes.length ? windowsText(answering.suggestedTimes) : ""], ["Your note", answering.adminNote]] as [string, string][]) : []),
    ...lines,
    ["Where", where(r)],
  ];
  const title = replied ? "A customer sent new times" : change ? "Change request from a customer" : "New meal prep request";
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


/** The chef tapped "Running late": tell the customer and the owner right away. */
export async function notifyChefRunningLate(v: ScheduleEvent, who: Who | null, minutes: number) {
  const site = publicSiteUrl();
  const delay = `about ${minutes} minutes`;
  if (who) {
    await toCustomer(
      who,
      "Your chef is running a little late",
      "Your chef is running late",
      [["Your chef", firstName(v.chef)], ["Delay", delay], ["Scheduled", when(v)]],
      "Thank you for your patience. Call or text (503) 741-9630 if you need to reach us.",
    );
  }
  const lines: [string, string][] = [["Chef", v.chef], ["Client", v.household], ["Scheduled", when(v)], ["Delay", delay]];
  await sendEmail({
    to: ownerEmails(),
    subject: `${v.chef} is running late: ${v.household}`,
    text: asText("A chef is running late", lines, who ? "The customer has been told." : "No customer email is on this visit, so nobody was notified.", `${site}/portal`),
    html: layout("A chef is running late", lines, who ? "The customer has been told." : "No customer email is on this visit, so nobody was notified.", { href: `${site}/portal`, label: "Open the dashboard" }),
  }).catch(() => false);
}

/** A customer tried to cancel or change a visit inside 48 hours and was told to call: the owner hears about it too. */
export async function notifyOwnerLateChangeAttempt(v: ScheduleEvent, who: Who, kind: "cancel" | "change") {
  const site = publicSiteUrl();
  const title = kind === "cancel" ? "A customer tried to cancel inside 48 hours" : "A customer tried to change a visit inside 48 hours";
  const lines: [string, string][] = [["Customer", `${who.name} (${who.email})`], ["Phone", who.phone ?? ""], ["Visit", when(v)], ["Chef", v.chef || "Unassigned"]];
  const note = "They were told to call or text (503) 741-9630. Nothing was changed. Open the schedule if you want to cancel or move it for them.";
  await sendEmail({
    to: ownerEmails(),
    subject: `${title}: ${who.name}`,
    text: asText(title, lines, note, `${site}/portal`),
    html: layout(title, lines, note, { href: `${site}/portal`, label: "Open the dashboard" }),
    replyTo: who.email,
  }).catch(() => false);
}

/** A chef who already accepted a visit says they cannot make it: the owner needs to act now. */
export async function notifyChefCantMakeIt(v: ScheduleEvent, reason: string) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [["Chef", v.chef], ["Client", v.household], ["Visit", when(v)], ["Reason", reason || "No reason given"]];
  const note = "The visit is now unassigned. Pick another chef from the dashboard. The customer has not been told yet.";
  await sendEmail({
    to: ownerEmails(),
    subject: `${v.chef} can't make it: ${v.household}, ${prettyVisitDate(v.serviceDate)}`,
    text: asText("A chef cannot make a visit", lines, note, `${site}/portal`),
    html: layout("A chef cannot make a visit", lines, note, { href: `${site}/portal`, label: "Reassign the visit" }),
  }).catch(() => false);
}

/** Owner digest: visits where no chef has said yes, oldest first. */
export async function notifyOwnerChefWaiting(rows: { v: ScheduleEvent; tomorrow: boolean }[]) {
  if (!rows.length) return false;
  const site = publicSiteUrl();
  const lines: [string, string][] = rows.map(({ v, tomorrow }) => [
    `${v.household}${tomorrow ? " (TOMORROW)" : ""}`,
    `${when(v)}. ${v.chefResponse === "pending" && v.chef && v.chef !== "Unassigned" ? `Waiting on ${v.chef}` : "No chef assigned"}`,
  ]);
  const note = "These visits have gone more than a day without a chef saying yes. Assign or reassign a chef from the dashboard.";
  return sendEmail({
    to: ownerEmails(),
    subject: `${rows.length} visit${rows.length === 1 ? "" : "s"} still need a chef`,
    text: asText("Visits still need a chef", lines, note, `${site}/portal`),
    html: layout("Visits still need a chef", lines, note, { href: `${site}/portal`, label: "Open the dashboard" }),
  }).catch(() => false);
}

/** A day with no chef answer: the customer hears we are still on it. */
export async function notifyStillFindingChef(v: ScheduleEvent, who: Who) {
  await toCustomer(
    who,
    "We're still finding your chef",
    "We're still lining up your chef",
    [["Visit", when(v)]],
    "Your request is still active and we are working on it. We will email you as soon as a chef confirms. Nothing is charged until the visit is done.",
  );
}

/** A chef has had a visit waiting a day without answering. */
export async function nudgeChefToAnswer(v: ScheduleEvent) {
  if (!v.chefEmail) return false;
  const site = publicSiteUrl();
  const lines: [string, string][] = [["Client", v.household], ["Visit", when(v)]];
  const note = "Open the chef app and tap Accept or Decline so we can confirm the customer or find someone else.";
  return sendEmail({
    to: v.chefEmail,
    subject: `Please answer: ${v.household}, ${prettyVisitDate(v.serviceDate)}`,
    text: asText("A visit is waiting for your answer", lines, note, `${site}/chef`),
    html: layout("A visit is waiting for your answer", lines, note, { href: `${site}/chef`, label: "Answer in the chef app" }),
  }).catch(() => false);
}

/** The customer wrote in the thread: Driftline hears about it, and can reply to the email or in the portal. */
export async function notifyOwnerOfMessage(r: SessionRequest, who: Who, body: string) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [["From", `${who.name} (${who.email})`], ["Phone", who.phone ?? ""], ["Session", r.dishes.join(", ")], ["Message", body]];
  const title = "New message from a customer";
  await sendEmail({
    to: ownerEmails(),
    subject: `${title}: ${who.name}`,
    text: asText(title, lines, "Reply in the owner portal under Messages so it stays with their request.", `${site}/portal`),
    html: layout(title, lines, "Reply in the owner portal under Messages so it stays with their request.", { href: `${site}/portal`, label: "Open Messages" }),
    replyTo: who.email,
  }).catch(() => false);
}

/** Driftline wrote in the thread: the customer is told to check their account. */
export async function notifyCustomerOfMessage(r: SessionRequest, who: Who, body: string) {
  await toCustomer(who, "A message from Driftline", "You have a new message", [["Session", r.dishes.join(", ")], ["Message", body]], "Open your account to read the whole conversation and write back.", "Read and reply");
}
