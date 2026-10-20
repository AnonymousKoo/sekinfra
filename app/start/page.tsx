import type { Metadata } from "next";
import Link from "next/link";
import { DiagnosticTriage } from "@/components/diagnostic-triage";
import { PublicPremiumShell } from "@/components/public-site/public-premium-shell";
import { PageHero } from "@/components/public-site/page-hero";
import styles from "@/components/public-site/public-premium.module.css";

export const metadata: Metadata = {
  title: "Show us what is happening",
  description:
    "Tell Sekinfra what is going wrong. Answer a few simple questions and get a clear next step. You do not need to know the cause.",
  alternates: { canonical: "/start" },
};

// Presentation only. This does not issue System #001 commands or imply that
// the website has a hosted work-item API. Avuhz owns the shared work lifecycle;
// the OIA is Sekinfra's separate consulting diagnostic method.
const nextSteps = [
  ["01", "You send the request", "For now, prepare the request here, copy it, and email it to Sekinfra. This website does not submit or track requests."],
  ["02", "Sekinfra reviews it", "We discuss what is happening and whether a focused review or Sekinfra's OIA makes sense. A website answer is not a verified finding."],
  ["03", "We agree on the next step", "Scope, fee, timing, and any access are agreed separately. Sending a request never authorizes inspection, implementation, or deployment."],
  ["04", "Work moves with clear ownership", "Avuhz System #001 is reusable work-intake infrastructure for ownership, handoffs, blocked work, and resolution. Sekinfra can use it after a separately approved integration; this website does not track work automatically yet."],
] as const;

export default function Start() {
  return (
    <PublicPremiumShell>
      <PageHero eyebrow="Start with the problem" title="Show us what’s happening."
        visual={<div className={styles.reviewPanel}><p className={styles.label}>A useful starting point</p><ol>
          <li><span>01</span> Describe what is getting in the way.</li>
          <li><span>02</span> Explore which review may fit.</li>
          <li><span>03</span> Copy your brief and email it yourself.</li>
        </ol><p>Browser-only guidance. No system access, online submission or approval of changes.</p></div>}>
        <p>You do not need to know the cause or choose a service. Answer a few simple questions about what is going wrong, who it affects, and how often it happens.</p>
        <a href="#first-review" className={styles.heroAction}>See how to get started <span aria-hidden="true">↗</span></a>
        <p className={styles.hint}>Have a project in mind? You do not need to finish this problem check first.</p>
      </PageHero>

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
                <Link href="/oia" className="text-sm font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
                  Or take the guided OIA walkthrough →
                </Link>
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
              This browser-only check uses your answers to show whether the problem looks small and focused or needs a deeper review.
            </p>
          </div>
          <DiagnosticTriage />
        </div>
      </section>

      <section id="after-request" className="section-rule tech-light-surface bg-white py-16 sm:py-22 scroll-mt-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
            <div>
              <p className="eyebrow">What happens after your request</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
                A clear next step. A responsible owner. No surprises.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
                The public request is still prepared in your browser. These are the steps we aim to
                follow after you contact us, not a live status tracker.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {nextSteps.map(([number, title, body]) => (
                <article className="tech-card tech-card--light p-5" key={number}>
                  <span className="font-mono text-xs text-[var(--brand)]">{number}</span>
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
    </PublicPremiumShell>
  );
}
