import Link from "next/link";
import { OIA_AREAS } from "@/lib/oia-walkthrough";

export function DiagnosticPaths() {
  return (
    <section className="section-rule bg-[var(--surface-muted)] py-14 sm:py-20" aria-labelledby="diagnostic-paths-title">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Two review options</p>
          <h2 id="diagnostic-paths-title" className="mt-4 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Start focused. Look wider when needed.</h2>
          <p className="mt-4 leading-7 text-[var(--ink-muted)]">Agree on the smallest useful review before granting access. Neither option authorizes implementation.</p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="tech-card tech-card--light bg-white p-6 sm:p-8">
            <p className="eyebrow">One bounded problem</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-.035em]">Focused Diagnostic</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">For a recurring network interruption, a failed system connection or one workflow that keeps breaking. We trace the agreed issue using available evidence.</p>
            <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm leading-6"><strong>You receive:</strong> findings, evidence limits and recommended next steps for that problem.</p>
            <Link href="/start" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Prepare a problem brief →</Link>
          </article>
          <article className="tech-card tech-card--light border-[var(--brand)] bg-white p-6 sm:p-8">
            <p className="eyebrow">Across the operation</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-.035em]">Operational Infrastructure Assessment (OIA)</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">For issues that cross teams or systems, keep returning or have an unclear cause. The OIA looks across seven operating areas to understand how the parts affect each other.</p>
            <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm leading-6"><strong>You receive:</strong> an operating picture, supported findings, priorities and a decision about what to address next.</p>
            <details className="mt-4 text-sm">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold">The seven operating areas</summary>
              <ul className="grid gap-2 py-3 text-[var(--ink-muted)] sm:grid-cols-2">
                {OIA_AREAS.map((area) => <li key={area.id}>{area.number}. {area.category}</li>)}
              </ul>
            </details>
            <Link href="/oia" className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Try the seven-area OIA walkthrough →</Link>
          </article>
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--ink-muted)]">The free browser walkthrough is a self-review, not a completed assessment or verified diagnosis. A professional review requires an agreed scope, deliverables, fee and timing.</p>
      </div>
    </section>
  );
}
