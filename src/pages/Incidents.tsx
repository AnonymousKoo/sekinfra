import { PageHeader } from "@/components/page-header";
import { useAlerts, sevClass, timeAgo, type AlertRow } from "@/lib/use-operational";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertOctagon,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  X,
  ChevronDown,
  ChevronRight,
  Server,
  DollarSign,
  Workflow,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SEV_BADGE: Record<string, string> = {
  critical: "bg-status-failed/15 text-status-failed border-status-failed/40",
  high: "bg-status-clicked/15 text-status-clicked border-status-clicked/40",
  medium: "bg-status-followup/15 text-status-followup border-status-followup/40",
  low: "bg-status-new/15 text-status-new border-status-new/40",
};
const sevBadge = (s?: string) =>
  SEV_BADGE[(s ?? "").toLowerCase()] ??
  "bg-muted/40 text-muted-foreground border-border/50";

type Category = "all" | "infrastructure" | "revenue" | "automation" | "security";

const FILTERS: { key: Category; label: string; icon: any }[] = [
  { key: "all", label: "All", icon: Activity },
  { key: "infrastructure", label: "Infrastructure", icon: Server },
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "automation", label: "Automation", icon: Workflow },
  { key: "security", label: "Security", icon: Lock },
];

function categorize(a: AlertRow): Category {
  const hay = `${a.type ?? ""} ${a.source ?? ""} ${a.service ?? ""} ${a.message ?? ""}`.toLowerCase();
  if (/(infra|service|host|node|server|db|database|cpu|memory|disk|network|uptime)/.test(hay)) return "infrastructure";
  if (/(revenue|payment|stripe|invoice|charge|checkout|billing|mrr)/.test(hay)) return "revenue";
  if (/(workflow|automation|n8n|webhook|job|task|pipeline)/.test(hay)) return "automation";
  if (/(security|auth|login|breach|rls|policy|token|unauthorized)/.test(hay)) return "security";
  return "all";
}

export default function Incidents() {
  const { data, isLoading, error } = useAlerts();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Category>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [resolving, setResolving] = useState<Set<string>>(new Set());

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("alerts-incidents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => qc.invalidateQueries({ queryKey: ["ops", "alerts"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const alerts = data ?? [];

  const tagged = useMemo(
    () => alerts.map(a => ({ ...a, _cat: categorize(a) })),
    [alerts],
  );

  const visible = useMemo(() => {
    const list = filter === "all" ? tagged : tagged.filter(a => a._cat === filter);
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [tagged, filter]);

  const groups = useMemo(
    () => ({
      active: visible.filter(a => !a.resolved),
      infrastructure: visible.filter(a => a._cat === "infrastructure"),
      revenue: visible.filter(a => a._cat === "revenue"),
      automation: visible.filter(a => a._cat === "automation"),
    }),
    [visible],
  );

  const stats = {
    active: alerts.filter(a => !a.resolved).length,
    total: alerts.length,
    resolved: alerts.filter(a => a.resolved).length,
  };

  async function resolveAlert(id: string) {
    setResolving(prev => new Set(prev).add(id));
    const { error } = await supabase
      .from("alerts")
      .update({ resolved: true, resolved_at: new Date().toISOString(), status: "resolved" })
      .eq("id", id);
    setResolving(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    if (error) {
      toast.error("Failed to resolve alert", { description: error.message });
    } else {
      toast.success("Alert resolved");
      qc.invalidateQueries({ queryKey: ["ops", "alerts"] });
    }
  }

  function toggle(id: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Live operational alert feed from the alerts pipeline."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat icon={AlertTriangle} label="Active" value={stats.active} tone="crit" />
        <Stat icon={Activity} label="Total" value={stats.total} tone="info" />
        <Stat icon={ShieldCheck} label="Resolved" value={stats.resolved} tone="ok" />
      </div>

      <div className="card-surface mb-4 flex flex-wrap items-center gap-1.5 p-3">
        {FILTERS.map(f => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === f.key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3 w-3" />
              {f.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="card-surface px-5 py-12 text-center text-[13px] text-status-failed">
          Failed to load alerts: {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="card-surface px-5 py-12 text-center text-[13px] text-muted-foreground">
          Loading alerts…
        </div>
      ) : (
        <div className="space-y-4">
          <Section title="Active Incidents" count={groups.active.length}>
            <List
              items={groups.active}
              expanded={expanded}
              resolving={resolving}
              onToggle={toggle}
              onResolve={resolveAlert}
            />
          </Section>
          <Section title="Infrastructure Events" count={groups.infrastructure.length}>
            <List
              items={groups.infrastructure}
              expanded={expanded}
              resolving={resolving}
              onToggle={toggle}
              onResolve={resolveAlert}
            />
          </Section>
          <Section title="Revenue Failures" count={groups.revenue.length}>
            <List
              items={groups.revenue}
              expanded={expanded}
              resolving={resolving}
              onToggle={toggle}
              onResolve={resolveAlert}
            />
          </Section>
          <Section title="Automation Failures" count={groups.automation.length}>
            <List
              items={groups.automation}
              expanded={expanded}
              resolving={resolving}
              onToggle={toggle}
              onResolve={resolveAlert}
            />
          </Section>
        </div>
      )}
    </>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className="rounded-md border border-border/50 bg-surface/40 px-1.5 py-0.5 text-[10px] tabular text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function List({
  items,
  expanded,
  resolving,
  onToggle,
  onResolve,
}: {
  items: (AlertRow & { _cat?: string })[];
  expanded: Set<string>;
  resolving: Set<string>;
  onToggle: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <AlertOctagon className="mx-auto h-5 w-5 text-muted-foreground/60" />
        <p className="mt-2 text-[13px] text-foreground">No active operational incidents.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border/50">
      {items.map(a => {
        const isOpen = expanded.has(a.id);
        const isResolving = resolving.has(a.id);
        return (
          <li key={a.id} className="transition-colors hover:bg-surface-elevated/30">
            <div className="flex items-center gap-3 px-5 py-3">
              <button
                onClick={() => onToggle(a.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
              >
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {a.type ?? a.message ?? "Alert"}
                  </p>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                      sevBadge(a.severity),
                    )}
                  >
                    {a.severity ?? "info"}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                      a.resolved
                        ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                        : "bg-status-failed/15 text-status-failed border-status-failed/30",
                    )}
                  >
                    {a.resolved ? "resolved" : "open"}
                  </span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground truncate">
                  {(a.source ?? a.service ?? "system")}
                  {a.type ? ` · ${a.type}` : ""}
                  {a.message && a.message !== a.type ? ` · ${a.message}` : ""}
                </p>
              </div>
              <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-20 text-right">
                {timeAgo(a.created_at)}
              </span>
              {!a.resolved && (
                <button
                  onClick={() => onResolve(a.id)}
                  disabled={isResolving}
                  className="inline-flex items-center gap-1 rounded-md border border-status-booked/40 bg-status-booked/10 px-2 py-1 text-[11px] font-medium text-status-booked transition-colors hover:bg-status-booked/20 disabled:opacity-50"
                >
                  {isResolving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  Resolve
                </button>
              )}
            </div>
            {isOpen && (
              <div className="border-t border-border/40 bg-surface/20 px-5 py-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <Field label="Created">{new Date(a.created_at).toLocaleString()}</Field>
                  <Field label="Resolved">
                    {a.resolved_at ? new Date(a.resolved_at).toLocaleString() : "—"}
                  </Field>
                  <Field label="Source">{a.source ?? a.service ?? "—"}</Field>
                  <Field label="Type">{a.type ?? "—"}</Field>
                  <Field label="Lead ID">{a.lead_id ?? "—"}</Field>
                  <Field label="Status">{a.status ?? "—"}</Field>
                </div>
                {a.message && (
                  <div className="mb-3">
                    <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground mb-1">
                      Description
                    </div>
                    <p className="text-[12px] text-foreground">{a.message}</p>
                  </div>
                )}
                <div>
                  <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground mb-1">
                    Metadata
                  </div>
                  <pre className="rounded-md border border-border/60 bg-background/60 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-72">
                    {JSON.stringify(a.payload ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: number;
  tone: "crit" | "info" | "ok";
}) {
  const color =
    tone === "crit" ? "text-status-failed" : tone === "ok" ? "text-status-booked" : "text-primary";
  return (
    <div className="card-surface p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-xl font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-2">
      <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground break-all">{children}</div>
    </div>
  );
}
