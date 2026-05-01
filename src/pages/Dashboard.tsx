import { useClient } from "@/lib/client-context";
import {
  activityByClient,
  getMetrics,
  getStageCounts,
  getPaidNotBooked,
  getClickedNotScheduled,
  getNeedsFollowup,
  stageLabels,
  timeAgo,
} from "@/lib/mock-data";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  DollarSign,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Bell,
  MousePointerClick,
  Send,
  Eye,
  ArrowRight,
  RefreshCw,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const { client } = useClient();
  const m = getMetrics(client.id);
  const stages = getStageCounts(client.id);
  const recent = activityByClient[client.id].slice(0, 5);
  const paidNotBooked = getPaidNotBooked(client.id);
  const clicked = getClickedNotScheduled(client.id);
  const followups = getNeedsFollowup(client.id);

  const insights = [
    {
      icon: DollarSign,
      tone: "warning" as const,
      text: `${paidNotBooked.length} paid leads have not booked yet — ${formatCurrency(m.revenueAtRisk)} at risk.`,
      action: "Review queue",
      to: "/leads?filter=paid_not_booked",
    },
    {
      icon: MousePointerClick,
      tone: "default" as const,
      text: `${clicked.length} leads clicked the booking link but didn't schedule.`,
      action: "Send nudge",
      to: "/automations",
    },
    {
      icon: Clock,
      tone: "warning" as const,
      text: "Follow-up reminder recommended within 6 hours for top-of-funnel leads.",
      action: "Open rules",
      to: "/automations/rules",
    },
    {
      icon: TrendingUp,
      tone: "danger" as const,
      text: `Paid → booked conversion is ${m.paidToBookedConv}% this week (-3.2 pts).`,
      action: "View funnel",
      to: "/analytics",
    },
  ];

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
            {paidNotBooked.length + clicked.length + followups.length} open
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Paid but Not Booked */}
          <ActionPanel
            title="Paid but Not Booked"
            count={paidNotBooked.length}
            tone="warning"
            icon={DollarSign}
            subtitle="Payment + intake done, no schedule"
          >
            {paidNotBooked.length === 0 ? (
              <EmptyState message="All paid leads are booked." />
            ) : (
              paidNotBooked.map(l => (
                <ActionRow
                  key={l.id}
                  primary={l.name}
                  secondary={`Intake ${timeAgo(l.lastActivity)} · ${l.value ? formatCurrency(l.value) : ""}`}
                  actions={
                    <>
                      <ActionButton icon={Bell} label="Remind" />
                      <ActionButton icon={Eye} label="View" to={`/leads/${l.id}`} variant="ghost" />
                    </>
                  }
                />
              ))
            )}
          </ActionPanel>

          {/* Clicked but Did Not Schedule */}
          <ActionPanel
            title="Clicked, Didn't Schedule"
            count={clicked.length}
            tone="default"
            icon={MousePointerClick}
            subtitle="Engaged with booking link"
          >
            {clicked.length === 0 ? (
              <EmptyState message="No drop-offs at booking step." />
            ) : (
              clicked.map(l => (
                <ActionRow
                  key={l.id}
                  primary={l.name}
                  secondary={`Last clicked ${timeAgo(l.lastActivity)}`}
                  actions={
                    <>
                      <ActionButton icon={Send} label="Follow up" />
                      <ActionButton icon={Eye} label="Timeline" to={`/leads/${l.id}`} variant="ghost" />
                    </>
                  }
                />
              ))
            )}
          </ActionPanel>

          {/* Needs Immediate Follow-up */}
          <ActionPanel
            title="Needs Follow-Up"
            count={followups.length}
            tone="danger"
            icon={AlertTriangle}
            subtitle="Manual or automated attention"
          >
            {followups.length === 0 ? (
              <EmptyState message="No leads waiting on follow-up." />
            ) : (
              followups.map(l => (
                <div
                  key={l.id}
                  className="rounded-md border border-border/60 bg-surface/40 p-3 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium text-foreground truncate">{l.name}</div>
                      <div className="text-[10.5px] text-muted-foreground mt-0.5">{l.reason}</div>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-primary inline-flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" /> {l.nextAction}
                    </span>
                    <ActionButton icon={Eye} label="Open" to={`/leads/${l.id}`} variant="ghost" />
                  </div>
                </div>
              ))
            )}
          </ActionPanel>
        </div>
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
          <MetricCard label="Paid Assessments Today" value={m.paidToday} delta={8} icon={DollarSign} accent="success" />
          <MetricCard label="Revenue Today" value={formatCurrency(m.revenueToday)} delta={11} icon={TrendingUp} accent="success" />
          <MetricCard label="Paid → Booked" value={`${m.paidToBookedConv}%`} delta={-3.2} icon={CalendarCheck} hint="weekly conversion" />
          <MetricCard label="Revenue at Risk" value={formatCurrency(m.revenueAtRisk)} icon={AlertTriangle} accent="warning" hint="paid, not booked" />
          <MetricCard label="Recovered Bookings" value={m.recoveredBookings} delta={22} icon={RefreshCw} accent="success" hint="via follow-ups" />
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
          {stages.map((s, i) => {
            const prevCount = i === 0 ? s.count : stages[i - 1].count;
            const dropoff = prevCount - s.count;
            const conv = i === 0 ? 100 : prevCount ? Math.round((s.count / prevCount) * 100) : 0;
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
                        style={{ width: `${(s.count / (stages[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-border-strong z-10" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============== AI INSIGHTS + ACTIVITY ============== */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card-surface lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            </div>
            <span className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Updated {timeAgo(new Date(Date.now() - 4 * 60_000).toISOString())}</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {insights.map((ins, i) => (
              <InsightCard key={i} {...ins} />
            ))}
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
          <ul className="space-y-3">
            {recent.map(e => (
              <li key={e.id} className="flex items-start gap-2.5">
                <span className="status-dot bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-foreground leading-snug">
                    <span className="font-medium">{e.leadName}</span>{" "}
                    <span className="text-muted-foreground">{e.message}</span>
                  </div>
                  <div className="text-[10.5px] tabular text-muted-foreground mt-0.5">{timeAgo(e.timestamp)}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

/* ----------------- Sub-components ----------------- */

function ActionPanel({
  title,
  count,
  tone,
  icon: Icon,
  subtitle,
  children,
}: {
  title: string;
  count: number;
  tone: "default" | "warning" | "danger";
  icon: React.ElementType;
  subtitle: string;
  children: React.ReactNode;
}) {
  const toneMap = {
    default: { ring: "border-primary/30", chip: "bg-primary/15 text-primary", icon: "text-primary" },
    warning: { ring: "border-status-followup/30", chip: "bg-status-followup/15 text-status-followup", icon: "text-status-followup" },
    danger: { ring: "border-status-failed/30", chip: "bg-status-failed/15 text-status-failed", icon: "text-status-failed" },
  }[tone];

  return (
    <div className={`card-surface flex flex-col p-4 ${toneMap.ring}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={`flex h-7 w-7 items-center justify-center rounded ${toneMap.chip} shrink-0`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-foreground truncate">{title}</div>
            <div className="text-[10.5px] text-muted-foreground truncate">{subtitle}</div>
          </div>
        </div>
        <span className={`metric-number text-[15px] font-semibold tabular ${toneMap.icon}`}>{count}</span>
      </div>
      <div className="flex-1 space-y-2">{children}</div>
    </div>
  );
}

function ActionRow({
  primary,
  secondary,
  actions,
}: {
  primary: string;
  secondary: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-surface/40 p-2.5 transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-foreground truncate">{primary}</div>
          <div className="text-[10.5px] text-muted-foreground truncate">{secondary}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">{actions}</div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  to,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  to?: string;
  variant?: "default" | "ghost";
}) {
  const cls =
    variant === "default"
      ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-elevated border-border/60";
  const inner = (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[10.5px] font-medium transition-colors ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
  return to ? <Link to={to}>{inner}</Link> : <button type="button">{inner}</button>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/60 bg-surface/20 px-3 py-6 text-center">
      <p className="text-[11px] text-muted-foreground">{message}</p>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  tone,
  text,
  action,
  to,
}: {
  icon: React.ElementType;
  tone: "default" | "warning" | "danger";
  text: string;
  action: string;
  to: string;
}) {
  const toneMap = {
    default: "bg-primary/10 text-primary",
    warning: "bg-status-followup/10 text-status-followup",
    danger: "bg-status-failed/10 text-status-failed",
  }[tone];
  return (
    <div className="group rounded-md border border-border/60 bg-surface/40 p-3 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-2.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded ${toneMap} shrink-0`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground leading-snug">{text}</p>
          <Link
            to={to}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            {action} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
