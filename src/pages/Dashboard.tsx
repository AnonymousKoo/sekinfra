import { useClient } from "@/lib/client-context";
import { activityByClient, getMetrics, getStageCounts, stageLabels, timeAgo } from "@/lib/mock-data";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Users, DollarSign, CalendarCheck, TrendingUp, AlertCircle, Clock, ArrowUpRight, CheckCircle2, ShieldCheck, Webhook, Mail, Calendar as CalIcon, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { client } = useClient();
  const m = getMetrics(client.id);
  const stages = getStageCounts(client.id);
  const recent = activityByClient[client.id].slice(0, 6);
  const total = stages[0]?.count ?? 1;

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Lead-to-booking control for ${client.name}. Live operational state.`}
        actions={
          <Link to="/leads" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-card">
            View all leads <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Leads Today" value={m.leadsToday} delta={12} icon={Users} hint="vs. yesterday" />
        <MetricCard label="Total Leads" value={m.totalLeads} icon={Users} hint="all-time captured" />
        <MetricCard label="Paid Assessments" value={m.paidAssessments} delta={8} icon={DollarSign} accent="success" hint="payment received" />
        <MetricCard label="Bookings Today" value={m.bookingsToday} delta={4} icon={CalendarCheck} accent="success" />
        <MetricCard label="Booking Conversion" value={`${m.conversion}%`} delta={2.1} icon={TrendingUp} hint="paid → booked" />
        <MetricCard label="Leads Not Booked" value={m.leadsNotBooked} icon={Clock} accent="warning" hint="awaiting next step" />
        <MetricCard label="Pending Follow-ups" value={m.pendingFollowups} icon={Clock} accent="warning" />
        <MetricCard label="Failed Automations" value={m.failedAutomations} delta={-2} icon={AlertCircle} accent="danger" hint="last 24h" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Pipeline summary */}
        <section className="card-surface lg:col-span-2 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Pipeline summary</h2>
              <p className="text-[11px] text-muted-foreground">Drop-off across the lead-to-booking funnel</p>
            </div>
            <Link to="/pipeline" className="text-[11px] text-primary hover:underline">Open pipeline →</Link>
          </div>
          <div className="mt-5 space-y-3">
            {stages.map((s, i) => {
              const pct = Math.round((s.count / total) * 100);
              const prev = i === 0 ? 100 : Math.round((s.count / (stages[i - 1].count || 1)) * 100);
              return (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-foreground">{stageLabels[s.stage]}</span>
                    <div className="flex items-center gap-3 tabular text-muted-foreground">
                      <span>{s.count} leads</span>
                      {i > 0 && <span className="text-status-booked">{prev}%</span>}
                    </div>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* System health */}
        <section className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">System health</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-booked/15 px-2 py-0.5 text-[10px] font-medium text-status-booked">
              <span className="h-1.5 w-1.5 rounded-full bg-status-booked animate-pulse-soft" />
              Operational
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              { icon: Webhook, label: "Webhooks", desc: "Intake events flowing" },
              { icon: Mail, label: "Email delivery", desc: "Resend connected" },
              { icon: CalIcon, label: "Booking sync", desc: "Cal.com responsive" },
              { icon: Database, label: "CRM sync", desc: "All records mirrored" },
              { icon: ShieldCheck, label: "Follow-up rules", desc: "5 active rules" },
            ].map(item => (
              <li key={item.label} className="flex items-center gap-3 rounded-md border border-border/60 bg-surface/40 px-3 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-foreground">{item.label}</div>
                  <div className="text-[10.5px] text-muted-foreground truncate">{item.desc}</div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-status-booked" />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent activity */}
      <section className="card-surface mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
            <p className="text-[11px] text-muted-foreground">Live event feed across all leads</p>
          </div>
          <Link to="/activity" className="text-[11px] text-primary hover:underline">View all →</Link>
        </div>
        <ul className="mt-4 divide-y divide-border/50">
          {recent.map(e => (
            <li key={e.id} className="flex items-center gap-3 py-3">
              <span className="status-dot bg-primary" />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-foreground">
                  <span className="font-medium">{e.leadName}</span>{" "}
                  <span className="text-muted-foreground">{e.message}</span>
                </span>
              </div>
              <span className="text-[11px] tabular text-muted-foreground">{timeAgo(e.timestamp)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
