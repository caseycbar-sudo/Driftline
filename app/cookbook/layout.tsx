import type { Metadata } from "next";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "/cookbook",
  "The Driftline Cookbook · Meal Prep & Private Chef Menus",
  "Browse the dishes Chef Casey Barella cooks for weekly meal prep and private dinners on the Oregon coast, with ingredients, allergens, and reheating notes.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
