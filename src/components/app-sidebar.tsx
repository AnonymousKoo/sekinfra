import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, Users, Activity, Workflow, BarChart3, Settings, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/automations", label: "Automations", icon: Workflow },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold tracking-tight text-foreground font-display">SEKINFRA</span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Growth Engine</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Workspace</p>
        {items.map(item => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1 w-1 rounded-full bg-primary" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2">
            <span className="status-dot bg-status-booked animate-pulse-soft" />
            <span className="text-[11px] font-medium text-foreground">All systems operational</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">5 of 5 automations active</p>
        </div>
      </div>
    </aside>
  );
}
