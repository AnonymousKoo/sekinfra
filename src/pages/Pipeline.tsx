import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { useState, useMemo } from "react";
import { ArrowRight, Loader2, Hexagon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lead } from "@/lib/types";

const STAGES = [
  { key: "new_lead", label: "New Lead" },
  { key: "intake_received", label: "Intake Submitted" },
  { key: "oia_returned", label: "OIA Completed" },
  { key: "payment_pending", label: "Payment Pending" },
  { key: "payment_received", label: "Payment Received" },
  { key: "activation", label: "Activation" },
  { key: "live", label: "Dashboard Live" },
] as const;

type StageKey = typeof STAGES[number]["key"];

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}
function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function leadInStage(l: Lead, key: StageKey): boolean {
  const op = (l.operationalState ?? "").toLowerCase();
  if (key === "payment_pending") {
    return l.bookedCall === true && !l.paymentReceived;
  }
  if (key === "new_lead") return op === "new_lead" || (!l.oiaSubmitted && !l.bookedCall);
  return op === key;
}

export default function Pipeline() {
  const { client } = useClient();
  const { data, isLoading } = useDashboardData(client.id);
  const leads = data?.leads ?? [];
  const pipelineApi = data?.pipeline ?? [];
  const [selected, setSelected] = useState<StageKey | null>(null);

  const stageData = useMemo(() => {
    return STAGES.map(s => {
      const inStage = leads.filter(l => leadInStage(l, s.key));
      const apiCount = pipelineApi.find((p: any) => p.stage === s.key)?.count;
      const count = typeof apiCount === "number" ? apiCount : inStage.length;
      const revenue = inStage.reduce((sum, l) => sum + (l.value ?? l.paymentAmount ?? 0), 0);
      return { ...s, count, revenue, leads: inStage };
    });
  }, [leads, pipelineApi]);

  const totalLeads = stageData[0]?.count || stageData.reduce((s, x) => s + x.count, 0);
  const totalRevenue = stageData.reduce((s, x) => s + x.revenue, 0);
  const liveCount = stageData[stageData.length - 1].count;
  const overallConv = totalLeads ? Math.round((liveCount / totalLeads) * 100) : 0;

  const inSelected = selected ? stageData.find(s => s.key === selected)?.leads ?? [] : [];

  return (
    <>
      <PageHeader
        title="Operational Pipeline"
        description="Lead → Activation → Live. Drop-off, revenue, and conversion across every operational stage."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      {/* Top-line metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total in flight</div>
          <div className="mt-1 metric-number text-2xl font-semibold">{leads.length}</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pipeline revenue</div>
          <div className="mt-1 metric-number text-2xl font-semibold">{fmtCurrency(totalRevenue)}</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lead → Live</div>
          <div className="mt-1 metric-number text-2xl font-semibold">{overallConv}%</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live dashboards</div>
          <div className="mt-1 metric-number text-2xl font-semibold text-status-booked">{liveCount}</div>
        </div>
      </div>

      {/* Pipeline board */}
      <section className="card-surface p-5">
        <div className="mb-5 flex items-center gap-2">
          <Hexagon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold font-display">Lifecycle stages</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
          {stageData.map((s, i) => {
            const prev = i === 0 ? s.count : stageData[i - 1].count;
            const conv = i === 0 ? 100 : prev ? Math.round((s.count / prev) * 100) : 0;
            const max = Math.max(...stageData.map(x => x.count), 1);
            const isSelected = selected === s.key;
            return (
              <motion.button
                key={s.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                onClick={() => setSelected(isSelected ? null : s.key)}
                className={cn(
                  "relative text-left rounded-md border bg-surface/40 p-3 transition-all",
                  isSelected ? "border-primary/60 glow-ring" : "border-border/60 hover:border-primary/40",
                )}
              >
                <div className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground font-medium truncate">
                  {s.label}
                </div>
                <div className="mt-1.5 metric-number text-xl font-semibold text-foreground">{s.count}</div>
                <div className="mt-1 flex items-center justify-between text-[10px] tabular">
                  <span
                    className={
                      i === 0
                        ? "text-muted-foreground"
                        : conv >= 70
                        ? "text-status-booked"
                        : conv >= 40
                        ? "text-status-followup"
                        : "text-status-failed"
                    }
                  >
                    {i === 0 ? "Entry" : `${conv}%`}
                  </span>
                  <span className="text-muted-foreground">{fmtCurrency(s.revenue)}</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / max) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.04 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                  />
                </div>
                {i < stageData.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden -translate-y-1/2 h-3 w-3 text-border lg:block" />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Drill-down */}
      {selected && (
        <section className="card-surface mt-6 p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Leads in {STAGES.find(s => s.key === selected)?.label}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {inSelected.length} leads · {fmtCurrency(inSelected.reduce((s, l) => s + (l.value ?? l.paymentAmount ?? 0), 0))} pipeline value
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-[11px] text-muted-foreground hover:text-foreground">
              Close
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {inSelected.map(l => (
              <Link
                key={l.id}
                to={`/leads/${l.id}`}
                className="rounded-md border border-border/60 bg-surface/40 p-3 transition-colors hover:border-primary/40 hover:bg-surface"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground truncate">{l.name}</span>
                  <span className="text-[10px] tabular text-muted-foreground whitespace-nowrap">{timeAgo(l.lastActivity)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate">{l.businessType} · {l.source}</span>
                  {(l.value || l.paymentAmount) ? (
                    <span className="tabular text-status-booked">{fmtCurrency(l.value ?? l.paymentAmount ?? 0)}</span>
                  ) : null}
                </div>
              </Link>
            ))}
            {inSelected.length === 0 && (
              <div className="text-[12px] text-muted-foreground col-span-full py-8 text-center">
                No leads currently at this stage
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
