"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./OwnerTools.css";
import { ALLERGENS } from "../cookbook-core";
import DishPhoto from "../DishPhoto";

type Dish = {
  id: number;
  side: "meal-prep" | "private-chef";
  title: string;
  category: string;
  description: string;
  servings: number;
  yieldNote: string;
  active: number;
  total: number;
  tags: string[];
  allergens: string[];
  dietary: string[];
  image: string;
  ingredients: string[];
  directions: string[];
  equipment: string[];
  storage: string;
  reheating: string;
  makeAhead: string;
  safety: string;
  chefNotes: string;
  edited: boolean;
  hidden: boolean;
  custom: boolean;
};

const MEAL_PREP_CATEGORIES = ["Poultry", "Beef, Pork & Lamb", "Seafood", "Vegetarian"];
const PRIVATE_CHEF_CATEGORIES = ["Starters", "Soups & Salads", "Mains", "Sides", "Desserts"];
const blank = (side: Dish["side"]): Partial<Dish> => ({
  side,
  title: "",
  category: side === "meal-prep" ? MEAL_PREP_CATEGORIES[0] : PRIVATE_CHEF_CATEGORIES[2],
  description: "",
  servings: side === "meal-prep" ? 12 : 6,
  yieldNote: "",
  active: 30,
  total: 60,
  tags: [],
  allergens: [],
  ingredients: [],
  directions: [],
  equipment: [],
  storage: "",
  reheating: "",
  makeAhead: "",
  safety: "",
  chefNotes: "",
});

/** Owner screen for editing the cookbook: change a dish, hide one, or add your own. */
export default function CookbookManager() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [side, setSide] = useState<Dish["side"]>("meal-prep");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Partial<Dish> | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/recipes", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { recipes?: Dish[] } | null) => d?.recipes && setDishes(d.recipes))
      .catch(() => setMessage("Couldn't load the cookbook."));
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes.filter((d) => d.side === side && (!q || `${d.title} ${d.category}`.toLowerCase().includes(q)));
  }, [dishes, side, query]);

  async function send(body: Record<string, unknown>, done: string) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/recipes", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error || "That didn't save. Try again.");
      return false;
    }
    setMessage(done);
    load();
    return true;
  }

  /**
   * Casey photographs the dish on his phone. Those files are huge, so the picture is
   * shrunk in the browser before it goes up; the site never needs more than 1400px.
   */
  async function uploadPhoto(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const shrunk = await shrink(file);
      const form = new FormData();
      form.set("photo", shrunk, shrunk.name);
      const response = await fetch("/api/admin/recipe-photo", { method: "POST", body: form });
      const data = (await response.json().catch(() => ({}))) as { image?: string; error?: string };
      if (!response.ok || !data.image) {
        setMessage(data.error || "That photo didn't upload. Try again.");
        return;
      }
      field("image", data.image);
      setMessage("Photo ready. Save the dish to use it.");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const { id, custom, edited, hidden, ...fields } = editing as Dish;
    const body = id ? { action: "save", id, ...fields } : { action: "add", ...fields };
    const ok = await send(body, id ? "Saved. The website shows the change now." : "Dish added.");
    if (ok) setEditing(null);
  }

  async function reset(dish: Dish) {
    const question = dish.custom
      ? `Delete "${dish.title}"? It disappears from the cookbook for good.`
      : `Undo your changes to "${dish.title}"? It goes back to the original wording.`;
    if (!window.confirm(question)) return;
    await send({ action: "reset", id: dish.id }, dish.custom ? "Dish deleted." : "Back to the original.");
  }

  const field = (key: keyof Dish, value: unknown) => setEditing((current) => (current ? { ...current, [key]: value } : current));
  const listValue = (value: string[] | undefined) => (value ?? []).join("\n");
  const categories = (editing?.side ?? side) === "meal-prep" ? MEAL_PREP_CATEGORIES : PRIVATE_CHEF_CATEGORIES;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Cookbook</h1>
          <p>Change any dish, hide one you&apos;re not cooking this season, or add your own. Customers and chefs see the change straight away.</p>
        </div>
        <button className="owner-primary" onClick={() => setEditing(blank(side))}>
          Add a dish
        </button>
      </header>
      <div className="page-body owner-tools cookbook-tools">
        {message ? (
          <p className="owner-message" role="status">
            {message}
          </p>
        ) : null}

        {editing ? (
          <form className="owner-card cookbook-form" onSubmit={save}>
            <small>{editing.id ? `EDITING DISH #${editing.id}` : "NEW DISH"}</small>
            <h2 className="owner-h2">{editing.title || "New dish"}</h2>
            <label>
              Name
              <input required value={editing.title ?? ""} onChange={(e) => field("title", e.target.value)} placeholder="Lemon-herb chicken thighs" />
            </label>
            <div className="cookbook-row">
              <label>
                Course
                <select value={editing.category ?? ""} onChange={(e) => field("category", e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                {(editing.side ?? side) === "meal-prep" ? "Portions" : "Guests"}
                <input
                  inputMode="numeric"
                  value={String(editing.servings ?? "")}
                  onChange={(e) => field("servings", Number(e.target.value.replace(/\D/g, "")) || 0)}
                />
              </label>
            </div>
            <label>
              Short description
              <textarea rows={2} value={editing.description ?? ""} onChange={(e) => field("description", e.target.value)} placeholder="What a customer sees on the card." />
            </label>
            <div className="cookbook-row">
              <label>
                Hands-on minutes
                <input inputMode="numeric" value={String(editing.active ?? "")} onChange={(e) => field("active", Number(e.target.value.replace(/\D/g, "")) || 0)} />
              </label>
              <label>
                Total minutes
                <input inputMode="numeric" value={String(editing.total ?? "")} onChange={(e) => field("total", Number(e.target.value.replace(/\D/g, "")) || 0)} />
              </label>
            </div>
            <label>
              Ingredients — one per line
              <textarea rows={8} value={listValue(editing.ingredients)} onChange={(e) => field("ingredients", e.target.value.split("\n"))} placeholder={"6 lb boneless skinless chicken thighs\n2 lb orzo"} />
            </label>
            <label>
              Steps — one per line
              <textarea rows={8} value={listValue(editing.directions)} onChange={(e) => field("directions", e.target.value.split("\n"))} />
            </label>
            <div className="cookbook-photo">
              <span>Photo</span>
              {editing.image ? <img src={editing.image} alt="" /> : <p className="owner-empty">No photo yet.</p>}
              <label className="cookbook-photo-pick">
                {uploading ? "Uploading…" : editing.image ? "Replace photo" : "Add a photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void uploadPhoto(file);
                  }}
                />
              </label>
              <small>Take it in daylight, from above or at a slight angle. Your photo replaces the stock one everywhere on the site.</small>
            </div>
            <fieldset className="cookbook-allergens">
              <legend>Allergens</legend>
              {ALLERGENS.map((a) => (
                <label key={a}>
                  <input
                    type="checkbox"
                    checked={(editing.allergens ?? []).includes(a)}
                    onChange={(e) =>
                      field("allergens", e.target.checked ? [...(editing.allergens ?? []), a] : (editing.allergens ?? []).filter((x) => x !== a))
                    }
                  />
                  {a}
                </label>
              ))}
            </fieldset>
            <label>
              Chef notes — only your chefs see these
              <textarea rows={3} value={editing.chefNotes ?? ""} onChange={(e) => field("chefNotes", e.target.value)} />
            </label>
            <label>
              Storage
              <textarea rows={2} value={editing.storage ?? ""} onChange={(e) => field("storage", e.target.value)} />
            </label>
            <label>
              Reheating
              <textarea rows={2} value={editing.reheating ?? ""} onChange={(e) => field("reheating", e.target.value)} />
            </label>
            <label>
              Food safety
              <textarea rows={2} value={editing.safety ?? ""} onChange={(e) => field("safety", e.target.value)} />
            </label>
            <div className="cookbook-actions">
              <button className="owner-primary" disabled={busy}>
                {busy ? "Saving…" : editing.id ? "Save changes" : "Add the dish"}
              </button>
              <button type="button" onClick={() => setEditing(null)} disabled={busy}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <section className="owner-card">
          <div className="cookbook-filters">
            <div className="cookbook-sides">
              {(["meal-prep", "private-chef"] as const).map((s) => (
                <button key={s} className={side === s ? "active" : ""} onClick={() => setSide(s)}>
                  {s === "meal-prep" ? "Meal prep" : "Private chef"}
                </button>
              ))}
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" aria-label="Search dishes" />
          </div>
          {!dishes.length ? <p className="owner-empty">Loading…</p> : null}
          <ul className="cookbook-list">
            {shown.map((dish) => (
              <li key={dish.id} className={dish.hidden ? "is-hidden" : ""}>
                <DishPhoto src={dish.image} alt={dish.title} loading="lazy" />
                <div>
                  <strong>{dish.title}</strong>
                  <span>
                    {dish.category} · {dish.servings} {dish.side === "meal-prep" ? "portions" : "guests"}
                    {dish.allergens.length ? ` · ${dish.allergens.join(", ")}` : ""}
                  </span>
                  <em>
                    {dish.hidden ? "Hidden from the website" : dish.custom ? "Your dish" : dish.edited ? "Edited" : "Original"}
                  </em>
                </div>
                <div className="cookbook-row-actions">
                  <button onClick={() => setEditing(dish)} disabled={busy}>
                    Edit
                  </button>
                  <button
                    onClick={() => send({ action: dish.hidden ? "show" : "hide", id: dish.id }, dish.hidden ? "Back on the website." : "Hidden from the website.")}
                    disabled={busy}
                  >
                    {dish.hidden ? "Show" : "Hide"}
                  </button>
                  {dish.edited || dish.custom ? (
                    <button className="danger" onClick={() => reset(dish)} disabled={busy}>
                      {dish.custom ? "Delete" : "Undo edits"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

/** Scale a phone photo down to something a web page should serve. */
async function shrink(file: File): Promise<File> {
  const MAX = 1400;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], "dish.jpg", { type: "image/jpeg" });
  } catch {
    // Older browser, or a format the canvas can't read: send the original.
    return file;
  }
}
