import { clientDemoEngagement as engagement } from "@/fixtures/oia-demo-engagement";
import { DeliveryHistory, EngagementHeader, FindingCard, LifecycleTimeline, LimitationNotice, NextActionCard, SectionHeading, StatusPill, SyntheticDemoBanner, WorkspaceShell } from "@/components/workspace/workspace-components";

export function ClientEngagementView() {
  return <WorkspaceShell perspective="Client" alternateHref="/workspace/engagements/demo" alternateLabel="View operator perspective">
    <SyntheticDemoBanner notice={engagement.provenance.notice} />
    <div className="space-y-8">
      <EngagementHeader organization={engagement.identity.organization} label={engagement.identity.label} stage={engagement.presentation.stage} status={engagement.presentation.status} eyebrow="Your engagement" />
      <NextActionCard audience="Client" action={engagement.presentation.nextAction} />
      <LifecycleTimeline items={engagement.presentation.lifecycle} />

      <section aria-labelledby="scope-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><SectionHeading id="scope-heading" eyebrow="Scope" title="What the assessment covers" /><StatusPill label="Scope approved" kind="approved" /></div>
        <p className="mt-5 max-w-4xl text-lg">{engagement.reportedContext.desiredOutcome}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-bold">Included systems</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.includedSystems.map((item) => <li key={item}>• {item}</li>)}</ul>
            <h3 className="mt-5 font-bold">SekInfra may inspect</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.permittedActions.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
          <div>
            <h3 className="font-bold">Excluded systems</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.excludedSystems.map((item) => <li key={item}>• {item}</li>)}</ul>
            <h3 className="mt-5 font-bold">SekInfra may not</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.prohibitedActions.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="access-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--brand-deep)] p-6 text-white sm:p-7">
        <SectionHeading id="access-heading" eyebrow="Diagnostic access" title="Limited access, separate authority" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/20 p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#c8dbd2]">Approval</p><p className="mt-2 font-bold">{engagement.access.approval.label}</p><p className="mt-2 text-sm text-[#c8dbd2]">Approval establishes the boundary. It is distinct from active technical access.</p></div>
          <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent)] p-4 text-[var(--brand-deep)]"><p className="text-xs font-bold uppercase tracking-[.12em]">Current access</p><p className="mt-2 font-bold">{engagement.access.status.label}</p><p className="mt-2 text-sm">Approved read only diagnostic actions are currently usable.</p></div>
        </div>
        <p className="mt-5 text-sm text-[#c8dbd2]">Approved targets: {engagement.access.approvedTargets.join(", ")}. Access expires <time dateTime={engagement.access.expiresAt}>{engagement.access.expiresLabel}</time>.</p>
        <p className="mt-5 rounded-xl border border-white/20 bg-white/10 p-4 font-bold">Assessment access does not authorize system changes. Implementation and deployment require separate decisions and authority.</p>
      </section>

      <section aria-labelledby="progress-heading">
        <SectionHeading id="progress-heading" eyebrow="Assessment" title="What SekInfra has assessed" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-[var(--line)] bg-white p-5"><h3 className="font-bold">Areas assessed</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessmentProgress.areasAssessed.map((item) => <li key={item}>• {item}</li>)}</ul></article>
          <article className="rounded-xl border border-[var(--line)] bg-white p-5"><h3 className="font-bold">Areas still limited</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessmentProgress.limitedAreas.map((item) => <li key={item}>• {item}</li>)}</ul></article>
        </div>
      </section>

      <LimitationNotice>{engagement.assessmentProgress.limitation}</LimitationNotice>

      <section aria-labelledby="delivered-findings-heading">
        <SectionHeading id="delivered-findings-heading" eyebrow="Delivered findings" title="Evidence backed conclusions available to you" />
        <div className="mt-5 space-y-4">{engagement.deliveredFindings.map((finding) => <FindingCard key={finding.id} finding={finding} clientSafe />)}</div>
      </section>

      <DeliveryHistory deliveries={engagement.deliveries} />

      <section aria-labelledby="next-phase-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-7">
        <SectionHeading id="next-phase-heading" eyebrow="Next phase" title="A decision, not an automatic change" />
        <p className="mt-4 max-w-3xl text-[var(--ink-muted)]">Delivered findings provide a basis for deciding what should move forward. They do not authorize implementation.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">{engagement.nextPhaseOptions.map((option) => <li key={option} className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 font-bold">{option}<p className="mt-2 text-sm font-normal text-[var(--ink-muted)]">Explanatory option only. No decision can be recorded in this demonstration.</p></li>)}</ul>
        <p className="mt-5 text-sm font-bold text-[var(--brand)]">Implementation planning and deployment authority remain separate.</p>
      </section>

      <p className="rounded-xl border border-dashed border-[var(--line-strong)] p-4 text-sm text-[var(--ink-muted)]">{engagement.prototypeNote}</p>
    </div>
  </WorkspaceShell>;
}
