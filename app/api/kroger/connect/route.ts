import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { flowCookie, safeRelativeReturnPath, shouldUseSecureCookie } from "../../../auth-core";
import { saveChallenge } from "../../../../db/auth";
import { siteOrigin } from "../../../notify";
import { krogerApi, krogerConfig } from "../../../kroger";
import { KROGER_SCOPES } from "../../../kroger-core";

export const dynamic = "force-dynamic";

/** "Link Fred Meyer": send the staff member to sign in to their Fred Meyer account. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeRelativeReturnPath(url.searchParams.get("return_to") || "/portal");
  const user = await requireStaffRole();
  const config = krogerConfig();
  if (!user || !config) return NextResponse.redirect(new URL(returnTo, url.origin), 303);
  const state = await saveChallenge({ challenge: "kroger", purpose: "kroger", email: user.email, returnTo });
  const to = new URL(`${krogerApi()}/connect/oauth2/authorize`);
  to.searchParams.set("scope", KROGER_SCOPES);
  to.searchParams.set("response_type", "code");
  to.searchParams.set("client_id", config.clientId);
  to.searchParams.set("redirect_uri", `${siteOrigin(request.url)}/api/kroger/callback`);
  to.searchParams.set("state", state);
  const response = NextResponse.redirect(to.toString(), 303);
  response.headers.append("Set-Cookie", flowCookie(state, shouldUseSecureCookie(request.url)));
  return response;
}
