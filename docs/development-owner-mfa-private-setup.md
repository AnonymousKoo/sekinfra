# Private DEVELOPMENT owner MFA screen — review-only

**Source boundary:** `AnonymousKoo/sekinfra` — the existing Next.js Command
Center is deployed separately as Vercel project
`sekinfra-command-center` (`prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`).
The public website is the separate `sekinfra-website` project
(`prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN`). Both use one repository.

**Shared identity project:** Supabase **DEVELOPMENT AUTH**
`pwlhruwutoitnieactol`. Never redirect to, read, or mutate
**DEVELOPMENT DATA** `gnuqaefotwgkwurjpyik` or production for this flow.

This PR is a **review-only disabled-by-default private client UI** for the
existing Supabase AUTH GoTrue REST TOTP APIs. It is not a new identity provider,
tenant authorization system, credential issuer, customer signup, API server,
or vertical-specific auth infrastructure. No secrets, user IDs, passwords,
sessions, invitations, MFA factors, or customer records were modified by the
repository work. Existing public Sekinfra intake remains HTTP 503.

## Verified initial account state (read-only, October 12, 2026)

The invited, real candidate owner account was confirmed via a scoped
provider read (the email string is deliberately not repeated in CI evidence):
one matching account, **email confirmed**, **has signed in**, exactly one
AUTH session at the time of inspection, no existing tenant binding,
no verified or unverified MFA factors. This state changes as enrollment
proceeds; validate afresh before claiming readiness.

## Existing deployment boundary

The new route `/owner-enrollment` is available only when all checks pass:

1. The **dedicated Command Center Vercel project** has its exact
   server-only `SEKINFRA_DEPLOYMENT_ROLE=private-operator` marker.
2. The new server-only `SEKINFRA_DEV_OWNER_MFA_ENABLED=true` opt-in is
   present on **that project and approved environment only**, after
   independently reviewing Cloudflare Access and direct-origin behavior.
   It is **not set by this PR**. Without it the route responds 404.
3. Existing `authorizeOperator` independently validates the signed
   Cloudflare Access JWT, issuer/audience/expiration, exact configured
   owner email, and Host `dashboard.sekinfra.com`. A Vercel alias,
   public website, spoofed email header, or missing signature fails 404.
4. The server-only `SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY` is a well-formed
   **Supabase DEVELOPMENT AUTH publishable key**, not `service_role`,
   `sb_secret_...`, admin credential, DATA project key, or bypass key.
   No `NEXT_PUBLIC_` variable or committed real key is added. This
   public-safe key is passed only to the already-authorized browser
   enrollment UI. Validate key/project pairing separately before enabling.

**Do not set any of these values on the public Vercel project**.
Cloudflare Access is an operator-network perimeter, not Avuhz tenant or
business-ownership proof. Changing Vercel/Cloudflare configuration is a
**separate environment-bound provider change** requiring explicit approval.

## UI flow

1. Access the signed-operator `https://dashboard.sekinfra.com/owner-enrollment`
   page **only after** authorized private-host activation. No claim is made
   that this route is reachable on the current live origin.
2. Enter the existing confirmed owner account password. No new account
   is created. The browser sends it directly to DEVELOPMENT AUTH
   `/auth/v1/token?grant_type=password` using the project publishable
   key. Tokens exist in memory only. Supabase AUTH `/user` must return
   the exact Cloudflare-verified email, a confirmed human user, and **no
   existing Avuhz tenant/workload binding** before MFA can begin.
3. Confirm setup separately. GoTrue `POST /auth/v1/factors` starts
   TOTP enrollment. Scan the controlled data-image QR code or manually
   type the temporary secret into an authenticator app. Untrusted SVG,
   external URLs, scripts and auth secrets are not accepted as markup.
   A verified existing TOTP factor triggers a challenge instead of
   duplicating enrollment. An unverified lingering factor fails closed.
4. Submit the current six-digit TOTP code. GoTrue challenge/verify APIs
   must return a new session token. A second `/user` check confirms the
   same subject, same configured email and the newly verified factor.
   The UI then clears the access token and setup secret; no tenant,
   business, data, or Avuhz API authority is granted by this event.
5. Independently recheck **AUTH** verified factors and session AAL2
   via a secure read-only provider query. A UI success message is
   **not** proof of signed recent TOTP or active session in Avuhz.
   The already-merged Avuhz owner verifier must remain fail-closed
   until separately approved row-scoped AUTH policies/column grants
   and a protected session reader are installed.

### Important prerequisites and restrictions

- The account is **already created and confirmed**. Do not invite it a
  second time or convert tenant-bound synthetic AUTH identities.
- The screen's first sign-in currently requires a password. If the
  original invitation was accepted without establishing one, stop:
  independently design/review the existing Supabase AUTH password reset
  process without sending credentials or recovery links into chat.
- MFA enrollment itself adds a factor record. A failed or interrupted
  setup may leave an unverified factor. This UI intentionally does not
  auto-delete factors or retry destructive operations; recovery needs a
  separately reviewed authorized operation.
- No analytics, cookie session store, persistent browser tokens, proxy
  credential relay, console/provider-payload logging, direct DATA access,
  server-stored TOTP secret or customer data insertion.
- This page has no AUTH-provider administrative privilege. Password,
  bearer, secret, TOTP code, QR data, and error response must never be
  pasted into CI, GitHub issues, chat, or logs.
- A fresh owner/business-directory verification and an independently
  authorized DEVELOPMENT DATA registration/activation are still required.
  The OIA assessment/n8n receiver and hosted acquisition runtime remain
  disconnected. Production intake is disabled.

## Verification and next action

GitHub CI must run offline transport denial tests, existing Command
Center Access/Host/proxy tests, Next.js strict typechecking, ESLint and
a no-credential build. Provider contact is not part of CI.

**Next action:** Review and merge only if CI passes. Then verify the
actual Cloudflare Access application, private Vercel project/env and
password sign-in readiness. Request one explicit DEVELOPMENT private
environment enablement approval separately; do not deploy or switch
Cloudflare DNS/tunnel, public site, or production traffic in this task.
