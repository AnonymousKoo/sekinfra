# Avuhz Operator Command Center — identity correction (source-only)

**Confirmed source target:** `AnonymousKoo/sekinfra`, isolated LOCAL/TEST
source worktree from Avuhz-facing dashboard at current main.
**Private deployment:** `sekinfra-command-center`,
Vercel project `prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`.
**Separate PUBLIC SekInfra client website:** `sekinfra-website`,
Vercel project `prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN`.

No hosted resource, domain, Cloudflare Access policy, credential,
Supabase, n8n workflow or client record is changed here.

## Ownership correction

Avuhz is the multi-tenant, API-first **operating system** and shared
infrastructure authority. The private Command Center is its operator
interface, intended as the owner's Jarvis-style intelligence and
operations experience. The AI assistant is `Avuhz AI Operator` and is
still READ-ONLY and feature-gated, not an autonomous service.

SekInfra is a **client organization** of Avuhz, not the application
branding, operator identity, shared billing/auth provider or service
infrastructure. Do not add fictional SekInfra tenant records or show
business operations as connected until Avuhz tenant ownership, RLS and
authorized read models are genuinely established.

## What changed on the private operator surface

- Replace the old SekInfra logo/white tile with a **provisional inline Avuhz
  typographic wordmark and geometric emblem**. Neither inspected repo has
  a canonical Avuhz brand asset to reuse; this is NOT represented as an
  externally verified official corporate logo. Dark palette remains.
- Browser title, description and **route-specific data URI favicon** now
  identify Avuhz. The public SekInfra favicon is not modified.
- Sidebar, operator header, footer and assistant heading use Avuhz.
  AI server-side READ-ONLY instructions now explicitly distinguish Avuhz
  as the OS and SekInfra as a client.
- Development owner AUTH helper copy refers to the neutral Command
  Center server rather than SekInfra's server.
- Remove the private-host `/brand/sekinfra-wordmark.webp` allowlist
  because the private dashboard no longer needs the client brand asset.
  Public site's asset and display remain in place.

## What intentionally does NOT change

The two Vercel projects share one GitHub repository today.
The already-configured private access URL is
`https://dashboard.sekinfra.com/command-center`; the existing
`SEKINFRA_*` configuration variables, route-origin check and private
client-side API header are **technical authentication contracts**.
Renaming them as part of a visual/logo change would break routing or
disable the dashboard. These remain unchanged and are not user-facing
marketing identity. Likewise, the public `www.sekinfra.com` website
still belongs to SekInfra.

Moving to an Avuhz-owned hostname, independent Avuhz dashboard repo or
Vercel project is a **separate future migration** with confirmed
domain ownership, DNS/Cloudflare/JWT issuer-audience/origin updates,
and a proofed rollback. This source PR is not permission to migrate
domains or reissue credentials.

PRs #56 (AI zero-credit setup) and #57 (separate Supabase health) are
still independent unmerged source branches at the time of authoring.
Both also touch `page.tsx`; rebase/review conflicts **before any merge**
and preserve both functional changes. No forced merge.

## Verification

- Full private operator tests: **33/33 PASS**.
- Production build **PASS**.
- Lint **PASS** (one pre-existing unrelated warning).
- `git diff --check` **PASS**.
- Auth guard, exact private hostname, default-disabled AI, public
  GitHub activity, health probes and no-index page remain unchanged.
- No elevated credentials, exposed tenant data or new API endpoints.

**Next action:** review the source-only Avuhz operator branding PR.
After current independent PRs are reconciled and their checks pass,
obtain exact production-aware merge authorization. A merge into this
shared repository automatically builds both Vercel production projects.
Then verify the private dashboard's branding and public client's
unchanged website. Plan an independent Avuhz-owned hosting migration
only after ownership and security boundary requirements are confirmed.
