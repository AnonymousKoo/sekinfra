"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { usePersonalization } from "@/components/personalization-provider";
import {
  illustrativeOutcome,
  orderedOutcomeFamilies,
  outcomeProcess,
  outcomeVsFeature,
  transformations,
} from "@/lib/outcomes";

export function OutcomesExperience() {
  const { profile } = usePersonalization();
  const families = orderedOutcomeFamilies(profile?.id);

  return <>
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.04fr_.96fr] lg:px-8 lg:py-32">
        <div className="relative z-10">
          <p className="eyebrow">{profile ? `Outcome focus: ${profile.label}` : "Business outcomes"}</p>
          <h1 className="text-balance mt-6 max-w-3xl text-5xl font-semibold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">Systems that are easier to run, easier to see, and easier to trust.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">{profile ? `${profile.outcome} SekInfra starts with the operating condition that should change, then establishes what is actually happening before deciding what should be built.` : "The outcome is not more technology. It is dependable movement, clear ownership, useful visibility, controlled access, and infrastructure the business can rely on."}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start">Tell us what&apos;s happening</ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">See How It Works</ButtonLink>
          </div>
        </div>
        <SystemDiagram variant="selector" activeLabel={profile?.label || "Outcome"} flow={profile?.flow}/>
      </div>
    </section>

    <section className="section-rule bg-[var(--brand-deep)] py-18 text-white sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <p className="eyebrow text-[var(--accent)]">Before and controlled state</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <h2 className="text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">The value is visible in how the business and its systems behave differently.</h2>
          <p className="max-w-2xl text-lg leading-8 text-white/65">SekInfra is not trying to make a tool look impressive. The goal is to change the condition that creates delay, uncertainty, rework, lost accountability, weak access control, or unreliable infrastructure.</p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/10 md:grid-cols-2">
          {transformations.map((item, index) => <article className="bg-[var(--brand-deep)] p-6 sm:p-7" key={item.label}>
            <div className="flex items-center justify-between gap-4"><span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span><span className="text-xs font-bold uppercase tracking-[.14em] text-white/45">{item.label}</span></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div><p className="eyebrow text-white/40">Before</p><p className="mt-2 leading-7 text-white/70">{item.before}</p></div>
              <span aria-hidden="true" className="hidden text-xl text-[var(--accent)] sm:block">→</span>
              <div><p className="eyebrow text-[var(--accent)]">Controlled state</p><p className="mt-2 font-semibold leading-7">{item.controlled}</p></div>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section-rule bg-white py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">Business outcome families</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Different pressure points. Five ways the business should become stronger.</h2>
          </div>
          <div>
            <p className="max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">{profile ? `Your focus on ${profile.label} moves the most relevant outcome family to the front. The complete operating picture stays visible.` : "These are not fixed packages. They are business states that become possible when the right operating path, ownership, visibility, capacity, and technical controls are in place."}</p>
          </div>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {families.map((family, index) => <article className={`rounded-[var(--radius-card)] border p-7 sm:p-8 ${profile && index === 0 ? "border-[var(--brand)] bg-[var(--brand-wash)]" : "border-[var(--line)] bg-white"}`} key={family.id}>
            <div className="flex items-center justify-between gap-4"><span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>{profile && index === 0 ? <span className="rounded-full border border-[var(--brand)] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--brand)]">Most relevant now</span> : null}</div>
            <h3 className="mt-6 text-2xl font-semibold tracking-[-.04em]">{family.title}</h3>
            <p className="mt-3 leading-7 text-[var(--ink-muted)]">{family.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">{family.outcomes.map((outcome) => <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold" key={outcome}>{outcome}</span>)}</div>
            <dl className="mt-7 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
              <div><dt className="eyebrow">What changes</dt><dd className="mt-2 text-sm leading-6">{family.whatChanges}</dd></div>
              <div><dt className="eyebrow">What becomes visible</dt><dd className="mt-2 text-sm leading-6">{family.whatBecomesVisible}</dd></div>
              <div><dt className="eyebrow">What good looks like</dt><dd className="mt-2 text-sm font-semibold leading-6 text-[var(--brand)]">{family.goodLooksLike}</dd></div>
            </dl>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section-rule py-18 sm:py-28">
      <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">{illustrativeOutcome.label}</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">An outcome becomes credible when the path to it is visible.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">SekInfra separates the symptom from the evidence, the finding, the business consequence, and the desired operating state. That is how a build gets a clear job instead of becoming the starting assumption.</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.12em] text-[var(--ink-muted)]">{illustrativeOutcome.disclosure}</p>
        </div>
        <ol className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white">
          {illustrativeOutcome.steps.map(([label, text], index) => <li className="grid gap-4 border-b border-[var(--line)] p-6 last:border-b-0 sm:grid-cols-[70px_170px_1fr] sm:items-start" key={label}>
            <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
            <span className="text-xs font-bold uppercase tracking-[.14em] text-[var(--ink-muted)]">{label}</span>
            <p className={`leading-7 ${index === illustrativeOutcome.steps.length - 1 ? "font-semibold text-[var(--brand)]" : ""}`}>{text}</p>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="section-rule bg-[var(--surface-muted)] py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <p className="eyebrow">Outcome versus feature</p>
        <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Technology is not the finish line.</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">A system matters only when it changes how the operation performs. SekInfra defines the business state first, then determines whether technology is part of the right intervention.</p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {outcomeVsFeature.map(([featureLabel, feature, outcomeLabel, outcome], index) => <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-7" key={feature}>
            <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
            <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div><p className="eyebrow text-[var(--ink-muted)]">{featureLabel}</p><p className="mt-2 text-lg text-[var(--ink-muted)]">{feature}</p></div>
              <span aria-hidden="true" className="hidden text-xl text-[var(--brand)] sm:block">→</span>
              <div><p className="eyebrow text-[var(--brand)]">{outcomeLabel}</p><p className="mt-2 text-lg font-semibold">{outcome}</p></div>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section-rule bg-white py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <p className="eyebrow">How SekInfra gets there</p>
        <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">The desired state comes before the implementation decision.</h2>
        <div className="mt-12 grid border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {outcomeProcess.map(([label, text], index) => <article className="min-h-56 border-b border-r border-[var(--line)] p-6" key={label}>
            <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
            <h3 className="mt-9 text-xl font-semibold">{label}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{text}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section-rule py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-8 rounded-[var(--radius-card)] bg-[var(--brand-deep)] p-7 text-white sm:p-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-[var(--accent)]">Controlled improvement</p>
            <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-.045em] sm:text-4xl">A verified outcome creates a decision. It does not authorize a system change.</h2>
            <p className="mt-5 max-w-2xl leading-7 text-white/65">Assessment, implementation planning, implementation authority, deployment authority, and ongoing access remain separate decisions. SekInfra moves forward only through the authority that actually exists.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="eyebrow text-white/45">What this protects</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/75">
              <li>Diagnosis does not silently become implementation.</li>
              <li>Access does not silently become change permission.</li>
              <li>Findings do not silently become deployment authority.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section className="section-rule bg-white py-22 sm:py-30">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <p className="eyebrow">Begin with the condition</p>
        <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">You do not need to know what kind of system needs to change before you start.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">Start by identifying what should become different in the business. SekInfra can establish what is happening, where the failure sits, and what outcome is worth moving toward.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/start">Tell us what&apos;s happening</ButtonLink>
          <ButtonLink href="/how-it-works" variant="secondary">See How It Works</ButtonLink>
        </div>
      </div>
    </section>
  </>;
}
