import type { Metadata } from "next";
import { ContextualHero, ContextualOutcomes } from "@/components/contextual-home";
import { AuthorityTrust, ImplementationBridge, OiaIntroduction } from "@/components/landing/oia-story";
import { ProblemSelector } from "@/components/problem-selector";
import { SectionHeading } from "@/components/sections/section-heading";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const signals = [
  "Customers or leads are waiting too long for a response",
  "Important work depends on one person remembering",
  "Systems do not share the information people need",
  "Network or cloud issues interrupt the operation",
  "Access, security, or reliability controls are unclear",
  "Manual coordination is consuming too much staff time",
  "Leadership cannot easily see what is happening",
  "The same operational problem keeps coming back",
] as const;

const capabilityAreas = [
  {
    title: "Operations & Business Systems",
    signal: "Work is inconsistent, unclear, or too dependent on people holding the process together.",
    response: "Design workflows, ownership, handoffs, visibility, and controls around how the business actually operates.",
  },
  {
    title: "Automation & Integration",
    signal: "People repeat work, move information manually, or bridge systems that should work together.",
    response: "Connect the right systems and automate repeatable movement without hiding exceptions.",
  },
  {
    title: "Cloud & Network Infrastructure",
    signal: "Connectivity, availability, or infrastructure problems are slowing or interrupting the business.",
    response: "Trace the failure path, establish the operating requirement, and build or repair the supporting infrastructure.",
  },
  {
    title: "Security & Reliability",
    signal: "Access, exposure, recovery, or system dependability is uncertain.",
    response: "Tighten the controls and reliability measures that the operation actually depends on.",
  },
  {
    title: "System Design & Improvement",
    signal: "The business has a recurring problem but the right technical or operational intervention is not obvious.",
    response: "Diagnose the condition first, then design the smallest system change that can produce the required outcome.",
  },
] as const;

export default function Home() {
  return (
    <SiteShell>
      <ContextualHero />

      <section className="section-rule bg-white py-18 sm:py-28">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <SectionHeading
            eyebrow="What brings companies to SekInfra"
            title="You usually notice the symptom before you know the system causing it."
          >
            You do not need to decide whether the problem is operations, automation, cloud, networking, security, or software before talking to SekInfra. Start with what is not working.
          </SectionHeading>
          <div className="mt-12 grid gap-x-10 md:grid-cols-2">
            {signals.map((signal, index) => (
              <div className="group flex gap-4 border-t border-[var(--line)] py-5" key={signal}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--line)] font-mono text-[10px] text-[var(--brand)] transition group-hover:border-[var(--brand)] group-hover:bg-[var(--brand-wash)]">
                  0{index + 1}
                </span>
                <p className="font-semibold leading-7">{signal}</p>
                <span
                  aria-hidden="true"
                  className="ml-auto mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--line-strong)] group-hover:bg-[var(--brand)]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProblemSelector />

      <section className="section-rule py-18 sm:py-28">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <SectionHeading
            eyebrow="One operating partner"
            title="Business problems and technology problems often share the same system."
          >
            SekInfra works across the operating stack so the solution can follow the real failure point instead of being forced into a single service category.
          </SectionHeading>

          <div className="mt-12 grid border-l border-t border-[var(--line)] md:grid-cols-2 xl:grid-cols-5">
            {capabilityAreas.map((area, index) => (
              <article
                className="flex min-h-80 flex-col border-b border-r border-[var(--line)] bg-white p-6"
                key={area.title}
              >
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-[-.035em]">{area.title}</h3>
                <p className="mt-5 text-sm leading-6 text-[var(--ink-muted)]">{area.signal}</p>
                <p className="mt-auto border-t border-[var(--line)] pt-5 text-sm font-semibold leading-6 text-[var(--brand)]">
                  {area.response}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <OiaIntroduction />

      <section className="section-rule bg-white py-18 sm:py-28">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:px-8">
          <SectionHeading eyebrow="Why diagnosis matters" title="SekInfra does not start by selling you a tool.">
            Software, automation, infrastructure, and process changes are interventions. The job comes first: establish what is failing, why it matters, and what the operation needs instead.
          </SectionHeading>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["01", "Diagnose", "Establish the real operating and technical condition."],
              ["02", "Design", "Define the intervention around the required outcome."],
              ["03", "Build", "Implement only what has been explicitly approved."],
              ["04", "Secure", "Protect access, reliability, and operating boundaries."],
              ["05", "Automate", "Remove repeatable manual work where it is justified."],
              ["06", "Improve", "Validate the result and make the next decision from evidence."],
            ].map(([number, title, body]) => (
              <article className="rounded-[var(--radius-card)] border border-[var(--line)] p-5" key={title}>
                <span className="font-mono text-xs text-[var(--brand)]">{number}</span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContextualOutcomes />
      <AuthorityTrust />
      <ImplementationBridge />

      <section className="py-22 sm:py-30">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="eyebrow">Bring us the problem</p>
          <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
            You do not need to know what kind of system is broken before you start.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--ink-muted)]">
            Tell SekInfra what is happening. We will establish what deserves attention before recommending what should be built, repaired, connected, secured, or automated.
          </p>
          <ButtonLink href="/start" className="mt-8">
            Tell us what&apos;s happening
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
