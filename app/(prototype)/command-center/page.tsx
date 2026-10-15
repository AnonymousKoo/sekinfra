import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { authorizeOperator } from "@/lib/command-center/operator-access";
import { fetchAvuhzActivity, type AvuhzActivityLane } from "@/lib/command-center/avuhz-activity";
import { fetchAvuhzReviewQueue } from "@/lib/command-center/avuhz-review-queue";
import { probeAvuhzDevelopment, probeProductionN8n } from "@/lib/command-center/operator-runtime-probes";
import { AiOperator } from "@/components/command-center/ai-operator";
import "./operator-visual.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sekinfra Command Center",
  description: "Private Sekinfra operator workspace.",
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

type ProbeStatus = "ready" | "unavailable" | "not_ready";

async function avuhzReadiness(): Promise<{ status: ProbeStatus; detail: string }> {
  const probe = await probeAvuhzDevelopment();
  return {
    status: probe.state === "responding" ? "ready" : probe.state,
    detail: probe.detail,
  };
}

const readinessLabels: Record<ProbeStatus,string> = {
  ready:"Ready (health only)",
  unavailable:"Unavailable",
  not_ready:"Not ready",
};

function Indicator({ kind }: { kind: "ready" | "pending" | "warning" }) {
  const classes = {
    ready: "bg-[#c9ec81]",
    pending: "bg-[#7b999c]",
    warning: "bg-[#e8b676]",
  };
  return <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${classes[kind]}`} />;
}

function Panel({ children, id }: { children: React.ReactNode; id?: string }) {
  return <section id={id} className="operator-panel rounded-[22px] p-5 sm:p-7">
    {children}
  </section>;
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="mb-6">
    <p className="operator-eyebrow">{eyebrow}</p>
    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9bb1b0]">{subtitle}</p>
  </div>;
}

const boundaries = [
  { name: "Client records", status: "Not connected", description: "A real tenant-scoped Avuhz query adapter is required before showing a client or assessment." },
  { name: "Approvals and decisions", status: "Not connected", description: "Only governed Avuhz authority may create or progress approvals. The interface cannot approve by itself." },
  { name: "Workflow execution", status: "Not connected", description: "No browser-to-n8n credentials, direct database writes, or silent workflow execution." },
  { name: "AI assistance", status: "Configuration gated", description: "The operator chat has a server-only OpenAI adapter; no Avuhz commands, live n8n access, or mutation tools. Explicit protected configuration and activation required." },
] as const;

export default async function CommandCenterPage() {
  // A direct Vercel alias, spoofed identity header, missing config, or invalid
  // Access token must never render this operator surface.
  const identity = await authorizeOperator(await headers());
  if (!identity) notFound();

  // Health is fetched only AFTER successful cryptographic operator validation.
  const [avuhz, activity, reviewQueue, n8nProduction] = await Promise.all([avuhzReadiness(), fetchAvuhzActivity(), fetchAvuhzReviewQueue(), probeProductionN8n()]);
  const lanes: readonly AvuhzActivityLane[] = ["Security", "Infrastructure", "Automation", "Business"];

  return <div className="operator-shell min-h-screen text-[#e9f0ed]" style={{ colorScheme: "dark" }}>
    <a href="#main-content" className="fixed left-3 top-3 z-50 -translate-y-24 rounded-lg bg-[#c9ec81] px-4 py-3 text-sm font-bold text-[#102017] focus:translate-y-0">Skip to workspace</a>
    <div className="mx-auto min-h-screen max-w-[1800px] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="operator-rail border-b border-[#24434a] px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="space-y-2">
          <a href="/command-center" aria-label="Sekinfra Command Center home"
            className="operator-logo-plate inline-flex min-h-16 w-[196px] max-w-full items-center justify-center rounded-xl px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b9ef70]">
            <Image src="/brand/sekinfra-wordmark.webp" alt="Sekinfra" width={600} height={155}
              unoptimized priority sizes="196px" className="h-auto w-full object-contain" />
          </a>
          <p className="pl-1 text-[10px] font-semibold uppercase tracking-[.19em] text-[#92acaa]">Command Center <span aria-hidden="true" className="px-1.5 text-[#b9ef70]">/</span> Avuhz</p>
        </div>
        <p className="mt-9 text-[10px] font-semibold uppercase tracking-[.16em] text-[#779398]">Operator workspace</p>
        <nav aria-label="Command Center sections" className="mt-3 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {[
            ["#ai-operator", "AI Operator"],
            ["#overview", "Overview"],
            ["#activity", "Avuhz Activity"],
            ["#systems", "System Library"],
            ["#clients", "Client work"],
            ["#operations", "Operations"],
            ["#security", "Security"],
          ].map(([href, label], index) =>
            <a key={href} href={href} className="operator-nav-link flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-xs font-semibold text-[#b4c8c5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9ec81]">
              <span className="font-mono text-[10px] text-[#7f9d9f]">{String(index + 1).padStart(2, "0")}</span>{label}
            </a>
          )}
        </nav>
        <div className="mt-auto hidden border-t border-[#28424b] pt-6 lg:block">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#c9ec81]"><Indicator kind="ready" /> Access verified</p>
          <p className="mt-2 text-xs leading-5 text-[#93aaa9]">Cloudflare Access signature and owner policy verified for this request. Avuhz permissions remain separate.</p>
        </div>
      </aside>

      <main id="main-content" className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#24434a] px-5 py-5 sm:px-9">
          <span className="text-xs font-semibold tracking-[.12em] uppercase text-[#9db5b3]">Sekinfra <span className="mx-1.5 text-[#85d3bb]">/</span> Operating infrastructure</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#38584b] bg-[#172d29] px-3 py-1.5 text-xs font-semibold text-[#c9ec81]"><Indicator kind="ready" /> Operator verified</span>
        </header>

        <div className="mx-auto max-w-[1420px] space-y-6 px-5 py-8 sm:px-9 sm:py-10">
          <section id="ai-operator" aria-label="AI Operator" className="scroll-mt-6">
            <AiOperator available={process.env.SEKINFRA_AI_OPERATOR_ENABLED === "true" && !!process.env.OPENAI_API_KEY} />
          </section>

          <section id="overview" className="operator-hero rounded-[24px] p-7 sm:p-10 lg:p-12">
            <p className="operator-eyebrow">Private control plane / 01</p>
            <h1 className="mt-4 max-w-[780px] text-3xl font-semibold leading-tight tracking-[-.05em] text-white sm:text-5xl">Where your systems <span className="text-[#c9ec81]">come into focus.</span></h1>
            <p className="mt-4 max-w-[660px] text-sm leading-7 text-[#b0c4bd] sm:text-base">A single view of the work behind the business. See verified engineering activity, review your system templates and understand exactly which environments are connected. Avuhz remains the authority; n8n is the orchestrator.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#systems" className="inline-flex min-h-11 items-center rounded-lg bg-[#b9ef70] px-5 text-xs font-bold text-[#12241b] hover:bg-[#e1f7b3]">Explore systems →</a>
              <a href="#operations" className="inline-flex min-h-11 items-center rounded-lg border border-[#56756a] bg-[#0a1c22]/70 px-5 text-xs font-bold text-white hover:bg-white/10">Connection status ↗</a>
            </div>
          </section>

          <Panel id="activity">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeading
                eyebrow="Avuhz / activity"
                title="What changed in Avuhz"
                subtitle="Public GitHub review and merge evidence. PR and CI activity is engineering progress, not a deployed workflow execution or customer outcome."
              />
              <span className="rounded-full border border-[#3f5d61] px-3 py-1.5 text-xs text-[#c5d9d5]">
                {activity.state === "verified" ? "GitHub source verified" : "GitHub source unavailable"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Four activity lanes">
              {lanes.map((lane) => {
                const count = activity.events.filter((event) => event.lane === lane).length;
                return <div key={lane} className="rounded-xl border border-[#294851] bg-[#132a31] p-4">
                  <p className="text-[11px] font-semibold text-[#abc3be]">{lane}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{activity.state === "verified" ? count : "—"}</p>
                  <p className="mt-1 text-[11px] text-[#8faeab]">Merges in latest sample</p>
                </div>;
              })}
            </div>
            <section aria-label="Open Avuhz engineering reviews" className="mt-5 rounded-xl border border-[#294851] bg-[#102630] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#e4eee9]">Review queue · GitHub PRs</h3>
                <span className="text-[11px] text-[#90aaa8]">{reviewQueue.state === "verified" ? "Public GitHub source verified" : "GitHub review source unavailable"}</span>
              </div>
              {reviewQueue.state === "unavailable" ? (
                <p className="mt-3 text-xs text-[#abc3be]">Review queue unavailable. This does not mean all work has been merged or that CI passed.</p>
              ) : reviewQueue.items.length === 0 ? (
                <p className="mt-3 text-xs text-[#abc3be]">No open main-targeted PRs found in the latest sample.</p>
              ) : (
                <ol className="mt-3 divide-y divide-[#294851]">
                  {reviewQueue.items.map((item) => <li key={item.number} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-white underline-offset-4 hover:text-[#c9ec81] hover:underline">
                        #{item.number} · {item.title}
                      </a>
                      <p className="mt-1 text-[11px] text-[#90aaa8]">
                        {item.draft ? "Draft · " : "Open for review · "}
                        Updated {new Date(item.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                      </p>
                    </div>
                    <span className="rounded-md border border-[#3f5d61] px-3 py-1 text-[11px] font-medium text-[#c9ec81]">
                      {item.ci === "passing" ? "CI passed" : item.ci === "failing" ? "CI failed" : item.ci === "running" ? "CI running" : "CI unverified"}
                    </span>
                  </li>)}
                </ol>
              )}
            </section>
            <div className="mt-5 border-t border-[#294851] pt-5">
              {activity.state === "unavailable" ? (
                <p className="text-sm text-[#abc3be]">The GitHub activity source could not be verified. No events are shown; this is not evidence of zero activity.</p>
              ) : activity.events.length === 0 ? (
                <p className="text-sm text-[#abc3be]">No verified main-branch merges in the latest returned sample.</p>
              ) : (
                <ol className="divide-y divide-[#294851]">
                  {activity.events.map((event) => <li key={event.number} className="flex flex-wrap items-start gap-3 py-3">
                    <span className="min-w-24 rounded-md border border-[#3b565e] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#c9ec81]">{event.lane}</span>
                    <div className="min-w-0 flex-1">
                      <a href={event.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#e4eee9] underline-offset-4 hover:text-[#c9ec81] hover:underline">
                        #{event.number} · {event.title}
                      </a>
                      <p className="mt-1 text-[11px] text-[#90aaa8]">
                        {new Date(event.mergedAt).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                        {" · Source code merged · Not a hosted execution"}
                      </p>
                    </div>
                  </li>)}
                </ol>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-[#315058] bg-[#102830] p-4 text-xs leading-6 text-[#9db8b5]">
              <p className="font-semibold text-white">Operational sources still need authenticated integration.</p>
              <p className="mt-1">Supabase tenant activity, Render deployment history and n8n workflow executions are not connected to this view. Avuhz permissions and tenant RLS remain enforced outside this interface. No client activity counts are inferred from GitHub.</p>
            </div>
          </Panel>

          <Panel id="systems">
            <SectionHeading eyebrow="Shared backbone / 02" title="System Library" subtitle="Five reusable, policy-driven system families. Avuhz owns business decisions, tenancy and state; n8n coordinates approved actions. These are target outcomes, not claims of activated automation." />
            <div className="mb-5 rounded-xl border border-[#426258]/60 bg-[#13302b]/60 px-4 py-4 text-sm leading-6 text-[#c0d9cd]">
              <span className="font-semibold text-[#d8f2a7]">Verified distinction:</span> repository templates and a passing CI check do not prove a runtime is wired, authorized or processing customer work.
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="System template families">
              {[
                { id:"001", category:"REVENUE", name:"Revenue Engine", outcome:"From incoming request to owned work and tracked follow-up.", source:"https://github.com/AnonymousKoo/avuhz-infra/pull/690", sourceLabel:"System #001 source review", first:true },
                { id:"002", category:"SCHEDULING", name:"Booking Engine", outcome:"From authorized booking request to verified appointment and handoff.", source:null, sourceLabel:null, first:false },
                { id:"003", category:"DELIVERY", name:"Client Onboarding", outcome:"From approved engagement to accountable onboarding.", source:null, sourceLabel:null, first:false },
                { id:"004", category:"OPERATIONS", name:"Work & Operations", outcome:"From assigned task to verified outcome or recovery.", source:null, sourceLabel:null, first:false },
                { id:"005", category:"RELATIONSHIPS", name:"Customer Retention", outcome:"From policy-defined follow-up obligation to recorded result.", source:null, sourceLabel:null, first:false },
              ].map((system) => <article className="operator-system" key={system.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="operator-mononum font-mono text-3xl font-semibold text-[#b9ef70]">{system.id}</span>
                  <span className="text-[10px] font-bold tracking-[.18em] text-[#8cb9b0]">{system.category}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-[-.04em] text-white">{system.name}</h3>
                <p className="mt-2 min-h-12 text-xs leading-6 text-[#acc1be]">{system.outcome}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#315057]/70 pt-4">
                  <span className="operator-stage">{system.first ? "Source tracked · runtime unverified" : "Template readiness unverified"}</span>
                  {system.source && <a className="text-xs font-semibold text-[#b9ef70] underline-offset-4 hover:underline" href={system.source} target="_blank" rel="noopener noreferrer">{system.sourceLabel} ↗</a>}
                </div>
              </article>)}
            </div>
            <p className="mt-5 text-xs leading-6 text-[#9fb8b4]">No template is installed or activated from this page. Shared policy evaluation, tenant-scoped state and command authority remain in Avuhz; n8n is never an alternate policy engine.</p>
          </Panel>

          <div className="grid gap-4 md:grid-cols-3" aria-label="Verified operating boundaries">
            <Panel>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#abc0ba]">Private access</span><Indicator kind="ready" /></div>
              <p className="mt-4 text-2xl font-semibold text-white">Verified</p><p className="mt-2 text-xs leading-5 text-[#91aaa7]">Cryptographically verified Cloudflare Access identity, not a trusted header alone.</p>
            </Panel>
            <Panel>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#abc0ba]">Avuhz readiness</span><Indicator kind={avuhz.status === "ready" ? "ready" : "warning"} /></div>
              <p className="mt-4 text-2xl font-semibold text-white">{readinessLabels[avuhz.status]}</p><p className="mt-2 text-xs leading-5 text-[#91aaa7]">{avuhz.detail}</p>
            </Panel>
            <Panel>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#abc0ba]">Client data</span><Indicator kind="pending" /></div>
              <p className="mt-4 text-2xl font-semibold text-white">Not connected</p><p className="mt-2 text-xs leading-5 text-[#91aaa7]">No fictional portfolio, scraped records or unauthenticated tenant queries.</p>
            </Panel>
          </div>

          <Panel id="clients">
            <SectionHeading eyebrow="Client work / 01" title="Customer and assessment work" subtitle="Only tenant-scoped, authorized Avuhz read models will appear here. There are no seeded clients, fake activity counters, or local-only approval buttons." />
            <div className="rounded-xl border border-dashed border-[#446068] bg-[#102830] px-5 py-8">
              <p className="text-base font-semibold text-[#e5efea]">Client read access not connected</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a2b8b6]">An Avuhz read adapter must verify the shared AUTH identity, tenant scope, capability and response contract before real records can be displayed. This empty state does not mean no customers exist.</p>
            </div>
          </Panel>

          <Panel id="operations">
            <SectionHeading eyebrow="Systems / 02" title="Environment connections" subtitle="Live HTTP health probes for the known DEVELOPMENT API and production n8n are read-only diagnostics, not authenticated execution feeds. Local n8n and tenant data remain unconnected." />
            <div className="mb-6 grid gap-3 lg:grid-cols-2" aria-label="Local and production environment integration">
              {[
                { label:"Command Center / production", state:"Connected", detail:"Authenticated private operator session verified for this request.", connected:true },
                { label:"GitHub / engineering activity", state:activity.state === "verified" || reviewQueue.state === "verified" ? "Source verified" : "Unavailable", detail:"Public code review and merge metadata only; not workflow executions.", connected:activity.state === "verified" || reviewQueue.state === "verified" },
                { label:"n8n / local", state:"Not connected", detail:"Your localhost n8n requires a private read-only bridge. No public tunnel, credentials or direct browser request is configured.", connected:false },
                { label:"n8n / production", state:n8nProduction.state === "responding" ? "HTTP responds · not integrated" : n8nProduction.state === "not_ready" ? "Health failed" : "Health unavailable", detail:n8nProduction.detail, connected:false },
                { label:"Avuhz / runtime", state:readinessLabels[avuhz.status], detail:avuhz.detail, connected:false },
                { label:"Avuhz / tenant operations", state:"Not connected", detail:"No authenticated, tenant-scoped Work Item or lifecycle-event read model is mounted here.", connected:false },
              ].map((source) => <div className="rounded-xl border border-[#294851] bg-[#10262d]/80 p-4" key={source.label}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{source.label}</h3>
                  <span className="operator-status" data-connected={source.connected}>{source.state}</span>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#a6c0bb]">{source.detail}</p>
              </div>)}
            </div>
            <div className="divide-y divide-[#27444a]">
              <div className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
                <div><p className="text-sm font-semibold text-white">Avuhz API readiness</p><p className="mt-1 text-xs leading-5 text-[#90aaaa]">{avuhz.detail}</p></div>
                <span className="rounded-full border border-[#4c6464] px-3 py-1 text-xs text-[#d2e4d8]">{readinessLabels[avuhz.status]}</span>
              </div>
              {boundaries.map((entry) => <div key={entry.name} className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="max-w-2xl"><p className="text-sm font-semibold text-white">{entry.name}</p><p className="mt-1 text-xs leading-5 text-[#90aaaa]">{entry.description}</p></div>
                <span className="rounded-full border border-[#445961] px-3 py-1 text-xs text-[#b1c5c8]">{entry.status}</span>
              </div>)}
            </div>
          </Panel>

          <Panel id="security">
            <SectionHeading eyebrow="Authority / 03" title="Security boundaries" subtitle="This page is an operator entry point, not an independent identity provider, customer database or automation engine." />
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Verified perimeter", "JWT signature, exact issuer/audience, expiration, hostname and configured owner email are checked server-side."],
                ["Shared Avuhz authority", "Tenant identity, row-level security, approvals and business actions are governed by Avuhz, not Cloudflare identity alone."],
                ["No implicit execution", "Navigation, status checks and refresh do not create customer records, run workflows or deploy infrastructure."],
                ["No silent data access", "There are no hardcoded tokens, elevated Supabase clients, raw provider response logs or browser-side service credentials."],
              ].map(([heading, copy]) => <div key={heading} className="rounded-xl border border-[#294851] bg-[#132a31] p-4">
                <h3 className="text-sm font-semibold text-white">{heading}</h3><p className="mt-2 text-xs leading-6 text-[#9bb3b2]">{copy}</p>
              </div>)}
            </div>
          </Panel>
          <p className="pb-3 text-xs leading-6 text-[#79999b]">Sekinfra Command Center · Private operator surface · No client state is displayed without verified shared-core authorization.</p>
        </div>
      </main>
    </div>
  </div>;
}
