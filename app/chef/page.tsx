import Link from "next/link";
import {
  getChatGPTUser,
  chatGPTSignInPath,
  chatGPTSignOutPath,
} from "../chatgpt-auth";
import { getStaff } from "../../db/staff";
import { redirect } from "next/navigation";
import "./chef-login.css";
import BrandLogo from "../BrandLogo";
export const dynamic = "force-dynamic";
export default async function ChefLogin() {
  const user = await getChatGPTUser();
  if (user) {
    const staff = await getStaff(user.email);
    if (
      staff?.status === "active" &&
      (staff.role === "chef" || staff.role === "admin")
    )
      if (staff.role === "chef") redirect("/chef/workspace");
      redirect("/portal");
    return (
      <Shell>
        <div className="chef-login-status">
          <span>ACCESS PENDING</span>
          <h1>This account is not ready for the chef workspace.</h1>
          <p>
            You are signed in as <b>{user.email}</b>, but that exact email has
            not been approved as an active chef.
          </p>
          <ol>
            <li>
              Ask a Driftline administrator to open <b>People</b> in the Admin
              workspace.
            </li>
            <li>
              The administrator adds this exact email and selects the{" "}
              <b>Chef</b> role.
            </li>
            <li>Return here and sign in again to open your schedule.</li>
          </ol>
          <div>
            <a
              className="chef-login-primary"
              href={chatGPTSignOutPath("/chef")}
            >
              Use a different account
            </a>
            <Link href="/">Return home</Link>
          </div>
        </div>
      </Shell>
    );
  }
  return (
    <Shell>
      <div className="chef-login-card">
        <span>DRIFTLINE CHEF WORKSPACE</span>
        <h1>Your workday starts here.</h1>
        <p>
          Sign in with the same email that Driftline approved for your chef
          profile.
        </p>
        <a className="chef-login-primary" href={chatGPTSignInPath("/chef")}>
          Sign in as a chef →
        </a>
        <div className="chef-login-steps">
          <article>
            <b>1</b>
            <span>
              <strong>Get approved</strong>
              <small>An admin adds your exact email under People.</small>
            </span>
          </article>
          <article>
            <b>2</b>
            <span>
              <strong>Sign in here</strong>
              <small>
                Your account automatically opens the correct workspace.
              </small>
            </span>
          </article>
          <article>
            <b>3</b>
            <span>
              <strong>See your jobs</strong>
              <small>
                View dishes, ingredients, timecards, photos, and earnings.
              </small>
            </span>
          </article>
        </div>
        <small>
          Customers should use the <Link href="/account">customer account</Link>{" "}
          instead.
        </small>
      </div>
    </Shell>
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="chef-login">
      <header>
        <Link href="/">
          <BrandLogo />
        </Link>
        <Link href="/">Customer website</Link>
      </header>
      <section>{children}</section>
    </main>
  );
}
