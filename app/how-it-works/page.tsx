import type { Metadata } from "next";
import { PublicPremiumShell } from "@/components/public-site/public-premium-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHero, PremiumCard } from "@/components/public-site/page-hero";
import styles from "@/components/public-site/public-premium.module.css";
import { DiagnosticPaths } from "@/components/diagnostic-paths";

export const metadata: Metadata = {
  title: "How it works",
  description: "Start with a scoped diagnostic or seven-area OIA. Review evidence and priorities before separately approving implementation or support.",
  alternates: { canonical: "/how-it-works" },
};

const journey = [
  ["Agree on the question", "Describe what is happening, who it affects and what better would look like. Together, we agree on the review, deliverables, fee, timing and permitted access."],
  ["Review the evidence", "We follow the work and technology within that scope. You receive supported findings, priorities and recommendations, with uncertainty and limitations made clear."],
  ["Choose what happens next", "You can act internally, defer a recommendation or discuss work with Sekinfra. Implementation needs its own scope and approval; deployment and ongoing support also require separate authorization."],
] as const;

export default function HowItWorks() {
  return (
    <PublicPremiumShell>
      <PageHero eyebrow="How Sekinfra works" title="A clear picture before a bigger decision.">
        <p>Start with what is getting in the way. We help you understand the problem and the options, so you can decide what deserves to change.</p>
        <ButtonLink href="/start" className="mt-8">Find your starting point</ButtonLink>
      </PageHero>

      <section className="section-rule bg-white py-14 sm:py-20" aria-labelledby="review-process-title">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <h2 id="review-process-title" className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Three decisions. Clear boundaries.</h2>
          <ol className={styles.cardGrid}>
            {journey.map(([title, body], index) => <li key={title}><PremiumCard number={index + 1} title={title}>{body}</PremiumCard></li>)}
          </ol>
        </div>
      </section>

      <DiagnosticPaths />

      <section className="section-rule bg-[var(--brand-deep)] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-8 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow !text-[var(--accent)]">If you approve a change</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Plan it. Test it. Check it against the goal.</h2>
          </div>
          <div>
            <p className="leading-7 text-white/80">A separate implementation plan defines the work, permissions, risks, recovery approach and success measures. Connections depend on the tools supporting the required access and use. Automation follows the rules and approvals you agree to.</p>
            <p className="mt-4 leading-7 text-white/80">Before going live, we agree on validation and deployment. Any handover or ongoing support is scoped separately. Results are checked against the original goal, and unresolved issues stay visible.</p>
            <ButtonLink href="/start" variant="secondary" className="mt-7">Prepare your next step</ButtonLink>
          </div>
        </div>
      </section>
    </PublicPremiumShell>
  );
}
