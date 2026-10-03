import { smallImage } from "../site-config";

type WithImage = { side: string; image: string };

/** `count` meal prep dish photos, spread across the menu; repeats if the menu has fewer, so the mosaic always fills the screen. */
export function backdropImages(cookbook: WithImage[], count = 42): string[] {
  const pics = cookbook.filter((r) => r.side === "meal-prep" && r.image).map((r) => smallImage(r.image));
  if (!pics.length) return [];
  const out: string[] = [];
  const step = Math.max(1, Math.floor(pics.length / count));
  for (let i = 0; out.length < count; i++) out.push(pics[(i * step + Math.floor(i / pics.length)) % pics.length]);
  return out;
}
