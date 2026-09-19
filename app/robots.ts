import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "./site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/chef", "/portal", "/signin", "/signout", "/auth/", "/api/"] },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
