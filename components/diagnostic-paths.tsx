import{ButtonLink}from"@/components/ui/button-link";

const paths=[
  {
    label:"Focused Diagnostic",
    fit:"A contained problem with a clear operating boundary.",
    examples:["Network or cloud issue","Access or security concern","System integration failure","Automation or workflow problem"],
    outcome:"Establish the failure point, business impact, and the smallest justified fix."
  },
  {
    label:"Operational Infrastructure Assessment",
    fit:"A broader, recurring, cross-system problem—or a problem whose real cause is still unclear.",
    examples:["Multiple teams or systems involved","Recurring operational failures","Ownership and visibility are unclear","The business knows the symptom but not the real source"],
    outcome:"Build an evidence-backed operating picture, findings, priorities, and the controlled next decision."
  }
]as const;

const flow=[
  ["01","Tell us what’s happening","Start with the symptom, impact, urgency, and desired outcome."],
  ["02","Triage","SekInfra determines the smallest diagnostic path that can answer the right question."],
  ["03","Diagnose","Use a Focused Diagnostic or the full Operational Infrastructure Assessment."],
  ["04","Findings","Separate evidence, supported conclusions, priorities, and remaining uncertainty."],
  ["05","Authorize","You decide whether a specific recommendation should move into implementation."],
  ["06","Implement","SekInfra makes only the change that was explicitly approved."],
  ["07","Validate","Confirm the approved change solved the problem it was meant to solve."]
]as const;

export function DiagnosticPaths({cta=false}:{cta?:boolean}){
  return <section className="section-rule bg-white py-18 sm:py-28">
    <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
        <div>
          <p className="eyebrow">The diagnostic route</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Not every problem needs the full OIA.</h2>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">SekInfra starts with the problem, triages the scope, and uses the minimum diagnostic depth needed to establish the real failure point. A focused technical issue should stay focused. A broader or unclear operating problem can escalate into the Operational Infrastructure Assessment.</p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {paths.map((path,index)=><article className={`rounded-[var(--radius-card)] border p-7 sm:p-8 ${index===1?"border-[var(--brand)] bg-[var(--brand-wash)]":"border-[var(--line)] bg-[var(--surface)]"}`} key={path.label}>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span>
            <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">{index===0?"Contained issue":"Broader / unclear issue"}</span>
          </div>
          <h3 className="mt-7 text-2xl font-semibold tracking-[-.04em]">{path.label}</h3>
          <p className="mt-3 leading-7 text-[var(--ink-muted)]">{path.fit}</p>
          <ul className="mt-6 space-y-2 border-t border-[var(--line)] pt-5">
            {path.examples.map(item=><li className="flex gap-3 text-sm leading-6" key={item}><span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]"/>{item}</li>)}
          </ul>
          <div className="mt-6 rounded-lg bg-white/70 p-4">
            <p className="eyebrow">Goal</p>
            <p className="mt-2 text-sm font-semibold leading-6">{path.outcome}</p>
          </div>
        </article>)}
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-7">
        {flow.map(([number,title,body])=><li className="bg-[var(--surface)] p-5" key={title}>
          <span className="font-mono text-xs text-[var(--brand)]">{number}</span>
          <h3 className="mt-6 text-lg font-semibold">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
        </li>)}
      </ol>

      {cta?<div className="mt-8"><ButtonLink href="/start">Tell us what&apos;s happening</ButtonLink></div>:null}
    </div>
  </section>
}
