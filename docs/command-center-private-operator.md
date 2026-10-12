# Sekinfra private Command Center — deployment boundary

## Purpose and current status

The Command Center is a **real, server-guarded operator entry point**, not a demonstration. Its route is `/command-center` in `AnonymousKoo/sekinfra`. It intentionally renders **HTTP 404 by default** until the dedicated private deployment is prepared. The former fictional engagement fixture and non-executing AI-command widget are no longer used by this route.

This document does **not** assert that the private deployment, Cloudflare policy, Avuhz integration, or customer workflows are live. Source-code readiness and provider readiness are separate decisions.

## Exact owner and deployment boundary

- Repository: `AnonymousKoo/sekinfra` (Next.js website).
- Intended private hostname: `dashboard.sekinfra.com`. The hostname is pinned in source; public `sekinfra.com`, `www.sekinfra.com`, Vercel aliases, and unknown hosts fail closed.
- Current public website deployment must stay untouched while a separately scoped private operator deployment is verified.
- Cloudflare Access is an outer operator perimeter only. Its JWT **does not** confer Avuhz tenant, organization, capability, or approval authority.
- All business access and business mutations remain governed by the **shared Avuhz API**, not by the website, Cloudflare or direct n8n calls.

## Required private server environment (not committed values)

Only configure these on the **separately approved private operator deployment** after verifying its project/environment/hostname. They are server-side variables; do not add `NEXT_PUBLIC_` copies.

| Name | Meaning |
| --- | --- |
| `SEKINFRA_COMMAND_CENTER_ENABLED` | Must equal exactly `true` or every request is refused. |
| `SEKINFRA_OPERATOR_HOST` | Must equal exactly `dashboard.sekinfra.com`. The incoming Host must match. |
| `SEKINFRA_ACCESS_TEAM_DOMAIN` | Exact `https://<team>.cloudflareaccess.com` issuer; HTTPS only. |
| `SEKINFRA_ACCESS_AUD` | Exact Cloudflare Access application audience for this private operator app. |
| `SEKINFRA_OPERATOR_EMAIL` | One owner email allowed by the private Cloudflare Access policy; checked against the **signed** JWT email claim. |
| `SEKINFRA_AVUHZ_READINESS_URL` | Optional approved `https://<hostname>.onrender.com/health/ready` for a no-credential, server-side readiness check. Not an authenticated client-data transport. |

Do not commit the real owner email, tokens, private keys, credentials, provider payloads, or secret values. Cloudflare's issuer/audience are configuration values, not independent proof of authorized deployment. Never register the private operator hostname against the existing public Vercel project without a separate exact plan and direct-origin review.

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

## Remaining integrations — not implemented

- No shared Avuhz human operator access token or authenticated tenant-scoped query bridge has been registered for this website. The Avuhz DEVELOPMENT AUTH project is `pwlhruwutoitnieactol`; DEVELOPMENT DATA is `gnuqaefotwgkwurjpyik`. Never confuse them or access DATA directly from the website.
- No live client list, OIA assessment index, attention queue, approvals, or business action endpoint is wired to this route. Empty/readiness states are not evidence that a business has no records.
- No n8n execution, AI model/tool adapter, monitoring provider adapter, or billing integration exists in this route. Do not introduce a vertical-specific alternative to Avuhz.
- The website's `/api/diagnostic-intake` still returns `503 INTAKE_NOT_CONNECTED`; this operator page does not solve customer intake.
- A readiness probe is not a substitute for tenant-scoped Avuhz read data or a live client handoff. These require independent reviewed contracts and exactly scoped provider approval.

## Next approved engineering slice

Once this private route's CI and source review are complete, prepare **one** development-only shared Avuhz read-model adapter integration plan (identity, tenant/RLS denial tests, safe response contract, server-to-server authorization, and no customer PII in logs). The first real customer should not be created until the governed intake/handoff path is independently verified and explicitly authorized.
