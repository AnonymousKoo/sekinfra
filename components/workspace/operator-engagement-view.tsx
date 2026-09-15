import { operatorDemoEngagement as engagement } from "@/fixtures/oia-demo-engagement";
import { AuthorityStatus, DeliveryHistory, EngagementHeader, EvidenceSummaryCard, FindingCard, InspectionCoverageSummary, LifecycleTimeline, LimitationNotice, NextActionCard, ObservationSummary, RootCauseSummary, SectionHeading, StatusPill, SyntheticDemoBanner, WorkspaceShell } from "@/components/workspace/workspace-components";

export function OperatorEngagementView() {
  return <WorkspaceShell perspective="Operator" alternateHref="/client/engagements/demo" alternateLabel="View client perspective">
    <SyntheticDemoBanner notice={engagement.provenance.notice} />
    <div className="space-y-8">
      <EngagementHeader organization={engagement.identity.organization} label={engagement.identity.label} stage={engagement.presentation.stage} status={engagement.assessment.label + ". Access " + engagement.authority.currentAssessmentAccessGrant.technicalState.toLowerCase() + "."} eyebrow="Operator engagement" />
      <NextActionCard audience="Operator" action={engagement.presentation.operatorNextAction} />
      <LifecycleTimeline items={engagement.presentation.lifecycle} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <AuthorityStatus authority={engagement.authority} />
        <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
          <SectionHeading id="reported-context-heading" eyebrow="Reported context" title="Pressure is not proof" compact />
          <p className="mt-4 font-bold">{engagement.reportedContext.pressure}</p>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">Desired outcome: {engagement.reportedContext.desiredOutcome}</p>
          <p className="mt-4 rounded-lg bg-[var(--surface-muted)] p-3 text-sm font-bold">{engagement.reportedContext.qualification}</p>
        </article>
      </section>

      <section aria-labelledby="plan-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading id="plan-heading" eyebrow="Assessment plan" title="Approved inspection intent" />
          <div className="flex gap-2"><StatusPill label={"Plan " + engagement.assessment.plan.state.toLowerCase()} kind="approved" /><StatusPill label={"Version " + engagement.assessment.plan.version} kind="neutral" /></div>
        </div>
        <p className="mt-5 max-w-4xl text-lg text-[var(--ink-muted)]">{engagement.reportedContext.desiredOutcome}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-bold">Objectives</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessment.plan.objectives.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span>{item}</li>)}</ul>
          </div>
          <div>
            <h3 className="font-bold">Process areas</h3>
            <ul className="mt-3 flex flex-wrap gap-2">{engagement.assessment.plan.processAreas.map((item) => <li key={item} className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">{item}</li>)}</ul>
            <h3 className="mt-5 font-bold">Completion criteria</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessment.plan.completionCriteria.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
        </div>
        <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm font-bold text-[var(--brand)]">The plan describes inspection intent. It cannot widen approved scope or access.</p>
      </section>

      <InspectionCoverageSummary inspections={engagement.assessment.inspections} />
      <LimitationNotice>{engagement.assessment.limitation}</LimitationNotice>

      <section aria-labelledby="evidence-heading">
        <SectionHeading id="evidence-heading" eyebrow="Evidence" title="Provenance summaries, not raw evidence" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">{engagement.evidence.map((item) => <EvidenceSummaryCard key={item.id} evidence={item} />)}</div>
      </section>

      <section aria-labelledby="analysis-heading">
        <SectionHeading id="analysis-heading" eyebrow="Internal analysis" title="Observation and cause remain distinct" />
        <div className="mt-5 grid gap-4 lg:grid-cols-2"><ObservationSummary observation={engagement.observations[0]} /><RootCauseSummary cause={engagement.rootCauses[0]} /></div>
      </section>

      <section aria-labelledby="findings-heading">
        <SectionHeading id="findings-heading" eyebrow="Findings" title="Delivered truth and internal work" />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">{engagement.findings.map((finding) => <FindingCard key={finding.id} finding={finding} />)}</div>
      </section>

      <section aria-labelledby="readiness-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-deep)] p-6">
        <SectionHeading id="readiness-heading" eyebrow="Delivery readiness" title="Delivery 01 is complete" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm text-[var(--ink-muted)]">Final delivered findings</p><p className="mt-1 text-2xl font-bold">{engagement.findings.filter((item) => item.state === "FINAL" && item.delivered).length}</p></div>
          <div><p className="text-sm text-[var(--ink-muted)]">Latest delivery</p><p className="mt-1 text-lg font-bold">{engagement.deliveries[0].label}</p></div>
          <div><p className="text-sm text-[var(--ink-muted)]">Later delivery readiness</p><p className="mt-1 text-lg font-bold">Limited by evidence gap</p></div>
        </div>
      </section>

      <DeliveryHistory deliveries={engagement.deliveries} />

      <details className="rounded-xl border border-[var(--line)] bg-white p-5">
        <summary className="min-h-11 cursor-pointer content-center font-bold">Prototype boundaries and technical state</summary>
        <div className="mt-4 border-t border-[var(--line)] pt-4 text-sm text-[var(--ink-muted)]">
          <p>Assessment state: <code>{engagement.assessment.technicalState}</code>. Scope state: <code>{engagement.scope.state}</code>.</p>
          <ul className="mt-3 space-y-2">{engagement.domainGaps.map((gap) => <li key={gap}>• {gap}</li>)}</ul>
          <p className="mt-3 font-bold text-[var(--foreground)]">No implementation authority. No deployment authority. No ongoing access has been established.</p>
        </div>
      </details>
    </div>
  </WorkspaceShell>;
}
