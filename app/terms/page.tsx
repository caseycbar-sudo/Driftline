import type { Metadata } from "next";
import Link from "next/link";
import PageCanvas from "../PageCanvas";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import LegalSections from "../legal/LegalSections";
import { LEGAL_UPDATED, termsSections } from "../legal/content";
import { CONTACT_EMAIL, pageMetadata } from "../site-config";
import "../home.css";
import "../disclosures/disclosures.css";

export const metadata: Metadata = pageMetadata(
  "/terms",
  "Terms of Service · Driftline Provisions",
  "Booking, pricing, groceries, cancellations, allergies and food safety for Driftline Provisions' private chef, catering and meal prep services.",
);

export default function Terms() {
  return (
    <>
      <PageCanvas src="/canvas/contact.webp" />
      <main className="legal-page">
        <SiteHeader label="Terms" />
        <header>
          <span>Last updated {LEGAL_UPDATED}</span>
        </header>
        <section>
          <p>TERMS OF SERVICE</p>
          <h1>What you can expect, and what we ask.</h1>
          <LegalSections
            title="The agreement between us"
            intro="Written to be read, not to be survived. If your written proposal says something different from this page, your proposal is the one that counts."
            items={termsSections}
          />
          <footer>
            <p>
              Anything here you want explained? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <Link href="/privacy">Read the privacy policy →</Link>
          </footer>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}
