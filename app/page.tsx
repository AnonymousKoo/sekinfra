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
    label: "Policy",
    title: "The business rules decide what must happen",
    body: "Ownership, response time, required information, approvals, and escalation come from explicit rules the business chose.",
  },
  {
    number: "03",
    label: "AI assist",
    title: "AI can help interpret the lead",
    body: "AI may summarize the request, classify the need, or draft a response, but it does not get to rewrite the rules or grant itself authority.",
  },
  {
    number: "04",
    label: "Action",
    title: "The approved next step runs",
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
    label: "AI first automation",
    title: "Powerful when the model is asked to decide the workflow",
    body: "AI is strong at language, patterns, recommendations, and uncertain inputs. But model outputs can vary, so critical business actions need explicit limits, approvals, and guardrails around them.",
    items: [
      "Strong with language and messy inputs",
      "Outputs can vary with context",
      "Needs guardrails for critical actions",
    ],
  },
  {
    label: "Sekinfra controlled systems",
    title: "The business rules remain the authority",
    body: "Events trigger the workflow. Policies define what is allowed, required, or blocked. AI can assist inside that path, but approved rules control permissions, ownership, escalation, and change.",
    items: [
      "Approved rules decide critical actions",
      "Human approval stays available where needed",
      "Important actions can be traced",
    ],
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

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="eyebrow text-[var(--accent)]">AI vs controlled systems</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                AI can think. Your business still needs rules.
              </h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-lg leading-8 text-white/75">
                AI is powerful, but intelligence is not the same as operational control. Sekinfra builds the control
                layer first: events show what happened, policies decide what is allowed or required next, and AI can
                assist inside that path without becoming the authority over the business.
              </p>
              <p className="mt-4 text-sm font-semibold leading-6 text-[var(--accent)]">
                AI is intelligence. Sekinfra is control.
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
                  AI can help with the lead without deciding the rules the company runs on.
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
            We do not replace AI. We put it where it belongs: inside a system with explicit business authority.
            Approvals, limits, ownership, escalation, and change stay under the company's control.
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
