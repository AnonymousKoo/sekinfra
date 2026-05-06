import { useClient } from "@/lib/client-context";
import { stageLabels, timeAgo, PipelineStage } from "@/lib/mock-data";
import { useDashboardData } from "@/lib/use-live-leads";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import {
  DollarSign,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Loader2,
  WifiOff,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

function num(v: any, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const stageOrder: PipelineStage[] = ["new", "paid", "intake", "emailed", "opened", "clicked", "booked"];

export default function Dashboard() {
  const { client } = useClient();
  const { data, isLoading, isError, error, dataUpdatedAt } = useDashboardData(client.id);

  const summary = data?.summary ?? {};
  const priorityActions = data?.priority_actions ?? [];
  const pipelineRaw = data?.pipeline ?? [];
  const activity = data?.activity ?? [];

  // Normalize pipeline into stage rows
  const pipeline = stageOrder.map((stage) => {
    const found = pipelineRaw.find((p: any) => {
      const name = (p?.stage ?? p?.name ?? "").toString().toLowerCase();
      return name === stage || name.includes(stage);
    });
    return { stage, count: num(found?.count ?? found?.value, 0) };
  });

  const revenueToday = num(summary.revenue_today ?? summary.revenueToday);
  const paidToday = num(summary.paid_today ?? summary.paid_assessments ?? summary.paidAssessments);
  const paidToBooked = num(summary.paid_to_booked ?? summary.paidToBooked);
  const recovered = num(summary.recovered_bookings ?? summary.recoveredBookings);
  const revenueAtRisk = num(summary.revenue_at_risk ?? summary.revenueAtRisk);

  return (
    <>
      <PageHeader
        title="Command Center"
        description={`What needs attention, where revenue is stuck, and who needs follow-up — ${client.name}.`}
        actions={
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-card"
          >
            View all leads <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {(isLoading || isError) && (
        <div className={`mb-5 flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] ${isError ? "border-status-failed/30 bg-status-failed/10 text-status-failed" : "border-border/60 bg-surface/40 text-muted-foreground"}`}>
          {isError ? <WifiOff className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          <span className="truncate">
            {isError
              ? `Live data unavailable. ${(error as Error)?.message ?? ""}`
              : "Loading live dashboard…"}
          </span>
          {!isError && dataUpdatedAt > 0 && <span className="ml-auto text-[10.5px] tabular">last sync {timeAgo(new Date(dataUpdatedAt).toISOString())}</span>}
        </div>
      )}

      {/* ============== PRIORITY ACTIONS ============== */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground font-display flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Priority Actions
            </h2>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">What needs attention right now</p>
          </div>
          <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground tabular">
            {priorityActions.length} open
          </span>
        </div>

        {priorityActions.length === 0 ? (
          <div className="card-surface flex items-center justify-center px-3 py-10 text-center">
            <p className="text-[12px] text-muted-foreground">No priority actions right now.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {priorityActions.map((a: any, i: number) => (
              <div key={a.id ?? i} className="card-surface p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-foreground truncate">
                      {a.title ?? a.lead_name ?? a.name ?? "Action"}
                    </div>
                    <div className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                      {a.subtitle ?? a.reason ?? a.description ?? ""}
                    </div>
                  </div>
                  {a.count != null && (
                    <span className="metric-number text-[15px] font-semibold tabular text-primary">
                      {a.count}
                    </span>
                  )}
                </div>
                {(a.next_action ?? a.action) && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-primary">
                    <ArrowRight className="h-3 w-3" /> {a.next_action ?? a.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============== REVENUE LAYER ============== */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground font-display flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-status-booked" />
              Revenue Today
            </h2>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">Where revenue is stuck and what's been recovered</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <MetricCard label="Paid Assessments Today" value={paidToday} icon={DollarSign} accent="success" />
          <MetricCard label="Revenue Today" value={formatCurrency(revenueToday)} icon={TrendingUp} accent="success" />
          <MetricCard label="Paid → Booked" value={`${paidToBooked}%`} icon={CalendarCheck} hint="weekly conversion" />
          <MetricCard label="Revenue at Risk" value={formatCurrency(revenueAtRisk)} icon={AlertTriangle} accent="warning" hint="paid, not booked" />
          <MetricCard label="Recovered Bookings" value={recovered} icon={RefreshCw} accent="success" hint="via follow-ups" />
        </div>
      </section>

      {/* ============== REVENUE FLOW ============== */}
      <section className="card-surface mb-8 p-5">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground font-display">Revenue Flow</h2>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">Lead capture → booking. Drop-off at each stage.</p>
          </div>
          <Link to="/pipeline" className="text-[11px] text-primary hover:underline">Open pipeline →</Link>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-7 md:gap-0">
          {pipeline.map((s, i) => {
            const prevCount = i === 0 ? s.count : pipeline[i - 1].count;
            const dropoff = prevCount - s.count;
            const conv = i === 0 ? 100 : prevCount ? Math.round((s.count / prevCount) * 100) : 0;
            const max = pipeline[0]?.count || 1;
            return (
              <div key={s.stage} className="relative flex items-center md:contents">
                <div className="flex-1 md:flex-none md:w-full px-2">
                  <div className="rounded-md border border-border/60 bg-surface/40 p-3 transition-colors hover:border-primary/40 hover:bg-surface/60">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium truncate">
                      {stageLabels[s.stage]}
                    </div>
                    <div className="mt-1.5 metric-number text-xl font-semibold text-foreground">{s.count}</div>
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px] tabular">
                      <span className={i === 0 ? "text-muted-foreground" : conv >= 70 ? "text-status-booked" : conv >= 40 ? "text-status-followup" : "text-status-failed"}>
                        {i === 0 ? "Entry" : `${conv}%`}
                      </span>
                      {i > 0 && dropoff > 0 && (
                        <span className="text-status-failed">−{dropoff}</span>
                      )}
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                        style={{ width: `${(s.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-border-strong z-10" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============== ACTIVITY ============== */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card-surface lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            </div>
          </div>
          <div className="rounded-md border border-dashed border-border/60 bg-surface/20 px-3 py-8 text-center">
            <p className="text-[11.5px] text-muted-foreground">
              AI insights will appear here once the backend provides them.
            </p>
          </div>
        </section>

        <section className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">What changed today?</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Live event feed</p>
            </div>
            <Link to="/activity" className="text-[11px] text-primary hover:underline">All →</Link>
          </div>
          {activity.length === 0 ? (
            <p className="text-[11.5px] text-muted-foreground">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 5).map((e: any, i: number) => {
                const ts = e.timestamp ?? e.created_at ?? e.time ?? new Date().toISOString();
                const name = e.lead_name ?? e.leadName ?? e.name ?? "Activity";
                const msg = e.message ?? e.description ?? e.type ?? "";
                return (
                  <li key={e.id ?? i} className="flex items-start gap-2.5">
                    <span className="status-dot bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-foreground leading-snug">
                        <span className="font-medium">{name}</span>{" "}
                        <span className="text-muted-foreground">{msg}</span>
                      </div>
                      <div className="text-[10.5px] tabular text-muted-foreground mt-0.5">{timeAgo(ts)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
