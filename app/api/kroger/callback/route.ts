import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { flowCookie, safeRelativeReturnPath, shouldUseSecureCookie } from "../../../auth-core";
import { takeChallenge } from "../../../../db/auth";
import { siteOrigin } from "../../../notify";
import { readFlowCookie } from "../../../auth-session";
import { exchangeCode, saveAccountTokens } from "../../../kroger";

export const dynamic = "force-dynamic";

/** Fred Meyer sends the staff member back here after they approve Driftline. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const flow = readFlowCookie(request);
  const user = await requireStaffRole();
  const back = (path: string, result: string) => {
    const to = new URL(safeRelativeReturnPath(path), url.origin);
    to.searchParams.set("fredmeyer", result);
    const response = NextResponse.redirect(to, 303);
    response.headers.append("Set-Cookie", flowCookie("", shouldUseSecureCookie(request.url), 0));
    return response;
  };
  if (!user || !code || !flow || flow !== state) return back("/portal", "failed");
  const challenge = await takeChallenge(flow, "kroger");
  if (!challenge || challenge.email !== user.email) return back("/portal", "failed");
  try {
    const tokens = await exchangeCode(code, `${siteOrigin(request.url)}/api/kroger/callback`);
    await saveAccountTokens(user.email, tokens);
    return back(challenge.returnTo, "linked");
  } catch (error) {
    console.error("[kroger] link failed", error);
    return back(challenge.returnTo, "failed");
  }
}
