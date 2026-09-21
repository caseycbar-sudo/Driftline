import type { Metadata } from "next";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import { looksLikeToken } from "../../auth-core";
import "../../home.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Finish signing in · Driftline Provisions",
  description: "Finish signing in to Driftline Provisions.",
  robots: { index: false },
  // same-origin: the token in this URL is never sent to other sites, but the site's own
  // form POST still carries a normal Origin header (no-referrer makes Safari send "null").
  referrer: "same-origin",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

/**
 * Landing page for the emailed link. Opening it does nothing by itself; the person
 * taps Continue, which POSTs the token. Email scanners that pre-open links therefore
 * can't use up the one-time link.
 */
export default async function VerifyPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const token = typeof params.token === "string" && looksLikeToken(params.token) ? params.token : "";

  return (
    <main className="dp">
      <SiteHeader />
      <section className="dp-signin-page">
        <div className="dp-signin-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Almost there
          </p>
          <h1>
            Finish <em>signing in.</em>
          </h1>
        </div>
        <div className="dp-request-form dp-signin-card">
          {token ? (
            <form method="post" action="/api/auth/verify">
              <input type="hidden" name="token" value={token} />
              <p>Tap below to sign in to your Driftline account on this device.</p>
              <button>
                Continue to Driftline <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : (
            <div>
              <p className="dp-signin-error" role="alert">
                This sign-in link isn&apos;t valid. It may have been cut off when copying.
              </p>
              <a className="dp-btn dp-btn-gold" href="/signin">
                Get a new link
              </a>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
