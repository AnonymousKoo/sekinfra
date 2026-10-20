import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { ContextualAboutCta } from "@/components/contextual-about-cta";
import { SystemDiagram } from "@/components/visuals/system-diagram";

export const metadata: Metadata = {
  title: "About",
  description: "Sekinfra is a technology and operations partner for businesses that need dependable IT, clearer workflows and practical, permitted connections between systems.",
  alternates: { canonical: "/about" },
};

const principles = [
  ["Keep what works", "Start with the tools and knowledge you already have. Recommend a replacement only when the evidence and business need justify it."],
  ["Follow the evidence", "A reported problem is a starting point. Explain what the evidence supports, what remains uncertain and what needs further review."],
  ["Respect your control", "Use only approved access for the agreed purpose. Assessment, implementation, deployment and ongoing support are separate decisions."],
] as const;

export default function About() {
  return (
    <SiteShell>
      <section className="tech-page-hero mx-auto grid max-w-[var(--page-width)] gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8">
        <div>
          <p className="eyebrow">About Sekinfra</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-6xl">A practical partner for the way your business runs.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">Technology and daily work depend on each other. Sekinfra brings IT infrastructure, network and cloud reliability together with the workflows, handoffs and information your team needs.</p>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">We don&apos;t replace what&apos;s working. We improve what&apos;s missing—through a clear review, practical recommendations and separately approved implementation or support.</p>
        </div>
        <SystemDiagram variant="control" flow={["People", "Technology", "Workflows", "Better together"]} />
      </section>

      <section className="section-rule bg-[var(--brand-deep)] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-7 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow !text-[var(--accent)]">Who Sekinfra is for</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.05em] sm:text-4xl">For teams carrying too much work between the gaps.</h2>
          </div>
          <div className="space-y-4 leading-7 text-white/80">
            <p>Owner-led companies, growing service businesses and teams with disconnected systems can all face the same friction: repeated entry, unreliable access and work that waits for someone to chase it.</p>
            <p>For a commercial contractor, that might mean getting job information from the office to the field. For another business, it might mean a dependable cloud service or a clear customer follow-up process. The starting point is your operation, whatever the industry.</p>
          </div>
        </div>
      </section>

      <section className="section-rule bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <p className="eyebrow">How we work</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Useful improvements. Clear responsibility.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {principles.map(([title, body], index) => (
              <article className="tech-card tech-card--light p-6" key={title}>
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule bg-[var(--surface-muted)] py-14 sm:py-16">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-[-.04em]">Bring the problem. You don&apos;t need the diagnosis.</h2>
          <p className="mb-6 mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">Prepare a brief and see which review may fit. The browser tools do not submit a request or authorize access.</p>
          <ContextualAboutCta />
        </div>
      </section>
    </SiteShell>
  );
}
