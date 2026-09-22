import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { requireStaffRole } from "../../../staff-auth";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "private, no-store" };
const SQUARE_VERSION = "2025-01-23";

type Location = {
  id: string;
  name?: string;
  business_name?: string;
  status?: string;
  currency?: string;
  country?: string;
  capabilities?: string[];
  address?: { address_line_1?: string; locality?: string; administrative_district_level_1?: string };
};

/**
 * Whose Square account does our access token belong to?
 *
 * Asks Square to list the locations the token can see. That answers the only
 * question that matters before taking real cards -- money follows the token, so
 * if the business name and address here are Casey's, payments land in Casey's
 * account. It also hands back the location id, which saves copying it by hand,
 * and says whether the token is a production or a sandbox one.
 *
 * Read-only: it lists locations and nothing else. The token itself never leaves
 * the Worker.
 */
async function listLocations(base: string, token: string) {
  const response = await fetch(`${base}/v2/locations`, {
    headers: { authorization: `Bearer ${token}`, "square-version": SQUARE_VERSION },
    signal: AbortSignal.timeout(15000),
  });
  const json = (await response.json().catch(() => ({}))) as { locations?: Location[]; errors?: { detail?: string }[] };
  return { status: response.status, json };
}

export async function GET() {
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const token = ((env as unknown as { SQUARE_ACCESS_TOKEN?: string }).SQUARE_ACCESS_TOKEN || "").trim();
  if (!token) return NextResponse.json({ ok: false, reason: "No SQUARE_ACCESS_TOKEN is set yet." }, { status: 409, headers });

  // Try the real one first; a sandbox token only works against the sandbox host.
  for (const [environment, base] of [
    ["production", "https://connect.squareup.com"],
    ["sandbox", "https://connect.squareupsandbox.com"],
  ] as const) {
    const { status, json } = await listLocations(base, token);
    if (status === 401 || status === 403) continue;
    if (json.locations?.length) {
      return NextResponse.json(
        {
          ok: true,
          environment,
          warning: environment === "sandbox" ? "This is a TEST token. No real money will move." : null,
          locations: json.locations.map((l) => ({
            id: l.id,
            name: l.name ?? "",
            businessName: l.business_name ?? "",
            status: l.status ?? "",
            currency: l.currency ?? "",
            canTakeCards: (l.capabilities ?? []).includes("CREDIT_CARD_PROCESSING"),
            where: [l.address?.address_line_1, l.address?.locality, l.address?.administrative_district_level_1]
              .filter(Boolean)
              .join(", "),
          })),
        },
        { headers },
      );
    }
    return NextResponse.json(
      { ok: false, environment, reason: json.errors?.[0]?.detail ?? `Square answered ${status} with no locations.` },
      { status: 502, headers },
    );
  }
  return NextResponse.json(
    { ok: false, reason: "Square rejected the token. Check it was copied from the Production tab, with no spaces." },
    { status: 401, headers },
  );
}
