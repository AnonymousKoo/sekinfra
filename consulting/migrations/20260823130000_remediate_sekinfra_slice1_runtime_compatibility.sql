-- Forward-only remediation for the approved Slice 1 runtime record shapes.
-- This changes only additive sekinfra_* tables; legacy tables remain untouched.

alter table public.sekinfra_acquisition_handoffs
  alter column accepted_at drop not null;

alter table public.sekinfra_diagnostic_scopes
  alter column canonical_scope_digest drop not null;

alter table public.sekinfra_lifecycle_events
  alter column event_schema_version drop not null,
  alter column authoritative_subject_type drop not null,
  alter column authoritative_subject_id drop not null,
  alter column authoritative_subject_version drop not null,
  alter column occurred_at drop not null,
  alter column producer_reference drop not null,
  alter column correlation_id drop not null,
  alter column visibility drop not null,
  alter column sanitized_metadata drop not null;

alter table public.sekinfra_outbox_deliveries
  alter column outbox_delivery_id set default gen_random_uuid(),
  alter column destination_reference drop not null,
  alter column delivery_idempotency_key drop not null;
