# Private Command Center — Sekinfra dark UX and Avuhz system visibility

**Scope:** SOURCE ONLY, `AnonymousKoo/sekinfra`, operator-facing private route
`/command-center`. Local/TEST branch against `main`, not authorization
to deploy a production change. The public site runs from the same repository,
but no public site code, route, theme or auth is changed in this revision.

## UX decisions grounded in the implemented public website

The Sekinfra website's existing source in `app/page.tsx`,
`components/contextual-home.tsx`, `components/site-header.tsx` and
`app/globals.css` uses technical grid imagery, dark navy / almost-black
sections, gradients, teal `#0f9f98`, lime `#b9ef70`, Geist sans,
wide display headlines, editorial eyebrows and subtle card outlines.

The Command Center now uses the same visual language in a dark-only
operator treatment. Its styles are **scoped** to
`app/(prototype)/command-center/operator-visual.css`; the private page
imports that stylesheet directly. The stylesheet does not target global body,
HTML or `:root`, and honors reduced-motion preferences.

Changes to the private operator page:
- Refined sidebar, brand mark, active navigation affordances, technical grid
  and atmospheric teal/lime hero treatment
- A distinct, accessible **System Library** for Revenue Engine, Booking,
  Client Onboarding, Work & Operations and Customer Retention
- A separate **Environment Connections** overview, distinguishing
  production Command Center, public GitHub engineering evidence,
  local n8n, production n8n, Avuhz runtime health and tenant operations
- Existing signed operator gate, exact-host restrictions, PR/CI activity
  feed, provenance statements, and fail-closed unauthorized behavior preserved

## Connection reality and execution boundaries

| Source | Today | Allowed next integration |
| --- | --- | --- |
| Command Center production UI | Protected route deployed and owner sign-in observed | Preserve signed Cloudflare JWT plus exact owner and host |
| GitHub Avuhz engineering changes | Public PR/CI metadata is fetched server-side after owner authorization | Continue public-only engineering evidence; label code merges as code, not actions |
| LOCAL n8n | Running at `127.0.0.1:5678` on owner's machine; no dashboard telemetry connector | Separately review a local read-only collector with private outbound, authenticated telemetry or signed bounded summary exchange; **never expose local n8n publicly** |
| PRODUCTION n8n | Existing host/workflow health and auth not proven through this Command Center | Separately approve a production-scoped read-only adapter and least-privilege credential; no shared dev credential, no automated activation |
| Avuhz DEVELOPMENT service | Existing optional `SEKINFRA_AVUHZ_READINESS_URL` is not configured for private deployment | Verify exact DEV Render health URL and resource approval, then use bounded GET-only readiness; health is not tenant authority |
| Avuhz AUTH / DATA | Separate projects; private Command Center has no tenant-scoped Avuhz read model | Server-side shared identity, RBAC/ABAC and tenant RLS verification before exposing Work Items, lifecycle events, audit summaries and system outcomes |
| System #001 | Source candidates and reusable n8n v2 PR #690, NOT an authenticated end-to-end execution | Shared Avuhz policy/owner command adapter, durable work obligation, n8n receipt, consent and execution proof |
| Systems #002–#005 | Desired template families, not verified installed or running | Codex source candidates, synthetic tests, disposable n8n import, individual inactive local import approvals |

**Policy:** Avuhz controls policy and authoritative state; n8n orchestrates
already-authorized commands. No vertical-specific auth, billing, workflow
infrastructure, direct n8n-to-Supabase table writes, public exposure of
the local n8n API, runtime impersonation, or fake tenant metrics.

## Verification

Run the following from the Sekinfra repository:

```sh
node --experimental-strip-types --test tests/command-center-dark-system-ux.test.ts tests/command-center-preview.test.ts tests/command-center-activity.test.ts tests/command-center-review-queue.test.ts
npm run lint
npm run build
git diff --check
```

**Next action:** review source PR and passing private operator CI. Because
`sekinfra-website` and `sekinfra-command-center` automatically deploy from
the same GitHub `main`, a production-aware approval is required before
merging. After approved deployment, verify signed-in owner page and mobile
layouts, then design a single read-only, credential-isolated LOCAL n8n
telemetry path without exposing port 5678 or enabling workflows.
