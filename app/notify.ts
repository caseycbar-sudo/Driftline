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
  if (q.inquiryType === "general") {
    facts.push(["About", q.occasion]);
  } else if (q.inquiryType === "meal_prep") {
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
  if (q.inquiryType === "general") return `New message from ${q.fullName} (${q.occasion})`;
  if (q.inquiryType === "meal_prep") return `New meal prep request: ${q.fullName} (${q.zip}, ${q.packageName})`;
  const what = q.inquiryType === "catering" ? "catering" : "private dinner";
  return `New ${what} request: ${q.fullName}, ${q.guestCount} guests on ${formatDate(q.preferredDate)}`;
}

function ownerHtml(q: CleanInquiry, siteUrl: string) {
  const rows = inquiryFacts(q)
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6b7680;white-space:nowrap">${k}</td><td style="padding:6px 0;color:#16232f"><b>${escapeHtml(v)}</b></td></tr>`)
    .join("");
  const notes = q.details
    ? `<p style="margin:20px 0 6px;color:#6b7680">${q.inquiryType === "general" ? "Message" : "Notes from the customer"}</p><p style="margin:0;white-space:pre-wrap;color:#16232f">${escapeHtml(q.details)}</p>`
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
    q.inquiryType === "general"
      ? ({
          "Private chef dinner": "a private chef dinner",
          Catering: "catering",
          "Weekly meal prep": "weekly meal prep",
          "Sunday Market": "the Sunday Market",
        } as Record<string, string>)[q.occasion] ?? "Driftline Provisions"
      : q.inquiryType === "meal_prep"
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

/**
 * Email a one-time sign-in link. Returns false if email isn't configured or the send failed.
 * In local development without email configured, the link is printed to the server console instead.
 */
export async function sendSignInLink(email: string, link: string): Promise<boolean> {
  const config = mailConfig();
  if (!config) {
    if (import.meta.env.DEV) {
      console.warn(`[auth] email not configured; development sign-in link for ${email}: ${link}`);
      return true;
    }
    console.error("[auth] cannot send sign-in link: email is not configured");
    return false;
  }
  try {
    await send(config.endpoint, config.apiKey, {
      from: config.from,
      to: [email],
      subject: "Your Driftline sign-in link",
      text: `Sign in to Driftline Provisions:\n\n${link}\n\nThis link works once and expires in 15 minutes. If you didn't ask to sign in, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:520px;color:#16232f">
<h2 style="font-family:Georgia,serif;font-weight:400;margin:0 0 12px">Sign in to Driftline</h2>
<p>Tap the button below to sign in. It works once and expires in 15 minutes.</p>
<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="background:#9c7b40;color:#fff;padding:12px 20px;text-decoration:none;font-weight:bold;display:inline-block">Sign in to Driftline</a></p>
<p style="color:#6b7680;font-size:13px">If you didn't ask to sign in, you can ignore this email; nothing changes until the link is used.</p>
<p style="color:#6b7680;font-size:13px">Driftline Provisions · Astoria, Oregon</p></div>`,
    });
    return true;
  } catch (error) {
    console.error("[auth] sign-in email failed", error);
    return false;
  }
}

/**
 * The site's public address for links in emails. SITE_URL wins; without it, local
 * development uses the address it's running on and everything else uses the real
 * domain, so links never point at a temporary or forged host.
 */
export function siteOrigin(requestUrl: string): string {
  const configured = ((env as unknown as MailEnv).SITE_URL || "").trim().replace(/\/$/, "");
  if (configured) return configured;
  const url = new URL(requestUrl);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return url.origin;
  return "https://www.driftlineprovisions.com";
}

/** Tell the owner a new review is waiting for approval. Never throws. */
export async function notifyNewReview(r: { displayName: string; town: string; service: string; rating: number; body: string; email: string; verified: boolean }): Promise<boolean> {
  const config = mailConfig();
  if (!config) return false;
  try {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    await send(config.endpoint, config.apiKey, {
      from: config.from,
      to: config.to,
      reply_to: r.email,
      subject: `New ${r.rating}-star review waiting for approval`,
      text: `${stars}\n${r.displayName}${r.town ? `, ${r.town}` : ""} · ${r.service}${r.verified ? " · verified client" : ""}\n\n${r.body}\n\nApprove or hide it: ${config.siteUrl}/portal (Reviews tab). Nothing is public until you approve it.`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;color:#16232f">
<p style="font-size:20px;color:#7a6032;margin:0 0 6px">${stars}</p>
<p style="margin:0 0 14px"><b>${escapeHtml(r.displayName)}</b>${r.town ? `, ${escapeHtml(r.town)}` : ""} · ${escapeHtml(r.service)}${r.verified ? " · verified client" : ""}</p>
<blockquote style="margin:0 0 18px;padding:12px 16px;border-left:3px solid #7a6032;background:#f6f1e7;white-space:pre-wrap">${escapeHtml(r.body)}</blockquote>
<p><a href="${config.siteUrl}/portal" style="background:#7a6032;color:#fff;padding:10px 16px;text-decoration:none;font-weight:bold">Review it in your dashboard</a></p>
<p style="color:#6b7680;font-size:13px">Nothing is public until you approve it.</p></div>`,
    });
    return true;
  } catch (error) {
    console.error("[reviews] owner alert failed", error);
    return false;
  }
}
