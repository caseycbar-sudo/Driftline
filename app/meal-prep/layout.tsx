import type { Metadata } from "next";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "/meal-prep",
  "Weekly In-Home Meal Prep · Driftline Provisions · Astoria, Oregon",
  "A trusted local chef shops, cooks, portions, labels, and cleans up in your own kitchen, leaving a week of good meals in your refrigerator. Serving Astoria to Cannon Beach.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
