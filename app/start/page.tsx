import type{Metadata}from"next";
import{SiteShell}from"@/components/site-shell";
import{SystemDiagram}from"@/components/visuals/system-diagram";
import{ButtonLink}from"@/components/ui/button-link";
import{DiagnosticPaths}from"@/components/diagnostic-paths";

export const metadata:Metadata={
  title:"Start with the problem",
  description:"Tell Sekinfra what is happening. Sekinfra triages the problem and determines whether a focused diagnostic or the Operational Infrastructure Assessment is the right next step.",
  alternates:{canonical:"/start"}
};

const firstConversation=[
  ["What is happening?","Describe the symptom in plain language. You do not need to diagnose the cause."],
  ["Who or what is affected?","Identify the people, customers, systems, locations, or work that feel the impact."],
  ["When does it happen?","Note whether the problem is constant, intermittent, triggered by an event, or tied to a specific workflow."],
  ["What is involved?","List the systems, tools, network, cloud services, teams, or processes that may sit in the path."],
  ["What should be better?","Describe the outcome you need, even if you do not know what technology or process change should create it."]
]as const;

export default function Start(){
  return <SiteShell>
    <section className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28">
      <div>
        <p className="eyebrow">The front door</p>
        <h1 className="text-balance mt-5 text-5xl font-semibold tracking-[-.065em] sm:text-6xl">Tell us what&apos;s happening. We&apos;ll determine how deep the diagnosis needs to go.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">You do not need to choose between operations, automation, cloud, networking, security, software, or the OIA. Start with the symptom, the impact, and what should be working better.</p>

        <div className="mt-10 grid gap-4">
          {[
            ["01","You describe the problem","Start with what you are seeing and why it matters to the business."],
            ["02","SekInfra triages it","We bound the issue and determine the smallest diagnostic path that can answer the right question."],
            ["03","The diagnostic path is scoped","A contained issue can stay focused. A broader or unclear problem can move into the Operational Infrastructure Assessment."]
          ].map(([number,title,body])=><div className="flex gap-4 border-t border-[var(--line)] pt-5" key={title}>
            <span className="font-mono text-xs text-[var(--brand)]">{number}</span>
            <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">{body}</p></div>
          </div>)}
        </div>

        <ButtonLink href="/how-it-works" variant="secondary" className="mt-8">See the full client journey</ButtonLink>
      </div>

      <div className="space-y-5">
        <SystemDiagram variant="selector" activeLabel="Triage" flow={["Symptom","Impact","Scope","Diagnostic path","Next decision"]}/>
        <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-8">
          <p className="eyebrow">What triage decides</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-.04em]">Focused Diagnostic or Operational Infrastructure Assessment?</h2>
          <p className="mt-4 leading-7 text-[var(--ink-muted)]">Triage is not a diagnosis. It determines what should be examined, how broad the scope needs to be, and which diagnostic path is appropriate before any inspection or system access begins.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--line)] p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]">Focused</p><p className="mt-2 text-sm leading-6">Contained technical or workflow issue with a clear boundary.</p></div>
            <div className="rounded-lg border border-[var(--brand)] bg-[var(--brand-wash)] p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]">OIA</p><p className="mt-2 text-sm leading-6">Broader, recurring, cross-system, or unclear operating problem.</p></div>
          </div>
        </div>
      </div>
    </section>

    <DiagnosticPaths/>

    <section className="section-rule bg-[var(--surface-muted)] py-18 sm:py-28">
      <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
        <div>
          <p className="eyebrow">Prepare for the first conversation</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Five things that help us understand the problem faster.</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">You do not need perfect documentation. These are simply the most useful starting signals for triage.</p>
        </div>
        <ol className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 sm:p-8">
          {firstConversation.map(([title,body],index)=><li className="flex gap-4 border-t border-[var(--line)] py-4 first:border-t-0 first:pt-0 last:pb-0" key={title}>
            <span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span>
            <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">{body}</p></div>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="section-rule bg-white py-14">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <p className="max-w-3xl border-l-2 border-[var(--brand)] pl-4 text-sm leading-6 text-[var(--ink-muted)]">Secure online problem submission is not enabled on this site yet. This page does not collect, store, or send contact or diagnostic information. When intake is enabled, it should feed the triage step—not send every visitor directly into the OIA.</p>
      </div>
    </section>
  </SiteShell>
}
