import { PageHeader } from "@/components/page-header";
import { useDashboardData } from "@/lib/use-live-leads";
import { useClient } from "@/lib/client-context";
import { TrendingUp, Loader2, CreditCard, AlertTriangle, RotateCcw, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

const fmtCurrency = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Number(n || 0).toLocaleString()}`;

export default function RevenueEngine() {
  const { client } = useClient();
  const { data, isLoading, error } = useDashboardData(client.id);
  const summary = data?.summary ?? {};
  const leads = data?.leads ?? [];

  const revenueToday = Number(summary.revenue_today ?? 0);
  const revenueAtRisk = Number(summary.revenue_at_risk ?? 0);
  const paidToBooked = Number(summary.paid_to_booked ?? 0);
  const recoveredBookings = Number(summary.recovered_bookings ?? 0);
  const paidToday = Number(summary.paid_today ?? 0);
  const totalLeads = Number(summary.total_leads ?? 0);
  const booked = Number(summary.booked ?? 0);

  return (
    <>
      <PageHeader
        title="Revenue Engine"
        description="Revenue intelligence: payments, conversion, activation, and revenue-at-risk signals."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue today" value={fmtCurrency(revenueToday)} icon={TrendingUp} tone="ok" />
        <Stat label="Revenue at risk" value={fmtCurrency(revenueAtRisk)} icon={AlertTriangle} tone="warn" />
        <Stat label="Paid → Booked" value={`${paidToBooked}%`} icon={Percent} tone="info" />
        <Stat label="Recovered bookings" value={String(recoveredBookings)} icon={RotateCcw} tone="ok" />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Paid today" value={String(paidToday)} icon={CreditCard} tone="info" />
        <Stat label="Total leads" value={String(totalLeads)} icon={TrendingUp} tone="info" />
        <Stat label="Booked" value={String(booked)} icon={TrendingUp} tone="ok" />
      </div>

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
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 backdrop-blur">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Client</th>
                  <th className="px-4 py-2.5 text-left font-medium">Stage</th>
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
                        <div className="text-[10.5px] text-muted-foreground truncate max-w-[220px]">{l.email}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-primary/10 text-primary border-primary/20")}>
                          {l.pipeline_stage ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider",
                          l.paymentReceived === true
                            ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                            : "bg-status-failed/15 text-status-failed border-status-failed/30",
                        )}>
                          {l.paymentReceived === true ? "RECEIVED" : "PENDING"}
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
