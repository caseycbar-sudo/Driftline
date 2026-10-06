import Link from "next/link";
import type { SessionRequest } from "../../db/requests";
import type { ScheduleEvent } from "../../db/schedule";
import { BUSINESS_PHONE, STATUS_LABELS, insideCancelWindow } from "../request-core";
import { prettyTime, prettyVisitDate } from "../visit-emails";
import "./Overview.css";

type Card = { brand: string; last4: string; expMonth: number; expYear: number } | null;
type Payment = { amountCents: number; status: string; createdAt: string; paidAt: string };

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDay = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const PAYMENT_STATUS: Record<string, string> = { paid: "Paid", pending: "Waiting for a card", processing: "Processing", unknown: "Processing", failed: "Card declined", link_sent: "Ready to pay", canceled: "Cancelled" };

/**
 * The top of a customer's account: what is coming up, what they chose, how they pay,
 * and what to do if plans change. Everything here is read from what they already have.
 */
export default function Overview({
  upcoming,
  requests,
  card,
  payments,
  completedVisits,
  address,
  hasAutopay,
}: {
  upcoming: ScheduleEvent[];
  requests: SessionRequest[];
  card: Card;
  payments: Payment[];
  completedVisits: number;
  address: string;
  hasAutopay: boolean;
}) {
  // A visit is shown to the customer once a chef has said yes (or when it was booked by hand).
  const confirmed = upcoming.filter((v) => v.status !== "cancelled" && (v.chefResponse === "accepted" || !v.requestId));
  const next = confirmed[0] ?? null;
  const nextRequest = next ? requests.find((r) => r.scheduleEventId === next.id) ?? null : null;
  const waiting = requests.filter((r) => !r.scheduleEventId || !confirmed.some((v) => v.id === r.scheduleEventId)).filter((r) => !["completed", "declined", "cancelled", "closed"].includes(r.status));
  const shown = nextRequest ?? waiting[0] ?? null;
  const lastPayment = payments[0] ?? null;
  const inside = next ? insideCancelWindow(next.serviceDate, next.startTime) : false;

  return (
    <section className="acct-overview" aria-label="Your account at a glance">
      <nav className="acct-jump" aria-label="Jump to">
        <a href="#sessions">Your visits</a>
        <a href="#household">Your household</a>
        <a href="#billing">Card &amp; receipts</a>
        <a href="#visits">Visit photos</a>
        <a href="#help">Help</a>
      </nav>
      <div className="acct-grid">
        <article className="acct-card acct-next">
          <small>{next ? "YOUR NEXT VISIT" : waiting.length ? "YOUR REQUEST" : "NO VISIT YET"}</small>
          {next ? (
            <>
              <h2>{prettyVisitDate(next.serviceDate)}</h2>
              <p className="acct-big">
                {prettyTime(next.startTime)}
                {next.endTime ? ` to ${prettyTime(next.endTime)}` : ""}
              </p>
              <dl>
                {next.chef && next.chef !== "Unassigned" ? (<><dt>Your chef</dt><dd>{next.chef.split(/\s+/)[0]}</dd></>) : null}
                <dt>Where</dt>
                <dd>{nextRequest?.address || next.location || address || "Address on your household details"}</dd>
                <dt>Status</dt>
                <dd>{next.status === "confirmed" || next.status === "scheduled" ? "Confirmed" : next.status}</dd>
              </dl>
              <p className="acct-note">
                {inside
                  ? `This visit is less than 48 hours away. To change or cancel, call or text ${BUSINESS_PHONE}.`
                  : `Need to change or cancel? Message us from your session card, free until 48 hours before. After that, call or text ${BUSINESS_PHONE}.`}
              </p>
            </>
          ) : shown ? (
            <>
              <h2>{STATUS_LABELS[shown.status] ?? "In progress"}</h2>
              <p className="acct-big">We confirm within a day. You will get an email as soon as a chef says yes.</p>
            </>
          ) : (
            <>
              <h2>Ready when you are</h2>
              <p className="acct-big">Pick your meals and send a request. A chef confirms within a day.</p>
              <Link className="acct-action" href="/account/plan">Plan a visit →</Link>
            </>
          )}
        </article>

        <article className="acct-card">
          <small>WHAT YOU CHOSE</small>
          {shown ? (
            <>
              <h2>{shown.packageName || "Your menu"}</h2>
              <p className="acct-big">
                {shown.people} {shown.people === 1 ? "person" : "people"} · {money(shown.priceCents)}
              </p>
              <ul className="acct-dishes">
                {shown.dishes.map((dish) => (
                  <li key={dish}>{dish}</li>
                ))}
              </ul>
              <p className="acct-note">Groceries are billed at cost after the visit, with a photo of the receipt.</p>
            </>
          ) : (
            <p className="acct-big">Your chosen dishes will show here once you send a request.</p>
          )}
        </article>

        <article className="acct-card">
          <small>PAYMENT</small>
          {card ? (
            <>
              <h2>
                {card.brand} ending {card.last4}
              </h2>
              <p className="acct-big">
                Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
              </p>
              <p className="acct-note">{hasAutopay ? "Charged after each completed visit." : "Saved, but charging after visits is not turned on."}</p>
            </>
          ) : (
            <>
              <h2>No card saved</h2>
              <p className="acct-big">Save a card to send a request. You are only charged after a visit is completed.</p>
              <a className="acct-action" href="#billing">Add a card →</a>
            </>
          )}
          {lastPayment ? (
            <p className="acct-last">
              Last charge: {money(lastPayment.amountCents)} · {PAYMENT_STATUS[lastPayment.status] ?? lastPayment.status} · {shortDay(lastPayment.paidAt || lastPayment.createdAt)}
            </p>
          ) : null}
        </article>

        <article className="acct-card">
          <small>YOUR HISTORY</small>
          <h2>
            {completedVisits} {completedVisits === 1 ? "visit" : "visits"} completed
          </h2>
          <p className="acct-big">{completedVisits ? "Photos of every meal and the clean kitchen are saved below, with your receipts." : "After each visit your chef shares photos of the meals and the clean kitchen here."}</p>
          {completedVisits ? <a className="acct-action" href="#visits">See visit photos →</a> : null}
        </article>
      </div>
    </section>
  );
}
