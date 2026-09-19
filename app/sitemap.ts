import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE_ORIGIN } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_ORIGIN}${path === "/" ? "" : path}`,
    changeFrequency: path === "/sunday-market" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/disclosures" ? 0.3 : 0.8,
  }));
}
