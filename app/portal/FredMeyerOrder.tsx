"use client";

import { useEffect, useMemo, useState } from "react";
import type { GroceryItem } from "./grocery-list";
import "./FredMeyerOrder.css";

type Product = { upc: string; description: string; brand: string; size: string; priceCents: number | null; promoCents: number | null; image: string; inStock: boolean; aisle: string };
type Row = { key: string; need: GroceryItem; product: Product | null; options: Product[]; quantity: number; include: boolean; remembered: boolean };

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
// Small amounts of spices, salt and oil are usually already in the kitchen.
const probablyOnHand = (i: GroceryItem) => Boolean(i.onHand) || (i.category === "Pantry" && (i.unit === "tsp" || i.unit === "tbsp" || /\b(salt|pepper|oil|vinegar)\b/i.test(i.name)));

/**
 * Turn a visit's shopping list into a Fred Meyer Warrenton pickup order: match each
 * item to a product, adjust, and add everything to the linked Fred Meyer cart.
 */
export default function FredMeyerOrder({ items, allItems, title = "Order at Fred Meyer" }: { items: GroceryItem[]; allItems?: GroceryItem[]; title?: string }) {
  const full = allItems ?? items;
  const [wholeList, setWholeList] = useState(false);
  const toOrder = wholeList ? full : items;
  const [status, setStatus] = useState<{ configured: boolean; linked: boolean } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<"" | "match" | "cart">("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/kroger/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => s && setStatus(s))
      .catch(() => {});
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fredmeyer") === "failed")
      setMessage({ kind: "error", text: "Linking Fred Meyer didn't finish. Please try again." });
  }, []);

  const chosen = rows.filter((r) => r.include && r.product);
  const total = useMemo(() => chosen.reduce((sum, r) => sum + ((r.product?.promoCents ?? r.product?.priceCents) ?? 0) * r.quantity, 0), [chosen]);

  if (!status?.configured || !full.length) return null;

  const returnTo = typeof window === "undefined" ? "/" : window.location.pathname + window.location.search.replace(/[?&]fredmeyer=\w+/, "");

  if (!status.linked)
    return (
      <section className="fm-order">
        <header>
          <small>FRED MEYER · WARRENTON</small>
          <h2>{title}</h2>
          <p>Link your Fred Meyer account once. Then this list goes straight into your Fred Meyer cart for pickup.</p>
        </header>
        <a className="fm-primary" href={`/api/kroger/connect?return_to=${encodeURIComponent(returnTo)}`}>
          Link my Fred Meyer account →
        </a>
        {message ? <p className={`fm-msg ${message.kind}`}>{message.text}</p> : null}
      </section>
    );

  async function match() {
    setBusy("match");
    setMessage(null);
    try {
      const response = await fetch("/api/kroger/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: toOrder.map((i) => ({ key: i.key, name: i.name, quantity: i.quantity, unit: i.unit })) }),
      });
      const data = (await response.json()) as { results?: Omit<Row, "need" | "include">[]; error?: string };
      if (!response.ok || !data.results) throw new Error(data.error || "Couldn't reach Fred Meyer.");
      const byKey = new Map(full.map((i) => [i.key, i]));
      setRows(data.results.map((r) => ({ ...r, need: byKey.get(r.key)!, include: Boolean(r.product) && !probablyOnHand(byKey.get(r.key)!) })));
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Couldn't reach Fred Meyer." });
    }
    setBusy("");
  }

  const update = (key: string, patch: Partial<Row>) => setRows((all) => all.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function choose(row: Row, product: Product) {
    update(row.key, { product, include: true, remembered: true });
    setSwapping(null);
    fetch("/api/kroger/pick", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: row.key, product }) }).catch(() => {});
  }

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) return setResults([]);
    const r = await fetch(`/api/kroger/search?q=${encodeURIComponent(q)}`).then((x) => x.json()).catch(() => ({ products: [] }));
    setResults((r as { products?: Product[] }).products ?? []);
  }

  async function sendToCart() {
    setBusy("cart");
    setMessage(null);
    try {
      const response = await fetch("/api/kroger/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: chosen.map((r) => ({ upc: r.product!.upc, quantity: r.quantity })) }),
      });
      const data = (await response.json()) as { error?: string; relink?: boolean; added?: number };
      if (data.relink) setStatus({ configured: true, linked: false });
      if (!response.ok) throw new Error(data.error || "Fred Meyer didn't take the order.");
      setMessage({ kind: "ok", text: `Added ${data.added} items to your Fred Meyer cart.` });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Fred Meyer didn't take the order." });
    }
    setBusy("");
  }

  return (
    <section className="fm-order">
      <header>
        <small>FRED MEYER · WARRENTON · PICKUP</small>
        <h2>{title}</h2>
        <p>
          Only the items you haven&apos;t checked off get ordered, so anything you already have is skipped. Match them to Fred Meyer
          products, adjust, and send them to your cart.
        </p>
      </header>
      {!rows.length ? (
        <>
          {toOrder.length ? (
            <button type="button" className="fm-primary" onClick={match} disabled={busy === "match"}>
              {busy === "match" ? "Finding products…" : `Match ${toOrder.length} ${toOrder.length === 1 ? "item" : "items"} at Fred Meyer`}
            </button>
          ) : (
            <p className="fm-none-needed">Everything on the list is checked off, so there's nothing left to order.</p>
          )}
          {full.length !== items.length ? (
            <button type="button" className="fm-link fm-scope" onClick={() => setWholeList(!wholeList)}>
              {wholeList
                ? `Only order the ${items.length} ${items.length === 1 ? "item" : "items"} still unchecked`
                : `Order the whole list instead (${full.length} items)`}
            </button>
          ) : null}
        </>
      ) : (
        <>
          <ul className="fm-rows">
            {rows.map((row) => (
              <li key={row.key} className={row.include ? "" : "off"}>
                <label className="fm-check">
                  <input type="checkbox" checked={row.include} disabled={!row.product} onChange={(e) => update(row.key, { include: e.target.checked })} />
                </label>
                {row.product?.image ? <img src={row.product.image} alt="" loading="lazy" /> : <span className="fm-noimg" />}
                <div className="fm-info">
                  <small>For: {row.need.display}</small>
                  {row.product ? (
                    <strong>
                      {row.product.description}
                      {row.product.size ? <em> · {row.product.size}</em> : null}
                    </strong>
                  ) : (
                    <strong className="fm-none">No match found</strong>
                  )}
                  <span className="fm-meta">
                    {row.product?.priceCents ? (row.product.promoCents ? <><s>{money(row.product.priceCents)}</s> <b>{money(row.product.promoCents)}</b></> : money(row.product.priceCents)) : ""}
                    {row.product && !row.product.inStock ? " · may be out of stock" : ""}
                    {row.product?.aisle ? ` · ${row.product.aisle}` : ""}
                  </span>
                  <button type="button" className="fm-link" onClick={() => { setSwapping(swapping === row.key ? null : row.key); setQuery(""); setResults([]); }}>
                    {swapping === row.key ? "Close" : "Change product"}
                  </button>
                  {swapping === row.key ? (
                    <div className="fm-swap">
                      <input placeholder="Search Fred Meyer…" value={query} onChange={(e) => search(e.target.value)} />
                      {(query ? results : row.options).map((p) => (
                        <button type="button" key={p.upc} onClick={() => choose(row, p)}>
                          {p.image ? <img src={p.image} alt="" /> : <span className="fm-noimg" />}
                          <span>
                            {p.description} <em>{p.size}</em>
                            <small>{p.priceCents ? money(p.promoCents ?? p.priceCents) : ""}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="fm-qty">
                  <button type="button" aria-label="One fewer" onClick={() => update(row.key, { quantity: Math.max(1, row.quantity - 1) })}>−</button>
                  <b>{row.quantity}</b>
                  <button type="button" aria-label="One more" onClick={() => update(row.key, { quantity: Math.min(50, row.quantity + 1) })}>+</button>
                </div>
              </li>
            ))}
          </ul>
          <footer className="fm-footer">
            <span>
              {chosen.length} items{total ? ` · about ${money(total)}` : ""}
            </span>
            <button type="button" className="fm-primary" onClick={sendToCart} disabled={!chosen.length || busy === "cart"}>
              {busy === "cart" ? "Adding…" : "Add to my Fred Meyer cart"}
            </button>
          </footer>
        </>
      )}
      {message ? (
        <div className={`fm-msg ${message.kind}`}>
          <p>{message.text}</p>
          {message.kind === "ok" ? (
            <p>
              Now open the Fred Meyer app (or <a href="https://www.fredmeyer.com/cart" target="_blank" rel="noreferrer">fredmeyer.com/cart</a>), choose <b>Pickup at Warrenton</b>, pick a time and check out. Keep the receipt for the visit.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
