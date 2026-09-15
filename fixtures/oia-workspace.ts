import { oiaDemoEngagement } from "./oia-demo-engagement.ts";
import northlineProgressJson from "./oia-engagement-progress-demo.json" with { type: "json" };
import { projectProgressTechnicalFacts, type OiaEngagementProgressView } from "../lib/oia-workspace-read-model.ts";

export const WORKSPACE_SYNTHETIC_NOTICE = "Synthetic operator workspace. No active engagements or production data.";
export const WORKSPACE_REFERENCE_TIME = "2027-02-15T17:00:00Z";
export const ACCESS_EXPIRY_WARNING_DAYS = 14;
export const WORKSPACE_QUEUE_MODEL = {
  kind: "PRESENTATION_PROJECTION",
  authoritative: false,
  notice: "Queue membership remains presentation only and is not authoritative task state. Exact assessment facts may come from OIAEngagementProgressView v1, while attention ownership and pre assessment state remain synthetic presentation data.",
} as const;

export type DiagnosticScopeState = "DRAFT" | "REVIEW_PENDING" | "APPROVED" | "REJECTED" | "SUPERSEDED" | "CANCELLED";
export type AssessmentState = "IN_PROGRESS" | "READY_FOR_DELIVERY" | "FINDINGS_DELIVERED" | "CLOSED";
export type AssessmentAccessState = "APPROVED" | "ACTIVE" | "EXPIRED" | "REVOKED" | "CLOSED";
export type ConversionState = "PENDING_SEKINFRA" | "ACCEPTED" | "DECLINED";
export type FindingState = "DRAFT" | "FINAL" | "SUPERSEDED";
export type InspectionCoverageState = "NOT_STARTED" | "IN_PROGRESS" | "PARTIALLY_EVIDENCED" | "SUFFICIENTLY_EVIDENCED" | "BLOCKED" | "NOT_APPLICABLE";
export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type PresentationAttentionOwner = "CLIENT" | "SEKINFRA";

export type WorkspaceEngagementSummary = {
  provenance: {
    kind: "SYNTHETIC_FIXTURE" | "CONTRACT_VALIDATED_READ_MODEL_FIXTURE";
    authoritative: false;
    notice: string;
  };
  identity: {
    engagementId: string;
    organization: string;
    label: string;
    detailHref?: string;
  };
  stage: string;
  scopeState?: DiagnosticScopeState;
  assessmentState?: AssessmentState;
  assessmentAccess?: {
    state: AssessmentAccessState;
    usable?: boolean;
    reason?: string;
    expiresAt?: string;
    expiresLabel?: string;
  };
  inspectionCoverage?: Partial<Record<InspectionCoverageState, number>> & { total: number };
  findingCounts?: Partial<Record<FindingState, number>>;
  latestDeliverySequence?: number;
  conversionState?: ConversionState;
  readModel?: {
    name: "OIAEngagementProgressView";
    version: 1;
    generatedAt: string;
    oiaAssessmentId: string;
    nextRequiredAction: { code: string; reason_codes: string[] };
  };
  presentationAttentionOwner?: {
    owner: PresentationAttentionOwner;
    presentationOnly: true;
    authoritative: false;
  };
  presentationConversionCondition?: {
    condition: "AWAITING_CLIENT_DECISION";
    presentationOnly: true;
    authoritative: false;
  };
};

const northlineProgress = northlineProgressJson as unknown as OiaEngagementProgressView;
const northlineTechnicalFacts = projectProgressTechnicalFacts(northlineProgress);

const syntheticProvenance = {
  kind: "SYNTHETIC_FIXTURE",
  authoritative: false,
  notice: "Synthetic summary. Not an authoritative engagement record.",
} as const;

const presentationOwner = (owner: PresentationAttentionOwner) => ({
  owner,
  presentationOnly: true,
  authoritative: false,
} as const);

export const oiaWorkspaceFixture = {
  provenance: {
    kind: "SYNTHETIC_FIXTURE",
    authoritative: false,
    notice: WORKSPACE_SYNTHETIC_NOTICE,
  },
  referenceTime: WORKSPACE_REFERENCE_TIME,
  referenceTimeLabel: "February 15, 2027 at 12:00 PM Eastern Time",
  engagements: [
    {
      provenance: {
        kind: "CONTRACT_VALIDATED_READ_MODEL_FIXTURE",
        authoritative: false,
        notice: "Synthetic OIAEngagementProgressView v1 snapshot. Contract valid, but not live production data.",
      },
      identity: {
        engagementId: oiaDemoEngagement.identity.engagementId,
        organization: oiaDemoEngagement.identity.organization,
        label: oiaDemoEngagement.identity.label,
        detailHref: "/workspace/engagements/demo",
      },
      stage: oiaDemoEngagement.presentation.stage,
      ...northlineTechnicalFacts,
      assessmentAccess: {
        ...northlineTechnicalFacts.assessmentAccess,
        expiresLabel: oiaDemoEngagement.authority.expiresLabel,
      },
      presentationAttentionOwner: presentationOwner("CLIENT"),
    },
    {
      provenance: syntheticProvenance,
      identity: {
        engagementId: "synthetic-emberline-intake",
        organization: "Emberline Parts Cooperative",
        label: "Order exception intake assessment",
      },
      stage: "Authorize",
      scopeState: "REVIEW_PENDING",
      presentationAttentionOwner: presentationOwner("CLIENT"),
    },
    {
      provenance: syntheticProvenance,
      identity: {
        engagementId: "synthetic-moss-harbor-assessment",
        organization: "Moss Harbor Equipment",
        label: "Service dispatch visibility assessment",
      },
      stage: "Assess",
      scopeState: "APPROVED",
      assessmentState: "IN_PROGRESS",
      assessmentAccess: {
        state: "ACTIVE",
        expiresAt: "2027-02-22T17:00:00Z",
        expiresLabel: "February 22, 2027 at 12:00 PM Eastern Time",
      },
      inspectionCoverage: { total: 5, IN_PROGRESS: 2, PARTIALLY_EVIDENCED: 1, SUFFICIENTLY_EVIDENCED: 2 },
      findingCounts: { DRAFT: 0, FINAL: 0, SUPERSEDED: 0 },
      presentationAttentionOwner: presentationOwner("SEKINFRA"),
    },
    {
      provenance: syntheticProvenance,
      identity: {
        engagementId: "synthetic-pineglass-review",
        organization: "Pineglass Operations",
        label: "Inventory handoff reliability assessment",
      },
      stage: "Prove",
      scopeState: "APPROVED",
      assessmentState: "IN_PROGRESS",
      assessmentAccess: {
        state: "ACTIVE",
        expiresAt: "2027-04-01T16:00:00Z",
        expiresLabel: "April 1, 2027 at 12:00 PM Eastern Time",
      },
      inspectionCoverage: { total: 6, SUFFICIENTLY_EVIDENCED: 6 },
      findingCounts: { DRAFT: 2, FINAL: 1, SUPERSEDED: 0 },
      presentationAttentionOwner: presentationOwner("SEKINFRA"),
    },
    {
      provenance: syntheticProvenance,
      identity: {
        engagementId: "synthetic-lantern-ridge-delivery",
        organization: "Lantern Ridge Logistics",
        label: "Routing control assessment",
      },
      stage: "Deliver",
      scopeState: "APPROVED",
      assessmentState: "READY_FOR_DELIVERY",
      assessmentAccess: {
        state: "ACTIVE",
        expiresAt: "2027-03-20T16:00:00Z",
        expiresLabel: "March 20, 2027 at 12:00 PM Eastern Time",
      },
      inspectionCoverage: { total: 4, SUFFICIENTLY_EVIDENCED: 4 },
      findingCounts: { DRAFT: 0, FINAL: 2, SUPERSEDED: 0 },
      presentationAttentionOwner: presentationOwner("SEKINFRA"),
    },
    {
      provenance: syntheticProvenance,
      identity: {
        engagementId: "synthetic-bright-acre-decision",
        organization: "Bright Acre Service Group",
        label: "Work order ownership assessment",
      },
      stage: "Decide",
      scopeState: "APPROVED",
      assessmentState: "FINDINGS_DELIVERED",
      assessmentAccess: { state: "CLOSED" },
      inspectionCoverage: { total: 5, SUFFICIENTLY_EVIDENCED: 5 },
      findingCounts: { DRAFT: 0, FINAL: 3, SUPERSEDED: 0 },
      latestDeliverySequence: 2,
      presentationAttentionOwner: presentationOwner("CLIENT"),
      presentationConversionCondition: {
        condition: "AWAITING_CLIENT_DECISION",
        presentationOnly: true,
        authoritative: false,
      },
    },
    {
      provenance: syntheticProvenance,
      identity: {
        engagementId: "synthetic-fairwind-closed",
        organization: "Fairwind Workshop Network",
        label: "Scheduling exception assessment",
      },
      stage: "Closed",
      scopeState: "APPROVED",
      assessmentState: "CLOSED",
      assessmentAccess: { state: "CLOSED" },
      inspectionCoverage: { total: 3, SUFFICIENTLY_EVIDENCED: 3 },
      findingCounts: { DRAFT: 0, FINAL: 1, SUPERSEDED: 0 },
      latestDeliverySequence: 1,
      conversionState: "DECLINED",
    },
  ] satisfies WorkspaceEngagementSummary[],
} as const;

export type WorkspaceQueueKey =
  | "needs-client-action"
  | "needs-sekinfra-review"
  | "active-assessments"
  | "evidence-gaps"
  | "findings-awaiting-finalization"
  | "ready-for-delivery"
  | "awaiting-conversion-decision"
  | "access-expiring-soon";

export type WorkspaceQueue = {
  key: WorkspaceQueueKey;
  label: string;
  purpose: string;
  presentationOnly: true;
  authoritative: false;
  engagements: WorkspaceEngagementSummary[];
};

const queueDefinitions: ReadonlyArray<Omit<WorkspaceQueue, "engagements"> & { includes: (summary: WorkspaceEngagementSummary, referenceTime: number) => boolean }> = [
  {
    key: "needs-sekinfra-review",
    label: "Needs SekInfra review",
    purpose: "Surfaces synthetic summaries with an explicit SekInfra presentation attention owner.",
    presentationOnly: true,
    authoritative: false,
    includes: (summary) => summary.presentationAttentionOwner?.owner === "SEKINFRA",
  },
  {
    key: "ready-for-delivery",
    label: "Ready for delivery",
    purpose: "Surfaces assessments in the authoritative READY_FOR_DELIVERY technical state.",
    presentationOnly: true,
    authoritative: false,
    includes: (summary) => summary.assessmentState === "READY_FOR_DELIVERY",
  },
  {
    key: "findings-awaiting-finalization",
    label: "Findings awaiting finalization",
    purpose: "Surfaces summaries that contain at least one draft finding.",
    presentationOnly: true,
    authoritative: false,
    includes: (summary) => (summary.findingCounts?.DRAFT ?? 0) > 0,
  },
  {
    key: "evidence-gaps",
    label: "Evidence gaps",
    purpose: "Surfaces inspection coverage that is blocked or only partially evidenced.",
    presentationOnly: true,
    authoritative: false,
    includes: (summary) => (summary.inspectionCoverage?.BLOCKED ?? 0) > 0 || (summary.inspectionCoverage?.PARTIALLY_EVIDENCED ?? 0) > 0,
  },
  {
    key: "needs-client-action",
    label: "Needs client action",
    purpose: "Surfaces only summaries with an explicit client presentation attention owner.",
    presentationOnly: true,
    authoritative: false,
    includes: (summary) => summary.presentationAttentionOwner?.owner === "CLIENT",
  },
  {
    key: "awaiting-conversion-decision",
    label: "Awaiting conversion decision",
    purpose: "Surfaces delivered findings that require a conversion decision, using the bounded read model when an exact assessment is available.",
    presentationOnly: true,
    authoritative: false,
    // Exact assessed engagements can use the bounded read-model next action. Pre-assessment and legacy synthetic summaries still require an explicit presentation condition.
    includes: (summary) => summary.assessmentState === "FINDINGS_DELIVERED" && (summary.latestDeliverySequence ?? 0) > 0 && (summary.readModel?.nextRequiredAction.code === "RECORD_CONVERSION_DECISION" || summary.presentationConversionCondition?.condition === "AWAITING_CLIENT_DECISION"),
  },
  {
    key: "access-expiring-soon",
    label: "Access expiring soon",
    purpose: `Surfaces active assessment access that expires within ${ACCESS_EXPIRY_WARNING_DAYS} days of the fixed reference time.`,
    presentationOnly: true,
    authoritative: false,
    includes: (summary, referenceTime) => {
      if (summary.assessmentAccess?.state !== "ACTIVE" || !summary.assessmentAccess.expiresAt) return false;
      const expiry = Date.parse(summary.assessmentAccess.expiresAt);
      const warningEnd = referenceTime + ACCESS_EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000;
      return expiry > referenceTime && expiry <= warningEnd;
    },
  },
  {
    key: "active-assessments",
    label: "Active assessments",
    purpose: "Surfaces assessment work in the authoritative IN_PROGRESS technical state.",
    presentationOnly: true,
    authoritative: false,
    includes: (summary) => summary.assessmentState === "IN_PROGRESS",
  },
];

export function deriveWorkspaceQueues(
  engagements: readonly WorkspaceEngagementSummary[],
  referenceTime = WORKSPACE_REFERENCE_TIME,
): WorkspaceQueue[] {
  const referenceTimestamp = Date.parse(referenceTime);
  if (!Number.isFinite(referenceTimestamp)) throw new Error("Workspace queue reference time must be a valid ISO timestamp.");

  return queueDefinitions.map(({ includes, ...queue }) => ({
    ...queue,
    engagements: engagements.filter((summary) => includes(summary, referenceTimestamp)),
  }));
}

export function getWorkspaceQueue(queues: readonly WorkspaceQueue[], key: WorkspaceQueueKey) {
  const queue = queues.find((item) => item.key === key);
  if (!queue) throw new Error(`Workspace queue ${key} is not defined.`);
  return queue;
}

export function orderEngagementsForWorkspace(engagements: readonly WorkspaceEngagementSummary[], queues: readonly WorkspaceQueue[]) {
  const firstQueueIndex = new Map<string, number>();
  queues.forEach((queue, queueIndex) => queue.engagements.forEach((summary) => {
    if (!firstQueueIndex.has(summary.identity.engagementId)) firstQueueIndex.set(summary.identity.engagementId, queueIndex);
  }));

  return [...engagements].sort((left, right) => {
    const queueDifference = (firstQueueIndex.get(left.identity.engagementId) ?? Number.MAX_SAFE_INTEGER) - (firstQueueIndex.get(right.identity.engagementId) ?? Number.MAX_SAFE_INTEGER);
    return queueDifference || left.identity.organization.localeCompare(right.identity.organization);
  });
}

export const workspaceQueues = deriveWorkspaceQueues(oiaWorkspaceFixture.engagements);
export const orderedWorkspaceEngagements = orderEngagementsForWorkspace(oiaWorkspaceFixture.engagements, workspaceQueues);
