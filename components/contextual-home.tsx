"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { usePersonalization } from "@/components/personalization-provider";

const capabilities = ["Operations", "Automation", "Cloud & Network", "Security", "Business Systems"] as const;

const betterStates = [
  ["Faster response", "Customers and leads are not left waiting without an owner."],
  ["Clear ownership", "People know who owns the next step and what happens if it is missed."],
  ["Less manual work", "Routine work does not need as much copying, chasing, or remembering."],
  ["Better visibility", "The right people can see what is moving, stuck, or at risk."],
  ["Safer access", "It is clear who can reach important systems and why."],
  ["More reliable systems", "The technology the business depends on is easier to trust and recover."],
] as const;

export function ContextualHero() {
  const { profile } = usePersonalization();
  const copy = profile
    ? profile.hero
    : "When customers wait, work gets dropped, systems do not talk, or technology keeps causing problems, Sekinfra finds what is causing it and fixes the right thing.";

  return (
    <section className="relative overflow-hidden bg-[var(--brand-deep)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 18% 28%, rgba(15,159,152,.18), transparent 34%), radial-gradient(circle at 78% 24%, rgba(185,239,112,.07), transparent 28%)",
        }}
      />
      <div className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-32">
        <div className="relative z-10">
          <p className="eyebrow text-[var(--accent)]">
            {profile ? `Problem area: ${profile.label}` : "Business systems that work"}
          </p>
          <h1 className="text-balance mt-6 max-w-3xl text-5xl font-semibold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">
            We build and fix the systems your business runs on.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/72">{copy}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start">Show us what&apos;s happening</ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">
              See how Sekinfra works
            </ButtonLink>
          </div>
          <ul className="mt-10 flex max-w-2xl flex-wrap gap-2" aria-label="Sekinfra capability areas">
            {capabilities.map((capability) => (
              <li
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70"
                key={capability}
              >
                {capability}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-white/65">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_5px_rgba(185,239,112,.12)]" />
            {profile ? profile.cta : "Start with the problem. We will help find the cause."}
          </div>
        </div>

        <SystemDiagram className="lg:mt-3" activeLabel={profile?.label} flow={profile?.flow} />
      </div>
    </section>
  );
}

export function ContextualOutcomes() {
  const { profile } = usePersonalization();

  return (
    <section className="section-rule bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="eyebrow">{profile ? `What better looks like for ${profile.label}` : "What better looks like"}</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              The goal is a business that works better.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            {profile
              ? profile.response
              : "The work should move with less chasing, clearer ownership, safer access, and systems the team can depend on."}
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {betterStates.map(([title, body], index) => (
            <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-5" key={title}>
              <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
            </article>
          ))}
        </div>

        <ButtonLink href="/outcomes" variant="secondary" className="mt-7">
          See more outcomes
        </ButtonLink>
      </div>
    </section>
  );
}
