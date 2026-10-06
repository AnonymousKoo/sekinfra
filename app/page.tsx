import type { Metadata } from "next";
import { ContextualHero, ContextualOutcomes } from "@/components/contextual-home";
import { ProblemSelector } from "@/components/problem-selector";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { DiagnosticPaths } from "@/components/diagnostic-paths";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const controlFlow = [
  {
    number: "01",
    label: "Event",
    title: "A new lead arrives",
    body: "The event tells the system that something changed and starts the approved workflow.",
  },
  {
    number: "02",
    label: "Rule",
    title: "The rules choose the next step",
    body: "Response time, required information, approvals, and what happens if something is missed come from rules the business chose.",
  },
  {
    number: "03",
    label: "Ownership",
    title: "One person owns the next step",
    body: "The system makes responsibility clear so the work does not depend on someone noticing a message or remembering what to do.",
  },
  {
    number: "04",
    label: "Action",
    title: "The work moves",
    body: "The system can assign work, send a message, update a record, create a task, or stop and wait for a person to approve the next move.",
  },
  {
    number: "05",
    label: "Evidence",
    title: "The result stays visible",
    body: "Important actions can be recorded so the business can see what happened, who owned the step, and where an exception occurred.",
  },
] as const;

const policyAiComparison = [
  {
    label: "AI tools",
    title: "Useful for thinking, creating, and analyzing",
    body: "AI can answer questions, create content, study information, and suggest ideas. That is useful, but it is not the same as running the work.",
    items: [
      "Answers and generates quickly",
      "Helps analyze information",
      "Supports human decisions",
    ],
  },
  {
    label: "Sekinfra business systems",
    title: "Built to keep work moving the right way",
    body: "Sekinfra builds the rules, triggers, owners, handoffs, alerts, approvals, and records behind the work. The system does not need AI to know what happens next.",
    items: [
      "Rules define the next step",
      "Ownership and next steps stay clear",
      "Important actions stay visible",
    ],
  },
] as const;

const scenarios = [
  {
    business: "Security company",
    problem: "A guard calls off. The supervisor starts texting people. No one can clearly see whether the shift is covered.",
    look: "Who owns the replacement, how the call-off moves, when the client should be updated, and what happens if no one responds.",
    better: "The call-off creates clear replacement steps and a visible coverage status.",
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
    better: "The file has a visible owner, next step, missing-item status, and a clear path when something is missing.",
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

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="eyebrow text-[var(--accent)]">AI and business systems</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                AI can help you think. Your business still needs a system.
              </h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-lg leading-8 text-white/75">
                AI can answer questions, create content, study information, and suggest ideas. Sekinfra solves a different problem:
                making sure the right work happens at the right time. We build the rules, owners, handoffs, alerts,
                and checks that keep work moving.
              </p>
              <p className="mt-4 text-sm font-semibold leading-6 text-[var(--accent)]">
                AI adds intelligence. Sekinfra adds control.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {policyAiComparison.map((model, index) => (
              <article
                className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 p-6 sm:p-7"
                key={model.label}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-white/60">
                    {model.label}
                  </span>
                </div>
                <h3 className="mt-7 text-2xl font-semibold tracking-[-.035em]">{model.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/70">{model.body}</p>
                <ul className="mt-6 grid gap-3 border-t border-white/10 pt-5">
                  {model.items.map((item) => (
                    <li className="flex gap-3 text-sm leading-6 text-white/80" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius-card)] border border-white/15 bg-black/10 p-6 sm:p-8">
            <div className="grid gap-8 xl:grid-cols-[.55fr_1.45fr]">
              <div>
                <p className="eyebrow text-[var(--accent)]">Simple example</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
                  A new lead comes in.
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/65">
                  Here is the same lead handled by a clear business system.
                </p>
              </div>

              <ol className="grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-5">
                {controlFlow.map((step) => (
                  <li className="min-h-56 border-b border-r border-white/15 p-5" key={step.number}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-[var(--accent)]">{step.number}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[.12em] text-white/45">{step.label}</span>
                    </div>
                    <h4 className="mt-6 text-lg font-semibold tracking-[-.03em]">{step.title}</h4>
                    <p className="mt-3 text-sm leading-6 text-white/65">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <p className="mt-8 max-w-3xl border-l-2 border-[var(--accent)] pl-4 text-sm leading-6 text-white/70">
            Sekinfra is not an AI company. We build business systems that run on clear rules and defined steps. AI can still be
            useful in other parts of a business.
          </p>
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
              A deeper review for problems that cross more than one part of the business.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              The OIA is for bigger or unclear problems. We use it only when a smaller review cannot explain the whole problem.
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
              Looking at a problem does not give us permission to change anything.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Clear scope", "We agree on what Sekinfra may review before access begins."],
              ["Limited access", "We use only the access needed for the approved diagnostic."],
              ["Separate approval", "Finding a problem does not automatically approve a fix."],
              ["You decide", "Changes go live only after you approve them."],
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
            You do not need to know the cause before you start.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Show Sekinfra what is happening. We will help find where the problem starts and what should happen next.
          </p>
          <ButtonLink href="/start" className="mt-8">
            Show us what&apos;s happening
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
