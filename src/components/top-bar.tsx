import { useClient } from "@/lib/client-context";
import { Check, ChevronsUpDown, Search, Bell, Command } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { client, setClientId, clients } = useClient();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center gap-4 px-5">
        {/* Client switcher */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-left transition-colors hover:bg-card">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/15 text-[11px] font-semibold text-primary font-display">
                {client.initial}
              </div>
              <div className="hidden sm:flex flex-col leading-tight pr-2">
                <span className="text-[12px] font-semibold text-foreground">{client.name}</span>
                <span className="text-[10px] text-muted-foreground">{client.industry}</span>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-1.5 bg-popover border-border">
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Switch workspace</p>
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => { setClientId(c.id); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-[13px] transition-colors hover:bg-accent/10",
                  c.id === client.id && "bg-accent/10"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/15 text-[11px] font-semibold text-primary font-display">
                  {c.initial}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.industry}</div>
                </div>
                {c.id === client.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search leads, events, automations…"
              className="w-full rounded-md border border-border bg-card/40 py-1.5 pl-9 pr-16 text-[13px] placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </div>
        </div>

        <div className="flex-1 md:flex-none" />

        <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/60 hover:bg-card">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-[11px] font-semibold text-primary-foreground font-display">
          OP
        </div>
      </div>
    </header>
  );
}
