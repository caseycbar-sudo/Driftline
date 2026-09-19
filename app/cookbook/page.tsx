"use client";

import { useEffect, useMemo, useState } from "react";
import { recipes, SIDES, type CookbookSide, type Recipe } from "./recipes";
import { scaleIngredients } from "../portal/grocery-list";
import "./cookbook.css";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import "../home.css";

const SIGN_IN = "/signin-with-chatgpt?return_to=%2Fcookbook";

const HERO: Record<CookbookSide, { kicker: string; title: [string, string]; lede: string; choose: string; chosen: string; countLabel: string }> = {
  "meal-prep": {
    kicker: "WEEKLY MEAL PREP",
    title: ["What sounds good", "for your week?"],
    lede: "Pick a few dishes you'd like in your fridge. Your chef cooks them in your kitchen, portions and labels everything, and leaves the kitchen clean.",
    choose: "Choose this dish",
    chosen: "Chosen for my meals ✓",
    countLabel: "meals chosen",
  },
  "private-chef": {
    kicker: "PRIVATE CHEF DINNERS",
    title: ["Build the dinner", "you've been craving."],
    lede: "Browse Casey's dishes by course and save the ones you love. He'll shape your favorites into a menu for your date, your guests and the season.",
    choose: "Add to my dinner wishlist",
    chosen: "On my wishlist ✓",
    countLabel: "dishes on your wishlist",
  },
};

function sideFromUrl(): CookbookSide {
  if (typeof window === "undefined") return "meal-prep";
  return new URLSearchParams(window.location.search).get("side") === "private-chef" ? "private-chef" : "meal-prep";
}

export default function Cookbook() {
  const [side, setSide] = useState<CookbookSide>("meal-prep");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Recipe>(recipes[0]);
  const [portions, setPortions] = useState(recipes[0].servings);
  const [saved, setSaved] = useState<number[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [showOwnRecipe, setShowOwnRecipe] = useState(false);
  const [notice, setNotice] = useState("");
  const [customCount, setCustomCount] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);

  const sideInfo = SIDES[side];
  const hero = HERO[side];
  const sideRecipes = useMemo(() => recipes.filter((r) => r.side === side), [side]);

  function open(recipe: Recipe, showDetail = true) {
    setSelected(recipe);
    setPortions(recipe.servings);
    if (showDetail) setDetailOpen(true);
  }

  function switchSide(next: CookbookSide, keepUrl = false) {
    setSide(next);
    setCategory("All");
    setQuery("");
    const first = recipes.find((r) => r.side === next)!;
    setSelected(first);
    setPortions(first.servings);
    if (!keepUrl) {
      const url = new URL(window.location.href);
      if (next === "private-chef") url.searchParams.set("side", "private-chef");
      else url.searchParams.delete("side");
      url.searchParams.delete("recipe");
      window.history.replaceState(null, "", url);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = recipes.find((r) => r.id === Number(params.get("recipe")));
    const initialSide = requested ? requested.side : sideFromUrl();
    switchSide(initialSide, true);
    if (requested) {
      setSelected(requested);
      setPortions(requested.servings);
      if (window.matchMedia("(max-width: 1050px)").matches) setDetailOpen(true);
    }
    if (params.get("add") === "recipe") setShowOwnRecipe(true);
    fetch("/api/meals")
      .then((r) => r.json())
      .then((data) => {
        setSignedIn(Boolean(data.signedIn));
        setSaved(data.selectedRecipeIds ?? []);
        setCustomCount(data.customRecipes?.length ?? 0);
      })
      .catch(() => setNotice("We couldn't load your saved dishes."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!detailOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [detailOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sideRecipes.filter(
      (r) =>
        (category === "All" || r.category === category) &&
        (!q || `${r.title} ${r.description} ${r.tags.join(" ")} ${r.dietary.join(" ")} ${r.ingredients.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [sideRecipes, query, category]);

  const factor = portions / selected.servings;
  const scaledIngredients = useMemo(() => scaleIngredients(selected.ingredients, selected.servings, portions), [selected, portions]);
  const savedOnSide = saved.filter((id) => recipes.find((r) => r.id === id)?.side === side).length;

  async function toggleMeal(recipeId: number) {
    if (!signedIn) {
      window.location.href = SIGN_IN;
      return;
    }
    const removing = saved.includes(recipeId);
    setSaved((current) => (removing ? current.filter((id) => id !== recipeId) : [...current, recipeId]));
    try {
      const response = await fetch(
        removing ? `/api/meals?type=selection&id=${recipeId}` : "/api/meals",
        removing ? { method: "DELETE" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "selection", recipeId }) },
      );
      if (!response.ok) throw new Error(String(response.status));
      setNotice(removing ? "Removed." : side === "meal-prep" ? "Added to your meal plan ✓" : "Added to your dinner wishlist ✓");
      window.setTimeout(() => setNotice(""), 2400);
    } catch {
      setSaved((current) => (removing ? [...current, recipeId] : current.filter((id) => id !== recipeId)));
      setNotice("That didn't save. Please try again.");
    }
  }

  async function submitOwnRecipe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) {
      window.location.href = SIGN_IN;
      return;
    }
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/meals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(String(response.status));
      setCustomCount((count) => count + 1);
      setShowOwnRecipe(false);
      setNotice("Your recipe was added to your Driftline meal plan ✓");
      window.setTimeout(() => setNotice(""), 3000);
    } catch {
      setNotice("Please complete the recipe title, ingredients, and directions, then try again.");
    }
  }

  const credit = selected.photoCredit;

  return (
    <main className="cookbook">
      <SiteHeader current={side === "meal-prep" ? "/meal-prep" : "/private-chef"} />
      <nav className="dp-subnav" aria-label="Cookbook">
        {side === "meal-prep" ? (
          <>
            <a href="/meal-prep">← Meal prep</a>
            <a href="/meal-prep#pricing">Packages &amp; pricing</a>
            <a href="/account">My account</a>
            <a className="dp-subnav-cta" href="/meal-prep#booking">Check availability →</a>
          </>
        ) : (
          <>
            <a href="/private-chef">← Private chef</a>
            <a href="/private-chef#experience">The experience</a>
            <a href="/account">My account</a>
            <a className="dp-subnav-cta" href="/private-chef#inquire">Plan a dinner →</a>
          </>
        )}
      </nav>

      <section className="book-hero">
        <div>
          <div className="book-sides" role="tablist" aria-label="Cookbook side">
            {(Object.keys(SIDES) as CookbookSide[]).map((key) => (
              <button key={key} role="tab" aria-selected={side === key} className={side === key ? "on" : ""} onClick={() => switchSide(key)}>
                {SIDES[key].label}
              </button>
            ))}
          </div>
          <p>{hero.kicker}</p>
          <h1>
            {hero.title[0]}
            <br />
            {hero.title[1]}
          </h1>
          <span>{hero.lede}</span>
          <div className="hero-choice">
            <strong>{savedOnSide + (side === "meal-prep" ? customCount : 0)}</strong>
            <span>{hero.countLabel}</span>
            {side === "meal-prep" ? <button onClick={() => setShowOwnRecipe(true)}>+ Add my own recipe</button> : null}
          </div>
        </div>
        <aside>
          <strong>{sideRecipes.length}</strong>
          <span>{side === "meal-prep" ? "meal prep recipes" : "dishes by course"}</span>
          <strong>{sideInfo.categories.length}</strong>
          <span>{side === "meal-prep" ? "categories" : "courses"}</span>
          <strong>
            {sideInfo.min}–{sideInfo.max}
          </strong>
          <span>{sideInfo.unit}</span>
        </aside>
      </section>

      <section className="book-tools">
        <label>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by dish, ingredient, or diet…" aria-label="Search recipes" />
        </label>
        <div>
          {["All", ...sideInfo.categories].map((c) => (
            <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <b>
          {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
        </b>
      </section>

      <div className="book-layout">
        <section className="recipe-gallery">
          {filtered.length === 0 ? <p className="book-empty">No dishes match that search yet.</p> : null}
          {filtered.map((r, index) => (
            <article
              key={r.id}
              className={selected.id === r.id ? "active" : ""}
              role="button"
              tabIndex={0}
              aria-label={`Open full recipe for ${r.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(r);
                }
              }}
              onClick={() => open(r)}
            >
              <button
                className={saved.includes(r.id) ? "save on" : "save"}
                aria-label={saved.includes(r.id) ? "Remove" : hero.choose}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMeal(r.id);
                }}
              >
                {saved.includes(r.id) ? "✓" : "+"}
              </button>
              <img src={r.image} alt={r.title} loading={index < 4 ? "eager" : "lazy"} decoding="async" />
              <div>
                <small>{r.category}</small>
                <h2>{r.title}</h2>
                <p>
                  {r.active} min active · {r.total} min total
                </p>
                <span>
                  {[...r.dietary, ...r.tags].slice(0, 2).map((t) => (
                    <i key={t}>{t}</i>
                  ))}
                </span>
                <b className="open-recipe">View full recipe →</b>
              </div>
            </article>
          ))}
        </section>

        <aside
          className={`recipe-detail${detailOpen ? " open" : ""}`}
          role={detailOpen ? "dialog" : undefined}
          aria-modal={detailOpen ? "true" : undefined}
          aria-label={detailOpen ? `${selected.title} recipe details` : undefined}
        >
          <button className="detail-close" type="button" onClick={() => setDetailOpen(false)} aria-label="Close recipe details">
            ×
          </button>
          <div className="detail-photo">
            <img src={selected.image} alt={selected.title} decoding="async" />
            {credit.source === "Driftline" ? (
              <span>PHOTO BY CHEF CASEY</span>
            ) : (
              <span className="photo-credit">
                Photo: {credit.page ? <a href={credit.page} target="_blank" rel="noreferrer">{credit.author} / {credit.source}</a> : `${credit.author} / ${credit.source}`}
              </span>
            )}
          </div>
          <div className="detail-title">
            <small>
              {SIDES[selected.side].label} · {selected.category}
            </small>
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>
            {selected.dietary.length ? (
              <div className="detail-diet">
                {selected.dietary.map((d) => (
                  <i key={d}>{d}</i>
                ))}
              </div>
            ) : null}
          </div>
          <div className="detail-meta">
            <span>
              <small>ACTIVE</small>
              <b>{selected.active} min</b>
            </span>
            <span>
              <small>TOTAL</small>
              <b>{selected.total} min</b>
            </span>
            <span>
              <small>ALLERGENS</small>
              <b>{selected.allergens.length ? selected.allergens.join(", ") : "None of the major 9"}</b>
            </span>
          </div>
          <div className="portion-tool">
            <div>
              <small>{selected.side === "meal-prep" ? "PORTION CALCULATOR" : "GUEST CALCULATOR"}</small>
              <strong>
                {selected.yieldNote} · scale to {portions} {sideInfo.unit}
              </strong>
            </div>
            <button aria-label={`Fewer ${sideInfo.unit}`} onClick={() => setPortions(Math.max(sideInfo.min, portions - sideInfo.step))}>
              −
            </button>
            <b>{portions}</b>
            <button aria-label={`More ${sideInfo.unit}`} onClick={() => setPortions(Math.min(sideInfo.max, portions + sideInfo.step))}>
              +
            </button>
            <span>{factor.toFixed(2)}× batch</span>
          </div>
          <section className="book-section ingredients">
            <h3>Ingredients</h3>
            {scaledIngredients.map((x, i) => (
              <p key={i}>
                <span>□</span>
                {x}
              </p>
            ))}
          </section>
          <section className="book-section">
            <h3>Method</h3>
            <ol>
              {selected.directions.map((x, i) => (
                <li key={i}>
                  <b>{i + 1}</b>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
          </section>
          <div className="production-grid">
            <section>
              <h3>Equipment</h3>
              <ul>
                {selected.equipment.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Chef&apos;s notes</h3>
              <p className="chef-notes">{selected.chefNotes}</p>
            </section>
          </div>
          <section className="safety-notes">
            <div>
              <b>FOOD SAFETY</b>
              <p>{selected.safety}</p>
            </div>
            {selected.makeAhead ? (
              <div>
                <b>MAKE AHEAD</b>
                <p>{selected.makeAhead}</p>
              </div>
            ) : null}
            <div>
              <b>STORAGE</b>
              <p>{selected.storage}</p>
            </div>
            {selected.reheating ? (
              <div>
                <b>REHEATING</b>
                <p>{selected.reheating}</p>
              </div>
            ) : null}
          </section>
          <div className="recipe-actions">
            <button onClick={() => toggleMeal(selected.id)}>{saved.includes(selected.id) ? hero.chosen : hero.choose}</button>
            <button onClick={() => window.print()}>Print recipe</button>
          </div>
          <footer>
            <p>Driftline Provisions recipe. Always check the household&apos;s allergy notes before cooking.</p>
            <p>Food safety guidance follows USDA/FDA recommendations for cooking, cooling, storage and reheating.</p>
          </footer>
        </aside>
      </div>

      {notice ? (
        <div className="book-notice" role="status">
          {notice}
        </div>
      ) : null}

      {showOwnRecipe ? (
        <div className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="own-recipe-title">
          <form onSubmit={submitOwnRecipe}>
            <button className="modal-close" type="button" onClick={() => setShowOwnRecipe(false)} aria-label="Close">
              ×
            </button>
            <p>YOUR FAMILY RECIPE</p>
            <h2 id="own-recipe-title">What would you like us to make?</h2>
            <span>Enter the full recipe below. Your chef will review it with your household notes before scheduling.</span>
            <label>
              Recipe name
              <input name="title" required placeholder="Grandma's chicken and dumplings" />
            </label>
            <div className="own-row">
              <label>
                Servings
                <input name="servings" type="number" min="1" max="50" defaultValue="4" />
              </label>
              <label>
                Recipe link, if available
                <input name="sourceUrl" type="url" placeholder="https://…" />
              </label>
            </div>
            <label>
              Ingredients
              <textarea name="ingredients" required placeholder={"List each ingredient and amount on its own line\n2 cups flour\n1 tsp salt…"} />
            </label>
            <label>
              Directions
              <textarea name="directions" required placeholder={"Write each step in order\n1. Preheat the oven…"} />
            </label>
            <label>
              Notes for your chef
              <textarea name="notes" placeholder="Family traditions, preferred brands, substitutions, or anything that makes it taste right." />
            </label>
            <button className="submit-recipe">
              Add recipe to my meal plan <span>→</span>
            </button>
            <small>{signedIn ? "This recipe will be saved privately to your account." : "You'll be asked to sign in before this recipe is saved."}</small>
          </form>
        </div>
      ) : null}
      <SiteFooter />
    </main>
  );
}
