import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { authorizeOperator } from "@/lib/command-center/operator-access";
import { fetchAvuhzActivity, type AvuhzActivityLane } from "@/lib/command-center/avuhz-activity";
import { fetchAvuhzReviewQueue } from "@/lib/command-center/avuhz-review-queue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sekinfra Command Center",
  description: "Private Sekinfra operator workspace.",
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

type ProbeStatus = "ready" | "unavailable" | "not_configured";

async function avuhzReadiness(): Promise<{ status: ProbeStatus; detail: string }> {
  const raw = process.env.SEKINFRA_AVUHZ_READINESS_URL;
  if (!raw) return { status: "not_configured", detail: "No approved Avuhz health endpoint is configured." };

  try {
    const url = new URL(raw);
    // An environment-owned, exact HTTPS Render health target only. No arbitrary
    // hosts, redirects, query strings, credentials, or customer data transport.
    if (url.protocol !== "https:" || !/^[a-z0-9-]+\.onrender\.com$/.test(url.hostname)
      || url.username || url.password || url.port || url.pathname !== "/health/ready"
      || url.search || url.hash) {
      return { status: "not_configured", detail: "The health endpoint configuration is not approved." };
    }
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(4000),
    });
    const payload: unknown = await response.json();
    if (response.status === 200 && payload && typeof payload === "object"
      && "status" in payload && payload.status === "ready") {
      return { status: "ready", detail: "The Avuhz readiness endpoint reported ready on this request." };
    }
    return { status: "unavailable", detail: "Avuhz did not report ready on this request." };
  } catch {
    // Do not persist provider response bodies, exception messages, or URLs.
    return { status: "unavailable", detail: "Avuhz readiness could not be verified." };
  }
}

const readinessLabels: Record<ProbeStatus, string> = {
  ready: "Ready",
  unavailable: "Unavailable",
  not_configured: "Not configured",
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
  return <section id={id} className="rounded-2xl border border-[#24434a] bg-[#0d2026] p-5 sm:p-7">
    {children}
  </section>;
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="mb-6">
    <p className="text-[10px] font-bold uppercase tracking-[.20em] text-[#c9ec81]">{eyebrow}</p>
    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9bb1b0]">{subtitle}</p>
  </div>;
}

const boundaries = [
  { name: "Client records", status: "Not connected", description: "A real tenant-scoped Avuhz query adapter is required before showing a client or assessment." },
  { name: "Approvals and decisions", status: "Not connected", description: "Only governed Avuhz authority may create or progress approvals. The interface cannot approve by itself." },
  { name: "Workflow execution", status: "Not connected", description: "No browser-to-n8n credentials, direct database writes, or silent workflow execution." },
  { name: "AI assistance", status: "Not connected", description: "A future AI assistant needs a reviewed, read-only first integration and explicit approval for every consequential action." },
] as const;

export default async function CommandCenterPage() {
  // A direct Vercel alias, spoofed identity header, missing config, or invalid
  // Access token must never render this operator surface.
  const identity = await authorizeOperator(await headers());
  if (!identity) notFound();

  // Health is fetched only AFTER successful cryptographic operator validation.
  const [avuhz, activity, reviewQueue] = await Promise.all([avuhzReadiness(), fetchAvuhzActivity(), fetchAvuhzReviewQueue()]);
  const lanes: readonly AvuhzActivityLane[] = ["Security", "Infrastructure", "Automation", "Business"];

  return <div className="min-h-screen bg-[#071419] text-[#e9f0ed]" style={{ colorScheme: "dark" }}>
    <a href="#main-content" className="fixed left-3 top-3 z-50 -translate-y-24 rounded-lg bg-[#c9ec81] px-4 py-3 text-sm font-bold text-[#102017] focus:translate-y-0">Skip to workspace</a>
    <div className="mx-auto min-h-screen max-w-[1800px] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-[#24434a] bg-[#0a1b20] px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9ec81] text-xl font-black text-[#0e2119]">S/</span>
          <div><p className="text-sm font-extrabold tracking-[.14em] text-white">SEKINFRA</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.15em] text-[#92acaa]">Command Center</p></div>
        </div>
        <p className="mt-9 text-[10px] font-semibold uppercase tracking-[.16em] text-[#779398]">Operator workspace</p>
        <nav aria-label="Command Center sections" className="mt-3 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {[
            ["#overview", "Overview"],
            ["#activity", "Avuhz Activity"],
            ["#clients", "Client work"],
            ["#operations", "Operations"],
            ["#security", "Security"],
          ].map(([href, label], index) =>
            <a key={href} href={href} className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-xs font-semibold text-[#b4c8c5] hover:bg-[#163039] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9ec81]">
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
          <span className="text-xs text-[#9db5b3]">Sekinfra / Private operations</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#38584b] bg-[#172d29] px-3 py-1.5 text-xs font-semibold text-[#c9ec81]"><Indicator kind="ready" /> Operator verified</span>
        </header>

        <div className="mx-auto max-w-[1420px] space-y-6 px-5 py-8 sm:px-9 sm:py-10">
          <section id="overview" className="rounded-[22px] border border-[#3c594b] bg-[radial-gradient(circle_at_90%_20%,#28483c,#11272b_43%,#0e2027_100%)] p-7 sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[.20em] text-[#c9ec81]">Private operator workspace</p>
            <h1 className="mt-4 max-w-[780px] text-3xl font-semibold leading-tight tracking-[-.05em] text-white sm:text-5xl">Your business systems. <span className="text-[#c9ec81]">Verified, not simulated.</span></h1>
            <p className="mt-4 max-w-[660px] text-sm leading-7 text-[#b0c4bd] sm:text-base">Only verified service information appears here. Customer records, approvals, workflows and AI actions remain unavailable until their real, authorized Avuhz connections are established.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#operations" className="inline-flex min-h-11 items-center rounded-lg bg-[#c9ec81] px-5 text-xs font-bold text-[#12241b] hover:bg-[#e1f7b3]">Review connections →</a>
              <a href="/command-center" className="inline-flex min-h-11 items-center rounded-lg border border-[#56756a] px-5 text-xs font-bold text-white hover:bg-white/10">Refresh verified status ↻</a>
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
            <SectionHeading eyebrow="Systems / 02" title="Operational connections" subtitle="These statuses reflect actual verification boundaries, not assumptions from DNS entries or saved links." />
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
