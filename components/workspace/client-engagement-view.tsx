import { clientDemoEngagement as engagement } from "@/fixtures/oia-demo-engagement";
import { DeliveryHistory, FindingCard, LifecycleTimeline, LimitationNotice, SectionHeading, StatusPill, SyntheticDemoBanner, WorkspaceShell } from "@/components/workspace/workspace-components";

function ClientFact({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-xl border border-[var(--line)] bg-white p-4">
    <p className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--ink-faint)]">{label}</p>
    <p className="mt-2 text-lg font-bold text-[var(--brand-deep)]">{value}</p>
    <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{note}</p>
  </div>;
}

export function ClientEngagementView() {
  const finding = engagement.deliveredFindings[0];
  const accessClosed = engagement.access.status.technicalState === "CLOSED";

  return <WorkspaceShell perspective="Client" alternateHref="/workspace/engagements/demo" alternateLabel="View operator perspective">
    <SyntheticDemoBanner notice={engagement.provenance.notice} />
    <div className="space-y-6 sm:space-y-7">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgb(7_63_50/.06)] sm:p-8">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[38%] opacity-35 md:block" style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "linear-gradient(90deg, transparent, black)" }} />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">Your SekInfra assessment</p><StatusPill label={`Stage: ${engagement.presentation.stage}`} kind="active" /></div>
          <h1 className="display-font mt-3 text-3xl leading-tight text-balance sm:text-5xl">Your findings are ready. The next step is your decision.</h1>
          <p className="mt-4 text-lg font-bold text-[var(--brand)]">{engagement.identity.organization}</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{engagement.identity.label}</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--ink-muted)]">SekInfra completed the approved assessment and delivered the finding below. Nothing changes in your systems unless you choose a next step and separate authority is established.</p>
        </div>

        <div className="relative mt-6 grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <ClientFact label="Assessment" value="Findings delivered" note="Delivery 01 is available" />
          <ClientFact label="Diagnostic access" value={accessClosed ? "Closed" : engagement.access.status.label} note={accessClosed ? "Closed after findings delivery" : "Approved diagnostic access"} />
          <ClientFact label="Delivered finding" value={String(engagement.deliveredFindings.length)} note="Client safe conclusion" />
          <ClientFact label="Your next step" value="Review and decide" note="No automatic implementation" />
        </div>
      </header>

      <section aria-labelledby="client-next-step-heading" className="rounded-2xl border border-[var(--accent)] bg-[var(--brand-deep)] p-5 text-white sm:p-7">
        <p className="text-[.68rem] font-bold uppercase tracking-[.14em] text-[var(--accent)]">Your next step</p>
        <h2 id="client-next-step-heading" className="mt-2 text-2xl font-bold sm:text-3xl">Review Delivery 01 and decide what should move forward.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#b9cec5]">You can move a selected finding forward with SekInfra, address it internally, or defer it. This preview does not record a decision.</p>
      </section>

      <section aria-labelledby="finding-summary-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionHeading id="finding-summary-heading" eyebrow="What SekInfra found" title="The delivered conclusion" /><StatusPill label="Delivery 01" kind="approved" /></div>
        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <FindingCard finding={finding} clientSafe />
          <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface-deep)] p-5 sm:p-6">
            <p className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[var(--brand)]">What this means for your operation</p>
            <h3 className="mt-3 text-xl font-bold">{finding.whyItMatters}</h3>
            <div className="mt-5 rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--ink-faint)]">Desired outcome</p><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{finding.desiredOutcome}</p></div>
            <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]"><strong className="text-[var(--foreground)]">Known limitation:</strong> {finding.limitation}</p>
          </article>
        </div>
      </section>

      <LifecycleTimeline items={engagement.presentation.lifecycle} />

      <section aria-labelledby="assessment-summary-heading" className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionHeading id="assessment-summary-heading" eyebrow="Assessment summary" title="What was reviewed and where limits remain" /><StatusPill label={engagement.assessmentProgress.label} kind="approved" /></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl bg-[var(--surface-muted)] p-4"><h3 className="font-bold">Areas assessed</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessmentProgress.areasAssessed.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />{item}</li>)}</ul></div>
          <div className="rounded-xl bg-[var(--surface-muted)] p-4"><h3 className="font-bold">Areas still limited</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.assessmentProgress.limitedAreas.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7619]" />{item}</li>)}</ul></div>
        </div>
      </section>

      <LimitationNotice>{engagement.assessmentProgress.limitation}</LimitationNotice>

      <section aria-labelledby="decision-options-heading" className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <SectionHeading id="decision-options-heading" eyebrow="What happens next" title="You choose what moves forward" />
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)]">Delivery creates a decision point. It does not create implementation authority.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">{engagement.nextPhaseOptions.map((option, index) => <article key={option} className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4"><span className="font-mono text-xs text-[var(--ink-faint)]">0{index + 1}</span><h3 className="mt-3 font-bold">{option}</h3><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{index === 0 ? "Selected findings can move into separately authorized implementation planning." : index === 1 ? "Your team can use the delivered finding as the basis for internal action." : "You can leave the finding delivered without starting additional work."}</p></article>)}</div>
        <p className="mt-5 rounded-xl bg-[var(--brand-wash)] p-4 text-sm font-bold text-[var(--brand-deep)]">Any SekInfra implementation planning, system change, deployment, or ongoing access requires a separate decision and authority.</p>
      </section>

      <DeliveryHistory deliveries={engagement.deliveries} />

      <details className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <summary className="min-h-11 cursor-pointer content-center font-bold">Assessment scope and access details</summary>
        <div className="mt-5 grid gap-6 border-t border-[var(--line)] pt-5 md:grid-cols-2">
          <div><h3 className="font-bold">Included systems</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.includedSystems.map((item) => <li key={item}>• {item}</li>)}</ul><h3 className="mt-5 font-bold">SekInfra was permitted to</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.permittedActions.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><h3 className="font-bold">Excluded systems</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.excludedSystems.map((item) => <li key={item}>• {item}</li>)}</ul><h3 className="mt-5 font-bold">SekInfra was not permitted to</h3><ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">{engagement.scope.prohibitedActions.map((item) => <li key={item}>• {item}</li>)}</ul></div>
        </div>
        <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4"><p className="font-bold">Diagnostic access is {accessClosed ? "closed" : engagement.access.status.technicalState.toLowerCase()}.</p><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">The approved diagnostic window had a scheduled end of <time dateTime={engagement.access.expiresAt}>{engagement.access.expiresLabel}</time>. Findings delivery closed the diagnostic access boundary. Assessment access never authorized system changes.</p></div>
      </details>

      <p className="rounded-xl border border-dashed border-[var(--line-strong)] p-4 text-sm text-[var(--ink-muted)]">{engagement.prototypeNote}</p>
    </div>
  </WorkspaceShell>;
}
