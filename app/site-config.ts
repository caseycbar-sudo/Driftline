import type { Metadata } from "next";

/** Public contact details shown on the site. */
export const CONTACT_EMAIL = "driftlineprovisions@gmail.com";

/** The one public address Google should treat as the site (driftlineprovisions.com forwards here). */
export const SITE_ORIGIN = "https://www.driftlineprovisions.com";

/** Public pages, in the order they appear in the sitemap. */
export const PUBLIC_PATHS = [
  "/",
  "/private-chef",
  "/catering",
  "/meal-prep",
  "/sunday-market",
  "/our-story",
  "/contact",
  "/cookbook",
  "/disclosures",
] as const;

/** Title, description, canonical address and share preview for a public page. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: "Driftline Provisions", type: "website", images: ["/og.jpg"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  };
}

/** For accounts, staff screens and sign-in: keep them out of search results. */
export const PRIVATE_PAGE: Metadata = { robots: { index: false, follow: false } };

/** The 640px-wide version of a photo, for cards and thumbnails. */
export function smallImage(src: string): string {
  return /\.webp$/.test(src) && (src.startsWith("/gallery/") || src.startsWith("/cookbook/")) ? src.replace(/\.webp$/, "-sm.webp") : src;
}
