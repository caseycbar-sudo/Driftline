const UNITS = "cups?|tbsp|tsp|tablespoons?|teaspoons?|lbs?|pounds?|oz|ounces?|g|kg|ml|l|cloves?|cans?|stalks?|bunch(?:es)?|sprigs?|pinch(?:es)?|slices?|large|medium|small|heads?|pieces?|packages?|bags?|jars?";

/** "2 large yellow onions, finely diced" becomes "yellow onions", so customers see what is in a dish and not a chef's shopping amounts. */
export function ingredientName(line: string): string {
  let text = line.replace(/\([^)]*\)/g, " ").split(",")[0].split(/ and \d/)[0];
  text = text.replace(/^[\d\s¼½¾⅓⅔⅛⅜⅝⅞/.\-]+/, "");
  for (let i = 0; i < 3; i++) text = text.replace(new RegExp(`^(?:${UNITS})\\b\\.?\\s*(?:of\\s+)?`, "i"), "");
  text = text.replace(/\s+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : line.trim();
}

export function ingredientNames(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const name = ingredientName(line);
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}
