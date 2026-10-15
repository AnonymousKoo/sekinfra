# Command Center / Avuhz Activity — source-only integration

**Target:** `AnonymousKoo/sekinfra` private Next.js Command Center
(`/command-center`). The private Vercel project is
`sekinfra-command-center` (`prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`).
**Public website project:** `sekinfra-website`
(`prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN`). The source is shared; never
confuse these project scopes or make the public site an operator route.

## What is implemented

- An **Avuhz Activity** section inside the existing private, server-rendered
  `/command-center` page with Security, Infrastructure, Automation and
  Business engineering lanes.
- Only verified public GitHub repository metadata is displayed: recent
  **main-branch merges** and a **review queue of open main-targeted PRs**.
  For each open PR, bounded GitHub check-run metadata is used to show
  `CI passed`, `CI failed`, `CI running` or `CI unverified`. Missing or
  malformed check evidence never becomes a false success. These signals
  are source/review activity, not deployments, n8n executions or business
  outcomes. All provider requests happen server-side after signed operator
  authorization succeeds.
- The GitHub REST URL is fixed; requests are GET-only, no authorization
  headers or cookies, no redirects, bounded response size and timeout.
  Only a narrow set of metadata is rendered after validation; URLs are
  constructed from fixed repository path plus validated PR number. Check
  lookups use only validated 40-character commit SHAs and render a status,
  never provider response bodies or arbitrary check-run names.
  Suspicious titles with emails/URLs are discarded rather than displayed.
- Provider failure shows **Source unavailable**, not a false zero.
  Supabase tenant data, Render deployments and n8n runs are explicitly
  **not connected**. No new auth, Supabase clients, workflow engine,
  polling daemon, third-party secrets or customer records are introduced.
- The existing Cloudflare Access RS256/JWKS, exact owner, host and Vercel
  routing gates, private no-store headers and fail-closed 404 are retained.

## Read-only provider evidence (2026-10-14 Eastern)

- Two separate Vercel projects were confirmed via list-projects, but
  connected deployment listing for either returned **403 forbidden** and
  private project details returned **404 not_found** with the explicit
  team scope. This prevents reliable verification, configuration or
  deployment of the private Command Center using the current connection.
- Unauthenticated request to `https://dashboard.sekinfra.com/` returned
  Cloudflare Access **302** to its login. This verifies the outer gate
  responds, **not** that the signed-in user reaches the intended origin.
- Direct `sekinfra-command-center.vercel.app/command-center` returned
  **404**, as intentionally required by the exact-host operator guard.
  Do not disable that guard as a workaround.
- Local n8n at `127.0.0.1:5678` responded to its health endpoint.
  Its read-only SQLite inventory showed 3 workflows, **0 active**, **0
  recorded executions**. System #001 child workflow ID
  `zxF2NZWcrtEKqyiG` is inactive; the shared local event receiver is
  also inactive. Repository tests of System #001 do **not** activate n8n.
- Avuhz System #001 shared deadline and due-review code is merged; the
  DEVELOPMENT DATA schema migration has been verified. The deployed Render
  command service still uses an older revision and does not mount the
  Work Intake HTTP route. No cross-project credential or deployment
  change is authorized by this PR.

## Verified tests

```bash
node --experimental-strip-types --test \
  tests/command-center-activity.test.ts \
  tests/command-center-review-queue.test.ts \
  tests/command-center-preview.test.ts
npm run build
```

Both exercise static or injected fetch/test-only responses. They must
run without a hosted operator token, production deploy or provider change.

## Required separate deployment/activation decisions

1. **Private project readback:** restore or select the correct authorized
   Vercel team scope for `sekinfra-command-center`, verify project ID,
   production assignment, private hostname and exact commit. Do not reuse
   the public website project or guess provider details.
2. **Cloudflare origin:** inspect the actual Access application, tunnel
   destination and authenticated route on `dashboard.sekinfra.com`.
   Confirm successful signed owner navigation and rejected direct-origin
   traffic. Any DNS/tunnel/origin/Access edit is a separately approved
   single-resource action.
3. **Reviewed private deployment:** require explicit production-specific
   approval for the exact private target and SHA, run checks, and verify
   private operator access. No production change under generic "proceed".
4. **Runtime activity adapters:** after Avuhz owner/tenant authority exists,
   develop individually reviewed authenticated server-side read models
   for DATA, Render and n8n execution summaries. No mock tenant counters,
   public n8n API or direct browser credentials.

**Next action:** review and merge this SOURCE-ONLY Activity PR after CI;
separately restore the exact private Vercel project access and verify
the Cloudflare-authenticated origin before a deployment request.
