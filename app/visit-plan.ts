/**
 * How much cooking fits in one meal prep visit.
 *
 * Casey's rule of thumb: a chef should be in and out of a customer's kitchen in
 * about 3 hours, 4 at most. Portions alone don't protect that (12 portions of one
 * sheet-pan chicken is quick; 12 portions spread over lasagna, meatballs and a pot
 * pie is not), so a visit is limited three ways:
 *   - how many different entrées the package includes,
 *   - how many "big project" dishes can be in one visit,
 *   - an estimate of total kitchen time, shown green / amber / red.
 * Desserts are an add-on (one per visit) and don't use an entrée slot, but their
 * time still counts. Pure module so it can be tested and used on any screen.
 */

export type Effort = "Easy" | "Medium" | "Big project";
export type PlanDish = { title: string; category?: string; active?: number; total?: number };
export type PlanLevel = "good" | "tight" | "over";

/** Unpacking, setup, final clean-up, labels and photos. */
export const VISIT_OVERHEAD_MIN = 45;
export const TARGET_MIN = 180;
export const LIMIT_MIN = 240;
export const DESSERT_LIMIT = 1;
/** What we assume for a dish typed in by hand (not in the cookbook). */
const UNKNOWN = { active: 60, total: 90 };

export const isDessert = (dish: PlanDish) => (dish.category ?? "").toLowerCase() === "desserts";

/** Easy / Medium / Big project, from the recipe's hands-on and total time. */
export function effortOf(dish: { active?: number; total?: number }): Effort {
  const active = dish.active ?? UNKNOWN.active;
  const total = dish.total ?? UNKNOWN.total;
  if (active >= 70 || total >= 180) return "Big project";
  if (active <= 40 && total <= 90) return "Easy";
  return "Medium";
}

/** Different entrées a package covers: 2 up to 8 portions, 3 up to 12, then 4. */
export function entreeLimit(portions: number): number {
  if (portions <= 8) return 2;
  if (portions <= 12) return 3;
  return 4;
}

/** Big-project dishes allowed in one visit. */
export function bigProjectLimit(portions: number): number {
  return portions >= 20 ? 2 : 1;
}

/** Package line for customers, e.g. "Up to 3 entrées + 1 dessert". */
export function packageAllowance(portions: number): string {
  const n = entreeLimit(portions);
  return `Up to ${n} entrées + ${DESSERT_LIMIT} dessert`;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round((minutes - h * 60) / 5) * 5;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/**
 * Estimate a visit. Hands-on time adds up; waiting time (braising, baking) overlaps
 * with other work, so the visit is at least as long as the slowest single dish.
 * Hands-on time shrinks a little for smaller batches, since recipes are written for 12.
 */
export function planVisit(dishes: PlanDish[], portions: number) {
  const entrees = dishes.filter((d) => !isDessert(d));
  const desserts = dishes.filter(isDessert);
  const perEntree = entrees.length ? portions / entrees.length : portions;
  const batchScale = (d: PlanDish) => (isDessert(d) ? 1 : Math.min(1.4, 0.6 + 0.4 * (perEntree / 12)));

  let handsOn = 0;
  let longest = 0;
  const unknown: string[] = [];
  for (const d of dishes) {
    if (d.active == null || d.total == null) unknown.push(d.title);
    const active = d.active ?? UNKNOWN.active;
    const total = d.total ?? UNKNOWN.total;
    handsOn += active * batchScale(d);
    longest = Math.max(longest, total);
  }
  const minutes = dishes.length ? Math.round(VISIT_OVERHEAD_MIN + Math.max(handsOn, longest)) : 0;
  const level: PlanLevel = minutes > LIMIT_MIN ? "over" : minutes > TARGET_MIN ? "tight" : "good";

  const maxEntrees = entreeLimit(portions);
  const maxBig = bigProjectLimit(portions);
  const big = entrees.filter((d) => effortOf(d) === "Big project");
  const warnings: string[] = [];
  if (entrees.length > maxEntrees) warnings.push(`${entrees.length} entrées: this package covers ${maxEntrees}.`);
  if (desserts.length > DESSERT_LIMIT) warnings.push(`${desserts.length} desserts: the limit is ${DESSERT_LIMIT} per visit.`);
  if (big.length > maxBig) warnings.push(`${big.length} big-project dishes (${big.map((d) => d.title).join(", ")}): ${maxBig === 1 ? "one per visit" : `${maxBig} per visit`}.`);
  const slow = dishes.filter((d) => (d.total ?? 0) + VISIT_OVERHEAD_MIN > LIMIT_MIN);
  for (const d of slow) warnings.push(`${d.title} takes ${formatMinutes(d.total ?? 0)} on its own, longer than a visit. Braise it ahead or use a pressure cooker.`);
  if (level === "over" && !slow.length) warnings.push(`About ${formatMinutes(minutes)} in the kitchen, over the 4-hour limit. Swap a dish for an easy one.`);

  return {
    entrees: entrees.length,
    desserts: desserts.length,
    maxEntrees,
    bigProjects: big.length,
    maxBig,
    minutes,
    level,
    unknown,
    warnings,
    ok: warnings.length === 0,
  };
}
