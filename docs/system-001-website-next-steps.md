# Sekinfra website → reusable Avuhz System #001

**State: website guidance only; no live integration is enabled.**

## Responsibility boundaries

- **Sekinfra** owns its public website, prospect qualification, client communication, and optional Focused Diagnostic / OIA consulting path. OIA is **not** a general Avuhz reusable-system prerequisite.
- **Avuhz** owns the shared tenant-authorized Work Item state, lifecycle commands, events, and outbox delivery. System #001 is reusable across separately approved tenants; no website-specific work table, auth layer, workflow bus or billing path may be created.
- A business using System #001 is a tenant with explicit membership and authority, not an arbitrary company name entered on the public website. Sekinfra's internal use does not make it an external Avuhz client.

## Verified current website behavior

1. `/start` collects a bounded local triage and contact-request candidate. `Prepare my request` does **not** submit it; the prospect must copy/email the text separately.
2. `/api/diagnostic-intake` responds `NOT_CONNECTED` to GET and 503 `INTAKE_NOT_CONNECTED` to POST, refusing real-prospect data.
3. `lib/server/avuhz-acquisition-adapter.ts` is a pure content mapper, and `lib/server/avuhz-acquisition-delivery.ts` is a dormant, server-only DEVELOPMENT candidate. Neither is mounted to the public route.
4. The website's `What happens after your request` explains intended communication/ownership steps; it is **not** a live status display or hosted Work Item receipt.

## Approved future integration path (not yet implemented)

```text
Visitor prepares request in browser
  ↓ visitor explicitly submits through a future approved server intake
Sekinfra bounded public ingress (consent, validation, anti-abuse)
  ↓ authenticated server-to-server only
Existing Avuhz shared acquisition intake / authoritative tenant binding
  ↓ human qualification and separately authorized work-intake command
System #001 shared Work Item (tenant-scoped and owner-authorized)
  ↓ transactional lifecycle event + existing shared outbox
Existing Avuhz worker → approved n8n workflow / notifications
  ↓ separately approved authenticated read model, if added
Appropriate Sekinfra operator/client next-step view
```

Never map browser-supplied `tenant_id`, `organization_id`, owner, role, or a claimed OIA conclusion into command authority. A prospect's submission must not create a tenant, grant system access, approve implementation, or automatically insert into `public.avuhz_work_items`. A qualified authorized actor must make that transition through the **shared command service**, after command idempotency and runtime boundaries are approved.

## Exact next technical gates

1. Complete the separately approved **DEVELOPMENT DATA command-idempotency** boundary and verify the authoritative Work Item/event/outbox transaction. The Work Item table alone does not prove end-to-end operation.
2. Validate the Sekinfra acquisition service binding, server identity, anti-abuse controls, consent, duplicate handling, and safe delivery receipt before ever changing `/api/diagnostic-intake` from fail-closed. Do not expose a bearer or database secret to the browser.
3. Define the human qualification handoff from acquired prospect to a separately authorized System #001 command. Confirm the correct Sekinfra tenant and owner independently of website values.
4. Prove authorization, tenant isolation, data minimization, duplicate/retry semantics, and failure/recovery on synthetic DEVELOPMENT records before activating any live website submission, n8n routing, or customer status view.
5. Production website or provider deployments require their own exact environment confirmation, review, and approval. This documentation grants no authority to change them.

The next-step presentation is intentionally useful **before** those gates are complete, while remaining explicit about what is not connected.
