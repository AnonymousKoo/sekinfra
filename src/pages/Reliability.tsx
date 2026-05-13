import { StubPage } from "@/components/stub-page";
import { ShieldCheck } from "lucide-react";
export default function Reliability() {
  return <StubPage title="Reliability" description="SLOs, error budgets, and reliability posture across all production services." icon={ShieldCheck}
    modules={[
      { title: "SLO Dashboard", desc: "Per-service SLOs and burn rate alerts." },
      { title: "Error Budgets", desc: "Remaining budget windows by service." },
      { title: "Change Log", desc: "Deploys correlated with reliability events." },
      { title: "Chaos Tests", desc: "Scheduled fault injection results." },
    ]} />;
}
