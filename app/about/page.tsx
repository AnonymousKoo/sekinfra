import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { ContextualAboutCta } from "@/components/contextual-about-cta";
import { SystemDiagram } from "@/components/visuals/system-diagram";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sekinfra finds and fixes the systems behind business problems across operations, automation, business software, cloud, network, security, and reliability.",
  alternates: { canonical: "/about" },
};

const principles = [
  ["Find the cause before the tool", "We start with what is going wrong before deciding what software, automation, or infrastructure should change."],
  ["Look at the whole path", "People, steps, software, cloud, network, security, and handoffs can all be part of the same problem."],
  ["Make the smallest useful change", "We do not add technology just to add technology. The change should have a clear job."],
  ["Ask before we change anything", "Review access, implementation, deployment, and ongoing access are separate decisions."],
  ["Make sure it worked", "A job is not done because the change went live. It has to solve the problem it was meant to solve."],
] as const;

const domains = [
  "Operations & business systems",
  "Automation & integration",
  "Cloud & network",
  "Security & reliability",
  "System design & improvement",
] as const;

export default function About() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
        <div>
          <p className="eyebrow">About Sekinfra</p>
          <h1 className="text-balance mt-5 text-5xl font-semibold tracking-[-.065em] sm:text-6xl">
            We find and fix the system behind the problem.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Sometimes the problem is the way work moves. Sometimes it is software, automation, network, cloud, security, or a mix of several things. Sekinfra follows the problem until we can see where it starts.
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-[var(--ink-muted)]">
            Then we build the right fix without making you choose a service category first.
          </p>
        </div>
        <SystemDiagram variant="control" />
      </section>

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
          <div>
            <p className="eyebrow text-[var(--accent)]">What Sekinfra works across</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              One business problem can cross several systems.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/70">
              You should not have to know what kind of expert you need before asking for help.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/15 sm:grid-cols-2">
            {domains.map((domain, index) => (
              <div className="bg-[var(--brand-deep)] p-6" key={domain}>
                <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                <p className="mt-7 text-xl font-semibold">{domain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">How we work</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              The goal is a business that is easier to run, easier to see, and easier to trust.
            </h2>
          </div>
          <div className="mt-12 grid border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {principles.map(([title, body], index) => (
              <article className="min-h-64 border-b border-r border-[var(--line)] p-6" key={title}>
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-.04em]">{title}</h3>
                <p className="mt-4 leading-7 text-[var(--ink-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule bg-[var(--surface-muted)] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="eyebrow">The Sekinfra standard</p>
          <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
            Understand first. Fix the right thing. Make sure it worked.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            The goal is not more software. The goal is to solve the right problem and leave the business stronger.
          </p>
        </div>
      </section>

      <section className="py-18">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <ContextualAboutCta />
        </div>
      </section>
    </SiteShell>
  );
}
