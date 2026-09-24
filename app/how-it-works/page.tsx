import type{Metadata}from"next";
import{SiteShell}from"@/components/site-shell";
import{ButtonLink}from"@/components/ui/button-link";
import{ProcessFlow}from"@/components/process-flow";
import{ContextualRouteIntro}from"@/components/contextual-route";
import{DiagnosticPaths}from"@/components/diagnostic-paths";

export const metadata:Metadata={
  title:"How it works",
  description:"See how Sekinfra moves from a reported problem through triage, the right level of diagnosis, findings, authorized implementation, and validation.",
  alternates:{canonical:"/how-it-works"}
};

const journey=[
  {
    title:"Tell us what is happening",
    client:"You start with the symptom, impact, urgency, and what should be working better.",
    sekinfra:"SekInfra listens for the business consequence without forcing the problem into a technical category.",
    output:"A clear starting problem and desired outcome."
  },
  {
    title:"Triage the problem",
    client:"You provide enough context to bound the issue without completing a full assessment.",
    sekinfra:"SekInfra identifies the likely scope, affected systems or workflows, and the smallest diagnostic depth that can answer the right question.",
    output:"A proposed diagnostic path and scope."
  },
  {
    title:"Use the right diagnostic",
    client:"You authorize only the systems, workflows, or infrastructure needed for the agreed diagnostic path.",
    sekinfra:"A contained problem stays focused. A broader, recurring, cross-system, or unclear problem can move into the Operational Infrastructure Assessment.",
    output:"Evidence about the real condition—not just the visible symptom."
  },
  {
    title:"Deliver findings",
    client:"You see what is supported, what remains uncertain, what matters most, and what should be different.",
    sekinfra:"SekInfra separates evidence, findings, business consequence, priorities, risks, and the desired state.",
    output:"A controlled decision about what should move forward."
  },
  {
    title:"Design and authorize",
    client:"You choose which verified recommendation should move into implementation.",
    sekinfra:"SekInfra designs the intervention across process, automation, integration, cloud, network, security, or business systems and defines success conditions.",
    output:"An approved implementation boundary with a clear job."
  },
  {
    title:"Build",
    client:"You approve the specific implementation before changes begin.",
    sekinfra:"SekInfra implements only the authorized change and keeps scope, decisions, and exceptions visible.",
    output:"A controlled build rather than an open-ended technology project."
  },
  {
    title:"Validate",
    client:"You see whether the change works under the conditions it was designed to support.",
    sekinfra:"SekInfra tests the result against the agreed success conditions and records anything still unresolved.",
    output:"Evidence that the problem was solved—or a clear reason it was not."
  },
  {
    title:"Improve when justified",
    client:"You choose whether another problem, refinement, or ongoing operating need should move forward.",
    sekinfra:"SekInfra uses the new evidence to recommend the next decision without silently expanding scope.",
    output:"A deliberate next step instead of permanent project drift."
  }
]as const;

const controls=[
  ["Scope","What SekInfra may inspect or change is explicit before the work begins."],
  ["Authority","Triage, assessment access, implementation permission, deployment permission, and ongoing access are separate decisions."],
  ["Evidence","A visible symptom is not treated as a root cause until the supporting evidence exists."],
  ["Depth","The diagnostic can deepen when the evidence shows the problem is broader than the original boundary."],
  ["Change","If the work needs to expand, the boundary changes deliberately instead of silently."]
]as const;

export default function HowItWorks(){
  return <SiteShell>
    <section className="mx-auto max-w-[var(--page-width)] px-5 py-20 lg:px-8 lg:py-28">
      <p className="eyebrow">How SekInfra works</p>
      <h1 className="text-balance mt-5 max-w-5xl text-5xl font-semibold tracking-[-.065em] sm:text-6xl">Bring us the problem. We determine how deep the diagnosis needs to go.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-muted)]">A business does not need to know whether it has an operations problem, automation problem, network problem, cloud problem, security problem, or an OIA-sized problem before starting. SekInfra begins with the consequence, triages the scope, and follows the system behind it.</p>
      <div className="mt-10"><ContextualRouteIntro kind="process"/></div>
    </section>

    <DiagnosticPaths/>

    <section className="section-rule bg-[var(--surface-muted)] py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">The client journey</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">From “something is wrong” to a validated improvement.</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">The diagnostic path can change depth without changing the control model. Triage does not authorize inspection. Diagnosis does not authorize implementation. Implementation does not authorize permanent access.</p>
        </div>

        <ol className="mt-12 grid gap-4 lg:grid-cols-2">
          {journey.map((step,index)=><li className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-7" key={step.title}>
            <div className="flex items-start justify-between gap-6">
              <div><span className="font-mono text-xs text-[var(--brand)]">{String(index+1).padStart(2,"0")}</span><h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{step.title}</h3></div>
              <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand)]"/>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div><p className="eyebrow">What you experience</p><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{step.client}</p></div>
              <div><p className="eyebrow">What SekInfra does</p><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{step.sekinfra}</p></div>
            </div>
            <div className="mt-6 border-t border-[var(--line)] pt-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]">Stage output</p><p className="mt-2 font-semibold leading-6">{step.output}</p></div>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="section-rule bg-[var(--brand-deep)] py-18 text-white sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="eyebrow text-[var(--accent)]">After the diagnostic path is chosen</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Diagnose → Design → Build → Validate → Improve.</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">This is the repeatable delivery core. The diagnostic may be focused or broad; the discipline around evidence, authorization, implementation, and validation stays the same.</p>
          </div>
          <div><ProcessFlow dark/></div>
        </div>
      </div>
    </section>

    <section className="section-rule bg-white py-18 sm:py-24">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.6fr_1.4fr]">
          <div><p className="eyebrow">What stays controlled</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.045em]">No hidden jump from symptom to system change.</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {controls.map(([title,body],index)=><article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-6" key={title}><span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p></article>)}
          </div>
        </div>
      </div>
    </section>

    <section className="py-22 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <p className="eyebrow">Your first step</p>
        <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Tell us what is not working the way it should.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--ink-muted)]">SekInfra will determine whether the right next move is a focused diagnostic, the OIA, or simply a clearer triage conversation.</p>
        <ButtonLink href="/start" className="mt-8">Tell us what&apos;s happening</ButtonLink>
      </div>
    </section>
  </SiteShell>
}
