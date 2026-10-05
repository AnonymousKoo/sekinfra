import type { Metadata } from "next";
import { ContextualHero, ContextualOutcomes } from "@/components/contextual-home";
import { ProblemSelector } from "@/components/problem-selector";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { DiagnosticPaths } from "@/components/diagnostic-paths";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const capabilityAreas = [
  {
    title: "Operations",
    problem: "Work gets stuck, dropped, or depends on one person knowing what to do next.",
    help: "We make the path, owner, handoffs, and exceptions clear.",
  },
  {
    title: "Automation",
    problem: "People repeat the same steps, copy information, or chase routine updates.",
    help: "We automate repeatable work where it is safe and useful.",
  },
  {
    title: "Business Systems",
    problem: "Your tools do not share the information your team needs.",
    help: "We connect the right systems around the work they need to support.",
  },
  {
    title: "Cloud & Network",
    problem: "Internet, network, cloud, or service problems interrupt normal work.",
    help: "We trace the failure path and fix the part the business depends on.",
  },
  {
    title: "Security & Reliability",
    problem: "Access, protection, alerts, or recovery are unclear.",
    help: "We make access and recovery rules clear around the systems that matter.",
  },
] as const;

const scenarios = [
  {
    business: "Security company",
    problem: "A guard calls off. The supervisor starts texting people. No one can clearly see whether the shift is covered.",
    look: "Who owns the replacement, how the call-off moves, when the client should be updated, and what happens if no one responds.",
    better: "The call-off creates a clear replacement path, escalation, and visible coverage status.",
  },
  {
    business: "HVAC company",
    problem: "A new service request comes in, but follow-up depends on someone seeing the message and remembering to respond.",
    look: "Where requests enter, who owns the first response, what information is needed, and how missed follow-up is caught.",
    better: "Every new request has an owner, a response window, and a visible next step.",
  },
  {
    business: "Consulting firm",
    problem: "Client work is spread across email, text, documents, and people’s memory.",
    look: "How work is assigned, where documents live, who owns the next step, and how leaders see what is late.",
    better: "Client work follows one clear path with visible ownership and fewer status-chasing messages.",
  },
  {
    business: "Real estate / mortgage",
    problem: "A file moves through several people and systems, but missing items or slow handoffs are found late.",
    look: "Where the file changes hands, what each person needs, which steps can wait, and how missing items become visible.",
    better: "The file has a visible owner, next step, missing-item status, and exception path.",
  },
] as const;

const oiaPoints = [
  ["Use it when", "The problem keeps coming back, crosses teams or systems, or has no clear cause."],
  ["What it does", "The OIA maps what is happening, why it matters, what is causing it, and what should change."],
  ["What it does not do", "An OIA does not give Sekinfra permission to change your systems. You approve changes separately."],
] as const;

export default function Home() {
  return (
    <SiteShell>
      <ContextualHero />

      <ProblemSelector />

      <section className="section-rule bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <div>
              <p className="eyebrow">What we can fix</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                One problem can touch the business and the technology behind it.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
              You do not need to choose the right service first. Sekinfra follows the problem across operations,
              automation, business systems, cloud, network, security, and reliability.
            </p>
          </div>

          <div className="mt-12 grid border-l border-t border-[var(--line)] md:grid-cols-2 xl:grid-cols-5">
            {capabilityAreas.map((area, index) => (
              <article
                className="flex min-h-80 flex-col border-b border-r border-[var(--line)] bg-white p-6"
                key={area.title}
              >
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-[-.035em]">{area.title}</h3>
                <p className="mt-5 text-sm leading-6 text-[var(--ink-muted)]">{area.problem}</p>
                <p className="mt-auto border-t border-[var(--line)] pt-5 text-sm font-semibold leading-6 text-[var(--brand)]">
                  {area.help}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <div>
              <p className="eyebrow text-[var(--accent)]">Sekinfra at work</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                See the kind of problems we are built to solve.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/70">
              These are simple examples, not client case studies. The point is to show how Sekinfra follows a business
              problem into the people, steps, systems, and technology behind it.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {scenarios.map((scenario) => (
              <article className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 p-6 sm:p-7" key={scenario.business}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold">{scenario.business}</h3>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--accent)]">
                    Example
                  </span>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">What is happening</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{scenario.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">What we look at</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{scenario.look}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Better state</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">{scenario.better}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <DiagnosticPaths cta showFlow={false} />

      <section className="section-rule bg-[var(--surface-muted)] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div>
            <p className="eyebrow">Operational Infrastructure Assessment (OIA)</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              A deeper review for problems that are bigger than one broken step.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              The OIA is not the first step for every client. We use it when a smaller diagnostic cannot explain the
              whole problem.
            </p>
          </div>
          <div className="grid gap-3">
            {oiaPoints.map(([title, body], index) => (
              <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6" key={title}>
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContextualOutcomes />

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow text-[var(--accent)]">You stay in control</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              Looking at a problem does not give us permission to change your systems.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Clear scope", "We agree on what Sekinfra may review before access begins."],
              ["Limited access", "We use only the access needed for the approved diagnostic."],
              ["Separate approval", "Finding a problem does not automatically approve a fix."],
              ["You decide", "Implementation and deployment happen only after you approve them."],
            ].map(([title, body], index) => (
              <article className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 p-6" key={title}>
                <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="eyebrow">Something is not working?</p>
          <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
            You do not need to know what is causing it before you start.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Show Sekinfra what is happening. We will help find where the problem starts and what the right next step is.
          </p>
          <ButtonLink href="/start" className="mt-8">
            Show us what&apos;s happening
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
