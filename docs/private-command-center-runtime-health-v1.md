# Private Command Center — real, read-only public health evidence v1

**Repository/environment:** `AnonymousKoo/sekinfra` isolated source branch.
PRIVATE production Vercel project `prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`;
PUBLIC website project `prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN` shares main.
**No hosted/provider mutation, credential registration, workflow import,
database write, email, or production deployment is authorized by this PR.**

## What exists, and what does not

The private Command Center already has signed Cloudflare Access operator
authentication, GitHub merge/PR/CI activity, dark SekInfra branding and a
disabled-by-default AI Operator UI. Engineering event visibility is NOT
workflow execution or tenant business-event visibility.

Two PUBLIC HTTPS health probes are now attempted at operator page render,
server-side and only **after** cryptographic owner verification:

- `https://avuhz-command-dev.onrender.com/health/ready`: exact
  DEVELOPMENT Render host and path. Only JSON `status` and the
  allowlisted `checks.data` health marker are parsed, with 8KB cap.
  A 503 `not_ready` with DATA `unavailable` is shown as not ready,
  not as an operational connection. No Supabase credentials are used.
- `https://n8n.sekinfra.com/healthz`: exact production hostname and
  health path. HTTP 502/503/504 is shown as a health failure; HTTP 200
  proves only a responding HTTP endpoint and does NOT imply shared n8n
  execution API access, authenticated receipt flow or activated workflows.

Both probes use bounded GET, no cookies, no provider auth, no redirects,
short timeouts, no body/exception logging, no remote user-supplied URLs.
Errors become `unavailable`, never green. The dashboard labels
`integration_connected:false` even if a health endpoint responds.
Browser clients only receive the final rendered, generic status.

## Verified audit observations (October 15, 2026, 08:30 UTC)

- PRIVATE Command Center production deploy merged PR #54 and reported READY.
- PUBLIC SekInfra website production deployed the same shared commit.
- GitHub PR activity: public API connected; not a live n8n or tenant event feed.
- AI Operator: server-side OpenAI adapter exists but no `OPENAI_API_KEY`
  nor `SEKINFRA_AI_OPERATOR_ENABLED` in PRIVATE project. AI disabled.
  Do not enable without approved Vault credential and usage/rate limits.
- Avuhz DEVELOPMENT Render: `/health/live` HTTP 200 `alive`;
  `/health/ready` HTTP 503 `not_ready`, checks
  `configuration=ready`, `identity=ready`, `data=unavailable`.
  Last verified deployed source revision `d30a92d...`, much older
  than current Avuhz main. Auto-deploy disabled.
- Separate Supabase DEVELOPMENT AUTH `pwlhruwutoitnieactol` and
  DATA `gnuqaefotwgkwurjpyik` both ACTIVE_HEALTHY, but DEVELOPMENT
  DATA count is still 0 for tenant organizations, owner memberships,
  acquisition intakes, Work Items, lifecycle events and outbox records.
  Healthy Supabase projects do not mean Render has a usable database
  connector or the Command Center has tenant-scoped read authority.
- Production `n8n.sekinfra.com` HTTPS returns nginx 502.
- Existing LOCAL `n8n` docker service on `127.0.0.1:5678`
  health 200, 3 workflows stored, 0 active, 0 executions, one
  **uncertified** System #001 name-matching child. The local snapshot
  from Avuhz PR #691 is merged, but does not send telemetry to the
  hosted dashboard.
- System #001 shared revenue-intake receipt-gated v2 source PR #690
  remains OPEN. Hosted owner routing and Work Item HTTP/notification
  paths are not end-to-end certified.

## Required connections — no invented authority

1. **Restore DEVELOPMENT Avuhz DATA readiness** by read-only
   reconciliation of Render connector/env variable *names only*,
   deployed commit, DATA grants/RLS and exact error classification.
   Any secret/grant/deploy change requires independent, one-resource
   scope approval; no downgrade to elevated `service_role`.
2. **Investigate nginx 502 for PRODUCTION n8n** using the actual host,
   upstream, container and proxy health readback. Production
   restart/config/DNS/tunnel or credential changes require explicit
   targeted authorization.
3. **Deliver LOCAL telemetry to the dashboard** via a separate,
   outbound-only, authenticated and replay-protected connector plus
   approved Avuhz receiving/read model. Never expose port 5678,
   database SQLite, execution payloads or customer PII. A local
   script output is not a live Command Center connection.
4. **OpenAI activation** requires Vault-managed server key in the
   PRIVATE project, separate usage cost/rate policy and explicit
   feature flag authorization; this does not inherit this ChatGPT
   thread's history, plugins, credits or permissions.
5. **Avuhz tenant operational data** needs verified shared AUTH,
   authoritative tenant/owner membership and RLS-scoped read model
   before live customer/Work Item events may appear.
6. **System templates** must be separately imported inactive,
   authenticated, locally certified, connected to shared commands,
   and activated only under exact scoped approvals. System #001 is
   not yet a customer-ready revenue engine.

**Next action:** review this source-only health visibility PR,
verify CI and both Vercel previews, then request the explicit
two-project production merge authorization. Separately prioritize
Render DATA readiness and production n8n upstream diagnostics.
