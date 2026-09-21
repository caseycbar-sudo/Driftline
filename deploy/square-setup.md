# Square setup (Driftline Provisions)

Square account: Driftline Provisions. Developer app: "Driftline Website"
(developer.squareup.com/apps → Credentials).

## Sandbox (test mode, no real money)
- SQUARE_ENVIRONMENT = sandbox
- SQUARE_APPLICATION_ID = sandbox-sq0idb-SND6IUgPknrN4zIW83j0iQ
- SQUARE_LOCATION_ID = LM6T79RAPCZX7   (Default Test Account, Main)
- SQUARE_ACCESS_TOKEN = secret, paste straight into Cloudflare (never in chat or git)
- SQUARE_WEBHOOK_SIGNATURE_KEY = secret, created with the webhook subscription

## Webhook subscription (after the site is live)
- Notification URL: https://www.driftlineprovisions.com/api/billing/webhook
  (must match SITE_URL exactly, including www)
- Events: payment.updated
- API version: 2025-01-23

## Going live
Switch the Developer Console toggle to Production, repeat the same four values from
the Production tab, and set SQUARE_ENVIRONMENT = production.

## Domain notes (from Cloudflare import, Sep 20 2026)
Registrar/DNS before the move: Squarespace.
Imported records: 4 A (198.49.23.144/145, 198.185.159.144/145 — Squarespace),
CNAME www -> ext-sq.squarespace.com, CNAME _domainconnect -> squarespace,
TXT SPF "v=spf1 -all", TXT _dmarc "p=reject", TXT _domainkey (empty DKIM).
No MX records: Casey uses Gmail, not @driftlineprovisions.com email.

The SPF record says "no mail comes from this domain", and DMARC is p=reject.
So when Resend is set up, either send from a subdomain Resend gives DNS for
(send.driftlineprovisions.com) and add its SPF/DKIM records, or keep the
from-address on a Resend-verified domain. Otherwise site email lands in spam.

Cloudflare nameservers for this zone:
  andronicus.ns.cloudflare.com
  liberty.ns.cloudflare.com

Cutover: A/CNAME records still point at Squarespace, so the old site keeps
serving until the Worker route is switched over.
