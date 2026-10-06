"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { usePersonalization } from "@/components/personalization-provider";
import { orderedOutcomeFamilies, outcomeVsFeature, transformations } from "@/lib/outcomes";

export function OutcomesExperience() {
  const { profile } = usePersonalization();
  const families = orderedOutcomeFamilies(profile?.id);

  return (
    <>
      <section className="tech-light-surface relative overflow-hidden">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.04fr_.96fr] lg:px-8 lg:py-32">
          <div className="relative z-10">
            <p className="eyebrow">{profile ? `What better looks like for ${profile.label}` : "Business outcomes"}</p>
            <h1 className="text-balance mt-6 max-w-3xl text-5xl font-semibold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">
              The goal is a business that works better.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
              {profile
                ? profile.outcome
                : "Faster response. Clear ownership. Less manual work. Better visibility. Safer access. More reliable systems."}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/start">Show us what&apos;s happening</ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary">
                See how Sekinfra works
              </ButtonLink>
            </div>
          </div>
          <SystemDiagram variant="selector" activeLabel={profile?.label || "Better state"} flow={profile?.flow} />
        </div>
      </section>

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <p className="eyebrow text-[var(--accent)]">Before and after</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
            <h2 className="text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              You should be able to see the difference in daily work.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-white/65">
              Sekinfra is not trying to sell more software. We want the problem to stop causing delays, confusion, rework, weak access, or unreliable service.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/10 md:grid-cols-2">
            {transformations.map((item, index) => (
              <article className="tech-domain-tile bg-[var(--brand-deep)] p-6 sm:p-7" key={item.label}>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                  <span className="text-xs font-bold uppercase tracking-[.14em] text-white/45">{item.label}</span>
                </div>
                <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div>
                    <p className="eyebrow text-white/40">Before</p>
                    <p className="mt-2 leading-7 text-white/70">{item.before}</p>
                  </div>
                  <span aria-hidden="true" className="hidden text-xl text-[var(--accent)] sm:block">
                    →
                  </span>
                  <div>
                    <p className="eyebrow text-[var(--accent)]">Better state</p>
                    <p className="mt-2 font-semibold leading-7">{item.controlled}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow">Five ways the business can get stronger</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                Different problems. Better day-to-day results.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
              These are not packages. They are the kinds of results Sekinfra works toward after we understand the real
              problem.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {families.map((family, index) => (
              <article
                className={`tech-card tech-card--light p-7 sm:p-8 ${
                  profile && index === 0
                    ? "border-[var(--brand)] bg-[var(--brand-wash)]"
                    : "border-[var(--line)] bg-white"
                }`}
                key={family.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                  {profile && index === 0 ? (
                    <span className="rounded-full border border-[var(--brand)] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--brand)]">
                      Most relevant now
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-.04em]">{family.title}</h3>
                <p className="mt-3 leading-7 text-[var(--ink-muted)]">{family.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {family.outcomes.map((outcome) => (
                    <span
                      className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold"
                      key={outcome}
                    >
                      {outcome}
                    </span>
                  ))}
                </div>
                <dl className="mt-7 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="eyebrow">What changes</dt>
                    <dd className="mt-2 text-sm leading-6">{family.whatChanges}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">What you can see</dt>
                    <dd className="mt-2 text-sm leading-6">{family.whatBecomesVisible}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">What good looks like</dt>
                    <dd className="mt-2 text-sm font-semibold leading-6 text-[var(--brand)]">{family.goodLooksLike}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-[var(--surface-muted)] py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <p className="eyebrow">Tools vs results</p>
          <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
            Technology is a tool. The result is what matters.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            A CRM, dashboard, automation, or monitoring tool is useful only when it changes the problem the business is
            dealing with.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {outcomeVsFeature.map(([featureLabel, feature, outcomeLabel, outcome], index) => (
              <article className="tech-card tech-card--light p-7" key={feature}>
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div>
                    <p className="eyebrow text-[var(--ink-muted)]">{featureLabel}</p>
                    <p className="mt-2 text-lg text-[var(--ink-muted)]">{feature}</p>
                  </div>
                  <span aria-hidden="true" className="hidden text-xl text-[var(--brand)] sm:block">
                    →
                  </span>
                  <div>
                    <p className="eyebrow text-[var(--brand)]">{outcomeLabel}</p>
                    <p className="mt-2 text-lg font-semibold">{outcome}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="tech-card tech-card--dark grid gap-8 p-7 text-white sm:p-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <div>
              <p className="eyebrow text-[var(--accent)]">You choose what changes</p>
              <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
                Finding a problem does not give Sekinfra permission to change it.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/65">
                We can find the problem, explain it, and suggest a fix. We make changes only after you approve them.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="eyebrow text-white/45">What this protects</p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-white/75">
                <li>Finding a problem does not automatically start the fix.</li>
                <li>Access does not mean permission to change anything.</li>
                <li>A finding does not automatically become a live change.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="eyebrow">Start with the problem</p>
          <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
            You do not need to know what kind of system needs to change.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Show Sekinfra what is happening. We will help find the cause and what better should look like.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/start">Show us what&apos;s happening</ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">
              See how Sekinfra works
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
