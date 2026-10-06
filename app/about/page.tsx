import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { ContextualAboutCta } from "@/components/contextual-about-cta";
import { SystemDiagram } from "@/components/visuals/system-diagram";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sekinfra finds and fixes the systems behind business problems across operations, automation, business software, cloud, network, security, compliance, and reliability.",
  alternates: { canonical: "/about" },
};

const principles = [
  ["Find the cause before the tool", "We start with what is going wrong before deciding what software, automation, or technology should change."],
  ["Look at the whole path", "People, steps, software, cloud, network, security, compliance, and handoffs can all be part of the same problem."],
  ["Make the smallest useful change", "We do not add technology just to add technology. The change should have a clear job."],
  ["Ask before we change anything", "Review access, changes, going live, and ongoing access are separate decisions."],
  ["Make sure it worked", "A job is not done because the change went live. It has to solve the problem it was meant to solve."],
] as const;

const audiences = [
  [
    "Growing service businesses",
    "More customers, employees, locations, or work have created more handoffs and more chances for things to get missed.",
  ],
  [
    "Owner-led companies",
    "Too much still depends on the owner knowing what is happening, answering questions, or fixing problems personally.",
  ],
  [
    "Teams with accountability gaps",
    "Work gets missed, deadlines slip, or no one can clearly say who owns the next step.",
  ],
  [
    "Businesses with compliance or risk requirements",
    "Required steps, approvals, access, records, or proof need to stay clear and easy to show.",
  ],
  [
    "Companies with disconnected systems",
    "Information lives in too many places, people repeat work, and important updates do not move where they need to.",
  ],
] as const;

export default function About() {
  return (
    <SiteShell>
      <section className="tech-page-hero mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
        <div>
          <p className="eyebrow">About Sekinfra</p>
          <h1 className="text-balance mt-5 text-5xl font-semibold tracking-[-.065em] sm:text-6xl">
            We find and fix the system behind the problem.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Sometimes the problem is the way work moves. Sometimes it is software, automation, network, cloud, security, compliance, or a mix of several things. Sekinfra follows the problem until we can see where it starts.
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-[var(--ink-muted)]">
            Then we build the right fix without making you choose a service category first.
          </p>
        </div>
        <SystemDiagram variant="control" />
      </section>

      <section className="section-rule bg-[var(--brand-deep)] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="eyebrow text-[var(--accent)]">Who Sekinfra is for</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
                For businesses that have outgrown “just figure it out.”
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/70">
              Sekinfra fits when the business is growing, the work is getting harder to manage, or too much still depends on memory, workarounds, and the owner stepping in.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map(([title, body], index) => (
              <article className="tech-domain-tile bg-[var(--brand-deep)] p-6 sm:p-7" key={title}>
                <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{body}</p>
              </article>
            ))}
            <div className="bg-white/5 p-6 sm:p-7">
              <p className="eyebrow text-[var(--accent)]">You do not need to know the cause</p>
              <p className="mt-4 text-lg font-semibold leading-7">
                You only need to know the business is not running the way it should.
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-4xl text-sm leading-6 text-white/55">
            When the problem requires it, Sekinfra can work across operations, automation, business systems, cloud, network, security, compliance, and reliability.
          </p>
        </div>
      </section>

      <section className="section-rule tech-light-surface bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">How we work</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              The goal is a business that is easier to run, easier to see, and easier to trust.
            </h2>
          </div>
          <div className="mt-12 grid border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {principles.map(([title, body], index) => (
              <article className="tech-grid-card min-h-64 border-b border-r border-[var(--line)] p-6" key={title}>
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
