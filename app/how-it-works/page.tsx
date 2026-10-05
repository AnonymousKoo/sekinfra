import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { ProcessFlow } from "@/components/process-flow";
import { DiagnosticPaths } from "@/components/diagnostic-paths";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "See how Sekinfra moves from a business problem to the right diagnosis, clear findings, approved work, and a checked result.",
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
    title: "Choose the right diagnostic",
    client: "You give enough context for us to understand how broad the problem may be.",
    sekinfra: "Sekinfra recommends a Focused Diagnostic or the Operational Infrastructure Assessment (OIA).",
    output: "The right level of diagnosis.",
  },
  {
    title: "Find the cause",
    client: "You approve only the systems, work, or information needed for the agreed diagnostic.",
    sekinfra: "We check the real path behind the problem and use evidence instead of guessing.",
    output: "A supported picture of what is actually wrong.",
  },
  {
    title: "See the findings",
    client: "You see what we found, what still is not clear, what matters most, and what should be better.",
    sekinfra: "Sekinfra explains the cause, business impact, priority, and recommended next step in plain language.",
    output: "A clear decision about what deserves attention.",
  },
  {
    title: "Approve the work",
    client: "You decide which recommendation, if any, should move forward.",
    sekinfra: "Sekinfra turns only the approved recommendation into a clear implementation plan.",
    output: "Approved scope before changes begin.",
  },
  {
    title: "Build the approved change",
    client: "You know what is being changed and what is outside the job.",
    sekinfra: "We fix, connect, secure, automate, or redesign only what was approved.",
    output: "A controlled build with clear boundaries.",
  },
  {
    title: "Make sure it worked",
    client: "You see whether the result solved the problem we started with.",
    sekinfra: "Sekinfra tests the result and records anything that is still unresolved.",
    output: "Proof of the result and a clear next decision.",
  },
] as const;

const controls = [
  ["Scope", "We agree on what Sekinfra may look at before access begins."],
  ["Access", "We use only the access needed for the approved diagnostic."],
  ["Approval", "Finding a problem does not automatically approve a fix."],
  ["Change", "Implementation and deployment require their own approval."],
] as const;

export default function HowItWorks() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[var(--page-width)] px-5 py-20 lg:px-8 lg:py-28">
        <p className="eyebrow">How Sekinfra works</p>
        <h1 className="text-balance mt-5 max-w-5xl text-5xl font-semibold tracking-[-.065em] sm:text-6xl">
          Start with the problem. We find the cause, fix the right thing, and make sure it worked.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-muted)]">
          You do not need to know whether the problem is operations, automation, software, cloud, network, or security.
          Sekinfra follows the problem far enough to choose the right next step.
        </p>
        <div className="mt-9">
          <ButtonLink href="/start">Show us what&apos;s happening</ButtonLink>
        </div>
      </section>

      <DiagnosticPaths />

      <section className="section-rule bg-[var(--surface-muted)] py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">The client journey</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              From “something is wrong” to a checked result.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Each step has a clear job. Diagnosis does not become implementation without your approval.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 lg:grid-cols-2">
            {journey.map((step, index) => (
              <li
                className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-7"
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
                Diagnose → Design → Build → Validate → Improve.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/70">
                The words are simple on purpose. Find the problem, plan the right fix, make the approved change, and check
                the result.
              </p>
            </div>
            <div>
              <ProcessFlow dark />
            </div>
          </div>
        </div>
      </section>

      <section className="section-rule bg-white py-16 sm:py-24">
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
                  className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-6"
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
            You do not need to know the cause. Sekinfra will help choose the right diagnostic path.
          </p>
          <ButtonLink href="/start" className="mt-8">
            Show us what&apos;s happening
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
