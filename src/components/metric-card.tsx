import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "default" | "success" | "warning" | "danger";
  spark?: number[];
}

export function MetricCard({ label, value, delta, hint, icon: Icon, accent = "default", spark }: MetricCardProps) {
  const accentMap = {
    default: "text-primary",
    success: "text-status-booked",
    warning: "text-status-followup",
    danger: "text-status-failed",
  };
  const accentBg = {
    default: "from-primary/30",
    success: "from-status-booked/30",
    warning: "from-status-followup/30",
    danger: "from-status-failed/30",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="card-surface group relative overflow-hidden p-5 transition-all hover:border-border-strong hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.18),0_8px_32px_-12px_hsl(var(--primary)/0.25)]"
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100", accentBg[accent])} />
      <div className="flex items-start justify-between">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        {Icon && <Icon className={cn("h-3.5 w-3.5", accentMap[accent])} />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="metric-number text-[26px] font-semibold text-foreground">{value}</span>
        {delta !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-[10.5px] font-medium tabular",
            delta >= 0 ? "text-status-booked" : "text-status-failed"
          )}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[10.5px] text-muted-foreground">{hint}</p>}
      {spark && spark.length > 0 && (
        <div className="mt-3 flex h-6 items-end gap-[2px]">
          {spark.map((v, i) => {
            const max = Math.max(...spark, 1);
            return (
              <div
                key={i}
                className={cn("flex-1 rounded-sm transition-all", accent === "danger" ? "bg-status-failed/50" : accent === "warning" ? "bg-status-followup/50" : accent === "success" ? "bg-status-booked/50" : "bg-primary/50")}
                style={{ height: `${(v / max) * 100}%` }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
