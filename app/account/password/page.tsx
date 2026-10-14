import type { Metadata } from "next";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import PasswordForm from "./PasswordForm";
import { requireUser } from "../../auth";
import "../../home.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Password · Driftline Provisions",
  description: "Set or change the password for your Driftline account.",
  robots: { index: false },
};

export default async function PasswordPage() {
  const user = await requireUser("/account/password");
  return (
    <main className="dp">
      <SiteHeader />
      <section className="dp-signin-page">
        <div className="dp-signin-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Your sign-in
          </p>
          <h1>
            Your <em>password.</em>
          </h1>
          <p className="dp-lede">
            Add a password if you would rather type one than wait for an email code. The email code always still works, and it is how you reset a forgotten password.
          </p>
        </div>
        <div className="dp-request-form dp-signin-card">
          <PasswordForm email={user.email} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
