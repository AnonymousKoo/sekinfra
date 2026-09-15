export const OIA_PROGRESS_READ_MODEL = "OIAEngagementProgressView" as const;

export type OiaProgressNextActionCode =
  | "CREATE_ASSESSMENT_PLAN"
  | "REVIEW_ASSESSMENT_PLAN"
  | "APPROVE_ASSESSMENT_PLAN"
  | "CONTINUE_DIAGNOSTIC_INVESTIGATION"
  | "RESOLVE_FINDING_SET"
  | "MARK_ASSESSMENT_READY_FOR_DELIVERY"
  | "DELIVER_FINDINGS"
  | "RECORD_CONVERSION_DECISION"
  | "RESOLVE_CONVERSION_DECISION"
  | "ESTABLISH_ONGOING_AGREEMENT"
  | "ESTABLISH_ONGOING_COMMERCIAL_AUTHORITY"
  | "ESTABLISH_ONGOING_ACCESS"
  | "DOMAIN_GAP_REQUIRES_DECISION"
  | "NO_REQUIRED_OIA_ACTION";

export type OiaEngagementProgressView = {
  tenant_id: string;
  engagement_id: string;
  oia_assessment_id: string;
  engagement_state: "OPEN" | "ONBOARDING";
  assessment_state: "IN_PROGRESS" | "READY_FOR_DELIVERY" | "FINDINGS_DELIVERED" | "CLOSED";
  assessment_record_version: number;
  diagnostic_scope: {
    diagnostic_scope_id: string;
    scope_version: number;
    status: "DRAFT" | "REVIEW_PENDING" | "APPROVED" | "REJECTED" | "SUPERSEDED" | "CANCELLED";
  };
  assessment_access: {
    assessment_access_grant_id: string;
    state: "APPROVED" | "ACTIVE" | "EXPIRED" | "REVOKED" | "CLOSED";
    usable: boolean;
    reason?: "GRANT_NOT_FOUND" | "GRANT_NOT_ACTIVE" | "ACCESS_NOT_YET_ACTIVE" | "ACCESS_EXPIRED" | "AUTHORITY_BINDING_MISMATCH" | "COMMERCIAL_AUTHORITY_INVALID";
    expires_at?: string;
  };
  assessment_plan?: {
    oia_assessment_plan_id: string;
    plan_version: number;
    state: "DRAFT" | "REVIEWED" | "APPROVED" | "SUPERSEDED";
  };
  inspection_coverage: {
    available: boolean;
    total_items?: number;
    counts?: Record<"NOT_STARTED" | "IN_PROGRESS" | "PARTIALLY_EVIDENCED" | "SUFFICIENTLY_EVIDENCED" | "BLOCKED" | "NOT_APPLICABLE", number>;
    ready_for_observation_analysis?: boolean;
  };
  evidence_progress: {
    evidence_count: number;
    counts_by_type: Array<{ evidence_type: string; count: number }>;
    counts_by_source_system: Array<{ source_system_reference: string; count: number }>;
  };
  findings: {
    current_finding_count: number;
    draft_finding_count: number;
    final_finding_count: number;
    priority_counts: Array<{ priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; count: number }>;
    finding_set_readiness?: { readiness: "READY" | "NOT_READY"; reason_codes: string[] };
  };
  delivery: {
    delivery_count: number;
    latest_delivery_id?: string;
    latest_delivery_sequence?: number;
    latest_delivered_at?: string;
  };
  conversion?: {
    oia_conversion_decision_id: string;
    decision_version: number;
    oia_findings_delivery_id: string;
    decision: "PROCEED" | "DECLINE";
    state: "PENDING_SEKINFRA" | "ACCEPTED" | "DECLINED";
  };
  phase5c_progression: {
    tenant_id: string;
    engagement_id: string;
    conversion_accepted: boolean;
    ongoing_agreement_active: boolean;
    ongoing_commercial_valid: boolean;
    ongoing_access_usable: boolean;
    implementation_authorized: false;
    deployment_authorized: false;
    managed_operations_authorized: false;
    generated_at: string;
  };
  next_required_action: { code: OiaProgressNextActionCode; reason_codes: string[] };
  implementation_authorized: false;
  deployment_authorized: false;
  generated_at: string;
  read_model_version: 1;
};

export function projectProgressTechnicalFacts(progress: OiaEngagementProgressView) {
  if (progress.implementation_authorized || progress.deployment_authorized) {
    throw new Error("OIA progress read model cannot grant implementation or deployment authority.");
  }

  return {
    readModel: {
      name: OIA_PROGRESS_READ_MODEL,
      version: progress.read_model_version,
      generatedAt: progress.generated_at,
      oiaAssessmentId: progress.oia_assessment_id,
      nextRequiredAction: progress.next_required_action,
    },
    scopeState: progress.diagnostic_scope.status,
    assessmentState: progress.assessment_state,
    assessmentAccess: {
      state: progress.assessment_access.state,
      usable: progress.assessment_access.usable,
      reason: progress.assessment_access.reason,
      expiresAt: progress.assessment_access.expires_at,
    },
    inspectionCoverage: progress.inspection_coverage.available && progress.inspection_coverage.counts
      ? { total: progress.inspection_coverage.total_items ?? 0, ...progress.inspection_coverage.counts }
      : undefined,
    findingCounts: {
      DRAFT: progress.findings.draft_finding_count,
      FINAL: progress.findings.final_finding_count,
    },
    latestDeliverySequence: progress.delivery.latest_delivery_sequence,
    conversionState: progress.conversion?.state,
  } as const;
}
