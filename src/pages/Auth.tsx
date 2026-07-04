import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-foreground font-display">SEKINFRA</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Growth Engine</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-7 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-foreground font-display">Operator sign-in</h1>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              This workspace is invite-only. Use credentials issued by your administrator.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <Field icon={Mail} type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
            <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-md border border-border/60 bg-surface/40 p-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-booked" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              All session data is encrypted. Lead PII, payment status, and revenue metrics are gated behind
              authentication.
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Need access? Contact your SEKINFRA administrator.
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-card/40 py-2.5 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
}
