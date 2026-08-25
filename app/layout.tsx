import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Driftline At Home",
  description: "Trusted local chefs prepare a week of fresh meals right in your home kitchen across Oregon's North Coast.",
  openGraph: { title: "Driftline At Home", description: "Your kitchen. A trusted local chef. A week of meals.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Driftline At Home", description: "Your kitchen. A trusted local chef. A week of meals.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
