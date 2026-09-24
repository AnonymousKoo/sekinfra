import type{Metadata}from"next";
import{SiteShell}from"@/components/site-shell";
import{ButtonLink}from"@/components/ui/button-link";
import{ProcessFlow}from"@/components/process-flow";
import{ContextualRouteIntro}from"@/components/contextual-route";

export const metadata:Metadata={
  title:"How it works",
  description:"See how Sekinfra moves from a reported business or technology problem to a diagnosed, designed, authorized, and validated improvement.",
  alternates:{canonical:"/how-it-works"}
};

const journey=[
  {
    title:"Tell us what is happening",
    client:"You start with the symptom, impact, and what should be working better.",
    sekinfra:"SekInfra listens for the operating consequence without forcing the problem into a service category.",
    output:"A clear starting problem and desired business outcome."
  },
  {
    title:"Diagnose",
    client:"You authorize the systems, workflows, or infrastructure that may be assessed.",
    sekinfra:"SekInfra maps the relevant operation, inspects approved conditions, and separates evidence from assumptions.",
    output:"A supported picture of what is actually happening."
  },
  {
    title:"Define the problem",
    client:"You can see which findings are supported, what remains uncertain, and what deserves attention first.",
    sekinfra:"SekInfra connects the symptom to the material failure point and business consequence where the evidence supports it.",
    output:"Prioritized findings and a defined target condition."
  },
  {
    title:"Design the solution",
    client:"You decide which verified problem should move forward.",
    sekinfra:"SekInfra determines the appropriate intervention across process, automation, integration, cloud, network, security, or business systems.",
    output:"A practical implementation plan with scope and success conditions."
  },
  {
    title:"Build with authorization",
    client:"You approve the specific implementation boundary before changes begin.",
    sekinfra:"SekInfra builds only the approved change and keeps scope, decisions, and exceptions visible.",
    output:"A controlled implementation rather than an open-ended technology project."
  },
  {
    title:"Validate",
    client:"You see whether the change works under the conditions it was designed to support.",
    sekinfra:"SekInfra tests the implemented result against the agreed success conditions and records what is still unresolved.",
    output:"Evidence that the change worked, or a clear reason it did not."
  },
  {
    title:"Improve when justified",
    client:"You choose whether another problem, refinement, or ongoing operating need should move forward.",
    sekinfra:"SekInfra uses the new operating evidence to recommend the next decision without silently expanding scope.",
    output:"A deliberate next step instead of permanent project drift."
  }
]as const;

const controls=[
  ["Scope","What SekInfra may inspect or change is explicit before the work begins."],
  ["Authority","Assessment access, implementation permission, deployment permission, and ongoing access are separate decisions."],
  ["Evidence","A visible symptom is not treated as a root cause until the supporting evidence exists."],
  ["Change","If the work needs to expand, the boundary changes deliberately instead of silently."]
]as const;

export default function HowItWorks(){
  return <SiteShell>
    <section className="mx-auto max-w-[var(--page-width)] px-5 py-20 lg:px-8 lg:py-28">
      <p className="eyebrow">How SekInfra works</p>
      <h1 className="text-balance mt-5 max-w-5xl text-5xl font-semibold tracking-[-.065em] sm:text-6xl">Bring us the problem. We establish what it is before deciding what should change.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-muted)]">A business does not need to know whether it has an operations problem, an automation problem, a network problem, a cloud problem, or a security problem before starting. SekInfra begins with the consequence and follows the system behind it.</p>
      <div className="mt-10"><ContextualRouteIntro kind="process"/></div>
    </section>

    <section className="section-rule bg-white py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">The client journey</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">From “something is wrong” to a controlled improvement.</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">Each stage has a different job. Diagnosis does not automatically become implementation, and implementation does not automatically become permanent access.</p>
        </div>

        <ol className="mt-12 grid gap-4 lg:grid-cols-2">
          {journey.map((step,index)=><li className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--background)] p-6 sm:p-7" key={step.title}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{step.title}</h3>
              </div>
              <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand)]"/>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="eyebrow">What you experience</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{step.client}</p>
              </div>
              <div>
                <p className="eyebrow">What SekInfra does</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{step.sekinfra}</p>
              </div>
            </div>
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]">Stage output</p>
              <p className="mt-2 font-semibold leading-6">{step.output}</p>
            </div>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="section-rule bg-[var(--brand-deep)] py-18 text-white sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="eyebrow text-[var(--accent)]">The delivery system</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Diagnose → Design → Build → Validate → Improve.</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">This is the repeatable core inside the broader client journey. The specific technology can change. The discipline does not.</p>
          </div>
          <div><ProcessFlow dark/></div>
        </div>
      </div>
    </section>

    <section className="section-rule bg-[var(--surface-muted)] py-18 sm:py-24">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.6fr_1.4fr]">
          <div>
            <p className="eyebrow">What stays controlled</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em]">No hidden jump from diagnosis to change.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {controls.map(([title,body],index)=><article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6" key={title}>
              <span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
            </article>)}
          </div>
        </div>
      </div>
    </section>

    <section className="py-22 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <p className="eyebrow">Your first step</p>
        <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Tell us what is not working the way it should.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--ink-muted)]">You do not need a technical diagnosis or a software recommendation before starting.</p>
        <ButtonLink href="/start" className="mt-8">Tell us what&apos;s happening</ButtonLink>
      </div>
    </section>
  </SiteShell>
}
