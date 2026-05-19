import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

export function SourcePill({ label, online, configured, latency }: { label: string; online: boolean; configured: boolean; latency?: number | null }) {
  const state = !configured ? "unconfigured" : online ? "online" : "offline";
  const color =
    state === "online" ? "text-status-booked border-status-booked/40 bg-status-booked/10"
    : state === "offline" ? "text-status-failed border-status-failed/40 bg-status-failed/10"
    : "text-muted-foreground border-border/60 bg-muted/30";
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-md border px-3 py-2", color)}>
      <div className="flex items-center gap-2">
        <Circle className={cn("h-2 w-2 fill-current", state === "online" && "animate-pulse")} />
        <span className="text-[12px] font-medium text-foreground">{label}</span>
      </div>
      <span className="text-[10px] uppercase tracking-wider tabular">
        {state === "unconfigured" ? "not set" : state}
        {state === "online" && latency != null ? ` · ${latency}ms` : ""}
      </span>
    </div>
  );
}
