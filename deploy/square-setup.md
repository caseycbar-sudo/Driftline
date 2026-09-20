# Square setup (Driftline Provisions)

Square account: Driftline Provisions. Developer app: "Driftline Website"
(developer.squareup.com/apps → Credentials).

## Sandbox (test mode, no real money)
- SQUARE_ENVIRONMENT = sandbox
- SQUARE_APPLICATION_ID = sandbox-sq0idb-SND6IUgPknrN4zIW83j0iQ
- SQUARE_LOCATION_ID = (pending — Developer Console → Locations)
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
