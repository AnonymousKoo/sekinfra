import Link from "next/link";

import {
  getWorkspaceQueue,
  oiaWorkspaceFixture,
  orderedWorkspaceEngagements,
  WORKSPACE_QUEUE_MODEL,
  workspaceQueues,
  type WorkspaceEngagementSummary,
  type WorkspaceQueue,
} from "@/fixtures/oia-workspace";
import { SectionHeading, StatusPill, SyntheticDemoBanner, WorkspaceShell } from "@/components/workspace/workspace-components";

const nextActionLabels: Record<string, string> = {
  CREATE_ASSESSMENT_PLAN: "Create the assessment plan",
  REVIEW_ASSESSMENT_PLAN: "Review the assessment plan",
  APPROVE_ASSESSMENT_PLAN: "Approve the assessment plan",
  CONTINUE_DIAGNOSTIC_INVESTIGATION: "Continue diagnostic investigation",
  RESOLVE_FINDING_SET: "Resolve the finding set",
  MARK_ASSESSMENT_READY_FOR_DELIVERY: "Mark the assessment ready for delivery",
  DELIVER_FINDINGS: "Deliver finalized findings",
  RECORD_CONVERSION_DECISION: "Client decision needed on delivered findings",
  RESOLVE_CONVERSION_DECISION: "Resolve the conversion decision",
  ESTABLISH_ONGOING_AGREEMENT: "Establish the ongoing agreement",
  ESTABLISH_ONGOING_COMMERCIAL_AUTHORITY: "Establish ongoing commercial authority",
  ESTABLISH_ONGOING_ACCESS: "Establish ongoing access",
  DOMAIN_GAP_REQUIRES_DECISION: "Owner decision required",
  NO_REQUIRED_OIA_ACTION: "No OIA action required",
};

function membershipsFor(summary: WorkspaceEngagementSummary) {
  return workspaceQueues.filter((queue) => queue.engagements.some((item) => item.identity.engagementId === summary.identity.engagementId));
}

function nextCue(summary: WorkspaceEngagementSummary) {
  const boundedAction = summary.readModel?.nextRequiredAction.code;
  if (boundedAction) return nextActionLabels[boundedAction] ?? boundedAction.replaceAll("_", " ").toLowerCase();
  if (summary.presentationAttentionOwner?.owner === "CLIENT") return "Waiting on client action";
  if (summary.presentationAttentionOwner?.owner === "SEKINFRA") return "SekInfra review needed";
  return "Monitor engagement state";
}

function primaryAttention(summary: WorkspaceEngagementSummary) {
  const memberships = membershipsFor(summary);
  if (memberships.some((queue) => queue.key === "access-expiring-soon")) return { label: "Time sensitive", kind: "limited" as const };
  if (summary.presentationAttentionOwner?.owner === "SEKINFRA") return { label: "SekInfra attention", kind: "active" as const };
  if (summary.presentationAttentionOwner?.owner === "CLIENT") return { label: "Waiting on client", kind: "neutral" as const };
  return { label: "Monitor", kind: "neutral" as const };
}

function StageDot({ stage }: { stage: string }) {
  const active = stage !== "Closed";
  return <span aria-hidden="true" className={"h-2 w-2 shrink-0 rounded-full " + (active ? "bg-[var(--accent)]" : "bg-[var(--line-strong)]")} />;
}

function FocusRow({ summary }: { summary: WorkspaceEngagementSummary }) {
  const attention = primaryAttention(summary);
  const memberships = membershipsFor(summary);
  const timeSensitive = memberships.some((queue) => queue.key === "access-expiring-soon");
  return <article className="group rounded-2xl border border-[var(--line)] bg-white p-4 transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[0_14px_34px_rgb(7_63_50/.07)] sm:p-5">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(15rem,.8fr)_auto] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={attention.label} kind={attention.kind} />
          {timeSensitive ? <span className="text-xs font-bold text-[#765a0a]">Access window needs attention</span> : null}
        </div>
        <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">{summary.identity.organization}</h3>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">{summary.identity.label}</p>
      </div>
      <div className="min-w-0 border-l-0 border-[var(--line)] xl:border-l xl:pl-5">
        <p className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--ink-faint)]">Next cue</p>
        <p className="mt-1 font-bold text-[var(--brand-deep)]">{nextCue(summary)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ink-muted)]">
          <span className="inline-flex items-center gap-1.5"><StageDot stage={summary.stage} />{summary.stage}</span>
          {summary.findingCounts ? <span>{summary.findingCounts.DRAFT ?? 0} draft · {summary.findingCounts.FINAL ?? 0} final</span> : null}
          {summary.assessmentAccess ? <span>Access {summary.assessmentAccess.state.toLowerCase()}</span> : null}
        </div>
      </div>
      <div className="xl:justify-self-end">
        {summary.identity.detailHref ? <Link href={summary.identity.detailHref} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand-deep)] px-4 text-sm font-bold text-white transition-colors hover:bg-[var(--brand)]">Open engagement</Link> : <span className="inline-flex min-h-10 items-center rounded-lg border border-[var(--line)] px-3 text-xs font-bold text-[var(--ink-muted)]">Summary only</span>}
      </div>
    </div>
  </article>;
}

function QueueDirectoryCard({ queue }: { queue: WorkspaceQueue }) {
  return <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold">{queue.label}</h3>
      <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[var(--surface-deep)] px-2 text-sm font-bold text-[var(--brand-deep)]">{queue.engagements.length}</span>
    </div>
    <p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">{queue.purpose}</p>
  </article>;
}

export function OperatorWorkspaceOverview() {
  const needsSekInfra = getWorkspaceQueue(workspaceQueues, "needs-sekinfra-review").engagements;
  const needsClient = getWorkspaceQueue(workspaceQueues, "needs-client-action").engagements;
  const activeAssessments = getWorkspaceQueue(workspaceQueues, "active-assessments").engagements;
  const expiringAccess = getWorkspaceQueue(workspaceQueues, "access-expiring-soon").engagements;
  const focusIds = new Set([...expiringAccess, ...needsSekInfra, ...needsClient].map((item) => item.identity.engagementId));
  const attentionRank = (summary: WorkspaceEngagementSummary) => {
    const memberships = membershipsFor(summary);
    if (memberships.some((queue) => queue.key === "access-expiring-soon")) return 0;
    if (summary.presentationAttentionOwner?.owner === "SEKINFRA") return 1;
    if (summary.presentationAttentionOwner?.owner === "CLIENT") return 2;
    return 3;
  };
  const focusEngagements = orderedWorkspaceEngagements.filter((item) => focusIds.has(item.identity.engagementId)).sort((left, right) => attentionRank(left) - attentionRank(right));
  const deliveredCount = orderedWorkspaceEngagements.filter((item) => (item.latestDeliverySequence ?? 0) > 0).length;

  const metrics = [
    { label: "Needs SekInfra", value: needsSekInfra.length, note: "Operator attention" },
    { label: "Waiting on client", value: needsClient.length, note: "External dependency" },
    { label: "Active assessments", value: activeAssessments.length, note: "Diagnostic work open" },
    { label: "Time sensitive", value: expiringAccess.length, note: "Access window" },
  ];

  return <WorkspaceShell perspective="Operator" currentPath="/workspace">
    <SyntheticDemoBanner notice={oiaWorkspaceFixture.provenance.notice} />
    <div className="space-y-6 sm:space-y-7">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgb(7_63_50/.06)] sm:p-7">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[42%] opacity-40 md:block" style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "34px 34px", maskImage: "linear-gradient(90deg, transparent, black)" }} />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">Operator command center</p>
              <span className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-2.5 py-1 text-[.68rem] font-bold text-[var(--ink-muted)]">{orderedWorkspaceEngagements.length} synthetic engagements</span>
            </div>
            <h1 className="display-font mt-3 text-3xl leading-tight text-balance sm:text-4xl">Run the work that needs attention.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-muted)]">See what SekInfra needs to handle, what is waiting on the client, and where every engagement stands without digging through raw technical state.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/workspace/engagements" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand-deep)] px-4 text-sm font-bold text-white hover:bg-[var(--brand)]">Open portfolio</Link>
            <span className="inline-flex min-h-11 items-center rounded-lg border border-[var(--line)] bg-white px-4 text-xs font-bold text-[var(--ink-muted)]">As of {oiaWorkspaceFixture.referenceTimeLabel}</span>
          </div>
        </div>
      </header>

      <dl aria-label="Workspace operating pulse" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><dt className="text-sm font-bold text-[var(--ink-muted)]">{metric.label}</dt><span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" /></div>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-[var(--brand-deep)]">{metric.value}</dd>
          <p className="mt-1 text-xs text-[var(--ink-faint)]">{metric.note}</p>
        </div>)}
      </dl>

      <section aria-labelledby="focus-heading" className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,.65fr)]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading id="focus-heading" eyebrow="Attention now" title="Priority stack" />
            <p className="text-xs font-bold text-[var(--ink-faint)]">Presentation order, not a persisted task queue</p>
          </div>
          <div className="mt-4 space-y-3">{focusEngagements.map((summary) => <FocusRow key={summary.identity.engagementId} summary={summary} />)}</div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-[var(--brand-deep)] p-5 text-white sm:p-6">
          <p className="text-[.68rem] font-bold uppercase tracking-[.14em] text-[var(--accent)]">Operating pulse</p>
          <h2 className="mt-2 text-2xl font-bold">Portfolio state</h2>
          <dl className="mt-6 space-y-5">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4"><div><dt className="text-sm font-bold text-[#c8dbd2]">Total engagements</dt><dd className="mt-1 text-xs text-[#88a89b]">Synthetic portfolio</dd></div><span className="text-3xl font-bold">{orderedWorkspaceEngagements.length}</span></div>
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4"><div><dt className="text-sm font-bold text-[#c8dbd2]">Findings delivered</dt><dd className="mt-1 text-xs text-[#88a89b]">Client decision stage</dd></div><span className="text-3xl font-bold">{deliveredCount}</span></div>
            <div className="flex items-end justify-between gap-4"><div><dt className="text-sm font-bold text-[#c8dbd2]">Read model backed</dt><dd className="mt-1 text-xs text-[#88a89b]">Exact assessment facts</dd></div><span className="text-3xl font-bold">{orderedWorkspaceEngagements.filter((item) => item.readModel).length}</span></div>
          </dl>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-[#a9c0b6]">Queue membership and attention ownership remain presentation cues. Exact assessment facts can use OIAEngagementProgressView v1.</div>
        </aside>
      </section>

      <section aria-labelledby="queues-heading" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-deep)] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading id="queues-heading" eyebrow="Queue directory" title="Everything else at a glance" compact />
          <Link href="/workspace/engagements" className="text-sm font-bold text-[var(--brand)] underline decoration-[var(--line-strong)] underline-offset-4">View full portfolio</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{workspaceQueues.map((queue) => <QueueDirectoryCard key={queue.key} queue={queue} />)}</div>
      </section>

      <aside className="rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-3 text-xs leading-5 text-[var(--ink-muted)]"><strong className="text-[var(--foreground)]">Model boundary.</strong> {WORKSPACE_QUEUE_MODEL.notice}</aside>
    </div>
  </WorkspaceShell>;
}

const coverageLabel = (summary: WorkspaceEngagementSummary) => {
  if (!summary.inspectionCoverage) return "Not started";
  const coverage = summary.inspectionCoverage;
  const details = [
    `${coverage.SUFFICIENTLY_EVIDENCED ?? 0}/${coverage.total} evidenced`,
    (coverage.PARTIALLY_EVIDENCED ?? 0) > 0 ? `${coverage.PARTIALLY_EVIDENCED} partial` : null,
    (coverage.BLOCKED ?? 0) > 0 ? `${coverage.BLOCKED} blocked` : null,
  ].filter(Boolean);
  return details.join(" · ");
};

const findingsLabel = (summary: WorkspaceEngagementSummary) => {
  if (!summary.findingCounts) return "No findings yet";
  const drafts = summary.findingCounts.DRAFT ?? 0;
  const finals = summary.findingCounts.FINAL ?? 0;
  return `${drafts} draft · ${finals} final`;
};

function EngagementIndexCard({ summary }: { summary: WorkspaceEngagementSummary }) {
  const memberships = membershipsFor(summary);
  const attention = primaryAttention(summary);
  return <li>
    <article className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[0_8px_24px_rgb(7_63_50/.035)] sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,1fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={attention.label} kind={attention.kind} />
            <span className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--ink-faint)]">{summary.readModel ? "Assessment facts backed" : "Presentation summary"}</span>
          </div>
          <h2 className="mt-3 text-xl font-bold">{summary.identity.organization}</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{summary.identity.label}</p>
          <p className="mt-3 font-bold text-[var(--brand-deep)]">{nextCue(summary)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm sm:grid-cols-4 xl:border-l xl:border-[var(--line)] xl:pl-5">
          <div><dt className="text-xs font-bold text-[var(--ink-faint)]">Stage</dt><dd className="mt-1 font-bold">{summary.stage}</dd></div>
          <div><dt className="text-xs font-bold text-[var(--ink-faint)]">Access</dt><dd className="mt-1 font-bold">{summary.assessmentAccess?.state ?? "Not issued"}</dd></div>
          <div><dt className="text-xs font-bold text-[var(--ink-faint)]">Coverage</dt><dd className="mt-1 font-bold">{coverageLabel(summary)}</dd></div>
          <div><dt className="text-xs font-bold text-[var(--ink-faint)]">Findings</dt><dd className="mt-1 font-bold">{findingsLabel(summary)}</dd></div>
        </dl>

        <div className="xl:justify-self-end">
          {summary.identity.detailHref ? <Link href={summary.identity.detailHref} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand-deep)] px-4 text-sm font-bold text-white hover:bg-[var(--brand)]">Open engagement</Link> : <span className="inline-flex min-h-10 items-center rounded-lg border border-[var(--line)] px-3 text-xs font-bold text-[var(--ink-muted)]">Demo summary only</span>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3" aria-label="Presentation queue membership">{memberships.map((queue) => <span key={queue.key} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[.68rem] font-bold text-[var(--ink-muted)]">{queue.label}</span>)}</div>
    </article>
  </li>;
}

export function OperatorEngagementIndex() {
  const inProgress = orderedWorkspaceEngagements.filter((item) => item.assessmentState === "IN_PROGRESS").length;
  const delivered = orderedWorkspaceEngagements.filter((item) => (item.latestDeliverySequence ?? 0) > 0).length;
  return <WorkspaceShell perspective="Operator" currentPath="/workspace/engagements">
    <SyntheticDemoBanner notice={oiaWorkspaceFixture.provenance.notice} />
    <div className="space-y-6 sm:space-y-7">
      <header className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Engagement portfolio</p>
            <h1 className="display-font mt-2 text-3xl leading-tight sm:text-4xl">Every client, one operating view.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-muted)]">Scan ownership, stage, access, evidence coverage, findings, and the next cue without opening every engagement.</p>
          </div>
          <Link href="/workspace" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--line)] bg-white px-4 text-sm font-bold text-[var(--brand-deep)] hover:border-[var(--brand)]">Back to command center</Link>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-5 sm:max-w-xl">
          <div><p className="text-2xl font-bold text-[var(--brand-deep)]">{orderedWorkspaceEngagements.length}</p><p className="text-xs text-[var(--ink-muted)]">Total</p></div>
          <div><p className="text-2xl font-bold text-[var(--brand-deep)]">{inProgress}</p><p className="text-xs text-[var(--ink-muted)]">In progress</p></div>
          <div><p className="text-2xl font-bold text-[var(--brand-deep)]">{delivered}</p><p className="text-xs text-[var(--ink-muted)]">Delivered</p></div>
        </div>
      </header>

      <aside className="rounded-xl border border-[#9a7619] bg-[#fff9df] px-4 py-3 text-xs leading-5 text-[#664c08]"><strong>Preview boundary.</strong> Attention ownership and queue badges are presentation cues. Exact assessment technical facts may come from OIAEngagementProgressView v1.</aside>

      <section aria-labelledby="engagement-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="engagement-list-heading" eyebrow="Operational order" title="Engagements" />
          <p className="text-xs font-bold text-[var(--ink-faint)]">Northline is the only detailed demo route in this slice</p>
        </div>
        <ol className="mt-5 space-y-3">{orderedWorkspaceEngagements.map((summary) => <EngagementIndexCard key={summary.identity.engagementId} summary={summary} />)}</ol>
      </section>
    </div>
  </WorkspaceShell>;
}
