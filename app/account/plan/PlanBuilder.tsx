"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DishBackdrop from "../DishBackdrop";
import { MAX_ITEMS, MIN_ITEMS, PORTIONS_PER_DISH_PER_PERSON, PRICE_COVERS, portionsFor } from "../../request-core";

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
  backdrop,
}: {
  dishes: Dish[];
  packages: Pkg[];
  initialItems: number[];
  initialPeople: number;
  editId: number;
  avoid: string;
  profileReady: boolean;
  backdrop: string[];
}) {
  const [items, setItems] = useState<number[]>(initialItems),
    [people, setPeople] = useState(initialPeople),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("");
  const cap = Math.max(...packages.map((p) => p.portions));
  const maxPeople = Math.max(1, Math.min(8, Math.floor(cap / (Math.max(MIN_ITEMS, items.length) * PORTIONS_PER_DISH_PER_PERSON))));
  const shownPeople = Math.min(people, maxPeople);
  const plan = useMemo(() => {
    if (items.length < MIN_ITEMS) return null;
    const need = portionsFor(items.length, shownPeople);
    return [...packages].sort((a, b) => a.portions - b.portions).find((p) => p.portions >= need) ?? null;
  }, [items.length, shownPeople, packages]);
  const categories = useMemo(() => [...new Set(dishes.map((d) => d.category).filter(Boolean))], [dishes]);
  const q = query.trim().toLowerCase();
  const visible = [...dishes].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))).filter((d) => (!category || d.category === category) && (!q || `${d.title} ${d.category} ${d.description}`.toLowerCase().includes(q)));
  const atLimit = shownPeople >= maxPeople;

  const toggle = (id: number) =>
    setItems((current) => (current.includes(id) ? current.filter((x) => x !== id) : current.length >= MAX_ITEMS ? current : [...current, id]));
  const conflict = (d: Dish) => d.allergens.filter((a) => avoid.includes(a.toLowerCase()));
  const href = `/account/schedule?items=${items.join(",")}&people=${shownPeople}${editId ? `&edit=${editId}` : ""}`;
  const ready = Boolean(plan);
  const scheduleButton = ready ? (
    <Link className="plan-schedule" href={href}>
      Schedule →
    </Link>
  ) : (
    <span className="plan-schedule disabled" aria-disabled="true">
      Pick {MIN_ITEMS - items.length} more to schedule
    </span>
  );

  return (
    <main className="account-page plan-page has-dishes">
      <DishBackdrop images={backdrop} />
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
            {plan ? ` · ${portionsFor(items.length, shownPeople)} portions` : ""}
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
        {scheduleButton}
      </section>
      <p className="plan-note">
        Pick 3 to 5 dishes and how many people you are cooking for. Each dish makes {PORTIONS_PER_DISH_PER_PERSON} portions per person, so more people means more food and a larger plan. {PRICE_COVERS}
      </p>
      {atLimit ? (
        <p className="plan-note">
          Cooking for more than {maxPeople}? Pick fewer dishes, or call or text us at (503) 741-9630 and we will set it up with you.
        </p>
      ) : null}
      {!profileReady ? (
        <p className="plan-warning">
          Before we can send your request we need your phone, address and allergies. <Link href="/account#profile">Finish your profile</Link>
        </p>
      ) : null}

      <section className="plan-menu">
        <div className="plan-head">
          <h1>Pick 3 to 5 dishes</h1>
          <input type="search" placeholder="Search dishes" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search dishes" />
        </div>
        <div className="plan-chips" role="group" aria-label="Filter by type">
          <button className={category ? "" : "on"} onClick={() => setCategory("")} aria-pressed={!category}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} className={category === c ? "on" : ""} onClick={() => setCategory(c)} aria-pressed={category === c}>
              {c}
            </button>
          ))}
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
      </section>

      <section className="plan-bottom">
        {scheduleButton}
      </section>
    </main>
  );
}
