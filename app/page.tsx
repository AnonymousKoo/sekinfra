import type { Metadata } from "next";
import Link from "next/link";
import { ContextualHero } from "@/components/contextual-home";
import { ProblemSelector } from "@/components/problem-selector";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { DiagnosticPaths } from "@/components/diagnostic-paths";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const offers = [
  {
    title: "Reliable IT, network & cloud",
    problem: "Lost connections and recurring outages interrupt the day.",
    offer: "Review the devices, network and cloud services behind one recurring issue, then propose improvements based on the evidence.",
    outcome: "Aim: fewer interruptions and a clearer recovery plan.",
  },
  {
    title: "Clearer everyday workflows",
    problem: "Requests, job updates and follow-ups get stuck between people.",
    offer: "Trace a workflow and define who owns each step, what information they need and how delayed work gets noticed.",
    outcome: "Aim: fewer missed handoffs and less chasing.",
  },
  {
    title: "Useful connections & automation",
    problem: "People copy the same information across tools all day.",
    offer: "Check whether your existing tools can share the information you need. Plan only feasible, permitted connections and approved automation.",
    outcome: "Aim: less duplicate entry and more time for customers.",
  },
] as const;

export default function Home() {
  return (
    <SiteShell>
      <ContextualHero />

      <section className="section-rule bg-white py-14 sm:py-20" aria-labelledby="offers-title">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">Practical ways we can help</p>
              <h2 id="offers-title" className="mt-4 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-4xl">
                Keep what works. Improve what gets in the way.
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[var(--ink-muted)]">
              For owners and teams dealing with growing workloads, unreliable technology or disconnected tools.
              Commercial contractors are one example: the office and field need dependable systems and clear job handoffs.
              The same needs span many industries.
            </p>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {offers.map((offer, index) => (
              <article key={offer.title} className="tech-card tech-card--light flex flex-col p-6">
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-.03em]">{offer.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6">{offer.problem}</p>
                <p className="mb-5 mt-3 text-sm leading-6 text-[var(--ink-muted)]">{offer.offer}</p>
                <p className="mt-auto border-t border-[var(--line)] pt-4 text-sm font-semibold leading-6">{offer.outcome}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[var(--ink-muted)]">
            These are service offers and intended outcomes, not client results. Scope, feasibility and success measures are agreed before work begins.
            {" "}<Link href="/outcomes" className="font-semibold underline underline-offset-4">Explore example outcomes</Link>.
          </p>
        </div>
      </section>

      <DiagnosticPaths />

      <div className="mx-auto max-w-[var(--page-width)] px-5 py-8 lg:px-8">
        <details className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white">
          <summary className="cursor-pointer p-5 text-lg font-semibold sm:p-6">Explore a problem that sounds familiar</summary>
          <ProblemSelector />
        </details>
      </div>

      <section className="section-rule bg-[var(--brand-deep)] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-9 px-5 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div>
            <p className="eyebrow !text-[var(--accent)]">A partner, with clear boundaries</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Understand first. You decide what changes.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/75">
              We agree on the review and use only the access you authorize. Findings explain the evidence, priorities and what remains uncertain.
              Implementation, going live and ongoing support each need separate agreement and approval.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-white/20 bg-white/5 p-6 sm:p-8">
            <h3 className="text-2xl font-semibold tracking-[-.03em]">Start with the problem you can see.</h3>
            <p className="mt-3 text-sm leading-6 text-white/75">You do not need to know the cause. Prepare a short brief and see which review may fit.</p>
            <ButtonLink href="/start" className="mt-6">Prepare your next step</ButtonLink>
            <p className="mt-4 text-xs leading-5 text-white/65">Online submission is not enabled. The brief stays in your browser.</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
