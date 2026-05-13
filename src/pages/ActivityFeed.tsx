import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity as ActivityIcon, AlertTriangle, Search, Filter, X,
  CircleCheck, CircleAlert, Workflow, UserPlus, CreditCard, CalendarCheck,
  Mail, Server, Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

type Severity = "info" | "warn" | "crit";

interface Event {
  id: string;
  timestamp: string;
  type: string;
  severity: Severity;
  source: string;
  client: string;
  leadId?: string;
  message: string;
  status: "success" | "failed" | "pending";
  raw: any;
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

function classifyEvent(raw: any): { type: string; severity: Severity; source: string; status: Event["status"]; icon: any } {
  const msg = (raw?.message ?? "").toLowerCase();
  if (msg.includes("fail") || msg.includes("error")) return { type: "automation_failed", severity: "crit", source: "Automation Engine", status: "failed", icon: AlertTriangle };
  if (msg.includes("payment")) return { type: "payment_received", severity: "info", source: "Stripe", status: "success", icon: CreditCard };
  if (msg.includes("book")) return { type: "appointment_booked", severity: "info", source: "Cal.com", status: "success", icon: CalendarCheck };
  if (msg.includes("email") || msg.includes("sent")) return { type: "email_sent", severity: "info", source: "Resend", status: "success", icon: Mail };
  if (msg.includes("intake") || msg.includes("oia")) return { type: "intake_submitted", severity: "info", source: "Intake Form", status: "success", icon: ActivityIcon };
  if (msg.includes("incident") || msg.includes("alert")) return { type: "infrastructure_alert", severity: "warn", source: "Wazuh", status: "pending", icon: Server };
  return { type: "lead_event", severity: "info", source: "n8n", status: "success", icon: UserPlus };
}

const SEV_BADGE: Record<Severity, string> = {
  info: "bg-status-booked/15 text-status-booked border-status-booked/30",
  warn: "bg-status-followup/15 text-status-followup border-status-followup/30",
  crit: "bg-status-failed/15 text-status-failed border-status-failed/30",
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All events" },
  { key: "info", label: "Info" },
  { key: "warn", label: "Warnings" },
  { key: "crit", label: "Critical" },
];

export default function ActivityFeed() {
  const { client } = useClient();
  const { data, isLoading } = useDashboardData(client.id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [drawer, setDrawer] = useState<Event | null>(null);

  const events: Event[] = useMemo(() => {
    const apiActivity = data?.activity ?? [];
    const infraEvents = data?.infrastructure_events ?? [];

    const fromActivity: Event[] = apiActivity.map((a: any, i: number) => {
      const cls = classifyEvent(a);
      return {
        id: a.id ?? `act-${i}`,
        timestamp: a.timestamp ?? new Date().toISOString(),
        type: cls.type,
        severity: cls.severity,
        source: cls.source,
        client: a.lead_name ?? client.name,
        leadId: a.id,
        message: `${a.lead_name ?? "Lead"} ${a.message ?? ""}`.trim(),
        status: cls.status,
        raw: a,
      };
    });

    const fromInfra: Event[] = infraEvents.map((e: any, i: number) => ({
      id: e.id ?? `infra-${i}`,
      timestamp: e.timestamp ?? e.created_at ?? new Date().toISOString(),
      type: e.event_type ?? "infrastructure_event",
      severity: (e.severity === "critical" ? "crit" : e.severity === "high" ? "warn" : "info") as Severity,
      source: e.source ?? "Infrastructure",
      client: e.client_name ?? client.name,
      message: e.message ?? e.description ?? "Infrastructure event",
      status: e.resolved ? "success" : "pending",
      raw: e,
    }));

    return [...fromActivity, ...fromInfra].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [data, client.name]);

  const visible = useMemo(() => {
    return events
      .filter(e => filter === "all" || e.severity === filter)
      .filter(e => !query || (e.message + e.client + e.source + e.type).toLowerCase().includes(query.toLowerCase()));
  }, [events, filter, query]);

  const counts = {
    crit: events.filter(e => e.severity === "crit").length,
    warn: events.filter(e => e.severity === "warn").length,
    info: events.filter(e => e.severity === "info").length,
  };

  return (
    <>
      <PageHeader
        title="Activity Logs"
        description="Live operational event feed across leads, automations, and infrastructure."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <CircleCheck className="h-3 w-3 text-status-booked" /> Info
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{counts.info}</div>
        </div>
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <CircleAlert className="h-3 w-3 text-status-followup" /> Warning
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{counts.warn}</div>
        </div>
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-status-failed" /> Critical
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{counts.crit}</div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/60 p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search messages, clients, sources…"
              className="w-full rounded-md border border-border bg-background/40 py-1.5 pl-9 pr-3 text-[13px] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  filter === f.key
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
          {visible.map(e => {
            const cls = classifyEvent(e.raw);
            const Icon = cls.icon;
            return (
              <li
                key={e.id}
                onClick={() => setDrawer(e)}
                className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-elevated/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{e.message}</p>
                  <p className="text-[10.5px] text-muted-foreground capitalize">
                    {e.type.replace(/_/g, " ")} · {e.source} · {e.client}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    SEV_BADGE[e.severity],
                  )}
                >
                  {e.severity}
                </span>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">
                  {timeAgo(e.timestamp)}
                </span>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="px-5 py-12 text-center text-[12px] text-muted-foreground">No events match these filters</li>
          )}
        </ul>
      </div>

      {/* Drawer */}
      {drawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDrawer(null)}
        >
          <div
            className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {drawer.type.replace(/_/g, " ")}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{drawer.message}</h3>
              </div>
              <button onClick={() => setDrawer(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <Field label="Severity"><span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase font-semibold", SEV_BADGE[drawer.severity])}>{drawer.severity}</span></Field>
              <Field label="Status">{drawer.status}</Field>
              <Field label="Source">{drawer.source}</Field>
              <Field label="Client">{drawer.client}</Field>
              <Field label="Timestamp">{new Date(drawer.timestamp).toLocaleString()}</Field>
              {drawer.leadId && (
                <Field label="Lead">
                  <Link to={`/leads/${drawer.leadId}`} className="text-primary hover:underline">View →</Link>
                </Field>
              )}
            </div>

            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Workflow className="h-3 w-3" /> Raw payload
              </div>
              <pre className="rounded-md border border-border/60 bg-surface/40 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-80">
                {JSON.stringify(drawer.raw, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/50 bg-surface/30 p-2.5">
      <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{children}</div>
    </div>
  );
}
