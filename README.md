# Driftline Provisions

The website, customer accounts, chef app and owner dashboard for Driftline
Provisions. Runs on [vinext](https://github.com/cloudflare/vinext) as a
Cloudflare Worker with D1 (database) and R2 (photos).

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout`

## Sites Lifecycle

The Sites lifecycle CLI runs the locked dependency install before returning this checkout. Edit the source under `app/`, then checkpoint when a coherent milestone is ready to inspect or share. The remote Sites builder runs `npm run build` against the pushed commit. Do not repeat install or build as a normal pre-checkpoint step.

This starter does not use `wrangler.jsonc`.

`install:ci` is intentionally a single, non-retrying `npm ci`. It refuses a concurrent install for the same project, consumes a matching image-seeded npm cache with `--prefer-offline` while retaining registry fallback for a missing cache object, otherwise downloads and verifies the complete vinext tarball recorded in `package-lock.json`, limits npm to one socket, and terminates a stalled install. `build` applies a short timeout. These helpers target Linux and use GNU `timeout`; they are not native macOS scripts.

Scripts that need writable project-scoped home, npm, XDG, and temporary paths use `scripts/sites-env.sh`. The `dev` and `start` scripts honor the caller's runtime environment and keep Wrangler logs inside the checkout. The generated `.sites-runtime/` directory is disposable and ignored by Git.

## Included Shape

- public site pages under `app/` (home, private chef, catering, meal prep, Sunday Market, story, contact, cookbook)
- customer account (`/account`), chef app (`/chef`) and owner dashboard (`/portal`)
- `app/auth.ts` + `app/auth-core.ts` + `db/auth.ts`: Driftline's own email sign-in
- `db/schema.ts` and `drizzle/`: D1 tables and migrations
- `vite.config.ts` simulates the D1 and R2 bindings for local development

## Sign-in

Customers, chefs and the owner all sign in the same way: enter an email address
at `/signin`, get a one-time link, tap it.

- `getUser()` returns the signed-in person (or `null`); `requireUser(returnTo)`
  sends signed-out visitors to `/signin` and back afterwards.
- `signInPath(returnTo)` / `signOutPath(returnTo)` build links. Only same-site
  relative paths are accepted as `returnTo`; anything else becomes `/`.
- Links last 15 minutes and work once. Opening a link shows a **Continue**
  button that POSTs the token, so email scanners that pre-open links can't use
  them up. Signing in retires any other open links for that address.
- Sessions last 30 days in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie
  (`dl_session`). Only SHA-256 hashes of link tokens and session ids are stored.
- Limits: 5 links per email and 20 per network (IPv6 grouped by /64) per hour.
  Requests and sign-ins posted from another website are refused.
- The form answers the same way whether or not an account exists.

Signing in proves someone controls an email address; it grants no role by
itself. Chef and owner access comes from an active row in `staff_profiles`,
managed from the owner dashboard. `BOOTSTRAP_ADMIN_EMAIL` makes that one address
the first owner **only while `staff_profiles` is empty**. Set it for the first
launch, sign in once, then remove it.

Sign-in email goes through the same Resend settings as request alerts (below).
Set `SITE_URL` in production so links always point at the real domain; without
it, links use `https://www.driftlineprovisions.com` (or the local address when
running on localhost).

## Local Development Sign-In

Locally you can use the real flow: leave `VITE_DEV_AUTH_EMAIL` blank, point
`RESEND_API_URL` at a mock mail server, and read the link from its log.

For quick work on staff screens there is a development shortcut:

```bash
cp .env.example .env.local
# edit .env.local — a placeholder address such as dev@example.com is fine
npm run dev
```

`VITE_DEV_AUTH_EMAIL` signs you in as that address with no email step.
`VITE_DEV_AUTH_FULL_NAME` is optional. Staff and owner routes still require a
matching `staff_profiles` row; a development identity alone grants no role.

### Safety boundary

The shortcut lives in `app/dev-auth.ts` and never ships:

- `app/auth.ts` imports it only inside `if (import.meta.env.DEV)`. Vite
  replaces that with `false` when building, so the module is not in the
  production bundle.
- `app/dev-auth.ts` also throws if it is ever loaded outside development.
- It never reads request headers, so nothing a visitor sends affects identity.

`npm test` checks that the shortcut is absent from `dist/server/index.js` and
that a built worker redirects `/account` to `/signin`.

Never put a real customer or staff email address in `.env.local`. `.env*` is
gitignored apart from the placeholder `.env.example`.

## Website requests and email alerts

Every form on the public site (Private Chef, Catering, and the meal-prep
availability form) posts to `/api/inquiries`. Each request is saved to D1
(`private_chef_inquiries`, with an `inquiry_type` column) and shows up in the
admin portal under **Requests**.

When a request comes in, the owner gets an email alert and the customer gets a
short confirmation, sent through [Resend](https://resend.com). Set these on the
Worker (use secrets for the key):

| Variable | Example | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_...` | Resend API key (secret) |
| `NOTIFY_EMAIL` | `driftlineprovisions@gmail.com` | Where alerts go; comma-separate for several |
| `FROM_EMAIL` | `Driftline Provisions <hello@driftlineprovisions.com>` | Sender; the domain must be verified in Resend |
| `SITE_URL` | `https://www.driftlineprovisions.com` | Public address used in sign-in links and the "Open in admin" link |
| `BOOTSTRAP_ADMIN_EMAIL` | `driftlineprovisions@gmail.com` | First owner account; remove after first sign-in |

If email isn't configured, requests are still saved; the admin screen flags
any request that didn't trigger an alert. Spam protection is a hidden
honeypot field plus hourly limits per address and per email.

## Diagnostic Commands

- `npm run install:ci`: perform the one bounded lockfile install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: start the built Vinext application
- `npm test`: build, then run the suite in `tests/` against the built worker
- `npm run db:generate`: generate Drizzle migrations after schema changes

Use build commands for targeted diagnosis after a remote failure, not as part of the normal checkpoint path.

The timeout defaults can be overridden for a controlled canary with `SITES_INSTALL_TIMEOUT`, `SITES_INSTALL_KILL_AFTER`, `SITES_BUILD_TIMEOUT`, and `SITES_BUILD_KILL_AFTER`. A timeout fails the command; the helpers never retry an unchanged install or build.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
