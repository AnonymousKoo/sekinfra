# Avuhz OpenAI account → private AI Operator: zero-credit setup

**Scope:** SOURCE ONLY, `AnonymousKoo/sekinfra` private Command Center.
Actual private Vercel project `sekinfra-command-center`
(`prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`).
The PUBLIC `sekinfra-website` project
(`prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN`) shares the repository.
No credential, production provider config, customer data, n8n, Supabase,
OpenAI billing, or API request is modified or executed by this PR.

## Confirmed current state

- The owner already has an OpenAI Platform account for Avuhz and reports
  **$0 prepaid credit**. Account existence is user-provided; no owner
  OpenAI API project membership or billing state was remotely inspected.
- The actual PRIVATE Vercel project's environment variable names were
  read without decrypting values. Neither `OPENAI_API_KEY` nor
  `SEKINFRA_AI_OPERATOR_ENABLED` was configured.
- The private AI Operator UI and fixed Responses API server-side adapter
  already exist and are protected by Cloudflare-signed owner authentication,
  exact private deployment role/host, and no-store responses.
- The backend returns `ai_not_configured` before requesting any OpenAI
  response while the feature flag is missing/false or API key is missing.
- There is **no durable AI usage/rate limiter** wired into the existing
  AI Operator route. The existing 450 output-token cap is per-request,
  not a financial budget or rate limit.
- The AI Operator currently exposes public GitHub repository engineering
  activity only. It does not inherit this ChatGPT session and has no
  tenant-scoped Avuhz actions, local n8n execution feed or autonomous tools.

## Source-only UX improvement

The private AI Operator renders a truthful, read-only setup status:
- **Awaiting secure API key** when none is configured;
- **Key configured · requests paused** when a key exists but the API
  feature is disabled;
- **Read-only API enabled · not yet verified** only when both key and
  activation flag are configured (still not proof of API billing or a
  successful model response).

Setup instructions keep secrets outside the browser, Git, n8n exports,
ChatGPT conversation and application logs. The Send form remains disabled
while the AI feature is not enabled. No synthetic success is displayed.

## Separately approved manual/provider setup steps

1. In the owner's **existing Avuhz OpenAI Platform organization/project**,
   verify the project in `https://platform.openai.com/` and generate a
   project-scoped, minimum-privilege API key when the owner wishes.
   Never generate or share an organization ADMIN key; don't paste it
   into a conversation, git issue, screenshot or exported workflow.
2. Store the key via the **PRIVATE** `sekinfra-command-center`
   Vercel project **Settings → Environment Variables**, under
   `OPENAI_API_KEY`, scoped to **Production** for that private
   project only. Use the approved secret/encrypted environment settings.
   Do **not** add it to `sekinfra-website` or `NEXT_PUBLIC_*`.
   This is one external secret-resource change requiring separate exact
   approval and verified ownership. No key is present today.
3. Keep `SEKINFRA_AI_OPERATOR_ENABLED` **unset/false**. Adding a key
   alone does NOT authorize paid OpenAI API requests. API credit may be
   zero, and no chargeable test request should be sent.
4. Before enabling, establish a **durable, centralized request/usage
   limiter** and verified budget/notification cap for the API project.
   Review expected model pricing and data retention, assign approval
   for credit purchase and maximum spend. Do not treat rate caps as an
   absolute financial guarantee. The current code does not implement
   such a limiter, so its absence is an activation blocker.
5. Once owner-approved budget, effective provider credit, credential,
   and limiter are verified, approve the one private feature-flag
   change `SEKINFRA_AI_OPERATOR_ENABLED=true`, then separately prove
   one authenticated successful read-only response and negative tests.
   Never turn it on automatically just because the API account exists.

This setup does NOT establish a production n8n or Avuhz tenant-data
connection. Shared tenant authority, RLS and orchestration remain separate.

## Test gates

- Private AI Operator tests and static/proxy auth checks.
- Next.js production build and lint.
- Confirm private API route still checks signed owner JWT and disabled
  feature flag before any call to `https://api.openai.com/v1/responses`.
- No actual provider request with zero credit; no config mutations.

**Next action:** review this source-only UX PR and its CI, then have the
owner configure the project-scoped key in the PRIVATE Vercel secret
settings under a separate exact authorization. Leave API calls paused
until the limiter and budget approval are complete.
