-- Forward-only closed vocabulary extension for diagnostic scope canonicalization idempotency.
-- Existing idempotency semantics, uniqueness, and legacy tables remain unchanged.

alter table public.sekinfra_idempotency_records
  drop constraint sekinfra_idempotency_records_command_type_check;

alter table public.sekinfra_idempotency_records
  add constraint sekinfra_idempotency_records_command_type_check
  check (command_type in (
    'AcceptAcquisitionHandoff',
    'OpenEngagement',
    'SubmitDiagnosticScope',
    'RecordHumanApproval',
    'ApproveDiagnosticScope',
    'CanonicalizeDiagnosticScope'
  ));
