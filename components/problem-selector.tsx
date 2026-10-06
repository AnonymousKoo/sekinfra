"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { usePersonalization } from "@/components/personalization-provider";
import { PRESSURES, type Pressure } from "@/lib/personalization";

const labels: Record<Pressure, string> = {
  leads: "Leads are waiting",
  operations: "Too much work is manual",
  accountability: "No one clearly owns it",
  visibility: "I cannot see what is happening",
  "customer-follow-up": "Follow-up keeps slipping",
  systems: "Our systems do not talk",
  "cloud-network": "Network or cloud problems",
  "security-reliability": "Security, access, or reliability",
  "not-sure": "I am not sure",
};

const neutral = {
  label: "Your problem",
  recognition: "You can see that something is wrong, even if you do not know where the problem starts.",
  consequence: "Guessing can waste time and money on a fix that does not solve the real problem.",
  outcome: "Sekinfra follows the problem until we know what needs to change.",
  flow: ["Problem", "Impact", "People & systems", "Cause", "Next step"],
};

export function ProblemSelector() {
  const { pressure, profile, setPressure } = usePersonalization();
  const selected = profile || neutral;

  return (
    <section aria-labelledby="selector-title" className="section-rule bg-[var(--surface-muted)] py-16 sm:py-24">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.74fr_1.26fr] lg:gap-16">
          <div>
            <p className="eyebrow">What is going wrong?</p>
            <h2 id="selector-title" className="mt-4 max-w-lg text-4xl font-semibold tracking-[-.05em] sm:text-5xl">
              Pick the problem that feels closest.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
              You do not need to know the cause. Start with what you are seeing. Sekinfra follows the problem from there.
            </p>

            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Common business problems">
              {PRESSURES.map((id) => (
                <button
                  key={id}
                  aria-pressed={pressure === id}
                  onClick={() => setPressure(id)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-bold transition ${
                    pressure === id
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                      : "border-[var(--line)] bg-white hover:border-[var(--brand)] hover:bg-[var(--brand-wash)]"
                  }`}
                >
                  {labels[id]}
                </button>
              ))}
            </div>

            <p className="mt-7 border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
              {pressure
                ? "This shows how Sekinfra looks at the problem. It is only an example, not a final answer."
                : "No matter where the problem lives, the first step is the same: tell us what is happening."}
            </p>

            <ButtonLink href="/start" className="mt-7">
              Start the problem check
            </ButtonLink>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-4 shadow-[0_20px_50px_rgba(16,37,31,.06)] sm:p-6">
            <SystemDiagram variant="selector" activeLabel={selected.label} flow={selected.flow} />
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="eyebrow">What you are seeing</p>
                <p className="mt-2 text-sm leading-6">{selected.recognition}</p>
              </div>
              <div>
                <p className="eyebrow">Why it matters</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{selected.consequence}</p>
              </div>
              <div>
                <p className="eyebrow">What better looks like</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--brand)]">{selected.outcome}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
