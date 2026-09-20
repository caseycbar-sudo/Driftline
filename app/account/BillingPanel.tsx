"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Card = { brand: string; last4: string; expMonth: number; expYear: number; autopay: boolean };
type Payment = {
  id: number;
  description: string;
  amountCents: number;
  serviceCents: number;
  groceryCents: number;
  status: string;
  kind: string;
  linkUrl: string;
  receiptUrl: string;
  createdAt: string;
  paidAt: string;
};
type Billing = {
  configured: boolean;
  sdk: { applicationId: string; locationId: string; url: string; environment: string } | null;
  card: Card | null;
  payments: Payment[];
};
type SquareCardField = { attach: (selector: string) => Promise<void>; tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>; destroy: () => Promise<void> };
type SquareWindow = Window & { Square?: { payments: (appId: string, locationId: string) => { card: () => Promise<SquareCardField> } } };

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const STATUS: Record<string, string> = {
  paid: "Paid",
  pending: "Waiting for a card",
  processing: "Processing",
  failed: "Card declined",
  link_sent: "Ready to pay",
  canceled: "Cancelled",
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if ((window as SquareWindow).Square) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load")));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load"));
    document.head.appendChild(script);
  });
}

/** Saved card for weekly meal prep, open invoices, and payment history. */
export default function BillingPanel() {
  const [billing, setBilling] = useState<Billing | null>(null);
  const [adding, setAdding] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const cardRef = useRef<SquareCardField | null>(null);

  const load = useCallback(() => {
    fetch("/api/billing/card", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: Billing | null) => b && setBilling(b))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!adding || !billing?.sdk) return;
    let cancelled = false;
    (async () => {
      try {
        await loadScript(billing.sdk!.url);
        const square = (window as SquareWindow).Square;
        if (!square) throw new Error("load");
        const card = await square.payments(billing.sdk!.applicationId, billing.sdk!.locationId).card();
        if (cancelled) return card.destroy();
        await card.attach("#square-card");
        cardRef.current = card;
      } catch {
        setMessage("The secure card form couldn't load. Check your connection and try again.");
      }
    })();
    return () => {
      cancelled = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
    };
  }, [adding, billing?.sdk]);

  async function saveCard() {
    if (!cardRef.current || busy) return;
    if (!consent) {
      setMessage("Please tick the box to allow charges after each visit.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setMessage(result.errors?.[0]?.message || "Please check the card details.");
        return;
      }
      const response = await fetch("/api/billing/card", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceId: result.token, consent: true }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; charged?: number };
      if (!response.ok) {
        setMessage(data.error || "The card couldn't be saved.");
        return;
      }
      setAdding(false);
      setConsent(false);
      setMessage(data.charged ? `Card saved. ${data.charged} waiting visit${data.charged === 1 ? " was" : "s were"} paid.` : "Card saved. You're all set.");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function removeCard() {
    if (!window.confirm("Remove your saved card? We'll send you a pay link after each visit instead.")) return;
    await fetch("/api/billing/card", { method: "DELETE" });
    setMessage("Card removed.");
    load();
  }

  if (!billing) return null;
  const open = billing.payments.filter((p) => p.status === "link_sent" || p.status === "failed" || p.status === "pending");

  return (
    <section className="billing-panel" id="billing">
      <div className="billing-head">
        <span>PAYMENTS</span>
        <h2>Card &amp; receipts</h2>
        <p>
          For weekly meal prep, your card is charged after each visit: the package price plus the grocery receipt. You&apos;ll get an
          email receipt every time.
        </p>
      </div>

      {open.length ? (
        <div className="billing-open">
          {open.map((p) => (
            <article key={p.id}>
              <div>
                <strong>{p.description}</strong>
                <span>
                  {money(p.amountCents)} · {STATUS[p.status] ?? p.status}
                </span>
              </div>
              {p.linkUrl ? (
                <a className="billing-pay" href={p.linkUrl} target="_blank" rel="noreferrer">
                  Pay {money(p.amountCents)}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <div className="billing-card">
        {billing.card ? (
          <div className="billing-saved">
            <b aria-hidden="true">▭</b>
            <div>
              <strong>
                {billing.card.brand.replace(/_/g, " ")} ending {billing.card.last4}
              </strong>
              <span>
                Expires {String(billing.card.expMonth).padStart(2, "0")}/{billing.card.expYear} · charged after each meal prep visit
              </span>
            </div>
            <button type="button" onClick={() => setAdding(true)}>
              Replace
            </button>
            <button type="button" className="link" onClick={removeCard}>
              Remove
            </button>
          </div>
        ) : !adding ? (
          <div className="billing-empty">
            <p>No card saved yet.</p>
            {billing.configured ? (
              <button type="button" onClick={() => setAdding(true)}>
                Add a card
              </button>
            ) : (
              <small>Online card payments are coming soon.</small>
            )}
          </div>
        ) : null}

        {adding ? (
          <div className="billing-add">
            <div id="square-card" />
            <label className="billing-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                Charge this card after each completed meal prep visit (package price plus groceries). I&apos;ll get a receipt each time and
                can remove the card anytime.
              </span>
            </label>
            <div className="billing-actions">
              <button type="button" onClick={saveCard} disabled={busy}>
                {busy ? "Saving…" : "Save card"}
              </button>
              <button type="button" className="link" onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
            <small>Card details go straight to Square. Driftline never sees or stores your card number.</small>
            {billing.sdk?.environment === "sandbox" ? <small className="billing-test">Test mode: use card 4111 1111 1111 1111.</small> : null}
          </div>
        ) : null}
        {message ? (
          <p className="billing-message" role="status">
            {message}
          </p>
        ) : null}
      </div>

      {billing.payments.some((p) => p.status === "paid") ? (
        <div className="billing-history">
          <h3>Receipts</h3>
          <ul>
            {billing.payments
              .filter((p) => p.status === "paid")
              .map((p) => (
                <li key={p.id}>
                  <span>
                    {day(p.paidAt)} · {p.description}
                    {p.groceryCents ? (
                      <small>
                        {money(p.serviceCents)} service + {money(p.groceryCents)} groceries
                      </small>
                    ) : null}
                  </span>
                  <b>{money(p.amountCents)}</b>
                  {p.receiptUrl ? (
                    <a href={p.receiptUrl} target="_blank" rel="noreferrer">
                      Receipt
                    </a>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
