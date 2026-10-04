/**
 * Rules for what goes on a container label, kept free of React so they can be tested.
 * The label is a 3 x 2 inch sticker: only what the customer needs, nothing about how the chef cooked it.
 */

/** Used only when a dish has no reheating directions of its own. */
export const DEFAULT_REHEAT = "Microwave covered until steaming hot, stirring halfway, until it reaches 165°F throughout. Do not reheat more than once.";

export const LABEL_SAFETY_LINE = "Reheat to 165°F (74°C) before eating. Do not eat after the use-by date.";

/** Longest reheating text that still fits a 3 x 2 inch label at the smallest readable size. */
export const MAX_REHEAT_CHARS = 420;

export const reheatText = (text: string) => text.replace(/\s+/g, " ").trim() || DEFAULT_REHEAT;

/** Font size in points for the reheating directions, so longer directions shrink instead of being cut off. */
export function reheatFontPt(text: string): number {
  const n = reheatText(text).length;
  if (n <= 200) return 6.6;
  if (n <= 300) return 6.1;
  if (n <= 380) return 5.7;
  return 5.4;
}

export const reheatTooLong = (text: string) => reheatText(text).length > MAX_REHEAT_CHARS;

export function allergenLine(allergens: string[], known: boolean | undefined): string {
  if (known === false) return "Not checked. Ask before eating if you have an allergy.";
  return allergens.length ? allergens.join(", ") : "None of the major allergens listed";
}
