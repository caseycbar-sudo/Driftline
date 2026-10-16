"use client";

import { useState } from "react";

export type SavedRecipe = { id: number; title: string; category: string; image: string; side: "meal-prep" | "private-chef" };
export type OwnRecipe = { id: number; title: string; servings: number; ingredients: string; directions: string; notes: string; sourceUrl: string };

/** Only web links are made clickable; anything else a customer typed stays plain text. */
function safeLink(url: string): string {
  return /^https?:\/\//i.test(url) ? url : "";
}

/**
 * The customer's own recipe shelf: dishes they saved from the cookbook, and the
 * recipes they typed in themselves. Their chef and Casey already see these; this
 * is the customer's own view, with a way to take one off.
 */
export default function MyRecipes({ saved: initialSaved, own: initialOwn }: { saved: SavedRecipe[]; own: OwnRecipe[] }) {
  const [saved, setSaved] = useState(initialSaved);
  const [own, setOwn] = useState(initialOwn);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(0);

  async function remove(kind: "selection" | "custom", id: number) {
    setBusy(`${kind}-${id}`);
    setError("");
    try {
      const response = await fetch(`/api/meals?type=${kind}&id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(String(response.status));
      if (kind === "selection") setSaved((current) => current.filter((recipe) => recipe.id !== id));
      else setOwn((current) => current.filter((recipe) => recipe.id !== id));
    } catch {
      setError("That didn't work. Please try again.");
    }
    setBusy("");
  }

  const empty = saved.length === 0 && own.length === 0;

  return (
    <section className="meal-plan my-recipes" id="recipes">
      <div className="meal-plan-heading">
        <div>
          <span>YOUR RECIPES</span>
          <h2>Saved and uploaded recipes</h2>
        </div>
        <a href="/cookbook">Open the cookbook →</a>
      </div>
      <p className="my-recipes-note">
        Your chef sees these when planning your visits. Save dishes from the cookbook, or add a family recipe of your own with &ldquo;Add my own recipe&rdquo; on the meal prep side.
      </p>
      {error ? (
        <p className="my-recipes-error" role="alert">
          {error}
        </p>
      ) : null}
      {empty ? (
        <p className="my-recipes-empty">
          Nothing saved yet. <a href="/cookbook">Browse the cookbook</a> and tap a dish to save it here.
        </p>
      ) : null}

      {saved.length ? (
        <>
          <h3 className="my-recipes-sub">Saved from the cookbook ({saved.length})</h3>
          <ul className="my-recipes-grid">
            {saved.map((recipe) => (
              <li key={recipe.id}>
                {recipe.image ? <img src={recipe.image} alt="" loading="lazy" /> : null}
                <div>
                  <b>{recipe.title}</b>
                  <small>
                    {recipe.category} · {recipe.side === "private-chef" ? "Private chef" : "Meal prep"}
                  </small>
                  <button type="button" disabled={busy === `selection-${recipe.id}`} onClick={() => remove("selection", recipe.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {own.length ? (
        <>
          <h3 className="my-recipes-sub">Your own recipes ({own.length})</h3>
          <ul className="my-recipes-own">
            {own.map((recipe) => {
              const link = safeLink(recipe.sourceUrl);
              return (
                <li key={recipe.id}>
                  <details>
                    <summary>
                      <b>{recipe.title}</b>
                      <small>Makes {recipe.servings}</small>
                    </summary>
                    <h4>Ingredients</h4>
                    <p className="my-recipes-text">{recipe.ingredients}</p>
                    <h4>Directions</h4>
                    <p className="my-recipes-text">{recipe.directions}</p>
                    {recipe.notes ? (
                      <>
                        <h4>Notes</h4>
                        <p className="my-recipes-text">{recipe.notes}</p>
                      </>
                    ) : null}
                    {recipe.sourceUrl ? (
                      <p className="my-recipes-text">
                        Source: {link ? <a href={link} target="_blank" rel="noreferrer noopener">{recipe.sourceUrl}</a> : recipe.sourceUrl}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy === `custom-${recipe.id}`}
                      onClick={() => {
                        if (confirming === recipe.id) void remove("custom", recipe.id);
                        else setConfirming(recipe.id);
                      }}
                    >
                      {confirming === recipe.id ? "Tap again to delete it for good" : "Remove this recipe"}
                    </button>
                  </details>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
