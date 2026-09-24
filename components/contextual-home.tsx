"use client";
import{ButtonLink}from"@/components/ui/button-link";
import{SystemDiagram}from"@/components/visuals/system-diagram";
import{usePersonalization}from"@/components/personalization-provider";
import{orderedOutcomeFamilies}from"@/lib/outcomes";

const capabilities=["Operations","Automation","Cloud & Network","Security & Reliability","Business Systems"]as const;

export function ContextualHero(){
  const{profile}=usePersonalization();
  const copy=profile?profile.hero:"From broken workflows and disconnected tools to cloud, network, security, and automation problems, SekInfra finds the real failure point and builds the right solution.";

  return <section className="relative overflow-hidden bg-[var(--brand-deep)] text-white"><div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-90" style={{background:"radial-gradient(circle at 18% 28%, rgba(15,159,152,.18), transparent 34%), radial-gradient(circle at 78% 24%, rgba(185,239,112,.07), transparent 28%)"}}/>
    <div className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-32">
      <div className="relative z-10">
        <p className="eyebrow text-[var(--accent)]">{profile?`Operational focus: ${profile.label}`:"Business + technology infrastructure"}</p>
        <h1 className="text-balance mt-6 max-w-3xl text-5xl font-semibold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">We build and fix the systems your business runs on.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">{copy}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/start">Tell us what&apos;s happening</ButtonLink>
          <ButtonLink href="/how-it-works" variant="secondary">See how SekInfra works</ButtonLink>
        </div>
        <ul className="mt-10 flex max-w-2xl flex-wrap gap-2" aria-label="SekInfra capability areas">
          {capabilities.map(capability=><li className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70" key={capability}>{capability}</li>)}
        </ul>
        <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-white/65">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_5px_rgba(185,239,112,.12)]"/>
          {profile?profile.cta:"Diagnose first. Build only what the operation needs."}
        </div>
      </div>
      <SystemDiagram className="lg:mt-3" activeLabel={profile?.label} flow={profile?.flow}/>
    </div>
  </section>
}

export function ContextualOutcomes(){
  const{profile}=usePersonalization();
  const families=orderedOutcomeFamilies(profile?.id);

  return <section className="section-rule py-18 sm:py-28">
    <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
      <p className="eyebrow">{profile?`Relevant to ${profile.label}`:"Business outcomes"}</p>
      <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl">
        {profile?"The most relevant outcome family rises to the surface.":"Different pressure points. Five ways the business should become stronger."}
      </h2>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
        {profile?profile.response:"SekInfra measures the work by the operating state it creates—not by how much technology was installed."}
      </p>

      <div className="mt-12 grid gap-4 lg:grid-cols-5">
        {families.map((family,index)=><article className={`flex min-h-72 flex-col rounded-[var(--radius-card)] border p-5 transition ${profile&&index===0?"border-[var(--brand)] bg-[var(--brand-wash)]":"border-[var(--line)] bg-white"}`} key={family.id}>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span>
            {profile&&index===0?<span className="rounded-full border border-[var(--brand)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[var(--brand)]">Relevant now</span>:null}
          </div>
          <h3 className="mt-7 text-lg font-semibold tracking-[-.03em]">{family.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{family.summary}</p>
          <div className="mt-auto flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-5">
            {family.outcomes.slice(0,3).map(outcome=><span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--ink-muted)]" key={outcome}>{outcome}</span>)}
          </div>
        </article>)}
      </div>

      <ButtonLink href="/outcomes" variant="secondary" className="mt-7">Explore business outcomes</ButtonLink>
    </div>
  </section>
}
