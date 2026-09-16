-- Local additive Phase 5D durable schema. Remote application is not authorized.

alter table public.sekinfra_human_approvals
  drop constraint sekinfra_human_approvals_subject_type_check,
  drop constraint sekinfra_human_approvals_approval_category_check,
  drop constraint sekinfra_human_approvals_subject_binding_check,
  add column implementation_outcome_authority_digest text check (
    implementation_outcome_authority_digest is null
    or implementation_outcome_authority_digest ~ '^sha256:[0-9a-f]{64}$'
  );

alter table public.sekinfra_human_approvals
  add constraint sekinfra_human_approvals_subject_type_check check (
    subject_type is null or subject_type in (
      'DIAGNOSTIC_SCOPE','ASSESSMENT_ACCESS_PROPOSAL','OIA_CONVERSION_DECISION',
      'ONGOING_AGREEMENT_AUTHORITY','ONGOING_ACCESS_GRANT','IMPLEMENTATION_OUTCOME'
    )
  ),
  add constraint sekinfra_human_approvals_approval_category_check check (
    approval_category is null or approval_category in (
      'ASSESSMENT_ACCESS','CONVERSION','ONGOING_AGREEMENT','ONGOING_ACCESS','IMPLEMENTATION_OUTCOME'
    )
  );

alter table public.sekinfra_human_approvals
  add constraint sekinfra_human_approvals_subject_binding_check check (
    subject_type is null
    or (
      subject_type='DIAGNOSTIC_SCOPE' and subject_id=diagnostic_scope_id
      and diagnostic_scope_id is not null and approved_scope_version is not null
      and canonical_scope_digest is not null and action_set_version is not null
      and assessment_access_proposal_id is null and assessment_access_authority_digest is null
      and subject_version is null and phase5c_authority_digest is null
      and implementation_outcome_authority_digest is null and approval_category is null
    )
    or (
      subject_type='ASSESSMENT_ACCESS_PROPOSAL' and subject_id=assessment_access_proposal_id
      and assessment_access_proposal_id is not null and assessment_access_authority_digest is not null
      and approval_category='ASSESSMENT_ACCESS' and diagnostic_scope_id is null
      and approved_scope_version is null and canonical_scope_digest is null
      and action_set_version is null and subject_version is null
      and phase5c_authority_digest is null and implementation_outcome_authority_digest is null
      and actor_identity is not null and actor_organization is not null and actor_role=approval_role
    )
    or (
      subject_type in ('OIA_CONVERSION_DECISION','ONGOING_AGREEMENT_AUTHORITY','ONGOING_ACCESS_GRANT')
      and subject_id is not null and subject_version is not null and phase5c_authority_digest is not null
      and implementation_outcome_authority_digest is null
      and approval_category = case subject_type
        when 'OIA_CONVERSION_DECISION' then 'CONVERSION'
        when 'ONGOING_AGREEMENT_AUTHORITY' then 'ONGOING_AGREEMENT'
        when 'ONGOING_ACCESS_GRANT' then 'ONGOING_ACCESS'
      end
      and diagnostic_scope_id is null and approved_scope_version is null
      and canonical_scope_digest is null and action_set_version is null
      and assessment_access_proposal_id is null and assessment_access_authority_digest is null
      and actor_identity is not null and actor_organization is not null and actor_role=approval_role
    )
    or (
      subject_type='IMPLEMENTATION_OUTCOME' and subject_id is not null and subject_version is not null
      and implementation_outcome_authority_digest is not null and phase5c_authority_digest is null
      and approval_category='IMPLEMENTATION_OUTCOME'
      and diagnostic_scope_id is null and approved_scope_version is null
      and canonical_scope_digest is null and action_set_version is null
      and assessment_access_proposal_id is null and assessment_access_authority_digest is null
      and actor_identity is not null and actor_organization is not null and actor_role=approval_role
    )
  );

create unique index sekinfra_human_approvals_active_implementation_outcome_role_key
  on public.sekinfra_human_approvals
  (tenant_id,subject_id,subject_version,implementation_outcome_authority_digest,approval_role)
  where subject_type='IMPLEMENTATION_OUTCOME' and status='ACTIVE';

alter table public.sekinfra_idempotency_records
  drop constraint sekinfra_idempotency_records_tenant_principal_command_scope_key,
  drop constraint sekinfra_idempotency_records_command_type_check,
  drop constraint sekinfra_idempotency_records_subject_type_check,
  drop column idempotency_scope;

alter table public.sekinfra_idempotency_records
  add column idempotency_scope text generated always as (
    case when command_type in (
      'CreateAssessmentAccessProposal','RecordAssessmentAccessApproval','IssueAssessmentAccessGrant',
      'VerifyAssessmentAccess','ExpireAssessmentAccess','RevokeAssessmentAccess',
      'CloseAssessmentAccessForAgreementEnd','RecordDiagnosticAgreementAuthority',
      'RecordDiagnosticPaymentVerification','InvalidateDiagnosticPaymentVerification',
      'OpenOIAAssessment','RecordOIAEvidence','CreateOIAAssessmentPlan',
      'ReviseOIAAssessmentPlan','ReviewOIAAssessmentPlan','ApproveOIAAssessmentPlan',
      'CreateOIAInspectionItem','UpdateOIAInspectionItem','MarkOIAInspectionItemBlocked',
      'RecordOIAObservation','SupersedeOIAObservation','RecordOIARootCause',
      'CreateOIAFinding','UpdateOIAFindingAnalysis','FinalizeOIAFinding',
      'MarkOIAAssessmentReadyForDelivery','DeliverOIAFindings','ReviseDeliveredOIAFinding',
      'CloseOIAAssessment','RecordOIAConversionDecision','AcceptOIAConversion',
      'ProposeOngoingAgreement','RecordOngoingAgreementApproval','ActivateOngoingAgreement',
      'TerminateOngoingAgreement','RecordOngoingPaymentVerification',
      'InvalidateOngoingPaymentVerification','ProposeOngoingAccessGrant',
      'RecordOngoingAccessApproval','ApproveOngoingAccessGrant','VerifyOngoingAccess',
      'RevokeOngoingAccess','CloseOngoingAccess','InitiateOngoingOffboarding',
      'VerifyOngoingAccessRevocation','CompleteOngoingOffboarding',
      'CreateImplementationOutcome','RecordImplementationOutcomeApproval',
      'ApproveImplementationOutcome','RevokeImplementationOutcome'
    ) then 'COMMAND' else 'SUBJECT:' || subject_id::text end
  ) stored,
  add constraint sekinfra_idempotency_records_command_type_check check (command_type in (
    'AcceptAcquisitionHandoff','OpenEngagement','SubmitDiagnosticScope','RecordHumanApproval',
    'ApproveDiagnosticScope','CanonicalizeDiagnosticScope','CreateAssessmentAccessProposal',
    'RecordAssessmentAccessApproval','IssueAssessmentAccessGrant','VerifyAssessmentAccess',
    'ExpireAssessmentAccess','RevokeAssessmentAccess','CloseAssessmentAccessForAgreementEnd',
    'RecordDiagnosticAgreementAuthority','RecordDiagnosticPaymentVerification',
    'InvalidateDiagnosticPaymentVerification','OpenOIAAssessment','RecordOIAEvidence',
    'CreateOIAAssessmentPlan','ReviseOIAAssessmentPlan','ReviewOIAAssessmentPlan',
    'ApproveOIAAssessmentPlan','CreateOIAInspectionItem','UpdateOIAInspectionItem',
    'MarkOIAInspectionItemBlocked','RecordOIAObservation','SupersedeOIAObservation',
    'RecordOIARootCause','CreateOIAFinding','UpdateOIAFindingAnalysis','FinalizeOIAFinding',
    'MarkOIAAssessmentReadyForDelivery','DeliverOIAFindings','ReviseDeliveredOIAFinding',
    'CloseOIAAssessment','RecordOIAConversionDecision','AcceptOIAConversion',
    'ProposeOngoingAgreement','RecordOngoingAgreementApproval','ActivateOngoingAgreement',
    'TerminateOngoingAgreement','RecordOngoingPaymentVerification',
    'InvalidateOngoingPaymentVerification','ProposeOngoingAccessGrant',
    'RecordOngoingAccessApproval','ApproveOngoingAccessGrant','VerifyOngoingAccess',
    'RevokeOngoingAccess','CloseOngoingAccess','InitiateOngoingOffboarding',
    'VerifyOngoingAccessRevocation','CompleteOngoingOffboarding',
    'CreateImplementationOutcome','RecordImplementationOutcomeApproval',
    'ApproveImplementationOutcome','RevokeImplementationOutcome'
  )),
  add constraint sekinfra_idempotency_records_subject_type_check check (subject_type in (
    'ACQUISITION_HANDOFF','ENGAGEMENT','DIAGNOSTIC_SCOPE','ASSESSMENT_ACCESS_PROPOSAL',
    'ASSESSMENT_ACCESS_GRANT','DIAGNOSTIC_AGREEMENT_AUTHORITY',
    'DIAGNOSTIC_PAYMENT_VERIFICATION','OIA_ASSESSMENT','OIA_ASSESSMENT_PLAN',
    'OIA_INSPECTION_ITEM','OIA_EVIDENCE_ITEM','OIA_OBSERVATION','OIA_ROOT_CAUSE',
    'OIA_FINDING','OIA_FINDINGS_DELIVERY','OIA_CONVERSION_DECISION',
    'ONGOING_AGREEMENT_AUTHORITY','ONGOING_PAYMENT_VERIFICATION','ONGOING_ACCESS_GRANT',
    'ONGOING_ACCESS_REVOCATION_VERIFICATION','ONGOING_OFFBOARDING','IMPLEMENTATION_OUTCOME'
  )),
  add constraint sekinfra_idempotency_records_tenant_principal_command_scope_key
    unique (tenant_id,trusted_principal_id,command_type,subject_type,idempotency_scope,idempotency_key);

alter table public.sekinfra_lifecycle_events
  drop constraint sekinfra_lifecycle_events_event_type_check,
  drop constraint sekinfra_lifecycle_events_authoritative_subject_type_check;

alter table public.sekinfra_lifecycle_events
  add constraint sekinfra_lifecycle_events_event_type_check check (event_type in (
    'engagement.handoff.accepted','engagement.opened','diagnostic_scope.submitted',
    'diagnostic_scope.approved','diagnostic_scope.rejected','human_approval.recorded',
    'diagnostic_scope.canonicalized','assessment_access.proposal_created',
    'assessment_access.approval_recorded','assessment_access.grant_issued',
    'assessment_access.verified_and_activated','assessment_access.expired',
    'assessment_access.revoked','assessment_access.closed','diagnostic_agreement.authority_recorded',
    'diagnostic_payment.verified','diagnostic_payment.invalidated','oia.assessment_opened',
    'oia.evidence_recorded','oia.observation_recorded','oia.observation_superseded',
    'oia.root_cause_recorded','oia.finding_created','oia.finding_updated','oia.finding_finalized',
    'oia.assessment_ready_for_delivery','oia.findings_delivered','oia.finding_revision_opened',
    'oia.assessment_closed','oia.assessment_plan_created','oia.assessment_plan_revised',
    'oia.assessment_plan_reviewed','oia.assessment_plan_approved','oia.inspection_item_created',
    'oia.inspection_item_blocked','oia.inspection_item_progressed',
    'conversion.decision_recorded','conversion.accepted','ongoing_agreement.proposed',
    'ongoing_agreement.approval_recorded','ongoing_agreement.activated',
    'ongoing_agreement.terminated','ongoing_payment.verified','ongoing_payment.invalidated',
    'ongoing_access.proposed','ongoing_access.approval_recorded','ongoing_access.approved',
    'ongoing_access.activated','ongoing_access.revoked','ongoing_access.closed',
    'offboarding.initiated','ongoing_access.revocation_verified','offboarding.completed',
    'implementation_outcome.draft_created','implementation_outcome.approval_recorded',
    'implementation_outcome.approved','implementation_outcome.revoked'
  )),
  add constraint sekinfra_lifecycle_events_authoritative_subject_type_check check (
    authoritative_subject_type in (
      'ACQUISITION_HANDOFF','ENGAGEMENT','DIAGNOSTIC_SCOPE','ASSESSMENT_ACCESS_PROPOSAL',
      'ASSESSMENT_ACCESS_GRANT','DIAGNOSTIC_AGREEMENT_AUTHORITY',
      'DIAGNOSTIC_PAYMENT_VERIFICATION','OIA_ASSESSMENT','OIA_ASSESSMENT_PLAN',
      'OIA_INSPECTION_ITEM','OIA_EVIDENCE_ITEM','OIA_OBSERVATION','OIA_ROOT_CAUSE',
      'OIA_FINDING','OIA_FINDINGS_DELIVERY','OIA_CONVERSION_DECISION',
      'ONGOING_AGREEMENT_AUTHORITY','ONGOING_PAYMENT_VERIFICATION','ONGOING_ACCESS_GRANT',
      'ONGOING_ACCESS_REVOCATION_VERIFICATION','ONGOING_OFFBOARDING','IMPLEMENTATION_OUTCOME'
    ) or authoritative_subject_type is null
  );

create table public.sekinfra_implementation_outcomes (
  tenant_id uuid not null,
  implementation_outcome_id uuid not null,
  outcome_version integer not null check (outcome_version > 0),
  implementation_handoff_id uuid not null,
  handoff_version integer not null check (handoff_version > 0),
  engagement_id uuid not null,
  oia_conversion_decision_id uuid not null,
  decision_version integer not null check (decision_version > 0),
  state text not null check (state in ('DRAFT','APPROVED','SUPERSEDED','REVOKED')),
  outcome_authority_digest text not null check (outcome_authority_digest ~ '^sha256:[0-9a-f]{64}$'),
  record_version integer not null check (record_version > 0),
  record jsonb not null check (jsonb_typeof(record)='object'),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (tenant_id,implementation_outcome_id,outcome_version),
  unique (tenant_id,implementation_handoff_id,handoff_version),
  foreign key (tenant_id,engagement_id)
    references public.sekinfra_engagements (tenant_id,engagement_id),
  foreign key (tenant_id,oia_conversion_decision_id,decision_version)
    references public.sekinfra_oia_conversion_decisions (tenant_id,oia_conversion_decision_id,decision_version),
  check (record->>'tenant_id'=tenant_id::text
    and record->>'implementation_outcome_id'=implementation_outcome_id::text
    and (record->>'outcome_version')::integer=outcome_version
    and record->>'implementation_handoff_id'=implementation_handoff_id::text
    and (record->>'handoff_version')::integer=handoff_version
    and record->>'engagement_id'=engagement_id::text
    and (record->'source_conversion_reference'->>'reference_id')=oia_conversion_decision_id::text
    and (record->'source_conversion_reference'->>'reference_version')::integer=decision_version
    and record->>'state'=state
    and record->>'outcome_authority_digest'=outcome_authority_digest
    and (record->>'record_version')::integer=record_version
    and (record->>'implementation_authority_granted')::boolean=false
    and (record->>'deployment_authority_granted')::boolean=false)
);

create index sekinfra_implementation_outcome_engagement
  on public.sekinfra_implementation_outcomes (tenant_id,engagement_id,outcome_version desc);

alter table public.sekinfra_implementation_outcomes enable row level security;
revoke all on table public.sekinfra_implementation_outcomes from anon,authenticated,public;
grant select,insert on table public.sekinfra_implementation_outcomes to sekinfra_consulting_service;
grant update (state,record_version,record,updated_at)
  on public.sekinfra_implementation_outcomes to sekinfra_consulting_service;

create policy sekinfra_consulting_service_tenant_isolation
  on public.sekinfra_implementation_outcomes
  for all to sekinfra_consulting_service
  using (tenant_id = nullif(current_setting('sekinfra.tenant_id',true),'')::uuid)
  with check (tenant_id = nullif(current_setting('sekinfra.tenant_id',true),'')::uuid);

grant insert (implementation_outcome_authority_digest)
  on public.sekinfra_human_approvals to sekinfra_consulting_service;
