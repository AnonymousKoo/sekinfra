import type{Metadata}from"next";
import{SiteShell}from"@/components/site-shell";
import{ContextualAboutCta}from"@/components/contextual-about-cta";
import{SystemDiagram}from"@/components/visuals/system-diagram";

export const metadata:Metadata={
  title:"About",
  description:"Sekinfra works across operations and technology to diagnose, design, secure, automate, and improve the systems businesses depend on.",
  alternates:{canonical:"/about"}
};

const principles=[
  ["Diagnose before prescribing","Start with the operating consequence and establish the real condition before deciding what technology should do."],
  ["Work across the whole system","Treat people, process, software, automation, cloud, network, security, and handoffs as one connected operating environment."],
  ["Build only what earns its place","Use the smallest justified intervention that can produce the required outcome instead of adding technology for its own sake."],
  ["Keep authority explicit","Assessment access, implementation permission, deployment authority, and ongoing access remain separate decisions."],
  ["Validate the result","A build is not complete because it shipped. The change has to work under the conditions it was designed to support."]
]as const;

const domains=[
  "Operations & business systems",
  "Automation & integration",
  "Cloud & network infrastructure",
  "Security & reliability",
  "System design & improvement"
]as const;

export default function About(){
  return <SiteShell>
    <section className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
      <div>
        <p className="eyebrow">About SekInfra</p>
        <h1 className="text-balance mt-5 text-5xl font-semibold tracking-[-.065em] sm:text-6xl">Business problems and technology problems are not always separate problems.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">SekInfra exists in the space between them. We help businesses understand what is actually failing, then design and implement the operational or technical system needed to make the work more dependable.</p>
        <p className="mt-5 max-w-2xl leading-7 text-[var(--ink-muted)]">That can mean fixing a workflow, connecting systems, reducing manual coordination, repairing infrastructure, strengthening security controls, improving visibility, or redesigning how the operation moves. The entry point changes. The discipline stays the same.</p>
      </div>
      <SystemDiagram variant="control"/>
    </section>

    <section className="section-rule bg-[var(--brand-deep)] py-18 text-white sm:py-24">
      <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
        <div>
          <p className="eyebrow text-[var(--accent)]">What SekInfra works across</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">One operating system. Multiple failure points.</h2>
          <p className="mt-5 text-lg leading-8 text-white/70">The client should not have to know which technical specialty owns the problem before asking for help.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/15 sm:grid-cols-2">
          {domains.map((domain,index)=><div className="bg-[var(--brand-deep)] p-6" key={domain}>
            <span className="font-mono text-xs text-[var(--accent)]">0{index+1}</span>
            <p className="mt-7 text-xl font-semibold">{domain}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="section-rule bg-white py-18 sm:py-28">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">How we think</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Infrastructure should make the business easier to run, easier to see, and easier to trust.</h2>
        </div>
        <div className="mt-12 grid border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {principles.map(([title,body],index)=><article className="min-h-64 border-b border-r border-[var(--line)] p-6" key={title}>
            <span className="font-mono text-xs text-[var(--brand)]">0{index+1}</span>
            <h3 className="mt-8 text-2xl font-semibold tracking-[-.04em]">{title}</h3>
            <p className="mt-4 leading-7 text-[var(--ink-muted)]">{body}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section-rule bg-[var(--surface-muted)] py-18 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <p className="eyebrow">The SekInfra standard</p>
        <h2 className="text-balance mt-5 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Understand first. Build deliberately. Leave the operation stronger than you found it.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">The goal is not more software. The goal is a business system that performs more reliably because the right problem was solved.</p>
      </div>
    </section>

    <section className="py-18">
      <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
        <ContextualAboutCta/>
      </div>
    </section>
  </SiteShell>
}
