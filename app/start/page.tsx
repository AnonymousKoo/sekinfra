import type { Metadata } from "next";
import { DiagnosticTriage } from "@/components/diagnostic-triage";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Start a diagnostic",
  description: "Tell Sekinfra what is happening and get an initial diagnostic path before any system access or implementation begins.",
  alternates: { canonical: "/start" },
};

const boundaries = [
  ["No software pitch", "Start with the operating problem, not a product category."],
  ["No system access", "Triage happens before inspection, credentials, or evidence collection."],
  ["No hidden submission", "This browser-only experience does not send or store your answers."],
];

export default function Start() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[var(--brand-deep)] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(213,227,108,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(213,227,108,.28)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(135deg,black,transparent_78%)]" />
        <div className="relative mx-auto max-w-[var(--page-width)] px-5 py-20 lg:px-8 lg:py-28">
          <p className="eyebrow !text-[var(--accent)]">Sekinfra operational triage</p>
          <h1 className="text-balance mt-6 max-w-5xl text-5xl font-semibold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">
            Tell us what is happening. Determine how deep the diagnosis needs to go.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl">
            You do not need to diagnose the cause or choose a technology. Bound the symptom, recurrence, impact, and
            operating spread. Sekinfra will show the smallest diagnostic path that fits the signals you provide.
          </p>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {boundaries.map(([title, body], index) => (
              <div className="border-t border-white/20 pt-4" key={title}>
                <div className="flex gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                  <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/60">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule bg-[var(--background)] py-14 sm:py-20">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="eyebrow">Live diagnostic lens</p>
            <h2 className="text-balance mt-4 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              Bound the problem before anyone prescribes a fix.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              This is an interactive triage experience, not a diagnosis. It helps distinguish a contained problem from a
              broader operating condition that may justify the Operational Infrastructure Assessment.
            </p>
          </div>
          <DiagnosticTriage />
        </div>
      </section>

      <section className="section-rule bg-white py-16 sm:py-22">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-8 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">What happens next</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
              A route is a decision about diagnostic depth—not permission to change anything.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[var(--radius-card)] border border-[var(--line)] p-6">
              <p className="font-mono text-xs text-[var(--brand)]">FOCUSED</p>
              <h3 className="mt-3 text-xl font-semibold">Focused Diagnostic</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
                Keep the boundary narrow, establish the failure point and consequence, then determine the smallest
                justified intervention.
              </p>
            </article>
            <article className="rounded-[var(--radius-card)] bg-[var(--brand-deep)] p-6 text-white">
              <p className="font-mono text-xs text-[var(--accent)]">OIA</p>
              <h3 className="mt-3 text-xl font-semibold">Operational Infrastructure Assessment</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Map a broader or unclear operating problem across boundaries, evidence, findings, priorities, and the
                controlled next decision.
              </p>
            </article>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
