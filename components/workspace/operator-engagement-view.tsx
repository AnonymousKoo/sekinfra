import Link from "next/link";

import { operatorDemoEngagement as engagement } from "@/fixtures/oia-demo-engagement";
import { AuthorityStatus, DeliveryHistory, EvidenceSummaryCard, FindingCard, InspectionCoverageSummary, LifecycleTimeline, LimitationNotice, NextActionCard, ObservationSummary, RootCauseSummary, SectionHeading, StatusPill, SyntheticDemoBanner, WorkspaceShell } from "@/components/workspace/workspace-components";

const jumpLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#scope-authority", label: "Scope & authority" },
  { href: "#assessment", label: "Assessment" },
  { href: "#analysis", label: "Evidence & analysis" },
  { href: "#findings", label: "Findings" },
  { href: "#delivery", label: "Delivery" },
] as const;

function FactCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
    <p className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--ink-faint)]">{label}</p>
    <p className="mt-2 text-lg font-bold text-[var(--brand-deep)]">{value}</p>
    <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{note}</p>
  </div>;
}

export function OperatorEngagementView() {
  const finalDelivered = engagement.findings.filter((item) => item.state === "FINAL" && item.delivered).length;
  const draftFindings = engagement.findings.filter((item) => item.state === "DRAFT").length;

  return <WorkspaceShell perspective="Operator" alternateHref="/client/engagements/demo" alternateLabel="Open client view" currentPath="/workspace/engagements/demo">
    <SyntheticDemoBanner notice={engagement.provenance.notice} />
    <div className="space-y-6 sm:space-y-7">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgb(7_63_50/.06)] sm:p-7">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[38%] opacity-35 md:block" style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "linear-gradient(90deg, transparent, black)" }} />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">Operator engagement</p>
              <StatusPill label={`Stage: ${engagement.presentation.stage}`} kind="active" />
              <StatusPill label={`Access: ${engagement.authority.currentAssessmentAccessGrant.technicalState}`} kind="neutral" />
            </div>
            <h1 className="display-font mt-3 text-3xl leading-tight text-balance sm:text-4xl">{engagement.identity.label}</h1>
            <p className="mt-3 text-lg font-bold text-[var(--brand)]">{engagement.identity.organization}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">One operating view for the diagnostic state, internal analysis, delivered findings, authority boundary, and the next decision.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/client/engagements/demo" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--line)] bg-white px-4 text-sm font-bold text-[var(--brand-deep)] hover:border-[var(--brand)]">Open client view</Link>
            <Link href="/workspace/engagements" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand-deep)] px-4 text-sm font-bold text-white hover:bg-[var(--brand)]">Back to portfolio</Link>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <FactCard label="Assessment" value={engagement.assessment.label} note={engagement.assessment.technicalState} />
          <FactCard label="Access" value={engagement.authority.currentAssessmentAccessGrant.label} note="Diagnostic access boundary" />
          <FactCard label="Findings" value={`${finalDelivered} final · ${draftFindings} draft`} note="Delivered truth stays fixed" />
          <FactCard label="Latest delivery" value={engagement.deliveries[0].label} note={engagement.deliveries[0].deliveredLabel} />
        </div>
      </header>

      <nav aria-label="Engagement sections" className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white p-2 shadow-[0_8px_24px_rgb(7_63_50/.04)]">
        <div className="flex min-w-max gap-1">{jumpLinks.map((item) => <a key={item.href} href={item.href} className="min-h-10 content-center rounded-lg px-3 text-xs font-bold text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--brand-deep)]">{item.label}</a>)}</div>
      </nav>

      <section id="overview" className="scroll-mt-4 space-y-5">
        <NextActionCard audience="Operator" action={engagement.presentation.operatorNextAction} />
        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
            <SectionHeading id="reported-context-heading" eyebrow="Reported context" title="What the client came in with" compact />
            <p className="mt-4 text-lg font-bold leading-7">{engagement.reportedContext.pressure}</p>
            <div className="mt-5 rounded-xl bg-[var(--surface-muted)] p-4">
              <p className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--ink-faint)]">Desired outcome</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{engagement.reportedContext.desiredOutcome}</p>
            </div>
            <p className="mt-4 text-xs font-bold text-[var(--brand)]">{engagement.reportedContext.qualification}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[var(--brand-deep)] p-5 text-white sm:p-6">
            <p className="text-[.68rem] font-bold uppercase tracking-[.14em] text-[var(--accent)]">Current decision point</p>
            <h2 className="mt-2 text-2xl font-bold">Delivery 01 is in the client decision stage.</h2>
            <p className="mt-3 text-sm leading-6 text-[#b9cec5]">The delivered finding is fixed. Diagnostic access is closed. No implementation, deployment, or ongoing access authority has been established.</p>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><dt className="text-xs text-[#88a89b]">Client decision</dt><dd className="mt-1 font-bold">Pending</dd></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><dt className="text-xs text-[#88a89b]">Implementation authority</dt><dd className="mt-1 font-bold">None</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <section id="scope-authority" className="scroll-mt-4 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionHeading id="scope-authority-heading" eyebrow="Scope & authority" title="Know exactly what SekInfra can and cannot do" /><StatusPill label={`Scope ${engagement.scope.state.toLowerCase()}`} kind="approved" /></div>
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <AuthorityStatus authority={engagement.authority} />
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
            <p className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--brand)]">Approved diagnostic boundary</p>
            <div className="mt-5 space-y-5">
              <div><h3 className="text-sm font-bold">Included systems</h3><ul className="mt-2 flex flex-wrap gap-2">{engagement.scope.includedSystems.map((item) => <li key={item} className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold">{item}</li>)}</ul></div>
              <div><h3 className="text-sm font-bold">Permitted actions</h3><ul className="mt-2 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.permittedActions.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />{item}</li>)}</ul></div>
              <div><h3 className="text-sm font-bold">Prohibited actions</h3><ul className="mt-2 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.prohibitedActions.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a6533d]" />{item}</li>)}</ul></div>
            </div>
          </article>
        </div>
      </section>

      <section id="assessment" className="scroll-mt-4 space-y-6">
        <LifecycleTimeline items={engagement.presentation.lifecycle} />
        <article aria-labelledby="plan-heading" className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionHeading id="plan-heading" eyebrow="Assessment plan" title="Approved inspection intent" />
            <div className="flex gap-2"><StatusPill label={"Plan " + engagement.assessment.plan.state.toLowerCase()} kind="approved" /><StatusPill label={"Version " + engagement.assessment.plan.version} kind="neutral" /></div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div><h3 className="font-bold">Objectives</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessment.plan.objectives.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span>{item}</li>)}</ul></div>
            <div><h3 className="font-bold">Process areas</h3><ul className="mt-3 flex flex-wrap gap-2">{engagement.assessment.plan.processAreas.map((item) => <li key={item} className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">{item}</li>)}</ul><h3 className="mt-5 font-bold">Completion criteria</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessment.plan.completionCriteria.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          </div>
          <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm font-bold text-[var(--brand)]">The plan describes inspection intent. It cannot widen approved scope or access.</p>
        </article>
        <InspectionCoverageSummary inspections={engagement.assessment.inspections} />
        <LimitationNotice>{engagement.assessment.limitation}</LimitationNotice>
      </section>

      <section id="analysis" className="scroll-mt-4 space-y-6">
        <div><SectionHeading id="evidence-heading" eyebrow="Evidence & analysis" title="Prove the condition before drawing the conclusion" /><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">Evidence provenance, observation, and root cause stay separate so the operator can see how the finding was supported.</p></div>
        <div className="grid gap-4 md:grid-cols-2">{engagement.evidence.map((item) => <EvidenceSummaryCard key={item.id} evidence={item} />)}</div>
        <div className="grid gap-4 xl:grid-cols-2"><ObservationSummary observation={engagement.observations[0]} /><RootCauseSummary cause={engagement.rootCauses[0]} /></div>
      </section>

      <section id="findings" className="scroll-mt-4 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionHeading id="findings-heading" eyebrow="Findings" title="Delivered truth and internal work" /><div className="flex gap-2"><StatusPill label={`${finalDelivered} final`} kind="approved" /><StatusPill label={`${draftFindings} draft`} kind="neutral" /></div></div>
        <div className="grid gap-4 xl:grid-cols-2">{engagement.findings.map((finding) => <FindingCard key={finding.id} finding={finding} />)}</div>
      </section>

      <section id="delivery" className="scroll-mt-4 space-y-5">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-deep)] p-5 sm:p-6">
          <SectionHeading id="readiness-heading" eyebrow="Delivery" title="Delivery 01 is complete" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <FactCard label="Final delivered findings" value={String(finalDelivered)} note="Included in immutable delivery" />
            <FactCard label="Latest delivery" value={engagement.deliveries[0].label} note="Client safe delivery record" />
            <FactCard label="Later delivery" value="Limited" note="Evidence gap remains" />
          </div>
        </div>
        <DeliveryHistory deliveries={engagement.deliveries} />
      </section>

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
