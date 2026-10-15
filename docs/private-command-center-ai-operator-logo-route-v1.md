# SekInfra Command Center — logo route repair + AI Operator v1 (source-only)

**Confirmed scope:** `AnonymousKoo/sekinfra` isolated source worktree based on
main `025a1961bb4c8b29ce1f45722164890e5fd730be`.
PRIVATE deployment: `sekinfra-command-center`,
`prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`.
PUBLIC deployment (same Git source): `sekinfra-website`,
`prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN`.

This change does not configure API keys, alter Cloudflare, activate n8n,
mutate Supabase, modify billing, call customer APIs, deploy production,
or permit an AI to execute commands.

## Root cause: blank white SekInfra wordmark

The site asset was already present at
`public/brand/sekinfra-wordmark.webp` and displayed correctly on
`www.sekinfra.com`. The private hostname's `proxy.ts` / strict
`privateOperatorRouteDecision` denied the path
`/brand/sekinfra-wordmark.webp`, so the dashboard rendered only its
white logo plate. Next/Image also tried image optimization via
`/_next/image`, which could not safely fetch a denied origin asset.

The fix permits **only** the exact public wordmark path in the private
host's route policy; it denies all other `/brand/*` paths. Set the
private sidebar's existing Next/Image wordmark to `unoptimized` to load
that same existing asset directly. Its original colors and white asset
background remain unchanged, inside the dark theme.

**Real LOCAL Next production-build smoke test with
`SEKINFRA_DEPLOYMENT_ROLE=private-operator`:**
- GET exact wordmark returns 200 `image/webp`
- GET other brand asset returns 404
- GET `/command-center` without signed owner identity returns 404
- GET `/api/diagnostic-intake` and `/about` return 404
- POST `/api/operator/ai-chat` without signed owner identity returns 404

A host-only mock without the deployment role is **not** proof of
production route isolation. The actual private-role smoke verifies that
boundary.

## AI Operator v1: a real API adapter, deliberately disabled until configured

The new first sidebar item and top-of-page AI Operator panel give the owner
a conversational workspace that **can** call OpenAI Responses API through a
server-side `/api/operator/ai-chat` route once its private runtime is
authorized and configured.

The API is **not ChatGPT's existing conversation**, has no access to ChatGPT
memory/plugins/previous chat, and is not an n8n/Avuhz policy decision-maker.
No persistent chat history is implemented; recent messages are kept only in
this browser tab's in-memory component state, then sent to OpenAI when the
operator asks a question. Tell the operator not to enter PII or secrets.

The endpoint:
- Requires exact private project role **and** hostname
  `dashboard.sekinfra.com`.
- Independently calls the existing cryptographic Cloudflare signed
  `authorizeOperator` on **every request**. It is NOT enough that the owner
  visited a prior private page.
- Is disabled unless `SEKINFRA_AI_OPERATOR_ENABLED=true` and an
  existing, separately approved **Vault-supplied** `OPENAI_API_KEY` is
  available server-side. Neither exists in the currently inspected private
  Vercel configuration. Do not write a key to git/workflows/client scripts.
- Requires exact same-origin `Origin` and `X-Sekinfra-Operator-Request`
  marker, JSON content type, strict 8 KB HTTP payload and message validation
  (up to 8 messages / 7K characters, final role `user`, no system/developer
  roles).
- Fixes HTTPS destination to `api.openai.com/v1/responses`; no
  redirects, 15-second timeout, bounded response parsing. Provider responses
  and exceptions are **never logged**. Errors use generic codes.
- Sets `store:false`, `tools:[]`, 450 max output tokens, and fixed
  `gpt-4.1-mini` model. This may incur separately billed OpenAI API usage
  when enabled; **ChatGPT login alone does not provide an API key or API
  billing authorization**. Privacy and usage must be approved before enablement.
- Supplies only bounded PUBLIC Avuhz GitHub PR/merge evidence as
  untrusted reference data. No tenant, customer, n8n execution, private
  credential, service-role or approval data.
- Never returns fabricated success when OpenAI or GitHub are unavailable.
  It has no tools, command endpoint, provider mutation, automated n8n
  execution or autonomous action path.

### Production activation blockers

1. Approve the exact **two-project shared-repo production merge** of the
   source PR after both preview builds and the private operator security
   gate pass. A merge may deploy **both** Vercel production projects.
2. Verify the signed-in private URL loads the brand image correctly.
3. Separately approve **one** private deployment configuration at a time:
   Vault-backed server credential source, API account/budget, owner-only
   scope and a proper shared server-side usage/rate limit appropriate to
   the environment. No existing durable request limiter is wired in this
   route, so do not turn on the AI feature prematurely.
4. Enable the private feature flag as a distinct approved configuration
   change and verify authenticated POST, denied unauthenticated/public
   requests, actual OpenAI response, error cases and billing constraints.
5. Separately build Avuhz-owned **read-only** tenant-authorized tools with
   proper RLS, and LOCAL/PRODUCTION n8n telemetry read models; do not let
   this chat query tenant data or execute workflows without dedicated
   policy/event boundary approvals.

The user wants the Command Center to become the primary operations
workspace. The UI/API source is the first increment, **not a working
ChatGPT replacement today**. The existing API platform does not inherit
conversation history or connected tools from this ChatGPT session.

**Next action:** review this source-only PR and its CI/preview status. Then
verify the logo after approved production merge. Activate API access only
after approved credentials and cost/rate controls are separately in place.
