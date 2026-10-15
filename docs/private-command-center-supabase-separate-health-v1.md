# Supabase DEVELOPMENT AUTH/DATA separated health indicators

**Source:** `AnonymousKoo/sekinfra`, private Command Center source-only
integration candidate. PRIVATE Vercel target: `sekinfra-command-center`
`prj_lUa67e16EsLK6OhJFjDBPmUjIuKz`. PUBLIC shared-repo site:
`prj_Cx03RXZ6zBCmq1i70UQPjtxth4SN` is unchanged by source files.

## Grounded provider findings

- Supabase **DEVELOPMENT AUTH** `pwlhruwutoitnieactol` and
  **DEVELOPMENT DATA** `gnuqaefotwgkwurjpyik` are separate projects.
  Both provider projects report `ACTIVE_HEALTHY`.
- Private Vercel environment currently has
  `SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY` present (value never decrypted),
  but no `SEKINFRA_DEV_DATA_PUBLISHABLE_KEY`.
- Avuhz DEVELOPMENT Render reports `/health/live=200` while
  `/health/ready=503`, data `unavailable`. Healthy Supabase provider
  status does not make the Render database connection ready.
- DATA tenant organizations, memberships, Work Items and events are
  empty; no owner/tenant authority has been certified for a command center
  operational read model.
- Existing private Cloudflare owner JWT is **NOT** interchangeable with
  Avuhz AUTH, nor does it authorize a direct DATA query.

## What this source change does

The Command Center calls exact Supabase **AUTH API health endpoints** as
bounded GET requests **server-side after cryptographic owner verification**:

| Boundary | Exact health endpoint | PRIVATE environment key |
| --- | --- | --- |
| AUTH | `https://pwlhruwutoitnieactol.supabase.co/auth/v1/health` | `SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY` |
| DATA | `https://gnuqaefotwgkwurjpyik.supabase.co/auth/v1/health` | `SEKINFRA_DEV_DATA_PUBLISHABLE_KEY` |

The key is sent only as an API header to the matching fixed project
endpoint and is **never displayed or logged**. Only
`sb_publishable_...` or a legacy `role=anon` JWT is accepted.
Service-role and secret keys are rejected, including if they are placed
in the environment under the wrong name. No provider response body is
read. No authenticated user/session, tenant row, SQL, service role, RLS
bypass or n8n data is accessed.

**These are API health probes, not full Supabase integration.** A 200
is labeled `API responds · not integrated` and
`tenant_data_connected:false`. Missing keys show
`Health not configured`; 401/403/network failures show unavailable.
AUTH and DATA cannot use one another's keys and have separate status.

## Required exact future provider operations

- No key is read, created, registered, decrypted or otherwise mutated
  in this source-only PR.
- To use the DATA API health probe, separately approve **one** scoped
  `SEKINFRA_DEV_DATA_PUBLISHABLE_KEY` setting on the PRIVATE
  `sekinfra-command-center` project (Production only) after verifying
  that it is the DATA project's publishable/anon credential. Do NOT
  copy AUTH's key or add service-role access.
- A true data integration requires Avuhz-shared owner identity proof,
  tenant membership, correctly scoped DATA RLS, and an Avuhz-owned
  authorized read-model API. Direct private dashboard access to DATA
  tenant tables is forbidden until that is certified.
- Any PRIVATE-source PR merge may auto-redeploy **both** Vercel projects
  from shared GitHub main; get exact production-aware merge approval.

**Next action:** review CI/preview for this source change, then
separately certify the DEVELOPMENT Avuhz DATA runtime connection and
RLS-scoped read model before calling tenant data connected.
