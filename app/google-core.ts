/** Pure checks on a Google ID token's claims (no network), so they can be unit tested. */
export type GoogleClaims = { email: string; email_verified: boolean; aud: string; iss: string; exp: number; nonce?: string; name?: string };

function decodePart(part: string): unknown {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** The claims if the token is for us, from Google, unexpired, verified, with our nonce; otherwise null. */
export function readGoogleIdToken(token: unknown, expect: { clientId: string; nonce: string; now?: number }): GoogleClaims | null {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let claims: GoogleClaims;
  try {
    claims = decodePart(parts[1]) as GoogleClaims;
  } catch {
    return null;
  }
  const now = Math.floor((expect.now ?? Date.now()) / 1000);
  if (claims.aud !== expect.clientId) return null;
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") return null;
  if (!claims.exp || claims.exp < now) return null;
  if (claims.nonce !== expect.nonce) return null;
  if (claims.email_verified !== true || typeof claims.email !== "string") return null;
  return claims;
}
