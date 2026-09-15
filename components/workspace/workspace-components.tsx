import Link from "next/link";
import type { ReactNode } from "react";

type LifecycleItem = { label: string; description: string; state: "complete" | "current" | "upcoming" };
type Finding = { title: string; problemStatement: string; whyItMatters: string; desiredOutcome: string; priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; state: "DRAFT" | "FINAL"; supportSummary: string; limitation: string };

const statusStyles = {
  complete: "border-[var(--line-strong)] bg-white text-[var(--foreground)]",
  current: "border-[var(--accent)] bg-[var(--brand-deep)] text-white",
  upcoming: "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-muted)]",
  approved: "border-[var(--line-strong)] bg-[var(--brand-wash)] text-[var(--brand-deep)]",
  active: "border-[var(--accent)] bg-[var(--accent)] text-[var(--brand-deep)]",
  blocked: "border-[#a6533d] bg-[#fff4ef] text-[#702f20]",
  limited: "border-[#9a7619] bg-[#fff9df] text-[#664c08]",
  neutral: "border-[var(--line)] bg-white text-[var(--foreground)]",
} as const;

type StatusKind = keyof typeof statusStyles;

const operatorNavigation = [
  { href: "/workspace", label: "Overview" },
  { href: "/workspace/engagements", label: "Engagements" },
  { href: "/workspace/engagements/demo", label: "Demo engagement" },
] as const;

export function WorkspaceShell({ perspective, alternateHref, alternateLabel, currentPath, children }: { perspective: "Operator" | "Client"; alternateHref?: string; alternateLabel?: string; currentPath?: string; children: ReactNode }) {
  return <div className="min-h-screen bg-[var(--background)]">
    <a href="#workspace-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-[var(--accent)] px-4 py-3 font-bold text-[var(--brand-deep)] transition-transform focus:translate-y-0">Skip to content</a>
    <header className="border-b border-white/15 bg-[var(--brand-deep)] text-white">
      <div className="mx-auto flex w-full max-w-[76rem] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="min-h-11 content-center text-lg font-bold tracking-tight">SekInfra</Link>
        <nav aria-label={perspective === "Operator" ? "Operator prototype" : "Prototype views"} className="flex max-w-full flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-[#c8dbd2]">{perspective} view</span>
          {perspective === "Operator" ? operatorNavigation.map((item) => <Link key={item.href} href={item.href} aria-current={currentPath === item.href ? "page" : undefined} className="min-h-11 content-center rounded-md border border-white/25 px-3 text-sm font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] aria-[current=page]:border-[var(--accent)] aria-[current=page]:text-[var(--accent)]">{item.label}</Link>) : null}
          {alternateHref && alternateLabel ? <Link href={alternateHref} className="min-h-11 content-center rounded-md border border-white/25 px-3 text-sm font-bold hover:border-[var(--accent)] hover:text-[var(--accent)]">{alternateLabel}</Link> : null}
        </nav>
      </div>
    </header>
    <main id="workspace-content" className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--ink-muted)]">Read only SekInfra OIA experience prototype. No account, authority action, or production connection exists.</footer>
  </div>;
}

export function SyntheticDemoBanner({ notice }: { notice: string }) {
  return <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--accent)] bg-[var(--brand-deep)] px-4 py-3 text-sm font-bold text-white">
    <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />{notice}
  </div>;
}

export function EngagementHeader({ organization, label, stage, status, eyebrow }: { organization: string; label: string; stage: string; status: string; eyebrow: string }) {
  return <header className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 shadow-[0_18px_50px_rgb(7_63_50/.08)] sm:p-8">
    <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1/3 opacity-35 sm:block" style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "linear-gradient(90deg, transparent, black)" }} />
    <div className="relative max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-font mt-3 text-4xl leading-tight text-balance sm:text-5xl">{label}</h1>
      <p className="mt-4 text-lg font-bold text-[var(--brand)]">{organization}</p>
      <div className="mt-6 flex flex-wrap gap-3"><StatusPill label={"Current stage: " + stage} kind="active" /><StatusPill label={status} kind="approved" /></div>
    </div>
  </header>;
}

export function NextActionCard({ audience, action }: { audience: string; action: string }) {
  return <section aria-labelledby="next-action-heading" className="rounded-[var(--radius-card)] border border-[var(--accent)] bg-[var(--brand-deep)] p-6 text-white sm:p-7">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">One next action</p>
    <h2 id="next-action-heading" className="mt-2 text-2xl font-bold">{action}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c8dbd2]">This is a {audience.toLowerCase()} presentation cue. It is not a persisted task or workflow action.</p>
  </section>;
}

export function LifecycleTimeline({ items }: { items: readonly LifecycleItem[] }) {
  return <section aria-labelledby="lifecycle-heading">
    <SectionHeading id="lifecycle-heading" eyebrow="Engagement progress" title="Understand what comes next" />
    <ol className="mt-5 grid gap-3 md:grid-cols-6">
      {items.map((item, index) => <li key={item.label} aria-current={item.state === "current" ? "step" : undefined} className={"relative rounded-xl border p-4 " + statusStyles[item.state]}>
        <div className="flex items-center justify-between gap-3"><span className="font-mono text-xs" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="text-xs font-bold uppercase tracking-[.1em]">{item.state}</span></div>
        <h3 className="mt-4 font-bold">{item.label}</h3>
        <p className={"mt-2 text-sm leading-5 " + (item.state === "current" ? "text-[#dbe8e1]" : "text-[var(--ink-muted)]")}>{item.description}</p>
      </li>)}
    </ol>
  </section>;
}

export function AuthorityStatus({ authority }: { authority: { diagnosticAgreement: { label: string }; paymentCondition: { label: string }; assessmentAccessGrantApprovalMilestone: { technicalState: string; label: string }; currentAssessmentAccessGrant: { technicalState: string; label: string }; expiresAt: string; expiresLabel: string; implementationAuthority: boolean; deploymentAuthority: boolean } }) {
  const rows = [authority.diagnosticAgreement.label, authority.paymentCondition.label];
  const accessIsActive = authority.currentAssessmentAccessGrant.technicalState === "ACTIVE";
  const accessIsClosed = authority.currentAssessmentAccessGrant.technicalState === "CLOSED";
  const accessExplanation = accessIsActive
    ? "Verification is complete for approved diagnostic actions only."
    : accessIsClosed
      ? "Assessment access is no longer usable. Findings delivery closed the diagnostic access boundary."
      : "Assessment access is not currently active.";
  return <section aria-labelledby="authority-heading" className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
    <SectionHeading id="authority-heading" eyebrow="Authority" title="Approved boundaries remain separate" compact />
    <ul className="mt-5 space-y-3">{rows.map((label) => <li key={label} className="flex items-center gap-3 text-sm font-bold"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />{label}</li>)}</ul>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--brand-wash)] p-4">
        <p className="text-xs font-bold uppercase tracking-[.12em]">Approval state</p><p className="mt-2 font-bold">{authority.assessmentAccessGrantApprovalMilestone.label}</p><code className="mt-2 block text-xs">{authority.assessmentAccessGrantApprovalMilestone.technicalState}</code><p className="mt-2 text-sm text-[var(--ink-muted)]">The boundary is approved. Approval alone does not make access active.</p>
      </div>
      <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent)] p-4 text-[var(--brand-deep)]">
        <p className="text-xs font-bold uppercase tracking-[.12em]">Technical state</p><p className="mt-2 font-bold">{authority.currentAssessmentAccessGrant.label}</p><code className="mt-2 block text-xs">{authority.currentAssessmentAccessGrant.technicalState}</code><p className="mt-2 text-sm">{accessExplanation}</p>
      </div>
    </div>
    <p className="mt-4 text-sm text-[var(--ink-muted)]">{accessIsActive ? <>Access expires <time dateTime={authority.expiresAt}>{authority.expiresLabel}</time>.</> : <>The approved access window had a scheduled end of <time dateTime={authority.expiresAt}>{authority.expiresLabel}</time>. Access is already closed.</>}</p>
    <div className="mt-5 rounded-xl border border-[#a6533d] bg-[#fff4ef] p-4 text-sm text-[#702f20]"><strong>No implementation or deployment authority.</strong> Assessment access permits inspection only while active. It never permits system changes.</div>
  </section>;
}

export function InspectionCoverageSummary({ inspections }: { inspections: readonly { id: string; title: string; coverage: string; required: boolean; evidenceCount: number; blockedReason?: string }[] }) {
  const friendly: Record<string, string> = { NOT_STARTED: "Not started", IN_PROGRESS: "In progress", PARTIALLY_EVIDENCED: "Partially evidenced", SUFFICIENTLY_EVIDENCED: "Sufficiently evidenced", BLOCKED: "Blocked", NOT_APPLICABLE: "Not applicable" };
  const kind = (coverage: string): StatusKind => coverage === "BLOCKED" ? "blocked" : coverage === "PARTIALLY_EVIDENCED" || coverage === "IN_PROGRESS" ? "limited" : coverage === "SUFFICIENTLY_EVIDENCED" ? "approved" : "neutral";
  return <section aria-labelledby="inspection-heading">
    <SectionHeading id="inspection-heading" eyebrow="Inspection coverage" title="Coverage is not proof" />
    <p className="mt-3 max-w-3xl text-[var(--ink-muted)]">Coverage shows whether inspection work was addressed and whether evidence was sufficient. It does not make a conclusion verified.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {inspections.map((item) => <article key={item.id} className="rounded-xl border border-[var(--line)] bg-white p-5">
        <StatusPill label={friendly[item.coverage] ?? item.coverage} kind={kind(item.coverage)} />
        <h3 className="mt-4 font-bold">{item.title}</h3>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.required ? "Required inspection" : "Optional inspection"}. {item.evidenceCount} evidence {item.evidenceCount === 1 ? "item" : "items"} linked.</p>
        {item.blockedReason ? <p className="mt-3 border-l-2 border-[#a6533d] pl-3 text-sm text-[#702f20]">{item.blockedReason}</p> : null}
      </article>)}
    </div>
  </section>;
}

export function EvidenceSummaryCard({ evidence }: { evidence: { id: string; type: string; sourceCategory: string; capturedAt: string; capturedLabel: string; relationship: string } }) {
  return <article className="rounded-xl border border-[var(--line)] bg-white p-5">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--brand)]">Provenance summary</p><h3 className="mt-2 font-bold">{evidence.type}</h3></div><span aria-label="Reference retained" className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-bold">Recorded</span></div>
    <dl className="mt-4 space-y-3 text-sm"><div><dt className="font-bold">Source category</dt><dd className="text-[var(--ink-muted)]">{evidence.sourceCategory}</dd></div><div><dt className="font-bold">Captured</dt><dd className="text-[var(--ink-muted)]"><time dateTime={evidence.capturedAt}>{evidence.capturedLabel}</time></dd></div><div><dt className="font-bold">Relationship</dt><dd className="text-[var(--ink-muted)]">{evidence.relationship}</dd></div></dl>
    <p className="mt-4 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-faint)]">Raw evidence and secure object references are withheld.</p>
  </article>;
}

export function ObservationSummary({ observation }: { observation: { state: string; condition: string; confidence: string; supportingEvidenceIds: readonly string[] } }) {
  return <article className="rounded-xl border border-[var(--line)] bg-white p-5"><StatusPill label={"Observation " + observation.state.toLowerCase()} kind="neutral" /><h3 className="mt-4 text-lg font-bold">What was verified is happening</h3><p className="mt-2 text-[var(--ink-muted)]">{observation.condition}</p><p className="mt-4 text-sm font-bold">Confidence: {observation.confidence.toLowerCase()}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Supported by {observation.supportingEvidenceIds.length} evidence summaries.</p></article>;
}

export function RootCauseSummary({ cause }: { cause: { statement: string; confidence: string; humanAccepted: boolean; progression: readonly { state: string; label: string; explanation: string }[] } }) {
  return <article className="rounded-xl border border-[var(--line)] bg-white p-5">
    <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--brand)]">Root cause analysis</p><h3 className="mt-3 text-lg font-bold">{cause.statement}</h3>
    <ol aria-label="Root cause confidence progression" className="mt-5 space-y-3">{cause.progression.map((step) => <li key={step.state} className={"rounded-lg border p-3 " + (step.state === "VERIFIED" ? statusStyles.active : step.state === "SUPPORTED" ? statusStyles.approved : statusStyles.neutral)}><div className="flex flex-wrap items-center justify-between gap-2"><strong>{step.label}</strong><code className="text-xs">{step.state}</code></div><p className="mt-1 text-sm">{step.explanation}</p></li>)}</ol>
    <p className="mt-4 text-sm font-bold">Current confidence: {cause.confidence}. {cause.humanAccepted ? "Human accepted." : "Human acceptance pending."}</p>
  </article>;
}

export function FindingCard({ finding, clientSafe = false }: { finding: Finding; clientSafe?: boolean }) {
  const priorityKind: StatusKind = finding.priority === "CRITICAL" || finding.priority === "HIGH" ? "blocked" : finding.priority === "MEDIUM" ? "limited" : "neutral";
  return <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
    <div className="flex flex-wrap items-center gap-2"><StatusPill label={finding.priority + " priority"} kind={priorityKind} /><StatusPill label={finding.state === "FINAL" ? "Final finding" : "Draft finding"} kind={finding.state === "FINAL" ? "approved" : "neutral"} /></div>
    <h3 className="mt-5 text-xl font-bold">{finding.title}</h3><p className="mt-3 text-[var(--ink-muted)]">{finding.problemStatement}</p>
    <dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="font-bold">Why it matters</dt><dd className="mt-1 text-sm text-[var(--ink-muted)]">{finding.whyItMatters}</dd></div><div><dt className="font-bold">Desired outcome</dt><dd className="mt-1 text-sm text-[var(--ink-muted)]">{finding.desiredOutcome}</dd></div>{clientSafe ? null : <div className="sm:col-span-2"><dt className="font-bold">Support summary</dt><dd className="mt-1 text-sm text-[var(--ink-muted)]">{finding.supportSummary}</dd></div>}</dl>
    <div className="mt-5 rounded-lg bg-[var(--surface-muted)] p-3 text-sm"><strong>Limitation:</strong> {finding.limitation}</div><p className="mt-4 text-xs text-[var(--ink-faint)]">A finding defines the verified operational problem and desired outcome. It is not an implementation specification.</p>
  </article>;
}

export function DeliveryHistory({ deliveries }: { deliveries: readonly { id: string; label: string; deliveredAt: string; deliveredLabel: string; findingRevisions: readonly { findingId: string; revision: number }[]; immutable: boolean }[] }) {
  return <section aria-labelledby="delivery-heading"><SectionHeading id="delivery-heading" eyebrow="Delivery history" title="Delivered truth remains fixed" /><div className="mt-5 space-y-3">{deliveries.map((delivery) => <article key={delivery.id} className="rounded-xl border border-[var(--line-strong)] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">{delivery.label}</h3><StatusPill label={delivery.immutable ? "Immutable record" : "Presentation record"} kind="approved" /></div><p className="mt-3 text-sm text-[var(--ink-muted)]">Delivered <time dateTime={delivery.deliveredAt}>{delivery.deliveredLabel}</time>.</p><ul className="mt-3 space-y-1 text-sm">{delivery.findingRevisions.map((item) => <li key={item.findingId + "-" + item.revision}>Finding revision {item.revision} preserved in this delivery.</li>)}</ul></article>)}</div></section>;
}

export function LimitationNotice({ children }: { children: ReactNode }) {
  return <aside className="rounded-xl border border-[#9a7619] bg-[#fff9df] p-5 text-[#664c08]"><p className="text-xs font-bold uppercase tracking-[.12em]">Material limitation</p><p className="mt-2 text-sm leading-6">{children}</p></aside>;
}

export function SectionHeading({ id, eyebrow, title, compact = false }: { id: string; eyebrow: string; title: string; compact?: boolean }) {
  return <div><p className="eyebrow">{eyebrow}</p><h2 id={id} className={"mt-2 font-bold text-balance " + (compact ? "text-xl" : "text-2xl sm:text-3xl")}>{title}</h2></div>;
}

export function StatusPill({ label, kind }: { label: string; kind: StatusKind }) {
  return <span className={"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold " + statusStyles[kind]}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
