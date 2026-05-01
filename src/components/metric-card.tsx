import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "default" | "success" | "warning" | "danger";
}

export function MetricCard({ label, value, delta, hint, icon: Icon, accent = "default" }: MetricCardProps) {
  const accentMap = {
    default: "text-primary",
    success: "text-status-booked",
    warning: "text-status-followup",
    danger: "text-status-failed",
  };
  return (
    <div className="card-surface group relative overflow-hidden p-5 transition-colors hover:border-border-strong">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", accentMap[accent])} />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="metric-number text-3xl font-semibold text-foreground">{value}</span>
        {delta !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-[11px] font-medium tabular",
            delta >= 0 ? "text-status-booked" : "text-status-failed"
          )}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
