import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import SignInForm from "./SignInForm";
import { getUser, safeRelativeReturnPath } from "../auth";
import "../home.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in · Driftline Provisions",
  description: "Sign in to your Driftline account with a secure email link.",
  robots: { index: false },
};

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(typeof params.return_to === "string" ? params.return_to : "/account");
  if (await getUser()) redirect(returnTo);
  const expired = params.expired === "1";
  const forStaff = returnTo.startsWith("/chef") || returnTo.startsWith("/portal");

  return (
    <main className="dp">
      <SiteHeader />
      <section className="dp-signin-page">
        <div className="dp-signin-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> {forStaff ? "Driftline team" : "Your Driftline account"}
          </p>
          <h1>
            Sign in <em>with your email.</em>
          </h1>
          <p className="dp-lede">
            {forStaff
              ? "Use the email address Casey approved for your chef or owner profile. We'll send you a one-time link."
              : "Save your household details, pick dishes from the cookbook, and see photos after every visit."}
          </p>
        </div>
        <div className="dp-request-form dp-signin-card">
          {expired ? (
            <p className="dp-signin-error" role="alert">
              That sign-in link has expired or was already used. Enter your email for a fresh one.
            </p>
          ) : null}
          <SignInForm
            returnTo={returnTo}
            initialSent={params.sent === "1"}
            initialError={typeof params.error === "string" ? params.error : ""}
          />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
