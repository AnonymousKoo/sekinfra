import { LucideIcon } from "lucide-react";
import { PageHeader } from "./page-header";
import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  modules?: { title: string; desc: string }[];
}

export function StubPage({ title, description, icon: Icon, modules = [] }: Props) {
  return (
    <>
      <PageHeader title={title} description={description} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-surface relative overflow-hidden p-8"
      >
        <div className="absolute inset-0 grid-bg opacity-[0.06] pointer-events-none" />
        <div className="relative flex flex-col items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground font-display">Module under provisioning</h2>
            <p className="mt-1 max-w-xl text-[12.5px] text-muted-foreground">
              This operational surface is being wired into the SekInfra control plane. Live telemetry,
              AI recommendations, and drill-down panels will appear here.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-status-followup/30 bg-status-followup/10 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-status-followup">
            <span className="h-1.5 w-1.5 rounded-full bg-status-followup animate-pulse-soft" /> Provisioning
          </span>
        </div>
      </motion.div>

      {modules.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="card-surface p-4"
            >
              <div className="text-[12.5px] font-semibold text-foreground">{m.title}</div>
              <div className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{m.desc}</div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary/60 to-primary-glow/60" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
