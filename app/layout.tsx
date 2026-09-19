import type { Metadata } from "next";
import "./globals.css";
import "./brand-refresh.css";

export const metadata: Metadata = {
  title: "Driftline Provisions",
  description: "Private chef dinners, catering, and weekly in-home meal prep on Oregon's North Coast.",
  openGraph: { title: "Driftline At Home", description: "Your kitchen. A trusted local chef. A week of meals.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Driftline At Home", description: "Your kitchen. A trusted local chef. A week of meals.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
