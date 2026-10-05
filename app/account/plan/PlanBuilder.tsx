"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import DishBackdrop from "../DishBackdrop";
import { MAX_ENTREES, MIN_ENTREES, PORTIONS_PER_DISH_PER_PERSON, PRICE_COVERS, isDessertCategory, portionsFor } from "../../request-core";

type Dish = { id: number; title: string; category: string; description: string; image: string; allergens: string[]; dietary: string[]; bigImage: string; ingredients: string[]; reheating: string };
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
    [category, setCategory] = useState(""),
    [openId, setOpenId] = useState(0),
    [step, setStep] = useState<"entrees" | "dessert">("entrees");
  const detailRef = useRef<HTMLDialogElement>(null);
  const opened = dishes.find((d) => d.id === openId) ?? null;
  useEffect(() => {
    const dialog = detailRef.current;
    if (!dialog) return;
    if (opened && !dialog.open) dialog.showModal();
    if (!opened && dialog.open) dialog.close();
  }, [opened]);
  const dessertIds = useMemo(() => new Set(dishes.filter((d) => isDessertCategory(d.category)).map((d) => d.id)), [dishes]);
  const isDessert = (id: number) => dessertIds.has(id);
  const entrees = items.filter((id) => !isDessert(id)).length;
  const dessert = dishes.find((d) => items.includes(d.id) && isDessert(d.id)) ?? null;
  const cap = Math.max(...packages.map((p) => p.portions));
  const maxPeople = Math.max(1, Math.min(8, Math.floor(cap / (Math.max(MIN_ENTREES, entrees) * PORTIONS_PER_DISH_PER_PERSON))));
  const shownPeople = Math.min(people, maxPeople);
  const plan = useMemo(() => {
    if (entrees < MIN_ENTREES) return null;
    const need = portionsFor(entrees, shownPeople);
    return [...packages].sort((a, b) => a.portions - b.portions).find((p) => p.portions >= need) ?? null;
  }, [entrees, shownPeople, packages]);
  const onDessertStep = step === "dessert";
  const stepDishes = useMemo(() => dishes.filter((d) => dessertIds.has(d.id) === onDessertStep), [dishes, dessertIds, onDessertStep]);
  const categories = useMemo(() => [...new Set(stepDishes.map((d) => d.category).filter(Boolean))], [stepDishes]);
  const goTo = (next: "entrees" | "dessert") => {
    setStep(next);
    setQuery("");
    setCategory("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const q = query.trim().toLowerCase();
  const visible = [...stepDishes].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))).filter((d) => (!category || d.category === category) && (!q || `${d.title} ${d.category} ${d.description}`.toLowerCase().includes(q)));
  const atLimit = shownPeople >= maxPeople;

  const entreesFull = entrees >= MAX_ENTREES;
  /** Can't add: the entrées are full. A dessert never blocks; picking another one swaps it in. */
  const blocked = (id: number) => !items.includes(id) && !isDessert(id) && entreesFull;
  const addLabel = (id: number, add: string) => (blocked(id) ? "Entrées are full" : isDessert(id) && dessert ? "Swap in this dessert" : add);
  const toggle = (id: number) =>
    setItems((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      if (isDessert(id)) return [...current.filter((x) => !isDessert(x)), id];
      return current.filter((x) => !isDessert(x)).length >= MAX_ENTREES ? current : [...current, id];
    });
  const conflict = (d: Dish) => d.allergens.filter((a) => avoid.includes(a.toLowerCase()));
  const href = `/account/schedule?items=${items.join(",")}&people=${shownPeople}${editId ? `&edit=${editId}` : ""}`;
  const ready = Boolean(plan);
  const scheduleButton = !ready ? (
    <span className="plan-schedule disabled" aria-disabled="true">
      Pick {MIN_ENTREES - entrees} more {MIN_ENTREES - entrees === 1 ? "entrée" : "entrées"} to continue
    </span>
  ) : onDessertStep ? (
    <Link className="plan-schedule" href={href}>
      {dessert ? "Schedule →" : "Skip dessert and schedule →"}
    </Link>
  ) : (
    <button type="button" className="plan-schedule" onClick={() => goTo("dessert")}>
      Next: pick a dessert →
    </button>
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
            {plan ? `${plan.name} · ${money(plan.priceCents)}` : `${entrees} of ${MIN_ENTREES} entrées to start`}
          </strong>
          <span>
            {entrees} {entrees === 1 ? "entrée" : "entrées"} (3 to 5) · {dessert ? `Dessert: ${dessert.title}` : "No dessert yet"}
            {plan ? ` · ${portionsFor(entrees, shownPeople)} portions` : ""}
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
        {onDessertStep
          ? "Step 2 of 2. Pick 1 dessert. It is included with your plan and does not change the price. You can also skip it."
          : `Step 1 of 2. Pick 3 to 5 entrées and how many people you are cooking for. Each entrée makes ${PORTIONS_PER_DISH_PER_PERSON} portions per person, so more people means more food and a larger plan. Next you can choose 1 dessert, included with every plan. ${PRICE_COVERS}`}
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
          <h1>{onDessertStep ? "Pick 1 dessert" : "Pick 3 to 5 entrées"}</h1>
          <input type="search" placeholder="Search dishes" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search dishes" />
        </div>
        {onDessertStep ? null : (
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
        )}
        {onDessertStep ? (
          <button type="button" className="plan-back" onClick={() => goTo("entrees")}>
            ← Back to entrées
          </button>
        ) : null}
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
                  <div className="plan-dish-actions">
                    <button type="button" className="plan-details" onClick={() => setOpenId(d.id)}>
                      Details
                    </button>
                    <button onClick={() => toggle(d.id)} disabled={blocked(d.id)} aria-pressed={on}>
                      {on ? "✓ Added" : addLabel(d.id, "Add")}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!visible.length ? <p>No dishes match that search.</p> : null}
        </div>
      </section>

      <dialog ref={detailRef} className="plan-modal" onClose={() => setOpenId(0)} onClick={(e) => { if (e.target === e.currentTarget) setOpenId(0); }} aria-label={opened?.title ?? "Dish details"}>
        {opened ? (
          <div className="plan-modal-body">
            <button type="button" className="plan-modal-close" onClick={() => setOpenId(0)} aria-label="Close">
              ×
            </button>
            {opened.bigImage ? <img src={opened.bigImage} alt={opened.title} /> : null}
            <small>{opened.category}</small>
            <h2>{opened.title}</h2>
            <p>{opened.description}</p>
            <h3>What is in it</h3>
            <p className="plan-modal-list">{opened.ingredients.join(", ")}.</p>
            <h3>Allergens</h3>
            <p>{opened.allergens.length ? `Contains ${opened.allergens.join(", ").toLowerCase()}.` : "No major allergens listed."}{opened.dietary.length ? ` ${opened.dietary.join(", ")}.` : ""}</p>
            {opened.reheating ? (
              <>
                <h3>How to reheat</h3>
                <p>{opened.reheating}</p>
              </>
            ) : null}
            {conflict(opened).length ? <p className="plan-clash">Heads up: contains {conflict(opened).join(", ")}, which is in your notes.</p> : null}
            <button type="button" className="plan-modal-add" onClick={() => toggle(opened.id)} disabled={blocked(opened.id)} aria-pressed={items.includes(opened.id)}>
              {items.includes(opened.id) ? "✓ Added (tap to remove)" : addLabel(opened.id, "Add to my plan")}
            </button>
          </div>
        ) : null}
      </dialog>

      <section className="plan-bottom">
        {onDessertStep ? (
          <button type="button" className="plan-back" onClick={() => goTo("entrees")}>
            ← Back to entrées
          </button>
        ) : null}
        {scheduleButton}
      </section>
    </main>
  );
}
