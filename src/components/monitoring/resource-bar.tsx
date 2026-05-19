import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/use-monitoring";

export function ResourceBar({ label, pct, hint }: { label: string; pct: number | null; hint?: string }) {
  const v = pct == null ? 0 : Math.max(0, Math.min(100, pct));
  const tone = pct == null ? "muted" : v >= 90 ? "crit" : v >= 75 ? "warn" : "ok";
  const fill =
    tone === "crit" ? "bg-status-failed"
    : tone === "warn" ? "bg-status-followup"
    : tone === "ok" ? "bg-status-booked"
    : "bg-muted-foreground/30";
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn("metric-number text-[13px] font-semibold tabular",
          tone === "crit" ? "text-status-failed" : tone === "warn" ? "text-status-followup" : "text-foreground")}>
          {fmtPct(pct)}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div className={cn("h-full transition-all duration-700 ease-out", fill)} style={{ width: `${v}%` }} />
      </div>
      {hint && <p className="mt-1.5 text-[10.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
