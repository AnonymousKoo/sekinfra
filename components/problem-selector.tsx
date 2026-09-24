"use client";
import{SystemDiagram}from"@/components/visuals/system-diagram";
import{usePersonalization}from"@/components/personalization-provider";
import{profiles,PRESSURES,type Pressure}from"@/lib/personalization";

const labels:Record<Pressure,string>={
  leads:"Leads are waiting",
  operations:"Too much manual work",
  accountability:"No clear owner",
  visibility:"Can’t see what’s happening",
  "customer-follow-up":"Follow-up keeps slipping",
  systems:"Systems don’t talk",
  "cloud-network":"Network or cloud issue",
  "security-reliability":"Security or access concern",
  "not-sure":"I’m not sure",
};

const neutral={
  label:"Problem",
  recognition:"You can see the symptom, but the real failure point may sit somewhere else in the operation or technology stack.",
  consequence:"Fixing the visible symptom alone can create another workaround without solving the underlying condition.",
  outcome:"The actual failure point is established before SekInfra recommends what should be repaired, connected, secured, automated, or redesigned.",
  flow:["Symptom","System","Failure point","Intervention","Outcome"],
};

export function ProblemSelector(){
  const{pressure,profile,setPressure}=usePersonalization();
  const selected=profile||neutral;

  return <section aria-labelledby="selector-title" className="section-rule bg-[var(--surface-muted)] py-18 sm:py-28">
    <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <div>
          <p className="eyebrow">Start with what you are experiencing</p>
          <h2 id="selector-title" className="mt-4 max-w-lg text-4xl font-semibold tracking-[-.05em] sm:text-5xl">You bring the symptom. We trace the system behind it.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">Choose an example to see how SekInfra thinks about the problem. You do not need to know whether the root cause is operational, technical, security-related, or automation-related before you start.</p>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Example business pressure points">
            {PRESSURES.map(id=>{
              const item=profiles[id];
              return <button key={id} aria-pressed={pressure===id} onClick={()=>setPressure(id)} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition ${pressure===id?"border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm":"border-[var(--line)] bg-white hover:border-[var(--brand)] hover:bg-[var(--brand-wash)]"}`}>
                {labels[item.id]}
              </button>
            })}
          </div>

          <p className="mt-7 border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">
            {pressure?"This is an illustrative path, not a browser diagnosis. Change the example at any time.":"Network, cloud, security, access, integration, and other technical issues can start the same way: tell us what is happening first."}
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-4 shadow-[0_20px_50px_rgba(16,37,31,.06)] sm:p-6">
          <SystemDiagram variant="selector" activeLabel={selected.label} flow={selected.flow}/>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="eyebrow">What you notice</p>
              <p className="mt-2 text-sm leading-6">{selected.recognition}</p>
            </div>
            <div>
              <p className="eyebrow">Why it matters</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{selected.consequence}</p>
            </div>
            <div>
              <p className="eyebrow">What SekInfra establishes</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--brand)]">{selected.outcome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
}
