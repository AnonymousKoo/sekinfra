import type { Metadata } from "next";
import { DiagnosticTriage } from "@/components/diagnostic-triage";
import { SiteShell } from "@/components/site-shell";
import { SystemDiagram } from "@/components/visuals/system-diagram";

export const metadata: Metadata = {
  title: "Show us what is happening",
  description:
    "Tell Sekinfra what is going wrong. Answer a few simple questions and get a clear next step. You do not need to know the cause.",
  alternates: { canonical: "/start" },
};

const nextSteps = [
  ["We choose how deep to look", "Sekinfra uses your answers to recommend a Focused Diagnostic or a deeper Operational Infrastructure Assessment (OIA)."],
  ["We keep small problems small", "A clear problem stays focused. A bigger or unclear problem gets a deeper review only when needed."],
  ["You stay in control", "This problem check does not give Sekinfra permission to inspect or change your systems."],
] as const;

export default function Start() {
  return (
    <SiteShell>
      <section className="tech-hero relative overflow-hidden bg-[var(--brand-deep)] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(185,239,112,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(185,239,112,.22)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(135deg,black,transparent_78%)]" />
        <div className="relative mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-18 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow !text-[var(--accent)]">Start with the problem</p>
            <h1 className="text-balance mt-5 text-5xl font-semibold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">
              Show us what&apos;s happening.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              You do not need to know the cause or choose a service. Answer a few simple questions about what is going
              wrong, who it affects, and how often it happens.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#first-review"
                className="inline-flex min-h-12 w-fit items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--brand-deep)] transition hover:bg-white"
              >
                See how to get started
              </a>
              <p className="max-w-sm text-sm leading-6 text-white/70">
                Have a project in mind? You do not need to finish this problem check first.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
              {["Operations", "Automation", "Business Systems", "Cloud & Network", "Security & Compliance"].map((item) => (
                <span className="tech-chip rounded-full px-3 py-2" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <SystemDiagram
              variant="selector"
              activeLabel="Your problem"
              flow={["What is wrong", "Who it affects", "People & systems", "How deep to look", "Next step"]}
            />
            <div className="tech-card tech-card--dark p-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">What this does</p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                It helps choose how deep we need to look. It does not find the root cause, ask for system access, or approve any changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="first-review"
        aria-labelledby="first-review-heading"
        className="section-rule bg-white py-16 sm:py-20 scroll-mt-24"
      >
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="eyebrow">Your first step with Sekinfra</p>
              <h2
                id="first-review-heading"
                className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl"
              >
                Get a clear plan before you pay for a build.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
                Start with a short discovery conversation. If a focused review makes sense, we agree on the
                problem, deliverables, assessment fee, and timing in writing before any paid work begins.
                You do not need to know which technology is causing the problem.
              </p>
              <div className="mt-7 flex flex-col items-start gap-3">
                <a
                  href="mailto:admin@sekinfra.com"
                  className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                >
                  Email Sekinfra to get started
                  <span className="ml-2" aria-hidden="true">→</span>
                </a>
                <p className="max-w-lg text-sm leading-6 text-[var(--ink-muted)]">
                  This opens your email app; it does not book a meeting or submit an online form.
                  Describe the business problem briefly. Please do not email passwords, customer records,
                  access tokens, or sensitive system details.
                </p>
              </div>
            </div>

            <div className="tech-card tech-card--light p-6 sm:p-8">
              <p className="eyebrow">A clear first offer</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
                Focused Systems Review
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-muted)]">
                A scoped, paid assessment of one business problem: missed leads, broken handoffs,
                repeated service delays, unreliable cloud or network systems, or gaps in security
                and compliance processes. If the issue is wider, we can propose a deeper Operational
                Infrastructure Assessment instead.
              </p>
              <ol className="mt-7 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
                {[
                  ["01", "Discover", "Tell us what is happening and what it costs your business. No system access is needed for this conversation."],
                  ["02", "Agree", "Review the written assessment scope, fee, timeframe, and information needed. You choose whether to proceed."],
                  ["03", "Decide", "Receive findings, the priority fixes, and a proposed next step. Implementation requires separate approval."],
                ].map(([number, title, body]) => (
                  <li key={number}>
                    <span className="font-mono text-xs font-bold text-[var(--brand)]">{number}</span>
                    <h4 className="mt-2 text-base font-semibold">{title}</h4>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
                You remain in control. An assessment is not permission to access or change your systems.
                Any access and implementation require their own written authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-[var(--background)] py-14 sm:py-20">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="eyebrow">Your first step</p>
            <h2 className="text-balance mt-4 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              Answer six simple questions.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Sekinfra will use your answers to show whether the problem looks small and focused or needs a deeper review.
            </p>
          </div>
          <DiagnosticTriage />
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-white py-16 sm:py-22">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
            <div>
              <p className="eyebrow">What happens next</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
                The result is a next step, not permission to change anything.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {nextSteps.map(([title, body], index) => (
                <article className="tech-card tech-card--light p-5" key={title}>
                  <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-rule bg-[var(--surface-muted)] py-10">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <p className="max-w-3xl border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
            This problem check runs in your browser. Online submission is not connected yet, so nothing you enter here is sent to Sekinfra.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
