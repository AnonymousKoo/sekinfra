export const SYNTHETIC_DEMO_NOTICE = "Synthetic demonstration. Not an active engagement.";

const lifecycle = [
  { label: "Understand", description: "Define the reported pressure and desired outcome.", state: "complete" },
  { label: "Authorize", description: "Approve scope, commercial conditions, and diagnostic access.", state: "complete" },
  { label: "Assess", description: "Inspect the approved operation and collect evidence.", state: "complete" },
  { label: "Prove", description: "Establish supported observations, causes, and findings.", state: "complete" },
  { label: "Decide", description: "Review delivered findings and choose what moves forward.", state: "current" },
  { label: "Improve", description: "Plan selected improvements under separate authority.", state: "upcoming" },
] as const;

export const oiaDemoEngagement = {
  provenance: {
    kind: "SYNTHETIC_FIXTURE",
    authoritative: false,
    notice: SYNTHETIC_DEMO_NOTICE,
  },
  identity: {
    engagementId: "demo-oia-engagement",
    organization: "Northline Field Services",
    label: "Emergency request response assessment",
  },
  reportedContext: {
    pressure: "Emergency work requests wait because intake, assignment, and customer follow up are split across tools.",
    desiredOutcome: "Every qualified request has an owner, a response window, a visible state, and an exception path.",
    qualification: "Client reported context. It is not an authoritative finding.",
  },
  presentation: {
    lifecycle,
    stage: "Decide",
    status: "Delivery 01 is available for review",
    operatorNextAction: "Review the remaining evidence gap before considering a later findings delivery.",
    clientNextAction: "Review Delivery 01 and consider the next phase options.",
  },
  scope: {
    version: 1,
    state: "APPROVED",
    includedSystems: ["Fictional CRM", "Fictional dispatch board", "Fictional reporting view"],
    excludedSystems: ["Production configuration surfaces", "Deployment controls", "Credential stores"],
    permittedActions: ["Review sanitized records", "Inspect read only operational views", "Map approved process behavior"],
    prohibitedActions: ["Modify system configuration", "Deploy changes", "Delete data", "Create ongoing access"],
  },
  authority: {
    diagnosticAgreement: { technicalState: "VERIFIED_ACTIVE", label: "Diagnostic agreement verified" },
    paymentCondition: { technicalState: "VERIFIED", label: "Payment condition verified" },
    assessmentAccessGrantApprovalMilestone: { technicalState: "APPROVED", label: "Diagnostic access approved" },
    currentAssessmentAccessGrant: { technicalState: "ACTIVE", label: "Diagnostic access verified and active" },
    expiresAt: "2027-02-28T17:00:00Z",
    expiresLabel: "February 28, 2027 at 12:00 PM Eastern Time",
    implementationAuthority: false,
    deploymentAuthority: false,
  },
  assessment: {
    technicalState: "FINDINGS_DELIVERED",
    label: "Findings delivered",
    plan: {
      version: 1,
      state: "APPROVED",
      objectives: [
        "Inspect intake to dispatch ownership.",
        "Inspect response timing.",
        "Inspect exception handling.",
        "Inspect operational visibility.",
      ],
      processAreas: ["Request intake", "Assignment", "Customer follow up", "Exception handling"],
      completionCriteria: ["Material paths inspected", "Evidence sufficiency evaluated", "Limitations recorded"],
      limitations: ["After hours exception timing is only partially evidenced."],
    },
    inspections: [
      { id: "inspection-intake", title: "Request intake completeness", coverage: "SUFFICIENTLY_EVIDENCED", required: true, evidenceCount: 2 },
      { id: "inspection-assignment", title: "Assignment acknowledgment", coverage: "SUFFICIENTLY_EVIDENCED", required: true, evidenceCount: 3 },
      { id: "inspection-response", title: "Response timing", coverage: "IN_PROGRESS", required: false, evidenceCount: 1 },
      { id: "inspection-exceptions", title: "After hours exception timing", coverage: "PARTIALLY_EVIDENCED", required: false, evidenceCount: 1 },
      { id: "inspection-reporting", title: "Archived reporting controls", coverage: "BLOCKED", required: false, evidenceCount: 0, blockedReason: "The historical view is unavailable in this synthetic scenario." },
      { id: "inspection-retired", title: "Retired queue behavior", coverage: "NOT_APPLICABLE", required: false, evidenceCount: 0 },
      { id: "inspection-future", title: "Future dispatch variation", coverage: "NOT_STARTED", required: false, evidenceCount: 0 },
    ],
    limitation: "After hours exception timing remains partially evidenced. Delivery 01 states this limitation and does not claim a conclusion for that path.",
  },
  restrictedAnalysis: {
    evidence: [
      { id: "evidence-metric", type: "Sanitized metric snapshot", sourceCategory: "Fictional reporting view", capturedAt: "2027-01-12T15:30:00Z", capturedLabel: "January 12, 2027 at 10:30 AM Eastern Time", relationship: "Supports the assignment timing observation", secureObjectReference: "REDACTED_SYNTHETIC_REFERENCE" },
      { id: "evidence-map", type: "Workflow map reference", sourceCategory: "Fictional dispatch board", capturedAt: "2027-01-13T16:00:00Z", capturedLabel: "January 13, 2027 at 11:00 AM Eastern Time", relationship: "Corroborates the documented exception path", secureObjectReference: "REDACTED_SYNTHETIC_REFERENCE" },
      { id: "evidence-sequence", type: "Operational sequence reference", sourceCategory: "Fictional CRM", capturedAt: "2027-01-14T19:15:00Z", capturedLabel: "January 14, 2027 at 2:15 PM Eastern Time", relationship: "Supports missing assignment acknowledgment", secureObjectReference: "REDACTED_SYNTHETIC_REFERENCE" },
      { id: "evidence-interview", type: "Interview corroboration", sourceCategory: "Synthetic staff interview", capturedAt: "2027-01-15T14:00:00Z", capturedLabel: "January 15, 2027 at 9:00 AM Eastern Time", relationship: "Corroborates, but does not independently verify, the cause", secureObjectReference: "REDACTED_SYNTHETIC_REFERENCE" },
    ],
    observations: [
      { id: "observation-assignment", state: "RECORDED", condition: "Assignment acknowledgment is absent on exception paths.", confidence: "HIGH", supportingEvidenceIds: ["evidence-metric", "evidence-sequence", "evidence-map"] },
    ],
    rootCauses: [
      {
        id: "cause-ownership",
        statement: "Ownership changes are not represented consistently across the intake and dispatch handoff.",
        confidence: "VERIFIED",
        humanAccepted: true,
        progression: [
          { state: "HYPOTHESIS", label: "Possible cause", explanation: "Ownership changes may not be represented consistently." },
          { state: "SUPPORTED", label: "Supported cause", explanation: "Multiple evidence sources support inconsistent ownership representation." },
          { state: "VERIFIED", label: "Verified cause", explanation: "A human reviewer accepted the evidence backed causal conclusion." },
        ],
        supportingEvidenceIds: ["evidence-metric", "evidence-sequence", "evidence-map"],
      },
    ],
    assessorNotes: "Do not extend the delivered conclusion to after hours timing without sufficient evidence.",
  },
  findings: [
    {
      id: "finding-assignment",
      revision: 1,
      state: "FINAL",
      delivered: true,
      title: "Assignment acknowledgment is inconsistent",
      problemStatement: "Inconsistent assignment acknowledgment contributes to delayed response.",
      whyItMatters: "Qualified emergency requests can wait without a visible owner or response window.",
      desiredOutcome: "Every qualified request records an accountable owner, response window, visible state, and exception path.",
      priority: "HIGH",
      supportSummary: "Supported by three synthetic evidence sources and one human accepted root cause.",
      limitation: "The conclusion does not cover after hours response timing.",
    },
    {
      id: "finding-visibility-draft",
      revision: 1,
      state: "DRAFT",
      delivered: false,
      title: "Reporting visibility requires further review",
      problemStatement: "A possible visibility gap remains under internal review.",
      whyItMatters: "The available synthetic evidence is not sufficient for a client conclusion.",
      desiredOutcome: "Operational state is visible without manual reconciliation.",
      priority: "MEDIUM",
      supportSummary: "Not ready for delivery.",
      limitation: "Historical reporting access is unavailable in this synthetic scenario.",
    },
  ],
  deliveries: [
    {
      id: "delivery-01",
      sequence: 1,
      label: "Delivery 01",
      deliveredAt: "2027-01-22T19:00:00Z",
      deliveredLabel: "January 22, 2027 at 2:00 PM Eastern Time",
      findingRevisions: [{ findingId: "finding-assignment", revision: 1 }],
      immutable: true,
    },
  ],
  domainGaps: [
    "Cross lifecycle status and next action are prototype presentation summaries, not canonical OIA fields.",
    "No client facing API, authentication, session integration, or browser authority facade exists.",
    "No authoritative persisted implementation handoff lifecycle is represented here.",
  ],
} as const;

export function projectOperatorEngagement(source: typeof oiaDemoEngagement) {
  return {
    provenance: source.provenance,
    identity: source.identity,
    reportedContext: source.reportedContext,
    presentation: source.presentation,
    scope: source.scope,
    authority: source.authority,
    assessment: source.assessment,
    evidence: source.restrictedAnalysis.evidence.map((item) => ({
      id: item.id,
      type: item.type,
      sourceCategory: item.sourceCategory,
      capturedAt: item.capturedAt,
      capturedLabel: item.capturedLabel,
      relationship: item.relationship,
    })),
    observations: source.restrictedAnalysis.observations,
    rootCauses: source.restrictedAnalysis.rootCauses,
    assessorNotes: source.restrictedAnalysis.assessorNotes,
    findings: source.findings,
    deliveries: source.deliveries,
    domainGaps: source.domainGaps,
  };
}

export function projectClientEngagement(source: typeof oiaDemoEngagement) {
  const deliveredFindingIds = new Set(source.deliveries.flatMap((delivery) => delivery.findingRevisions.map((item) => item.findingId)));
  return {
    provenance: source.provenance,
    identity: source.identity,
    presentation: {
      lifecycle: source.presentation.lifecycle,
      stage: source.presentation.stage,
      status: source.presentation.status,
      nextAction: source.presentation.clientNextAction,
    },
    reportedContext: source.reportedContext,
    scope: source.scope,
    access: {
      status: source.authority.currentAssessmentAccessGrant,
      approval: source.authority.assessmentAccessGrantApprovalMilestone,
      expiresAt: source.authority.expiresAt,
      expiresLabel: source.authority.expiresLabel,
      approvedTargets: source.scope.includedSystems,
      implementationAuthority: source.authority.implementationAuthority,
      deploymentAuthority: source.authority.deploymentAuthority,
    },
    assessmentProgress: {
      state: source.assessment.technicalState,
      label: source.assessment.label,
      areasAssessed: source.assessment.plan.processAreas,
      limitedAreas: source.assessment.inspections.filter((item) => item.coverage === "PARTIALLY_EVIDENCED" || item.coverage === "BLOCKED").map((item) => item.title),
      limitation: source.assessment.limitation,
    },
    deliveredFindings: source.findings.filter((finding) => finding.state === "FINAL" && finding.delivered && deliveredFindingIds.has(finding.id)),
    deliveries: source.deliveries,
    nextPhaseOptions: ["Proceed with selected findings", "Address internally", "Defer"],
    prototypeNote: "This client view is a synthetic presentation projection. No client API, account, approval action, or persisted decision exists.",
  };
}

export const operatorDemoEngagement = projectOperatorEngagement(oiaDemoEngagement);
export const clientDemoEngagement = projectClientEngagement(oiaDemoEngagement);
