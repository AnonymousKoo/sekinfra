import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { SystemDiagram } from "@/components/visuals/system-diagram";
import { DiagnosticPreview } from "@/components/contextual-route";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Start a diagnostic",
  description: "Start with what is happening. SekInfra establishes whether the real problem is operational, technical, or both before recommending a solution.",
  alternates: { canonical: "/start" },
};

const firstConversation = [
  ["What is happening?", "Describe the symptom in plain language. You do not need to diagnose the cause."],
  ["Who or what is affected?", "Identify the people, customers, systems, locations, or work that feel the impact."],
  ["When does it happen?", "Note whether the problem is constant, intermittent, triggered by an event, or tied to a specific workflow."],
  ["What is involved?", "List the systems, tools, network, cloud services, teams, or processes that may sit in the path."],
  ["What changed?", "Share any recent process, software, access, infrastructure, staffing, or configuration change you know about."],
] as const;

export default function Start() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-28">
        <div>
          <p className="eyebrow">Start with the problem</p>
          <h1 className="text-balance mt-5 text-5xl font-semibold tracking-[-.065em] sm:text-6xl">
            Tell us what&apos;s happening. You do not need to know what category it belongs to.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--ink-muted)]">
            The issue may be operations, automation, disconnected systems, cloud, networking, security, or a combination. SekInfra starts by establishing the condition before recommending the fix.
          </p>

          <div className="mt-10 grid gap-4">
            {[
              ["What we look at", "The symptom, the affected work, the systems in the path, the evidence available, and the business consequence."],
              ["What to expect", "A structured diagnostic conversation—not a software pitch and not an assumption about the cause."],
              ["What happens next", "If an assessment is appropriate, scope and access are agreed before SekInfra inspects anything."],
            ].map(([title, body], index) => (
              <div className="flex gap-4 border-t border-[var(--line)] pt-4" key={title}>
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <ButtonLink href="/how-it-works" variant="secondary" className="mt-8">
            See how SekInfra works
          </ButtonLink>
        </div>

        <div className="space-y-5">
          <SystemDiagram variant="selector" activeLabel="Your problem" />
          <DiagnosticPreview />

          <section className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-8" aria-labelledby="prepare-title">
            <p className="eyebrow">Prepare for the first conversation</p>
            <h2 id="prepare-title" className="mt-4 text-2xl font-semibold tracking-[-.04em]">
              Five things that help us understand the problem faster.
            </h2>

            <ol className="mt-7 grid gap-4">
              {firstConversation.map(([title, body], index) => (
                <li className="flex gap-4 border-t border-[var(--line)] pt-4" key={title}>
                  <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-7 border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
              Online diagnostic submission is not enabled on this site yet. This page does not collect, store, or send contact or diagnostic information.
            </p>
          </section>
        </div>
      </section>
    </SiteShell>
  );
}
