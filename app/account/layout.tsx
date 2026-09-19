import type { Metadata } from "next";
import { PRIVATE_PAGE } from "../site-config";

export const metadata: Metadata = PRIVATE_PAGE;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
