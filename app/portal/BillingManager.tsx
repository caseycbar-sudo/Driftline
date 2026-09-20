"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import "./OwnerTools.css";

type Payment = {
  id: number;
  scheduleEventId: number;
  customerEmail: string;
  kind: string;
  description: string;
  serviceCents: number;
  groceryCents: number;
  amountCents: number;
  status: string;
  linkUrl: string;
  receiptUrl: string;
  error: string;
  createdAt: string;
  paidAt: string;
};
type CustomerCard = { email: string; name: string; card: string; autopay: boolean };
type Data = { configured: boolean; environment: string; payments: Payment[]; customers: CustomerCard[] };
type Pkg = { name: string; portions: number; price: string; note: string; featured: boolean };
type PricesForm = { mealPrep: Pkg[]; privateChef: { perGuest: string; minGuests: string; smallTableMin: string } };

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");
const LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Waiting on card",
  processing: "Processing",
  failed: "Declined",
  link_sent: "Invoice sent",
  canceled: "Cancelled",
};

/** Owner dashboard: who owes what, what's been paid, pay links, and prices. */
export default function BillingManager() {
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(0);
  const [link, setLink] = useState({ customerEmail: "", customerName: "", amount: "", description: "" });
  const [sending, setSending] = useState(false);
  const [prices, setPrices] = useState<PricesForm | null>(null);
  const [priceMessage, setPriceMessage] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/billing", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Data | null) => d && setData(d))
      .catch(() => setMessage("Couldn't load billing."));
  }, []);
  useEffect(() => {
    load();
    fetch("/api/pricing", { cache: "no-store" })
      .then((r) => r.json())
      .then(
        (p: {
          mealPrep: { name: string; portions: number; priceCents: number; note: string; featured: boolean }[];
          privateChef: { perGuestCents: number; minGuests: number; smallTableMinCents: number };
        }) =>
          setPrices({
            mealPrep: p.mealPrep.map((m) => ({ ...m, price: String(m.priceCents / 100) })),
            privateChef: {
              perGuest: String(p.privateChef.perGuestCents / 100),
              minGuests: String(p.privateChef.minGuests),
              smallTableMin: String(p.privateChef.smallTableMinCents / 100),
            },
          }),
      )
      .catch(() => {});
  }, [load]);

  async function act(p: Payment, action: "retry" | "check" | "cancel") {
    if (action === "cancel" && !window.confirm(`Cancel "${p.description}"? The customer won't be charged.`)) return;
    setBusy(p.id);
    setMessage("");
    const response = await fetch("/api/admin/billing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id: p.id }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; result?: { message: string }; payment?: Payment };
    setBusy(0);
    if (!response.ok) setMessage(body.error || "That didn't work. Try again.");
    else if (action === "retry") setMessage(body.result?.message || "Retried.");
    else if (action === "check") setMessage(body.payment?.status === "paid" ? "Paid!" : "Not paid yet.");
    else setMessage("Cancelled.");
    load();
  }

  async function sendLink(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const response = await fetch("/api/admin/billing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "pay_link", ...link }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSending(false);
    if (!response.ok) {
      setMessage(body.error || "Couldn't create the pay link.");
      return;
    }
    setMessage(`Pay link emailed to ${link.customerEmail}.`);
    setLink({ customerEmail: "", customerName: "", amount: "", description: "" });
    load();
  }

  async function savePrices(event: FormEvent) {
    event.preventDefault();
    if (!prices) return;
    setPriceMessage("Saving…");
    const response = await fetch("/api/pricing", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(prices),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPriceMessage(response.ok ? "Saved. The website shows the new prices now." : body.error || "Couldn't save prices.");
  }
  const setPkg = (i: number, patch: Partial<Pkg>) =>
    setPrices((p) => (p ? { ...p, mealPrep: p.mealPrep.map((m, j) => (j === i ? { ...m, ...patch } : patch.featured ? { ...m, featured: false } : m)) } : p));

  const open = (data?.payments ?? []).filter((p) => ["failed", "pending", "processing", "link_sent"].includes(p.status));
  const paid = (data?.payments ?? []).filter((p) => p.status === "paid");
  const monthKey = new Date().toISOString().slice(0, 7);
  const paidThisMonth = paid.filter((p) => p.paidAt.startsWith(monthKey)).reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Billing</h1>
          <p>Meal prep is charged to the customer&apos;s saved card when the chef finishes. Dinners and events get a pay link.</p>
        </div>
      </header>
      <div className="page-body owner-tools billing-tools">
        {data && !data.configured ? (
          <p className="owner-message warn">
            Square isn&apos;t connected yet, so no cards can be charged. Everything is recorded and will be ready once it&apos;s set up.
          </p>
        ) : data?.environment === "sandbox" ? (
          <p className="owner-message warn">Test mode: no real money moves. Test card 4111 1111 1111 1111.</p>
        ) : null}
        {message ? (
          <p className="owner-message" role="status">
            {message}
          </p>
        ) : null}

        <section className="owner-card billing-stats">
          <div>
            <small>PAID THIS MONTH</small>
            <strong>{money(paidThisMonth)}</strong>
          </div>
          <div>
            <small>NEEDS ATTENTION</small>
            <strong>{open.filter((p) => p.status === "failed").length}</strong>
          </div>
          <div>
            <small>INVOICES OUT</small>
            <strong>{open.filter((p) => p.status === "link_sent").length}</strong>
          </div>
        </section>

        <section className="owner-card">
          <small>OPEN</small>
          <h2 className="owner-h2">Waiting to be paid</h2>
          {!data ? <p className="owner-empty">Loading…</p> : null}
          {data && !open.length ? <p className="owner-empty">Nothing outstanding.</p> : null}
          <ul className="billing-list">
            {open.map((p) => (
              <li key={p.id} className={`is-${p.status}`}>
                <div>
                  <strong>{p.description}</strong>
                  <span>
                    {p.customerEmail} · {money(p.amountCents)}
                    {p.groceryCents ? ` (${money(p.serviceCents)} + ${money(p.groceryCents)} groceries)` : ""}
                  </span>
                  <em>
                    {LABEL[p.status] ?? p.status}
                    {p.error ? `: ${p.error}` : ""}
                  </em>
                </div>
                <div className="billing-row-actions">
                  {p.kind === "visit_charge" && p.groceryCents ? (
                    <a href={`/api/admin/receipt?visit=${p.scheduleEventId}`} target="_blank" rel="noreferrer">
                      Receipt photo
                    </a>
                  ) : null}
                  {p.kind === "visit_charge" && ["failed", "pending", "processing"].includes(p.status) ? (
                    <button disabled={busy === p.id} onClick={() => act(p, "retry")}>
                      {p.status === "pending" ? "Charge now" : "Retry"}
                    </button>
                  ) : null}
                  {p.kind === "pay_link" && p.status === "link_sent" ? (
                    <>
                      <a href={p.linkUrl} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                      <button disabled={busy === p.id} onClick={() => act(p, "check")}>
                        Check payment
                      </button>
                    </>
                  ) : null}
                  {p.status !== "processing" ? (
                    <button className="danger" disabled={busy === p.id} onClick={() => act(p, "cancel")}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <form className="owner-card billing-link-form" onSubmit={sendLink}>
          <small>DINNERS, CATERING, ANYTHING ELSE</small>
          <h2 className="owner-h2">Send a pay link</h2>
          <label>
            Customer
            <input
              list="billing-customers"
              type="email"
              required
              value={link.customerEmail}
              onChange={(e) => {
                const match = data?.customers.find((c) => c.email === e.target.value);
                setLink({ ...link, customerEmail: e.target.value, customerName: match?.name ?? link.customerName });
              }}
              placeholder="their@email.com"
            />
            <datalist id="billing-customers">
              {data?.customers.map((c) => (
                <option key={c.email} value={c.email}>
                  {c.name}
                </option>
              ))}
            </datalist>
          </label>
          <label>
            Their name
            <input value={link.customerName} onChange={(e) => setLink({ ...link, customerName: e.target.value })} placeholder="Dana Henderson" />
          </label>
          <label>
            What it&apos;s for
            <input
              required
              value={link.description}
              onChange={(e) => setLink({ ...link, description: e.target.value })}
              placeholder="Anniversary dinner for 6, Oct 12"
            />
          </label>
          <label>
            Amount
            <span className="money-field">
              <b>$</b>
              <input required inputMode="decimal" value={link.amount} onChange={(e) => setLink({ ...link, amount: e.target.value })} placeholder="1050" />
            </span>
          </label>
          <button className="owner-primary" disabled={sending || !data?.configured}>
            {sending ? "Sending…" : "Email the pay link"}
          </button>
        </form>

        {paid.length ? (
          <section className="owner-card">
            <small>HISTORY</small>
            <h2 className="owner-h2">Paid</h2>
            <ul className="billing-list">
              {paid.slice(0, 30).map((p) => (
                <li key={p.id} className="is-paid">
                  <div>
                    <strong>{p.description}</strong>
                    <span>
                      {p.customerEmail} · {day(p.paidAt)}
                    </span>
                  </div>
                  <div className="billing-row-actions">
                    <b>{money(p.amountCents)}</b>
                    {p.receiptUrl ? (
                      <a href={p.receiptUrl} target="_blank" rel="noreferrer">
                        Square receipt
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data?.customers.length ? (
          <section className="owner-card">
            <small>CARDS ON FILE</small>
            <h2 className="owner-h2">Customers</h2>
            <ul className="billing-list compact">
              {data.customers.map((c) => (
                <li key={c.email}>
                  <div>
                    <strong>{c.name || c.email}</strong>
                    <span>{c.email}</span>
                  </div>
                  <em>{c.card ? `${c.card}${c.autopay ? " · autopay on" : ""}` : "No card"}</em>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {prices ? (
          <form className="owner-card price-editor" onSubmit={savePrices}>
            <small>YOUR PRICES</small>
            <h2 className="owner-h2">Prices on the website</h2>
            <p className="owner-note">Changes show on the website right away and apply to new charges.</p>
            <h3>Weekly meal prep packages (per visit, plus groceries)</h3>
            {prices.mealPrep.map((m, i) => (
              <div className="price-row" key={i}>
                <input aria-label="Package name" value={m.name} onChange={(e) => setPkg(i, { name: e.target.value })} />
                <label>
                  <input
                    aria-label="Portions"
                    inputMode="numeric"
                    value={m.portions}
                    onChange={(e) => setPkg(i, { portions: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                  />
                  portions
                </label>
                <span className="money-field">
                  <b>$</b>
                  <input aria-label="Price" inputMode="decimal" value={m.price} onChange={(e) => setPkg(i, { price: e.target.value })} />
                </span>
                <label className="price-featured">
                  <input type="radio" name="featured" checked={m.featured} onChange={() => setPkg(i, { featured: true })} />
                  Most popular
                </label>
                <button
                  type="button"
                  className="link"
                  onClick={() => setPrices((p) => (p ? { ...p, mealPrep: p.mealPrep.filter((_, j) => j !== i) } : p))}
                  disabled={prices.mealPrep.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            {prices.mealPrep.length < 8 ? (
              <button
                type="button"
                className="link"
                onClick={() =>
                  setPrices((p) => (p ? { ...p, mealPrep: [...p.mealPrep, { name: "", portions: 10, price: "", note: "", featured: false }] } : p))
                }
              >
                + Add a package
              </button>
            ) : null}
            <h3>Private chef dinners</h3>
            <div className="price-row pc">
              <label>
                From
                <span className="money-field">
                  <b>$</b>
                  <input
                    inputMode="decimal"
                    value={prices.privateChef.perGuest}
                    onChange={(e) => setPrices({ ...prices, privateChef: { ...prices.privateChef, perGuest: e.target.value } })}
                  />
                </span>
                per guest
              </label>
              <label>
                Minimum
                <input
                  inputMode="numeric"
                  value={prices.privateChef.minGuests}
                  onChange={(e) => setPrices({ ...prices, privateChef: { ...prices.privateChef, minGuests: e.target.value } })}
                />
                guests
              </label>
              <label>
                Smaller tables from
                <span className="money-field">
                  <b>$</b>
                  <input
                    inputMode="decimal"
                    value={prices.privateChef.smallTableMin}
                    onChange={(e) => setPrices({ ...prices, privateChef: { ...prices.privateChef, smallTableMin: e.target.value } })}
                  />
                </span>
              </label>
            </div>
            <button className="owner-primary">Save prices</button>
            {priceMessage ? (
              <p className="owner-message" role="status">
                {priceMessage}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </>
  );
}
