import { cn } from "@/lib/utils";
import { LeadStatus, statusColor, statusLabels } from "@/lib/types";

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
      statusColor[status],
      className
    )}>
      <span className="status-dot bg-current" />
      {statusLabels[status]}
    </span>
  );
}
