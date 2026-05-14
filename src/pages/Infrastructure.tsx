import { PageHeader } from "@/components/page-header";
import { useInfrastructureEvents, sevClass, timeAgo } from "@/lib/use-operational";
import { useDashboardData } from "@/lib/use-live-leads";
import { useClient } from "@/lib/client-context";
import { Server, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export default function Infrastructure() {
  const { client } = useClient();
  const dbQ = useInfrastructureEvents();
  const proxyQ = useDashboardData(client.id);
  const [drawer, setDrawer] = useState<any>(null);

  const events = useMemo(() => {
    const fromDb = (dbQ.data ?? []).map(e => ({
      id: e.id,
      timestamp: e.created_at,
      service: e.service_name,
      status: e.status,
      source: e.source ?? "supabase",
      message: e.message ?? `${e.service_name} → ${e.status}`,
      raw: e,
    }));
    const fromProxy = ((proxyQ.data?.infrastructure_events as any[]) ?? []).map((e: any, i) => ({
      id: e.id ?? `proxy-${i}`,
      timestamp: e.timestamp ?? e.created_at ?? new Date().toISOString(),
      service: e.service_name ?? e.service ?? "service",
      status: e.status ?? (e.resolved ? "resolved" : "active"),
      source: e.source ?? "proxy",
      message: e.message ?? e.description ?? "Infrastructure event",
      raw: e,
    }));
    return [...fromDb, ...fromProxy].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [dbQ.data, proxyQ.data]);

  const services = useMemo(() => {
    const map = new Map<string, { service: string; status: string; lastSeen: string; count: number }>();
    for (const e of events) {
      const cur = map.get(e.service);
      if (!cur || new Date(e.timestamp) > new Date(cur.lastSeen)) {
        map.set(e.service, { service: e.service, status: e.status, lastSeen: e.timestamp, count: (cur?.count ?? 0) + 1 });
      } else {
        cur.count++;
      }
    }
    return Array.from(map.values());
  }, [events]);

  const loading = dbQ.isLoading || proxyQ.isLoading;
  const error = dbQ.error;

  return (
    <>
      <PageHeader
        title="Infrastructure"
        description="VPS, container, and service event history across the SekInfra operating layer."
        actions={loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      {services.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 9).map(s => (
            <div key={s.service} className="card-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12.5px] font-semibold text-foreground">{s.service}</div>
                  <div className="mt-0.5 text-[10.5px] text-muted-foreground">{s.count} events · {timeAgo(s.lastSeen)}</div>
                </div>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                  s.status === "healthy" || s.status === "ok" || s.status === "resolved"
                    ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                    : s.status === "degraded" || s.status === "warning"
                    ? "bg-status-followup/15 text-status-followup border-status-followup/30"
                    : s.status === "down" || s.status === "failed" || s.status === "critical"
                    ? "bg-status-failed/15 text-status-failed border-status-failed/30"
                    : "bg-muted/40 text-muted-foreground border-border/50",
                )}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Event history
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load infrastructure events</div>
        ) : loading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : events.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Server className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No live events yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Service health and event telemetry will populate here as it streams in.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {events.map(e => (
              <li key={e.id} onClick={() => setDrawer(e)} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <Server className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{e.message}</p>
                  <p className="text-[10.5px] text-muted-foreground">{e.service} · {e.source}</p>
                </div>
                <span className="rounded-md border border-border/50 bg-muted/30 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {e.status}
                </span>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(e.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={() => setDrawer(null)}>
          <div className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Infrastructure event</div>
                <h3 className="text-[15px] font-semibold">{drawer.message}</h3>
              </div>
              <button onClick={() => setDrawer(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <pre className="rounded-md border border-border/60 bg-surface/40 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-[70vh]">
              {JSON.stringify(drawer.raw, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
