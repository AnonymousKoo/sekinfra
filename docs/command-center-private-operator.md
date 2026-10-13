# Sekinfra private Command Center — deployment boundary

## Purpose and current status

The Command Center is a **real, server-guarded operator entry point**, not a demonstration. Its route is `/command-center` in `AnonymousKoo/sekinfra`. It intentionally renders **HTTP 404 by default** until the dedicated private deployment is prepared. The former fictional engagement fixture and non-executing AI-command widget are no longer used by this route.

This document does **not** assert that the private deployment, Cloudflare policy, Avuhz integration, or customer workflows are live. Source-code readiness and provider readiness are separate decisions.

## Exact owner and deployment boundary

- Repository: `AnonymousKoo/sekinfra` (Next.js website).
- Intended private hostname: `dashboard.sekinfra.com`. The hostname is pinned in source; public `sekinfra.com`, `www.sekinfra.com`, Vercel aliases, and unknown hosts fail closed.
- Vercel project `sekinfra-command-center` (`prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`) is independent of the public website project `sekinfra-website` (`prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN`); both build the same Git repository, so the private project must have an explicit routing marker to avoid serving the public homepage on its Vercel URL. Its distinct private deployment marker affects routing only, **not authentication**.
- Current public website deployment must stay untouched while the separately scoped private operator deployment is verified.
- Cloudflare Access is an outer operator perimeter only. Its JWT **does not** confer Avuhz tenant, organization, capability, or approval authority.
- All business access and business mutations remain governed by the **shared Avuhz API**, not by the website, Cloudflare or direct n8n calls.

## Required private server environment (not committed values)

Only configure these on the **separately approved private operator deployment** after verifying its project/environment/hostname. They are server-side variables; do not add `NEXT_PUBLIC_` copies.

| Name | Meaning |
| --- | --- |
| `SEKINFRA_DEPLOYMENT_ROLE` | Exact `private-operator` value, **configured only in the dedicated Vercel Command Center project**, for Preview and Production. Restricts its Vercel alias to the private route; never set this on the public website project. Not a credential or an authentication bypass. |
| `SEKINFRA_COMMAND_CENTER_ENABLED` | Must equal exactly `true` or every request is refused. |
| `SEKINFRA_OPERATOR_HOST` | Must equal exactly `dashboard.sekinfra.com`. The incoming Host must match. |
| `SEKINFRA_ACCESS_TEAM_DOMAIN` | Exact `https://<team>.cloudflareaccess.com` issuer; HTTPS only. |
| `SEKINFRA_ACCESS_AUD` | Exact Cloudflare Access application audience for this private operator app. |
| `SEKINFRA_OPERATOR_EMAIL` | One owner email allowed by the private Cloudflare Access policy; checked against the **signed** JWT email claim. |
| `SEKINFRA_DEV_OWNER_PASSWORD_RECOVERY_ENABLED` | Separate disabled-by-default DEVELOPMENT password recovery pilot flag. Only the private operator deployment may set it to exactly `true` after security review, dedicated redirect allowlist verification and explicit approval. |\n| `SEKINFRA_AVUHZ_READINESS_URL` | Optional approved `https://<hostname>.onrender.com/health/ready` for a no-credential, server-side readiness check. Not an authenticated client-data transport. |

Do not commit the real owner email, tokens, private keys, credentials, provider payloads, or secret values. Cloudflare's issuer/audience are configuration values, not independent proof of authorized deployment. Never register the private operator hostname against the existing public Vercel project without a separate exact plan and direct-origin review.

**Expected behavior before Cloudflare cutover:** `sekinfra-command-center.vercel.app` should no longer display the public Sekinfra site after this routing change deploys. Its root rewrites to `/command-center`, which **still responds 404** without the exact `dashboard.sekinfra.com` hostname and a properly signed Cloudflare Access JWT. Do not set `SEKINFRA_COMMAND_CENTER_ENABLED=true` to try to make the Vercel alias work. The existing Cloudflare Tunnel/DNS/Access remain unchanged until an independently approved cutover.

## Security model implemented in repository code

1. Page is always request-dynamic and returns no personalized body until the server gate passes.
2. Check the enable flag, exact private hostname, issuer domain, Access application audience, and single configured owner.
3. Parse the **CF-Access-Jwt-Assertion** JWT, not an unverified email header. Require RS256, the matching certificate `kid`, issuer, audience, expiration, issue time, optional not-before, subject, and signed owner email.
4. Fetch the issuer's JWKS from its official cert endpoint and cryptographically verify the signature on the server. Fail closed on network failure or signature/claim mismatch.
5. Return 404 for denied requests. Never return the token, claims, cert payload, exception text, or authorization failure details to the browser.
6. Respond with private no-store and no-index policies. No direct browser-side service tokens, Supabase connections, provider credentials, or operator mutations exist in the current Command Center route.
7. The optional Render readiness check runs **after** Access validation, uses a bounded HTTPS host/path and timeout, follows no redirects, sends no credentials, and is marked unavailable rather than inventing health status.

The Cloudflare Access gate does **not** replace defense-in-depth at the Avuhz API, rate-limits, session revocation controls, identity-lifecycle review, production monitoring, or Cloudflare Access application configuration. Direct origin requests must be denied; a valid JWT alone does not create business authority.

## Verification before any future live cutover

- Confirm the **private Vercel project**, deployment environment, approved custom domain, and exact Git SHA. Do not reuse the public website project silently.
- Confirm the **actual Cloudflare Access application and tunnel route** for `dashboard.sekinfra.com`, then separately review domain/origin changes. Keep the existing Lovable origin until the new backend is fully tested.
- Verify without valid JWT: denied. Spoofed `CF-Access-Authenticated-User-Email`: denied. Wrong audience, issuer, signature, expired JWT, non-owner JWT: denied.
- Verify from the direct Vercel origin and public website hostname: denied. Confirm unauthenticated requests make no Avuhz/provider data calls.
- Verify only signed, approved operator traffic on the exact private hostname can render the shell. Compare external probe status independently; do not label a URL's mere presence as healthy.
- Confirm relevant CI gate, immutable reviewed commit, secure environment configuration, logging, incident/rollback path, and explicit production change approval **before** binding/repointing the hostname.

## DEVELOPMENT owner password setup (prepared, NOT activated)

This repository now contains a **disabled-by-default** private `/owner-password-recovery` route and an exact one-owner shared Supabase DEVELOPMENT AUTH browser transport. It is a companion to `/owner-enrollment`, not another authentication service. It does not grant tenant, organization, Avuhz session, MFA or business authority. The same Cloudflare signed-JWT verifier, exact private hostname, owner, private deployment role, valid server-configured publishable key and new separate recovery flag are mandatory. The public Sekinfra website and direct Vercel aliases fail closed; the private project's proxy allows this one exact pathname only.

Before enabling anything, obtain a separate owner approval for **exactly one DEVELOPMENT AUTH URL configuration change** in Supabase project `pwlhruwutoitnieactol` (not DATA `gnuqaefotwgkwurjpyik`): add only `https://dashboard.sekinfra.com/owner-password-recovery` to the Redirect URLs allowlist. Preserve the existing Site URL and other providers. Do not use the Supabase dashboard's `Send password recovery` command while its default Site URL is `http://localhost:3000`: it may direct the existing account to localhost. Instead, once the allowlist and callback are verified, the private recovery page can request one password email for the already signed owner through the pinned GoTrue `/auth/v1/recover` endpoint with its exact `redirect_to` value.

The default GoTrue implicit-recovery link redirects with a `#type=recovery&access_token=…` fragment. This client removes the fragment from browser history immediately, independently queries `GET /auth/v1/user` and requires the same confirmed, non-anonymous and unbound existing owner identity before permitting one `PUT /auth/v1/user` password update. It never sends the password or recovery bearer token to a Sekinfra server, does not use refresh tokens, and reports separately whether local logout of the temporary recovery session was accepted. Unsupported PKCE `?code`, query tokens or changed email templates fail closed. Cloudflare Access redirection may affect fragment delivery; confirm the actual end-to-end signed-in callback behavior before issuing any live email. Never paste the email link, token, password or session into chat, CI, logs, committed files or tickets.

**Further separately approved boundaries:** verify private project Production assignment for `SEKINFRA_DEV_OWNER_PASSWORD_RECOVERY_ENABLED`, confirm the deployed review SHA, run the offline CI and security denial tests, verify the redirect allowlist, and issue exactly one owner-interactive recovery email with no retry by default. After the owner completes password setup privately, verify temporary session revocation and return to existing TOTP MFA enrollment. No user creation, admin key, AUTH provider schema change, DATA access, production Avuhz activation or customer record action is authorized by this preparation.

## Unverified DEVELOPMENT owner TOTP cleanup (source only until reviewed)

The existing `/owner-enrollment` page may encounter an **unverified** TOTP factor when a setup secret has been exposed before six-digit verification. The Supabase admin dashboard's **Remove MFA factors** success message is not proof that an unverified factor was deleted; verify the actual count read-only first. Never reuse an exposed enrollment secret and never delete rows directly from `auth.mfa_factors`.

A separate explicit **Clear unfinished authenticator setup** action is available only after the existing signed Cloudflare operator check and owner password sign-in. It accepts exactly one pending `totp/unverified` factor, rejects invalid IDs, duplicate or verified factors, and independently checks current GoTrue `GET /auth/v1/user` identity before sending one owner-authenticated `DELETE /auth/v1/factors/{id}` request to pinned DEVELOPMENT AUTH `pwlhruwutoitnieactol`. It requires matching deletion confirmation and another owner-authenticated user read showing the factor is gone before enabling fresh enrollment. Uncertain outcomes stop. No service role, admin key, new provider, client customer data, RLS change, SQL deletion, or automatic cleanup on login.

**Approval boundary:** Repository PR only; merging may deploy both Vercel projects because the repository is shared. Confirm CI/PR review and explicit merge approval, then verify the private deployment before the owner opens the existing page. The owner must deliberately click cleanup. Keep the next newly generated QR/secret private; do not photograph or send it to assistants. Once setup verifies, independently confirm MFA state read-only and disable recovery-only features per a separately approved deployment configuration change.

## Remaining integrations — not implemented

- No shared Avuhz human operator access token or authenticated tenant-scoped query bridge has been registered for this website. The Avuhz DEVELOPMENT AUTH project is `pwlhruwutoitnieactol`; DEVELOPMENT DATA is `gnuqaefotwgkwurjpyik`. Never confuse them or access DATA directly from the website.
- No live client list, OIA assessment index, attention queue, approvals, or business action endpoint is wired to this route. Empty/readiness states are not evidence that a business has no records.
- No n8n execution, AI model/tool adapter, monitoring provider adapter, or billing integration exists in this route. Do not introduce a vertical-specific alternative to Avuhz.
- The website's `/api/diagnostic-intake` still returns `503 INTAKE_NOT_CONNECTED`; this operator page does not solve customer intake.
- A readiness probe is not a substitute for tenant-scoped Avuhz read data or a live client handoff. These require independent reviewed contracts and exactly scoped provider approval.

## Next approved engineering slice

Once this private route's CI and source review are complete, prepare **one** development-only shared Avuhz read-model adapter integration plan (identity, tenant/RLS denial tests, safe response contract, server-to-server authorization, and no customer PII in logs). The first real customer should not be created until the governed intake/handoff path is independently verified and explicitly authorized.
