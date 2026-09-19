/**
 * Email notifications for new inquiries, sent through Resend (https://resend.com).
 *
 * Configure these Worker variables/secrets:
 *   RESEND_API_KEY  secret API key from Resend
 *   NOTIFY_EMAIL    where new-request alerts go (e.g. Casey's inbox); comma-separate for several
 *   FROM_EMAIL      verified sender, e.g. "Driftline Provisions <hello@driftlineprovisions.com>"
 *
 * If any are missing, nothing is sent and the inquiry is still saved, so a
 * mail problem never loses a customer's request.
 */
import { env } from "cloudflare:workers";
import { INQUIRY_LABELS, type CleanInquiry } from "./inquiry-validation";

type MailEnv = { RESEND_API_KEY?: string; NOTIFY_EMAIL?: string; FROM_EMAIL?: string; SITE_URL?: string; RESEND_API_URL?: string };

function mailConfig() {
  const e = env as unknown as MailEnv;
  const apiKey = (e.RESEND_API_KEY || "").trim();
  const to = (e.NOTIFY_EMAIL || "").split(",").map((x) => x.trim()).filter(Boolean);
  const from = (e.FROM_EMAIL || "").trim();
  const siteUrl = (e.SITE_URL || "https://www.driftlineprovisions.com").replace(/\/$/, "");
  // RESEND_API_URL is only for local testing against a stand-in server.
  const endpoint = (e.RESEND_API_URL || "https://api.resend.com/emails").trim();
  return apiKey && to.length && from ? { apiKey, to, from, siteUrl, endpoint } : null;
}

export function isEmailConfigured() {
  return mailConfig() !== null;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Key facts for an inquiry, in display order. Empty values are dropped. */
export function inquiryFacts(q: CleanInquiry): [string, string][] {
  const facts: [string, string][] = [
    ["Request", INQUIRY_LABELS[q.inquiryType]],
    ["Name", q.fullName],
    ["Email", q.email],
    ["Phone", q.phone],
  ];
  if (q.inquiryType === "meal_prep") {
    facts.push(["ZIP", q.zip], ["Package", q.packageName], ["Service for", q.serviceFor]);
  } else {
    facts.push(
      ["Date", formatDate(q.preferredDate)],
      ["Guests", String(q.guestCount)],
      ["Location", q.location],
      ["Occasion", q.occasion],
    );
  }
  return facts.filter(([, v]) => v);
}

function ownerSubject(q: CleanInquiry) {
  if (q.inquiryType === "meal_prep") return `New meal prep request: ${q.fullName} (${q.zip}, ${q.packageName})`;
  const what = q.inquiryType === "catering" ? "catering" : "private dinner";
  return `New ${what} request: ${q.fullName}, ${q.guestCount} guests on ${formatDate(q.preferredDate)}`;
}

function ownerHtml(q: CleanInquiry, siteUrl: string) {
  const rows = inquiryFacts(q)
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6b7680;white-space:nowrap">${k}</td><td style="padding:6px 0;color:#16232f"><b>${escapeHtml(v)}</b></td></tr>`)
    .join("");
  const notes = q.details
    ? `<p style="margin:20px 0 6px;color:#6b7680">Notes from the customer</p><p style="margin:0;white-space:pre-wrap;color:#16232f">${escapeHtml(q.details)}</p>`
    : "";
  return `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:560px">
<h2 style="font-family:Georgia,serif;font-weight:400;color:#16232f;margin:0 0 16px">${escapeHtml(ownerSubject(q))}</h2>
<table style="border-collapse:collapse">${rows}</table>${notes}
<p style="margin:24px 0 0"><a href="mailto:${escapeHtml(q.email)}" style="background:#9c7b40;color:#fff;padding:10px 16px;text-decoration:none;font-weight:bold">Reply to ${escapeHtml(q.fullName.split(" ")[0])}</a>
&nbsp; <a href="${siteUrl}/portal" style="color:#16232f">Open in admin →</a></p></div>`;
}

function customerHtml(q: CleanInquiry) {
  const first = escapeHtml(q.fullName.split(" ")[0]);
  const what =
    q.inquiryType === "meal_prep"
      ? "weekly meal prep"
      : q.inquiryType === "catering"
        ? `catering on ${formatDate(q.preferredDate)}`
        : `a private dinner on ${formatDate(q.preferredDate)}`;
  return `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;color:#16232f">
<p>Hi ${first},</p>
<p>Thanks for reaching out about ${escapeHtml(what)}. Your request came through, and I'll get back to you personally, usually within a day.</p>
<p>If anything changes in the meantime, just reply to this email.</p>
<p>Chef Casey Barella<br/><span style="color:#6b7680">Driftline Provisions · Astoria, Oregon</span></p></div>`;
}

async function send(endpoint: string, apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

/**
 * Email the owner about a new inquiry and send the customer a short confirmation.
 * Returns true when the owner alert was accepted. Never throws.
 */
export async function notifyNewInquiry(q: CleanInquiry): Promise<boolean> {
  const config = mailConfig();
  if (!config) {
    console.warn("[notify] email not configured; inquiry saved without a notification");
    return false;
  }
  let ownerSent = false;
  try {
    await send(config.endpoint, config.apiKey, {
      from: config.from,
      to: config.to,
      reply_to: q.email,
      subject: ownerSubject(q),
      html: ownerHtml(q, config.siteUrl),
    });
    ownerSent = true;
  } catch (error) {
    console.error("[notify] owner alert failed", error);
  }
  try {
    await send(config.endpoint, config.apiKey, {
      from: config.from,
      to: [q.email],
      reply_to: config.to[0],
      subject: "We got your request · Driftline Provisions",
      html: customerHtml(q),
    });
  } catch (error) {
    console.error("[notify] customer confirmation failed", error);
  }
  return ownerSent;
}
