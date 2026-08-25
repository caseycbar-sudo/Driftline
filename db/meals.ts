import { env } from "cloudflare:workers";

export type CustomRecipe = { id: number; title: string; servings: number; ingredients: string; directions: string; notes: string; sourceUrl: string; createdAt: string };

const selectedMealsSql = `CREATE TABLE IF NOT EXISTS selected_meals (
  email TEXT NOT NULL,
  recipe_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (email, recipe_id)
)`;
const customRecipesSql = `CREATE TABLE IF NOT EXISTS custom_recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  title TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 4,
  ingredients TEXT NOT NULL,
  directions TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
)`;

function database() { if (!env.DB) throw new Error("Meal database is unavailable"); return env.DB; }
async function ensureTables() { const db=database(); await db.batch([db.prepare(selectedMealsSql),db.prepare(customRecipesSql)]); }

export async function getMealPlan(email:string) {
  await ensureTables(); const db=database();
  const [selected, custom] = await Promise.all([
    db.prepare("SELECT recipe_id FROM selected_meals WHERE email = ? ORDER BY created_at").bind(email).all<{recipe_id:number}>(),
    db.prepare("SELECT id, title, servings, ingredients, directions, notes, source_url, created_at FROM custom_recipes WHERE email = ? ORDER BY created_at DESC").bind(email).all<Record<string,unknown>>(),
  ]);
  return { selectedRecipeIds: selected.results.map(row=>Number(row.recipe_id)), customRecipes: custom.results.map(mapCustomRecipe) };
}

export async function addSelectedMeal(email:string, recipeId:number) {
  await ensureTables(); await database().prepare("INSERT OR IGNORE INTO selected_meals (email, recipe_id, created_at) VALUES (?, ?, ?)").bind(email,recipeId,new Date().toISOString()).run();
}
export async function removeSelectedMeal(email:string, recipeId:number) {
  await ensureTables(); await database().prepare("DELETE FROM selected_meals WHERE email = ? AND recipe_id = ?").bind(email,recipeId).run();
}
export async function addCustomRecipe(email:string, recipe:Omit<CustomRecipe,"id"|"createdAt">) {
  await ensureTables(); const now=new Date().toISOString();
  const result=await database().prepare("INSERT INTO custom_recipes (email, title, servings, ingredients, directions, notes, source_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(email,recipe.title,recipe.servings,recipe.ingredients,recipe.directions,recipe.notes,recipe.sourceUrl,now).run();
  return { id:Number(result.meta.last_row_id), ...recipe, createdAt:now };
}
export async function removeCustomRecipe(email:string,id:number) { await ensureTables(); await database().prepare("DELETE FROM custom_recipes WHERE email = ? AND id = ?").bind(email,id).run(); }

function mapCustomRecipe(row:Record<string,unknown>):CustomRecipe { return { id:Number(row.id),title:String(row.title),servings:Number(row.servings),ingredients:String(row.ingredients),directions:String(row.directions),notes:String(row.notes),sourceUrl:String(row.source_url),createdAt:String(row.created_at) }; }
