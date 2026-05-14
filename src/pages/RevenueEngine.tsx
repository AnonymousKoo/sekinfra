import { PageHeader } from "@/components/page-header";
import { useDashboardData } from "@/lib/use-live-leads";
import { useClient } from "@/lib/client-context";
import { TrendingUp, Loader2, CreditCard, Users, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const fmtCurrency = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

export default function RevenueEngine() {
  const { client } = useClient();
  const { data, isLoading, error } = useDashboardData(client.id);

  const leads = data?.leads ?? [];
  const summary = data?.summary ?? {};

  const breakdown = useMemo(() => {
    const paid = leads.filter(l => l.paymentReceived || l.payment === "paid");
    const unpaid = leads.filter(l => !(l.paymentReceived || l.payment === "paid"));
    const live = leads.filter(l => l.goLive || l.dashboardReady);
    const atRisk = leads.filter(l => l.followupCount && l.followupCount > 0 && !l.goLive);
    const totalValue = paid.reduce((s, l) => s + (l.paymentAmount || l.value || 0), 0);
    const lifecycle = leads.reduce((acc, l) => {
      const k = l.lifecycleStage ?? l.operationalState ?? "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { paid, unpaid, live, atRisk, totalValue, lifecycle };
  }, [leads]);

  return (
    <>
      <PageHeader
        title="Revenue Engine"
        description="Revenue intelligence: payments, lifecycle stages, activation, and revenue-at-risk signals."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue today" value={fmtCurrency(Number(summary.revenue_today ?? 0))} icon={TrendingUp} tone="ok" />
        <Stat label="Paid leads" value={String(breakdown.paid.length)} icon={CreditCard} tone="info" />
        <Stat label="Live deployments" value={String(breakdown.live.length)} icon={Users} tone="ok" />
        <Stat label="Revenue at risk" value={fmtCurrency(Number(summary.revenue_at_risk ?? 0))} icon={AlertTriangle} tone="warn" />
      </div>

      {Object.keys(breakdown.lifecycle).length > 0 && (
        <div className="card-surface mb-4 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Lifecycle distribution</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(breakdown.lifecycle).map(([k, v]) => (
              <div key={k} className="rounded-md border border-border/60 bg-surface/40 px-2.5 py-1 text-[11px]">
                <span className="text-muted-foreground">{k}</span>
                <span className="ml-1.5 font-semibold text-foreground tabular">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Revenue ledger · {leads.length} leads
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load revenue data</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <TrendingUp className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No revenue events yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Lead activity and payments will appear here.</p>
          </div>
        ) : (
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 backdrop-blur">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Client</th>
                  <th className="px-4 py-2.5 text-left font-medium">Lifecycle</th>
                  <th className="px-4 py-2.5 text-left font-medium">Operational</th>
                  <th className="px-4 py-2.5 text-left font-medium">Payment</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[...leads]
                  .sort((a, b) => (b.paymentAmount ?? b.value ?? 0) - (a.paymentAmount ?? a.value ?? 0))
                  .map(l => (
                    <tr key={l.id} className="hover:bg-surface-elevated/40">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{l.name}</div>
                        <div className="text-[10.5px] text-muted-foreground truncate max-w-[200px]">{l.email}</div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.lifecycleStage ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.operationalState ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider",
                          l.paymentReceived || l.payment === "paid"
                            ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                            : "bg-status-failed/15 text-status-failed border-status-failed/30",
                        )}>
                          {l.paymentReceived || l.payment === "paid" ? "received" : "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular text-foreground">
                        {l.paymentAmount || l.value ? fmtCurrency(Number(l.paymentAmount || l.value)) : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: "ok" | "info" | "warn" }) {
  const color = tone === "ok" ? "text-status-booked" : tone === "warn" ? "text-status-followup" : "text-primary";
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-2xl font-semibold">{value}</div>
    </div>
  );
}
