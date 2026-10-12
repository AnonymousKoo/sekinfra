"use client";

import { useMemo, useState } from "react";

type Section = "overview" | "clients" | "systems" | "automation" | "security";

type Engagement = {
  id: string;
  organization: string;
  label: string;
  stage: string;
  attention: "SEKINFRA" | "CLIENT" | "MONITOR";
  nextAction: string | null;
  assessmentState: string | null;
};

type Props = { engagements: Engagement[]; referenceLabel: string };

const navigation: { id: Section; number: string; label: string; description: string }[] = [
  { id: "overview", number: "01", label: "Overview", description: "Your operating picture" },
  { id: "clients", number: "02", label: "Client work", description: "Pipeline and diagnostics" },
  { id: "systems", number: "03", label: "Connected tools", description: "Infrastructure inventory" },
  { id: "automation", number: "04", label: "Workflows", description: "Automation boundaries" },
  { id: "security", number: "05", label: "Security", description: "Access and authority" },
];

const services = [
  { name: "Cloudflare Tunnel", group: "Connectivity", detail: "Sekinfra published routes", status: "Route configured", tag: "EDGE", glyph: "CF" },
  { name: "n8n", group: "Automation", detail: "n8n.sekinfra.com", status: "Connection not verified", tag: "FLOW", glyph: "n8n" },
  { name: "Grafana", group: "Monitoring", detail: "grafana.sekinfra.com", status: "Connection not verified", tag: "OBS", glyph: "GF" },
  { name: "Uptime Kuma", group: "Reliability", detail: "kuma.sekinfra.com", status: "Connection not verified", tag: "OBS", glyph: "UK" },
  { name: "Prometheus", group: "Metrics", detail: "prometheus.sekinfra.com", status: "Connection not verified", tag: "OBS", glyph: "PM" },
  { name: "Signing service", group: "Security", detail: "sign.sekinfra.com", status: "Restricted access to verify", tag: "SEC", glyph: "SG" },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {diagonal ? <path d="M5 19 19 5M8 5h11v11" /> : <path d="m5 12 14 0m-6-6 6 6-6 6" />}
  </svg>;
}

function Sparkle() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.4"><path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z" /><path d="M19 2v4M17 4h4" /></svg>;
}

function StatusDot({ color = "lime" }: { color?: "lime" | "amber" | "slate" }) {
  return <span aria-hidden="true" className={"inline-block h-1.5 w-1.5 shrink-0 rounded-full " + (color === "lime" ? "bg-[#c9ec81]" : color === "amber" ? "bg-[#ebb66e]" : "bg-[#73959a]")} />;
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
    <div className="max-w-2xl">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#b8d87c]">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#90a9ad]">{copy}</p>
    </div>
  </div>;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"min-w-0 rounded-[18px] border border-[#254249] bg-[#0b1a20] " + className}>{children}</div>;
}

export function CommandCenterExperience({ engagements, referenceLabel }: Props) {
  const [section, setSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  const operatorItems = engagements.filter((item) => item.attention === "SEKINFRA");
  const clientItems = engagements.filter((item) => item.attention === "CLIENT");
  const activeAssessments = engagements.filter((item) => item.assessmentState === "IN_PROGRESS");
  const visibleClients = useMemo(() => engagements.filter((item) =>
    [item.organization, item.label, item.stage].some((field) => field.toLowerCase().includes(search.trim().toLowerCase()))
  ), [engagements, search]);

  const changeSection = (next: Section) => {
    setSection(next);
    setSearch("");
    setShowDemoNotice(false);
  };

  return <div className="min-h-screen bg-[#071318] text-[#eaf1ec]" style={{ colorScheme: "dark" }}>
    <a href="#command-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-[#c9ec81] px-4 py-3 text-sm font-bold text-[#102018] focus:translate-y-0">Skip to command center</a>
    <div className="mx-auto min-h-screen max-w-[1920px] lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="border-b border-[#234049] bg-[#09171c] px-4 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9ec81] text-xl font-black tracking-tight text-[#0e2119]">S<span className="text-xs">/</span></span>
            <div>
              <div className="text-sm font-extrabold tracking-[.13em] text-white">SEKINFRA</div>
              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.16em] text-[#90aaab]">Command center</div>
            </div>
          </div>
          <span className="rounded-full border border-[#36534e] bg-[#19302c] px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-[#d5ef9d]">Preview</span>
        </div>

        <div className="mt-8 hidden lg:block">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#66828a]">Workspace</p>
        </div>
        <nav aria-label="Command center sections" className="mt-4 flex gap-1 overflow-x-auto pb-2 lg:mt-3 lg:flex-col lg:overflow-visible">
          {navigation.map((item) => <button type="button" key={item.id} aria-current={section === item.id ? "page" : undefined} onClick={() => changeSection(item.id)}
            className={"flex min-h-12 shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:w-full " +
              (section === item.id ? "border-[#496354] bg-[#1b302c] text-white shadow-[inset_3px_0_0_#c9ec81]" : "border-transparent text-[#91a6a8] hover:border-[#29444b] hover:bg-[#12252b] hover:text-white")}>
            <span className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] " + (section === item.id ? "bg-[#c9ec81] font-bold text-[#13251a]" : "bg-[#182a30] text-[#7c999e]")}>{item.number}</span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{item.label}</span>
              <span className="hidden truncate text-[10px] text-[#758f94] lg:block">{item.description}</span>
            </span>
          </button>)}
        </nav>

        <div className="mt-auto hidden space-y-4 pt-8 lg:block">
          <div className="rounded-xl border border-[#304942] bg-[#12251f] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#d8ecbd]"><StatusDot /> Workspace boundary</div>
            <p className="mt-2 text-[11px] leading-5 text-[#91aea4]">Presentation-only. No Avuhz authority, live credentials or system changes.</p>
          </div>
          <a href="/" className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#91a6a8] hover:bg-[#14282f] hover:text-white">Sekinfra public website <Arrow diagonal /></a>
        </div>
      </aside>

      <main id="command-content" className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#234049] px-5 py-5 sm:px-8 xl:px-11">
          <div className="flex items-center gap-2 text-xs text-[#93a9a9]">
            <span className="font-semibold text-[#dce9e2]">Workspace</span><span className="text-[#55727a]">/</span>
            <span className="capitalize">{section === "clients" ? "Client work" : section === "systems" ? "Connected tools" : section}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#315047] bg-[#142920] px-3 py-1.5 text-[#d8eabf]"><StatusDot /> Synthetic workspace</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#42616a] bg-[#20343b] font-bold text-[#e9f2ea]" title="Demo operator">S</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1540px] px-5 py-7 sm:px-8 sm:py-9 xl:px-11 xl:py-11">
          <div className="mb-7 flex flex-wrap items-center gap-2 rounded-xl border border-[#70582f] bg-[#382c19]/60 px-4 py-3 text-xs leading-5 text-[#f2d9a5]">
            <span className="font-extrabold uppercase tracking-[.12em]">Demo only</span>
            <span>All client records are fictional. Service health, AI commands, authentication and workflows are not connected.</span>
          </div>

          {section === "overview" && <>
            <section className="relative isolate overflow-hidden rounded-[22px] border border-[#355043] bg-[radial-gradient(circle_at_90%_25%,#26443a_0%,#172c2c_27%,#0e2328_63%,#0c1e22_100%)] px-6 py-8 sm:px-9 sm:py-10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] opacity-25 lg:block" style={{backgroundImage:"linear-gradient(#61877e 1px,transparent 1px),linear-gradient(90deg,#61877e 1px,transparent 1px)",backgroundSize:"32px 32px",maskImage:"linear-gradient(90deg,transparent,black)"}} />
              <div className="relative max-w-3xl">
                <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#c9ec81]"><span className="h-1.5 w-1.5 rounded-full bg-[#c9ec81]" /> Your operating system, in one view</div>
                <h1 className="max-w-[790px] text-3xl font-semibold leading-[1.12] tracking-[-.055em] text-white sm:text-5xl xl:text-[56px]">See the work. <span className="text-[#c9ec81]">Move what matters.</span></h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-[#a4beba] sm:text-base">One place for client progress, approvals, infrastructure and automation. Built for an operator—not another collection of dashboards.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={() => changeSection("clients")} className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-[#c9ec81] px-4 text-xs font-bold text-[#142619] transition-colors hover:bg-[#e1f7af]">Review client work <Arrow /></button>
                  <button onClick={() => changeSection("systems")} className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-[#49665f] bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/10">Explore connected tools <Arrow diagonal /></button>
                </div>
              </div>
              <div className="absolute -bottom-8 right-4 hidden h-40 w-40 rounded-full border border-[#8baa7d]/25 lg:block" aria-hidden="true"><div className="absolute inset-7 rounded-full border border-[#8baa7d]/35"/><div className="absolute inset-[66px] rounded-full bg-[#c9ec81] shadow-[0_0_45px_#c9ec81]/50"/></div>
            </section>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Synthetic portfolio indicators">
              {[
                { label: "Demo engagements", count: engagements.length, hint: "Illustrative portfolio", mark: "↗" },
                { label: "Needs operator", count: operatorItems.length, hint: "Presentation attention", mark: "↗" },
                { label: "Waiting on client", count: clientItems.length, hint: "Next external step", mark: "→" },
                { label: "Active assessments", count: activeAssessments.length, hint: "Fictional assessment state", mark: "◈" },
              ].map((stat) => <Panel key={stat.label} className="p-5">
                <div className="flex items-center justify-between text-[12px] font-medium text-[#9cb3b2]"><span>{stat.label}</span><span className="font-mono text-lg text-[#72938e]">{stat.mark}</span></div>
                <div className="mt-3 text-[38px] font-semibold tracking-[-.055em] text-white">{stat.count.toString().padStart(2,"0")}</div>
                <div className="mt-2 text-[11px] text-[#718b91]">{stat.hint}</div>
              </Panel>)}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,.9fr)]">
              <Panel className="p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#bedb8d]">Attention queue</p><h2 className="mt-1.5 text-xl font-semibold tracking-tight text-white">Where you should focus</h2></div>
                  <button onClick={() => changeSection("clients")} className="flex items-center gap-2 text-xs font-semibold text-[#c9ec81] hover:text-white">All client work <Arrow /></button>
                </div>
                <div className="divide-y divide-[#213a42]">
                  {engagements.slice(0,4).map((item, i) => <div key={item.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-1 last:pb-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2d4e4e] bg-[#1a3335] font-mono text-xs text-[#b6d3c1]">{String(i+1).padStart(2,"0")}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#eef4ed]">{item.organization}</p><p className="mt-1 truncate text-xs text-[#829fa3]">{item.label}</p></div>
                    <div className="flex flex-col items-end gap-1.5"><span className={"rounded-full px-2.5 py-1 text-[10px] font-semibold " + (item.attention === "SEKINFRA" ? "bg-[#3c3322] text-[#f3d39c]" : item.attention === "CLIENT" ? "bg-[#233c38] text-[#bdddc2]" : "bg-[#24363d] text-[#aac0c4]")}>{item.attention === "SEKINFRA" ? "Your attention" : item.attention === "CLIENT" ? "Waiting on client" : "Monitor"}</span><span className="text-[10px] text-[#718d91]">{item.stage}</span></div>
                  </div>)}
                  {engagements.length === 0 && <p className="py-6 text-sm text-[#9db2b5]">No fictional engagements available in this preview.</p>}
                </div>
              </Panel>

              <Panel className="flex flex-col p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#bedb8d]">Your next move</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">From visibility to action.</h2>
                <p className="mt-3 text-sm leading-6 text-[#8fa9aa]">The command center should surface decisions and execute only after the correct permissions, client approvals and shared Avuhz boundaries are in place.</p>
                <div className="mt-6 space-y-3">
                  {[["01","Review pending work","Separate operator attention from client waits"],["02","Confirm authority","No change without verified scope and access"],["03","Execute deliberately","Approved APIs and monitored automation only"]].map((item)=><div key={item[0]} className="flex gap-3 rounded-xl border border-[#244048] bg-[#11252b] p-3.5">
                    <span className="font-mono text-xs font-bold text-[#c9ec81]">{item[0]}</span><div><p className="text-xs font-semibold text-white">{item[1]}</p><p className="mt-1 text-[11px] leading-5 text-[#83a0a0]">{item[2]}</p></div>
                  </div>)}
                </div>
                <button onClick={() => changeSection("security")} className="mt-auto flex min-h-11 items-center justify-between pt-6 text-xs font-bold text-[#c9ec81]">Review authority controls <Arrow /></button>
              </Panel>
            </div>
          </>}

          {section === "clients" && <>
            <SectionIntro eyebrow="Client operations / 02" title="Every engagement. One clear next step." copy="A visual model of how diagnostics, approvals, and client attention will appear when Avuhz-backed data becomes available." />
            <Panel className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26424a] p-5">
                <div><h3 className="text-base font-semibold text-white">Fictional engagement portfolio</h3><p className="mt-1 text-xs text-[#82a0a2]">No live client records or permissions</p></div>
                <label className="relative block w-full sm:w-64"><span className="sr-only">Search fictional engagements</span><input type="search" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search engagements" className="min-h-10 w-full rounded-lg border border-[#375158] bg-[#091b22] px-3 text-xs text-white placeholder:text-[#6d888d] focus:outline-none focus:ring-2 focus:ring-[#badc83]"/></label>
              </div>
              <div className="divide-y divide-[#254047]">
                {visibleClients.map((item) => <div key={item.id} className="grid gap-3 px-5 py-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,.7fr)_minmax(0,1fr)] md:items-center">
                  <div><h4 className="text-sm font-semibold text-white">{item.organization}</h4><p className="mt-1 text-xs text-[#829da1]">{item.label}</p></div>
                  <div><p className="text-[10px] uppercase tracking-[.13em] text-[#6d8c91]">Stage</p><p className="mt-1 text-xs font-semibold text-[#d4e5d9]">{item.stage}</p></div>
                  <div><p className="text-[10px] uppercase tracking-[.13em] text-[#6d8c91]">Attention</p><p className="mt-1 text-xs font-semibold text-[#c9ec81]">{item.attention === "SEKINFRA" ? "Operator review" : item.attention === "CLIENT" ? "Waiting on client" : "Monitor"} · Demo</p></div>
                </div>)}
                {visibleClients.length === 0 && <p className="p-8 text-center text-sm text-[#9aafb0]">No fictional engagements match your search.</p>}
              </div>
            </Panel>
            <p className="mt-4 text-xs leading-6 text-[#799599]">Queue membership and attention labels are non-authoritative presentation cues. This page cannot open, edit, onboard or authorize a real client.</p>
          </>}

          {section === "systems" && <>
            <SectionIntro eyebrow="Infrastructure / 03" title="Know what you run." copy="One view of Sekinfra's existing operational endpoints. Routing references were inspected; service health and endpoint access are not connected to this preview." />
            <div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full border border-[#47614c] bg-[#1a3227] px-3 py-1.5 text-[10px] font-semibold text-[#d8e9bc]">Sekinfra-owned endpoints</span><span className="rounded-full border border-[#5c5037] bg-[#35291b] px-3 py-1.5 text-[10px] font-semibold text-[#edd19e]">No live health checks</span></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((tool) => <Panel key={tool.name} className="flex min-h-[208px] flex-col p-5">
                <div className="flex items-start justify-between"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-[#345354] bg-[#1b3335] px-2 text-[11px] font-extrabold text-[#d7e9d4]">{tool.glyph}</span><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#719095]">{tool.tag}</span></div>
                <h3 className="mt-5 text-lg font-semibold text-white">{tool.name}</h3><p className="mt-1 text-xs text-[#839da1]">{tool.group} · {tool.detail}</p>
                <div className="mt-auto flex items-center gap-2 pt-6 text-[11px] font-semibold text-[#e2c994]"><StatusDot color="amber"/>{tool.status}</div>
              </Panel>)}
            </div>
            <div className="mt-5 rounded-xl border border-[#34504d] bg-[#142522] px-4 py-4 text-xs leading-6 text-[#b2ccc0]">Tool cards are an inventory, not operational control. Real monitoring and actions must use approved Sekinfra connectors, explicit access grants and the applicable Avuhz authority boundary.</div>
          </>}

          {section === "automation" && <>
            <SectionIntro eyebrow="Automation / 04" title="Automation with boundaries." copy="Sekinfra already has an n8n hostname. Shared business automation must be governed through Avuhz, not a second vertical-specific authority path." />
            <Panel className="overflow-hidden p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5c5134] bg-[#30271b] px-3 py-1.5 text-xs font-semibold text-[#f2d39b]"><StatusDot color="amber"/> Workflow connection not configured</div>
              <h3 className="mt-6 max-w-xl text-2xl font-semibold tracking-tight text-white">Connect the engine. Keep the decisions governed.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#91aaac]">This preview cannot trigger an n8n workflow or change client state. Future automations should consume shared Avuhz events and APIs, respect tenant scope, and await human approval for consequential actions.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[["01","Event","Approved internal signal"],["02","Policy","Verify identity, scope and consent"],["03","Action","Bounded workflow with audit trail"]].map((step,i)=><div key={step[0]} className="rounded-xl border border-[#29454b] bg-[#11282d] p-4"><span className="text-xs font-mono text-[#c9ec81]">{step[0]}</span><h4 className="mt-4 text-base font-semibold text-white">{step[1]}</h4><p className="mt-1 text-xs text-[#86a1a4]">{step[2]}</p>{i<2&&<span className="mt-4 block text-[#698a89]" aria-hidden="true">→</span>}</div>)}
              </div>
            </Panel>
          </>}

          {section === "security" && <>
            <SectionIntro eyebrow="Trust / 05" title="Authority before action." copy="Cloudflare Access is an outer security layer. A real command center also needs shared identity, tenant permissions, application authorization and an auditable approval process." />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Cloudflare Access", "External gate", "A dashboard hostname and owner-only policy were configured; this preview cannot independently verify ongoing enforcement."],
                ["Application authentication", "Not integrated", "The Lovable dashboard's operator account remains independent; this preview does not authenticate operators."],
                ["Avuhz identity and tenancy", "Integration pending", "No live Supabase authentication, organization binding, RLS or tenant-specific records are exposed here."],
                ["Command approvals", "Enforced by design", "No mutation, payment, deployment, workflow dispatch, or third-party action can be performed from this preview."],
              ].map((card)=><Panel key={card[0]} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><h3 className="text-base font-semibold text-white">{card[0]}</h3><span className="shrink-0 rounded-full border border-[#44544c] px-2 py-1 text-[10px] text-[#cbdba8]">{card[1]}</span></div><p className="mt-4 text-sm leading-7 text-[#92aaad]">{card[2]}</p></Panel>)}
            </div>
          </>}

          <section aria-label="Assistant integration status" className="mt-7 rounded-[18px] border border-[#345243] bg-[#102720] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a7857] bg-[#254035] text-[#d7ef9b]"><Sparkle/></span><div><h2 className="text-sm font-bold text-white">Ask Sekinfra</h2><p className="mt-0.5 text-xs text-[#a2bbad]">AI command integration — not connected</p></div></div>
              <span className="rounded-full border border-[#566243] bg-[#333d26] px-2.5 py-1 text-[10px] font-semibold text-[#d8dea5]">No execution</span>
            </div>
            <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event)=>{event.preventDefault();if(prompt.trim()){setShowDemoNotice(true);setPrompt("");}}}>
              <label htmlFor="command-input" className="sr-only">Demo command input</label>
              <input id="command-input" value={prompt} onChange={(event)=>setPrompt(event.target.value)} maxLength={300} placeholder="Try: What needs my attention today?" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#4a665d] bg-[#0b1d1c] px-4 text-sm text-white placeholder:text-[#819c98] focus:outline-none focus:ring-2 focus:ring-[#c9ec81]" />
              <button type="submit" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c9ec81] px-5 text-xs font-bold text-[#1a2b1b] hover:bg-[#e0f7ad]">Preview command <Arrow/></button>
            </form>
            {showDemoNotice && <p role="status" className="mt-3 rounded-lg border border-[#5e6644] bg-[#243120] px-4 py-3 text-xs leading-6 text-[#d6e5ac]">Demo only: no AI model or action service is connected. Your text was not sent, stored, or executed. Real commands require authenticated, separately approved Avuhz capabilities.</p>}
            <p className="mt-3 text-[11px] leading-5 text-[#8ca99f]">No input is sent to a server or external model. Do not enter secrets or client information into this preview.</p>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 py-7 text-[10px] text-[#66848b]">
            <span>SEKINFRA / Operator command center concept</span><span>Synthetic fixture snapshot · {referenceLabel}</span>
          </footer>
        </div>
      </main>
    </div>
  </div>;
}
