import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, Users, Activity, Workflow, BarChart3, Settings,
  TrendingUp, Server, AlertOctagon, Radio, ShieldCheck, Sparkles, Building2, FileCog, Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: any; end?: boolean };

const operate: Item[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/revenue", label: "Revenue Engine", icon: TrendingUp },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/automations", label: "Automations", icon: Workflow },
];

const infra: Item[] = [
  { to: "/infrastructure", label: "Infrastructure", icon: Server },
  { to: "/incidents", label: "Incidents", icon: AlertOctagon },
  { to: "/monitoring", label: "Monitoring", icon: Radio },
  { to: "/reliability", label: "Reliability", icon: ShieldCheck },
];

const intel: Item[] = [
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/compliance", label: "Compliance", icon: FileCog },
];

const org: Item[] = [
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/activity", label: "Activity Logs", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Group({ label, items, pathname }: { label: string; items: Item[]; pathname: string }) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pb-1.5 pt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">{label}</p>
      {items.map(item => {
        const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-primary" />}
            <item.icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/40">
          <Hexagon className="h-4 w-4 text-primary" strokeWidth={2.2} />
          <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-status-booked ring-2 ring-sidebar animate-pulse-soft" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold tracking-tight text-foreground font-display">SEKINFRA</span>
          <span className="text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">Operational Infrastructure</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <Group label="Operate" items={operate} pathname={pathname} />
        <Group label="Infrastructure" items={infra} pathname={pathname} />
        <Group label="Intelligence" items={intel} pathname={pathname} />
        <Group label="Organization" items={org} pathname={pathname} />
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="status-dot bg-status-booked animate-pulse-soft" />
              <span className="text-[11px] font-medium text-foreground">All systems nominal</span>
            </div>
            <span className="text-[10px] tabular text-muted-foreground">99.98%</span>
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-0.5">
            {[5,7,4,8,6].map((h,i) => (
              <div key={i} className="h-3 rounded-sm bg-status-booked/40" style={{opacity: 0.3 + h*0.08}} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
