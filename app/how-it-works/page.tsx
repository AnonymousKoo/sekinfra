import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { ProcessFlow } from "@/components/process-flow";
import { DiagnosticPaths } from "@/components/diagnostic-paths";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "See how Sekinfra moves from a business problem to the right review, clear findings, approved work, and a checked result.",
  alternates: { canonical: "/how-it-works" },
};

const journey = [
  {
    title: "Show us the problem",
    client: "You tell us what is going wrong, who it affects, how often it happens, and what should work better.",
    sekinfra: "Sekinfra starts with what you can see instead of forcing the problem into a service category.",
    output: "A clear starting problem.",
  },
  {
    title: "Choose the right review",
    client: "You give enough context for us to understand how broad the problem may be.",
    sekinfra: "Sekinfra recommends a Focused Diagnostic or a deeper Operational Infrastructure Assessment (OIA).",
    output: "The right level of review.",
  },
  {
    title: "Find where it starts",
    client: "You approve only the systems, work, or information needed for the agreed review.",
    sekinfra: "We follow the real path behind the problem and use facts instead of guessing.",
    output: "A clear picture of what is wrong.",
  },
  {
    title: "See the findings",
    client: "You see what we found, what is still unclear, what matters most, and what should work better.",
    sekinfra: "Sekinfra explains the cause, the impact on the business, and the next step in plain language.",
    output: "A clear choice about what needs attention.",
  },
  {
    title: "Approve the work",
    client: "You decide which recommendation, if any, should move forward.",
    sekinfra: "Sekinfra turns only the approved recommendation into a clear work plan.",
    output: "A clear scope before any changes begin.",
  },
  {
    title: "Build the approved change",
    client: "You know what is being changed and what is outside the job.",
    sekinfra: "We fix, connect, secure, add required controls, automate, or redesign only what was approved.",
    output: "Only the approved work gets built.",
  },
  {
    title: "Make sure it worked",
    client: "You see whether the result solved the problem we started with.",
    sekinfra: "Sekinfra tests the result and records anything that is still unresolved.",
    output: "A checked result and a clear next step.",
  },
] as const;

const controls = [
  ["Scope", "We agree on what Sekinfra may look at before access begins."],
  ["Access", "We use only the access needed for the approved diagnostic."],
  ["Approval", "Finding a problem does not automatically approve a fix."],
  ["Change", "Making changes and putting them live require their own approval."],
] as const;

export default function HowItWorks() {
  return (
    <SiteShell>
      <section className="tech-page-hero mx-auto max-w-[var(--page-width)] px-5 py-20 lg:px-8 lg:py-28">
        <p className="eyebrow">How Sekinfra works</p>
        <h1 className="text-balance mt-5 max-w-5xl text-5xl font-semibold tracking-[-.065em] sm:text-6xl">
          Start with what is going wrong. We find the cause, fix the right thing, and check the result.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-muted)]">
          You do not need to know what kind of problem it is. Tell us what is going wrong. We will follow it far enough to find the right next step.
        </p>
        <div className="mt-9">
          <ButtonLink href="/start">Show us what&apos;s happening</ButtonLink>
        </div>
      </section>

      <DiagnosticPaths />

      <section className="section-rule tech-light-surface bg-[var(--surface-muted)] py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">What happens from start to finish</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              From “something is wrong” to a checked result.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Each step has a clear job. Finding a problem does not give us permission to change it.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 lg:grid-cols-2">
            {journey.map((step, index) => (
              <li
                className="tech-card tech-card--light p-6 sm:p-7"
                key={step.title}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <span className="font-mono text-xs text-[var(--brand)]">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{step.title}</h3>
                  </div>
                  <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand)]" />
                </div>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow">What you do</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{step.client}</p>
                  </div>
                  <div>
                    <p className="eyebrow">What Sekinfra does</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{step.sekinfra}</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-[var(--line)] pt-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]">What you get</p>
                  <p className="mt-2 font-semibold leading-6">{step.output}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
            <div>
              <p className="eyebrow text-[var(--accent)]">The delivery loop</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                Find → Plan → Build → Check → Improve.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/70">
                Find the problem, plan the right fix, make the approved change, check the result, and improve only when it makes sense.
              </p>
            </div>
            <div>
              <ProcessFlow dark />
            </div>
          </div>
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.6fr_1.4fr]">
            <div>
              <p className="eyebrow">You stay in control</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em]">
                Looking at a problem does not give us permission to change anything.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {controls.map(([title, body], index) => (
                <article
                  className="tech-card tech-card--light p-6"
                  key={title}
                >
                  <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                  <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="eyebrow">Your first step</p>
          <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
            Tell us what is not working the way it should.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            You do not need to know the cause. Sekinfra will help choose the right review.
          </p>
          <ButtonLink href="/start" className="mt-8">
            Show us what&apos;s happening
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
