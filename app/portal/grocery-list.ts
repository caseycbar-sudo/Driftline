export type GroceryCategory = "Meat & seafood" | "Produce" | "Dairy & eggs" | "Grains & bakery" | "Pantry";
export type GroceryItem = { key: string; name: string; quantity: number | null; unit: string; display: string; category: GroceryCategory; dishes: string[] };
type GroceryDish = { title: string; ingredients: string[]; servings?: number; portions?: number };

const fractions: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
const units: Record<string, string> = {
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb", oz: "oz", ounce: "oz", ounces: "oz",
  cup: "cup", cups: "cup", tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp", tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp",
  clove: "clove", cloves: "clove", can: "can", cans: "can", package: "package", packages: "package", bunch: "bunch", bunches: "bunch",
  fillet: "fillet", fillets: "fillet",
};

function amount(value: string) {
  const vulgar = value.match(/[¼½¾⅓⅔⅛⅜⅝⅞]/)?.[0];
  const whole = Number(value.replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, "").trim() || 0);
  if (vulgar) return whole + fractions[vulgar];
  if (value.includes("/")) {
    const parts = value.includes(" ") ? value.split(/\s+/, 2) : ["0", value];
    const [top, bottom] = parts[1].split("/").map(Number);
    return Number(parts[0]) + top / bottom;
  }
  return Number(value);
}

/** Shopping-list name: drop prep notes ("…, minced") and component notes ("(for the sauce)"). */
const shoppingName = (value: string) =>
  value
    .replace(/\s*\((for|to) [^)]*\)/gi, "")
    .replace(/,.*$/, "")
    .replace(/\s+/g, " ")
    .trim();

const has = (value: string, pattern: RegExp) => pattern.test(value);

/** Which store section an ingredient belongs in. Order matters: specific phrases before broad words. */
export function groceryCategory(name: string, unit = ""): GroceryCategory {
  const v = name.toLowerCase();
  if (unit === "can") return "Pantry";
  if (has(v, /\b(stock|broth|bouillon|peanut butter|coconut milk|coconut cream|sauce|paste|ketchup|mayonnaise|oil|vinegar|wine|syrup|honey|molasses|miso|tahini|capers|olives|canned)\b/)) return "Pantry";
  if (has(v, /\b(chicken|turkey|beef|chuck|short ribs?|steak|pork|bacon|pancetta|prosciutto|ham|lamb|sausage|chorizo|salmon|cod|rockfish|halibut|fish|shrimp|prawns?|tuna|crab|crabmeat|clams?|mussels?|scallops?|oysters?|anchov\w*)\b/)) return "Meat & seafood";
  if (has(v, /\b(milk|cream|half-and-half|buttermilk|yogurt|cheese|parmesan|parmigiano|pecorino|mozzarella|ricotta|feta|gouda|gruy[eè]re|cheddar|mascarpone|cr[eè]me fra[iî]che|butter|ghee|eggs?|yolks?|egg whites?)\b/)) return "Dairy & eggs";
  if (has(v, /\b(rice|pasta|penne|orzo|ziti|linguine|spaghetti|noodles?|quinoa|couscous|barley|farro|polenta|cornmeal|grits|tortillas?|bread|baguette|ciabatta|sourdough|panko|breadcrumbs?|crumbs|croutons|buns?|oats|crackers)\b/)) return "Grains & bakery";
  if (has(v, /\b(ground|dried|powder|flakes|black pepper|white pepper|peppercorns?|cayenne|paprika|cumin|coriander seed|turmeric|garam masala|curry powder|cinnamon|nutmeg|cloves ground|allspice|bay leaf|bay leaves|salt|sugar|flour|cornstarch|baking|yeast|gelatin|vanilla|chocolate|cocoa|lentils|beans dried|chickpeas|hazelnuts?|walnuts?|almonds?|pecans?|pine nuts|peanuts|sesame seeds|seeds?)\b/)) return "Pantry";
  if (has(v, /\b(onions?|shallots?|leeks?|garlic|ginger|lemons?|limes?|oranges?|grapefruit|citrus|zest|juice|parsley|cilantro|dill|basil|mint|thyme|rosemary|sage|chives|tarragon|oregano|herbs|spinach|kale|chard|arugula|lettuce|little gem|romaine|greens|potatoes|potato|tomatoes|tomato|peppers?|jalape[nñ]os?|poblanos?|chiles?|zucchini|squash|broccoli|broccolini|cauliflower|carrots?|celery|mushrooms?|chanterelles?|cabbage|corn|peas|green beans|snap peas|asparagus|beets?|radish(es)?|fennel|cucumbers?|eggplant|apples?|pears?|berries|marionberr\w*|strawberr\w*|blueberr\w*|raspberr\w*|avocados?|mangoes|mango|scallions?|green onions?|bok choy|brussels sprouts|sprouts|microgreens|watercress|frisée|endive)\b/)) return "Produce";
  return "Pantry";
}

function quantity(value: number, unit = "") {
  if (/^(clove|fillet)$/.test(unit) || unit === "") {
    // Countable things round to a sensible count, but keep halves for items like "½ lemon".
    if (unit === "" && value < 1) return value <= 0.5 ? "½" : "1";
    if (unit === "") return String(Math.round(value * 2) / 2).replace(/\.5$/, "½");
    return String(Math.max(1, Math.round(value)));
  }
  const whole = Math.floor(value), decimal = value - whole;
  const candidates: Array<[number, string]> = unit === "tsp"
    ? [[0, ""], [0.125, "⅛"], [0.25, "¼"], [0.5, "½"], [0.75, "¾"], [1, ""]]
    : [[0, ""], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"], [1, ""]];
  if (whole === 0 && value > 0 && decimal < 0.125) return unit === "tsp" ? "⅛" : "¼";
  const nearest = candidates.reduce((best, item) => (Math.abs(item[0] - decimal) < Math.abs(best[0] - decimal) ? item : best));
  if (nearest[0] === 1) return String(whole + 1);
  return `${whole || ""}${nearest[1]}` || "0";
}
const unitLabel = (unit: string, value: number) => (/^(lb|oz|tbsp|tsp)$/.test(unit) || value <= 1 ? unit : unit === "bunch" ? "bunches" : `${unit}s`);

const amountPattern = "(\\d+(?:\\.\\d+)?(?:\\s+\\d+\\/\\d+)?|\\d+\\/\\d+|\\d*[¼½¾⅓⅔⅛⅜⅝⅞])";

type Parsed = { quantity: number | null; unit: string; name: string; rest: string };
/** Split "3 cloves garlic, minced" into amount, unit, shopping name, and the original remainder. */
function parse(raw: string): Parsed {
  const value = raw.trim();
  const match = value.match(new RegExp(`^${amountPattern}\\s+(\\S+)\\s+(.+)$`));
  if (!match) {
    const bare = value.match(new RegExp(`^${amountPattern}\\s+(.+)$`));
    if (bare) return { quantity: amount(bare[1]), unit: "", name: shoppingName(bare[2]), rest: bare[2] };
    return { quantity: null, unit: "", name: shoppingName(value), rest: value };
  }
  const unit = units[match[2].toLowerCase().replace(/[.,]$/, "")];
  if (unit) return { quantity: amount(match[1]), unit, name: shoppingName(match[3]), rest: match[3] };
  // No recognised unit: a count, e.g. "4 large eggs" or "2 medium yellow onions, diced".
  const rest = `${match[2]} ${match[3]}`;
  return { quantity: amount(match[1]), unit: "", name: shoppingName(rest), rest };
}

function factor(dish: GroceryDish) {
  const base = Math.max(1, dish.servings || 12), target = Math.max(1, dish.portions || base);
  return target / base;
}
/** Move tiny or huge volumes to the unit a cook would use (⅛ cup → 2 tbsp, ½ tbsp → 1½ tsp, 12 tbsp → ¾ cup). */
function normalize(value: number, unit: string): [number, string] {
  if (unit === "cup" && value < 0.25) return normalize(value * 16, "tbsp");
  if (unit === "tbsp" && value < 1) return [value * 3, "tsp"];
  if (unit === "tbsp" && value >= 8) return [value / 16, "cup"];
  if (unit === "tsp" && value >= 6) return normalize(value / 3, "tbsp");
  return [value, unit];
}
const display = (raw: number, rawUnit: string, text: string) => {
  const [value, unit] = normalize(raw, rawUnit);
  return unit ? `${quantity(value, unit)} ${unitLabel(unit, value)} ${text}` : `${quantity(value, unit)} ${text}`;
};

/** Scale recipe lines for display, keeping each line's prep notes ("…, minced"). */
export function scaleIngredients(ingredients: string[], baseServings: number, portions: number) {
  const scale = Math.max(1, portions) / Math.max(1, baseServings);
  return ingredients.map((raw) => {
    const item = parse(raw);
    return item.quantity === null ? raw.trim() : display(item.quantity * scale, item.unit, item.rest);
  });
}

/** Combine every dish's ingredients into one shopping list, scaled to each dish's portions. */
export function buildGroceryList(dishes: GroceryDish[]): GroceryItem[] {
  const map = new Map<string, GroceryItem>();
  for (const dish of dishes)
    for (const raw of dish.ingredients) {
      const item = parse(raw);
      const scaled = item.quantity === null ? null : item.quantity * factor(dish);
      const key = `${item.unit || (item.quantity === null ? "item" : "count")}:${item.name.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        if (existing.quantity !== null && scaled !== null) existing.quantity += scaled;
        if (!existing.dishes.includes(dish.title)) existing.dishes.push(dish.title);
      } else
        map.set(key, { key, name: item.name, quantity: scaled, unit: item.unit, display: raw.trim(), category: groceryCategory(item.name, item.unit), dishes: [dish.title] });
    }
  return [...map.values()]
    .map((item) => ({ ...item, display: item.quantity === null ? item.name : display(item.quantity, item.unit, item.name) }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}
