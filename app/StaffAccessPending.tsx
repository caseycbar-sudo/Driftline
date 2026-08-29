import Link from "next/link";

import { chatGPTSignOutPath } from "./chatgpt-auth";

/**
 * Shown to a signed-in identity that is not active staff.
 *
 * Deliberately says nothing about whether the address exists in the staff
 * table, what role it holds, or why it was refused -- a staff-only page should
 * not double as a directory lookup for anyone who can sign in.
 */
export default function StaffAccessPending({
  email,
  workspace,
}: {
  email: string;
  workspace: "admin" | "chef";
}) {
  const label = workspace === "admin" ? "staff portal" : "chef workspace";

  return (
    <main className="access-denied">
      <section>
        <small>DRIFTLINE AT HOME</small>
        <h1>Staff access required</h1>
        <p>
          You are signed in as <b>{email}</b>. That account is not approved for
          the Driftline {label}.
        </p>
        <p>
          If you should have access, ask a Driftline administrator to add this
          exact email under <b>People</b> in the admin workspace.
        </p>
        <div>
          <Link href="/account">Return to customer account</Link>
          <a href={chatGPTSignOutPath("/")}>Use a different account</a>
        </div>
      </section>
    </main>
  );
}
