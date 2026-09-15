import Link from "next/link";

import {
  getWorkspaceQueue,
  oiaWorkspaceFixture,
  orderedWorkspaceEngagements,
  WORKSPACE_QUEUE_MODEL,
  workspaceQueues,
  type WorkspaceEngagementSummary,
} from "@/fixtures/oia-workspace";
import { SectionHeading, StatusPill, SyntheticDemoBanner, WorkspaceShell } from "@/components/workspace/workspace-components";

function EngagementName({ summary }: { summary: WorkspaceEngagementSummary }) {
  if (summary.identity.detailHref) {
    return <Link href={summary.identity.detailHref} className="font-bold text-[var(--brand)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--brand)]">{summary.identity.organization}</Link>;
  }
  return <span className="font-bold">{summary.identity.organization}</span>;
}

function SummaryRow({ summary }: { summary: WorkspaceEngagementSummary }) {
  return <li className="rounded-xl border border-[var(--line)] bg-white p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <EngagementName summary={summary} />
        <p className="mt-1 text-sm text-[var(--ink-muted)]">{summary.identity.label}</p>
      </div>
      <StatusPill label={summary.stage} kind="neutral" />
    </div>
  </li>;
}

function QueueCard({ queue }: { queue: (typeof workspaceQueues)[number] }) {
  return <article className="flex min-w-0 flex-col rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--brand)]">Presentation queue</p>
        <h3 className="mt-2 text-xl font-bold">{queue.label}</h3>
      </div>
      <span aria-label={`${queue.engagements.length} engagements`} className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-deep)] px-3 font-bold text-white">{queue.engagements.length}</span>
    </div>
    <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{queue.purpose}</p>
    <ul className="mt-5 space-y-3">{queue.engagements.map((summary) => <SummaryRow key={summary.identity.engagementId} summary={summary} />)}</ul>
  </article>;
}

export function OperatorWorkspaceOverview() {
  const metrics = [
    { label: "Active assessments", value: getWorkspaceQueue(workspaceQueues, "active-assessments").engagements.length },
    { label: "Client action", value: getWorkspaceQueue(workspaceQueues, "needs-client-action").engagements.length },
    { label: "SekInfra review", value: getWorkspaceQueue(workspaceQueues, "needs-sekinfra-review").engagements.length },
    { label: "Expiring access", value: getWorkspaceQueue(workspaceQueues, "access-expiring-soon").engagements.length },
  ];

  return <WorkspaceShell perspective="Operator" currentPath="/workspace">
    <SyntheticDemoBanner notice={oiaWorkspaceFixture.provenance.notice} />
    <div className="space-y-8">
      <header className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 shadow-[0_18px_50px_rgb(7_63_50/.08)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Operator workspace</p>
            <h1 className="display-font mt-3 text-4xl leading-tight text-balance sm:text-5xl">What requires attention now?</h1>
            <p className="mt-4 max-w-2xl text-lg text-[var(--ink-muted)]">A read only view of synthetic OIA work, organized around attention rather than generic activity metrics.</p>
          </div>
          <Link href="/workspace/engagements" className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--brand-deep)] px-5 font-bold text-white hover:bg-[var(--brand)]">View all engagements</Link>
        </div>
      </header>

      <aside aria-label="Projection warning" className="rounded-xl border border-[#9a7619] bg-[#fff9df] p-5 text-[#664c08]">
        <p className="font-bold">Queue membership is still a presentation projection.</p>
        <p className="mt-2 text-sm leading-6">Exact assessment facts can now come from OIAEngagementProgressView v1. Attention ownership and pre assessment portfolio state remain synthetic until their domain rules are modeled.</p>
      </aside>

      <dl aria-label="Workspace summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-[var(--line)] bg-[var(--surface-deep)] p-4 sm:p-5">
          <dt className="text-sm font-bold text-[var(--ink-muted)]">{metric.label}</dt>
          <dd className="mt-2 text-3xl font-bold text-[var(--brand-deep)]">{metric.value}</dd>
        </div>)}
      </dl>

      <section aria-labelledby="attention-heading">
        <SectionHeading id="attention-heading" eyebrow="Attention first" title="Operator attention queues" />
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)]">One engagement can appear in more than one queue. Membership is derived from the fixed synthetic facts as of <time dateTime={oiaWorkspaceFixture.referenceTime}>{oiaWorkspaceFixture.referenceTimeLabel}</time>.</p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">{workspaceQueues.filter((queue) => queue.engagements.length > 0).map((queue) => <QueueCard key={queue.key} queue={queue} />)}</div>
      </section>

      <aside className="rounded-xl border border-dashed border-[var(--line-strong)] p-5 text-sm text-[var(--ink-muted)]">
        <strong className="text-[var(--foreground)]">Model boundary.</strong> {WORKSPACE_QUEUE_MODEL.notice}
      </aside>
    </div>
  </WorkspaceShell>;
}

const coverageLabel = (summary: WorkspaceEngagementSummary) => {
  if (!summary.inspectionCoverage) return null;
  const coverage = summary.inspectionCoverage;
  const details = [
    `${coverage.SUFFICIENTLY_EVIDENCED ?? 0} of ${coverage.total} sufficiently evidenced`,
    (coverage.PARTIALLY_EVIDENCED ?? 0) > 0 ? `${coverage.PARTIALLY_EVIDENCED} partially evidenced` : null,
    (coverage.BLOCKED ?? 0) > 0 ? `${coverage.BLOCKED} blocked` : null,
    (coverage.IN_PROGRESS ?? 0) > 0 ? `${coverage.IN_PROGRESS} in progress` : null,
  ].filter(Boolean);
  return details.join(". ") + ".";
};

const findingsLabel = (summary: WorkspaceEngagementSummary) => {
  if (!summary.findingCounts) return null;
  const drafts = summary.findingCounts.DRAFT ?? 0;
  const finals = summary.findingCounts.FINAL ?? 0;
  return `${drafts} draft ${drafts === 1 ? "finding" : "findings"}. ${finals} final ${finals === 1 ? "finding" : "findings"}.`;
};

function EngagementIndexCard({ summary }: { summary: WorkspaceEngagementSummary }) {
  const memberships = workspaceQueues.filter((queue) => queue.engagements.some((item) => item.identity.engagementId === summary.identity.engagementId));
  const coverage = coverageLabel(summary);
  const findings = findingsLabel(summary);

  return <li>
    <article className="min-w-0 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--brand)]">{summary.readModel ? "Read model backed synthetic engagement" : summary.identity.detailHref ? "Detailed synthetic engagement" : "Synthetic summary only"}</p>
          <h2 className="mt-2 text-xl sm:text-2xl"><EngagementName summary={summary} /></h2>
          <p className="mt-2 text-[var(--ink-muted)]">{summary.identity.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={`Stage: ${summary.stage}`} kind="active" />
          {summary.assessmentState ? <StatusPill label={`Assessment: ${summary.assessmentState}`} kind="neutral" /> : null}
        </div>
      </div>

      {memberships.length > 0 ? <div className="mt-5 flex flex-wrap gap-2" aria-label="Presentation queue membership">{memberships.map((queue) => <StatusPill key={queue.key} label={queue.label} kind="approved" />)}</div> : null}

      <dl className="mt-5 grid gap-4 border-t border-[var(--line)] pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {summary.presentationAttentionOwner ? <div><dt className="font-bold">Presentation attention owner</dt><dd className="mt-1 text-[var(--ink-muted)]">{summary.presentationAttentionOwner.owner === "SEKINFRA" ? "SekInfra" : "Client"}. Not authoritative.</dd></div> : null}
        {coverage ? <div><dt className="font-bold">Inspection coverage</dt><dd className="mt-1 text-[var(--ink-muted)]">{coverage}</dd></div> : null}
        {findings ? <div><dt className="font-bold">Findings</dt><dd className="mt-1 text-[var(--ink-muted)]">{findings}</dd></div> : null}
        {summary.assessmentAccess?.expiresAt && summary.assessmentAccess.expiresLabel ? <div><dt className="font-bold">{summary.assessmentAccess.state === "ACTIVE" ? "Access expiry" : "Scheduled access expiry"}</dt><dd className="mt-1 text-[var(--ink-muted)]"><time dateTime={summary.assessmentAccess.expiresAt}>{summary.assessmentAccess.expiresLabel}</time>. State <code>{summary.assessmentAccess.state}</code>.</dd></div> : null}
        {summary.latestDeliverySequence ? <div><dt className="font-bold">Latest delivery</dt><dd className="mt-1 text-[var(--ink-muted)]">Delivery {String(summary.latestDeliverySequence).padStart(2, "0")}</dd></div> : null}
        {summary.scopeState ? <div><dt className="font-bold">Scope state</dt><dd className="mt-1 text-[var(--ink-muted)]"><code>{summary.scopeState}</code></dd></div> : null}
        {summary.readModel ? <div><dt className="font-bold">Technical facts source</dt><dd className="mt-1 text-[var(--ink-muted)]">{summary.readModel.name} v{summary.readModel.version}. Synthetic contract snapshot, not live production data.</dd></div> : null}
      </dl>
    </article>
  </li>;
}

export function OperatorEngagementIndex() {
  return <WorkspaceShell perspective="Operator" currentPath="/workspace/engagements">
    <SyntheticDemoBanner notice={oiaWorkspaceFixture.provenance.notice} />
    <div className="space-y-8">
      <header className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 shadow-[0_18px_50px_rgb(7_63_50/.08)] sm:p-8">
        <p className="eyebrow">Operator workspace</p>
        <h1 className="display-font mt-3 text-4xl leading-tight text-balance sm:text-5xl">OIA engagements</h1>
        <p className="mt-4 max-w-3xl text-lg text-[var(--ink-muted)]">Synthetic engagement summaries in presentation queue order. Only Northline Field Services has a detailed prototype route.</p>
      </header>

      <aside aria-label="Projection warning" className="rounded-xl border border-[#9a7619] bg-[#fff9df] p-5 text-[#664c08]">
        <p className="font-bold">Queue badges and attention ownership remain presentation projections.</p>
        <p className="mt-2 text-sm leading-6">Assessment backed technical facts may come from OIAEngagementProgressView v1. These queues are still not runtime tasks or approvals.</p>
      </aside>

      <section aria-labelledby="engagement-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="engagement-list-heading" eyebrow="Synthetic portfolio" title="Operational order" />
          <Link href="/workspace" className="min-h-11 content-center font-bold text-[var(--brand)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--brand)]">Return to overview</Link>
        </div>
        <ol className="mt-6 space-y-5">{orderedWorkspaceEngagements.map((summary) => <EngagementIndexCard key={summary.identity.engagementId} summary={summary} />)}</ol>
      </section>
    </div>
  </WorkspaceShell>;
}
