"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { usePersonalization } from "@/components/personalization-provider";

const capabilities = ["IT infrastructure", "Network & cloud", "Workflows", "Permitted automation"] as const;

export function ContextualHero() {
  const { profile } = usePersonalization();

  return (
    <section className="tech-hero relative overflow-hidden bg-[var(--brand-deep)] text-white">
      <div className="relative mx-auto grid max-w-[var(--page-width)] gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow !text-[var(--accent)]">Technology & operations, working together</p>
          <h1 className="text-balance mt-5 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-.055em] sm:text-5xl lg:text-6xl">
            We make the different parts of your business work better together.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
            Sekinfra helps connect the technology, people and everyday work your business depends on—from reliable IT, networks and cloud to clearer workflows and practical automation.
          </p>
          <p className="mt-4 text-base font-semibold leading-7 text-[var(--accent)]">
            We don&apos;t replace what&apos;s working. We improve what&apos;s missing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/start">Find your starting point</ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">See how it works</ButtonLink>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/65">Prepare a brief in your browser. Online submission is not enabled.</p>
        </div>
        <div className="min-w-0">
          <SystemDiagram activeLabel={profile?.label} flow={["People", "Technology", "Workflows", "Better together"]} />
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Sekinfra service areas">
            {capabilities.map((capability) => (
              <li className="tech-chip rounded-full px-3 py-2 text-xs font-semibold text-white/80" key={capability}>{capability}</li>
            ))}
          </ul>
          {profile && <p className="mt-4 text-sm leading-6 text-white/75">Your selected focus: {profile.label}. Start with what is happening and what should work better.</p>}
        </div>
      </div>
    </section>
  );
}
