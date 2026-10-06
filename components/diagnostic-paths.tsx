import { ButtonLink } from "@/components/ui/button-link";

const paths = [
  {
    label: "Focused Diagnostic",
    fit: "Best when the problem looks focused and has a clear starting point.",
    examples: [
      "Network or cloud problem",
      "Access or security concern",
      "System connection failure",
      "One workflow keeps breaking",
    ],
    outcome: "Find where the problem starts, show the impact, and define the smallest fix that makes sense.",
  },
  {
    label: "Operational Infrastructure Assessment (OIA)",
    fit: "Best when the problem is bigger, keeps coming back, touches several teams or systems, or has no clear cause.",
    examples: [
      "Several teams or systems are involved",
      "The same problem keeps coming back",
      "Ownership and visibility are unclear",
      "You can see the problem but not what is causing it",
    ],
    outcome: "Build a clear picture of what is happening, why it matters, what should change, and what comes next.",
  },
] as const;

const flow = [
  ["01", "Show us the problem", "Start with what you can see and why it matters."],
  ["02", "We choose how deep to look", "Sekinfra decides whether the problem needs a focused review or the full OIA."],
  ["03", "We find where it starts", "We use facts instead of guessing."],
  ["04", "You see what we found", "We explain what is wrong, what matters most, and what should work better."],
  ["05", "You choose the next move", "Nothing changes unless you approve it."],
  ["06", "We make the approved change", "Sekinfra changes only what you approved."],
  ["07", "We check the result", "We compare the result with the problem we started with."],
] as const;

export function DiagnosticPaths({ cta = false, showFlow = true }: { cta?: boolean; showFlow?: boolean }) {
  return (
    <section className="section-rule bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">Two ways we can review a problem</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">
              Start small. Go deeper only when needed.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Sekinfra starts with the smallest review that can answer the question. A clear problem stays focused. A bigger or unclear problem can move into the Operational Infrastructure Assessment.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {paths.map((path, index) => (
            <article
              className={`rounded-[var(--radius-card)] border p-7 sm:p-8 ${
                index === 1
                  ? "border-[var(--brand)] bg-[var(--brand-wash)]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              }`}
              key={path.label}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">
                  {index === 0 ? "Focused problem" : "Bigger or unclear"}
                </span>
              </div>
              <h3 className="mt-7 text-2xl font-semibold tracking-[-.04em]">{path.label}</h3>
              <p className="mt-3 leading-7 text-[var(--ink-muted)]">{path.fit}</p>
              <ul className="mt-6 space-y-2 border-t border-[var(--line)] pt-5">
                {path.examples.map((item) => (
                  <li className="flex gap-3 text-sm leading-6" key={item}>
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-lg bg-white/70 p-4">
                <p className="eyebrow">What you get</p>
                <p className="mt-2 text-sm font-semibold leading-6">{path.outcome}</p>
              </div>
            </article>
          ))}
        </div>

        {showFlow ? (
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-7">
            {flow.map(([number, title, body]) => (
              <li className="bg-[var(--surface)] p-5" key={title}>
                <span className="font-mono text-xs text-[var(--brand)]">{number}</span>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
              </li>
            ))}
          </ol>
        ) : null}

        {cta ? (
          <div className="mt-8">
            <ButtonLink href="/start">Show us what&apos;s happening</ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
