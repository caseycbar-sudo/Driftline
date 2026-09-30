"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MAX_ITEMS, MIN_ITEMS, PRICE_COVERS } from "../../request-core";

type Dish = { id: number; title: string; category: string; description: string; image: string; allergens: string[]; dietary: string[] };
type Pkg = { name: string; portions: number; priceCents: number };

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

export default function PlanBuilder({
  dishes,
  packages,
  initialItems,
  initialPeople,
  editId,
  avoid,
  profileReady,
}: {
  dishes: Dish[];
  packages: Pkg[];
  initialItems: number[];
  initialPeople: number;
  editId: number;
  avoid: string;
  profileReady: boolean;
}) {
  const [items, setItems] = useState<number[]>(initialItems),
    [people, setPeople] = useState(initialPeople),
    [all, setAll] = useState(initialItems.length > 0),
    [query, setQuery] = useState("");
  const cap = Math.max(...packages.map((p) => p.portions));
  const maxPeople = Math.max(1, Math.min(8, Math.floor(cap / Math.max(MIN_ITEMS, items.length))));
  const shownPeople = Math.min(people, maxPeople);
  const plan = useMemo(() => {
    if (items.length < MIN_ITEMS) return null;
    const need = items.length * shownPeople;
    return [...packages].sort((a, b) => a.portions - b.portions).find((p) => p.portions >= need) ?? null;
  }, [items.length, shownPeople, packages]);
  const heroes = dishes.filter((d) => d.image).slice(0, 4);
  const q = query.trim().toLowerCase();
  const visible = (all ? dishes : heroes).filter((d) => !q || `${d.title} ${d.category} ${d.description}`.toLowerCase().includes(q));

  const toggle = (id: number) =>
    setItems((current) => (current.includes(id) ? current.filter((x) => x !== id) : current.length >= MAX_ITEMS ? current : [...current, id]));
  const conflict = (d: Dish) => d.allergens.filter((a) => avoid.includes(a.toLowerCase()));
  const href = `/account/schedule?items=${items.join(",")}&people=${shownPeople}${editId ? `&edit=${editId}` : ""}`;
  const ready = Boolean(plan);
  const ScheduleButton = () =>
    ready ? (
      <Link className="plan-schedule" href={href}>
        Schedule →
      </Link>
    ) : (
      <span className="plan-schedule disabled" aria-disabled="true">
        Pick {MIN_ITEMS - items.length} more to schedule
      </span>
    );

  return (
    <main className="account-page plan-page">
      <header className="account-nav">
        <Link className="account-brand" href="/account">
          Driftline
        </Link>
        <nav>
          <Link href="/account">My account</Link>
        </nav>
      </header>

      <section className="plan-bar" aria-live="polite">
        <div>
          <small>{editId ? "EDITING YOUR MENU" : "YOUR PLAN"}</small>
          <strong>
            {plan ? `${plan.name} · ${money(plan.priceCents)}` : `${items.length} of ${MIN_ITEMS} dishes to start`}
          </strong>
          <span>
            {items.length} {items.length === 1 ? "dish" : "dishes"} (up to {MAX_ITEMS})
            {plan ? ` · ${items.length * shownPeople} portions` : ""}
          </span>
        </div>
        <label>
          People
          <select value={shownPeople} onChange={(e) => setPeople(Number(e.target.value))}>
            {Array.from({ length: maxPeople }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </label>
        <ScheduleButton />
      </section>
      <p className="plan-note">{PRICE_COVERS}</p>
      {!profileReady ? (
        <p className="plan-warning">
          Before we can send your request we need your phone, address and allergies. <Link href="/account#profile">Finish your profile</Link>
        </p>
      ) : null}

      <section className="plan-menu">
        <div className="plan-head">
          <h1>{all ? "Pick 3 to 5 dishes" : "Start with a favorite"}</h1>
          {all ? <input type="search" placeholder="Search dishes" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search dishes" /> : null}
        </div>
        <div className="plan-grid">
          {visible.map((d) => {
            const on = items.includes(d.id),
              clash = conflict(d);
            return (
              <article key={d.id} className={on ? "plan-dish on" : "plan-dish"}>
                {d.image ? <img src={d.image} alt={d.title} loading="lazy" /> : null}
                <div>
                  <small>{d.category}</small>
                  <h3>{d.title}</h3>
                  {clash.length ? <p className="plan-clash">Heads up: contains {clash.join(", ")}, which is in your notes.</p> : null}
                  <button onClick={() => toggle(d.id)} disabled={!on && items.length >= MAX_ITEMS} aria-pressed={on}>
                    {on ? "✓ Added" : items.length >= MAX_ITEMS ? "Plan is full" : "Add"}
                  </button>
                </div>
              </article>
            );
          })}
          {!visible.length ? <p>No dishes match that search.</p> : null}
        </div>
        {!all ? (
          <button className="plan-more" onClick={() => setAll(true)}>
            See more dishes
          </button>
        ) : null}
      </section>

      <section className="plan-bottom">
        <ScheduleButton />
      </section>
    </main>
  );
}
