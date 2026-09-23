import type { Metadata } from "next";
import Link from "next/link";
import PageCanvas from "../PageCanvas";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import LegalSections from "../legal/LegalSections";
import { LEGAL_UPDATED, privacySections } from "../legal/content";
import { CONTACT_EMAIL, pageMetadata } from "../site-config";
import "../home.css";
import "../disclosures/disclosures.css";

export const metadata: Metadata = pageMetadata(
  "/privacy",
  "Privacy · Driftline Provisions",
  "What Driftline Provisions collects when it cooks for you, who else sees it, and how to have it deleted.",
);

export default function Privacy() {
  return (
    <>
      <PageCanvas src="/canvas/questions.webp" />
      <main className="legal-page">
        <SiteHeader label="Privacy" />
        <header>
          <span>Last updated {LEGAL_UPDATED}</span>
        </header>
        <section>
          <p>PRIVACY</p>
          <h1>We come into your kitchen. Here&apos;s what we keep.</h1>
          <LegalSections
            title="What we hold, and why"
            intro="Cooking in someone's home means knowing things about them: the gate code, the nut allergy, what the oven does. This is the whole list, in plain words."
            items={privacySections}
          />
          <footer>
            <p>
              Questions, or want your information sent to you or deleted?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <Link href="/terms">Read the terms of service →</Link>
          </footer>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}
