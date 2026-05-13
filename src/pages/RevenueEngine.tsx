import { StubPage } from "@/components/stub-page";
import { TrendingUp } from "lucide-react";
export default function RevenueEngine() {
  return <StubPage title="Revenue Engine" description="Real-time revenue intelligence: MRR, recovery, cohort retention, and forecasting." icon={TrendingUp}
    modules={[
      { title: "MRR & ARR", desc: "Monthly recurring + annual run-rate, cohort breakdowns." },
      { title: "Recovery Engine", desc: "Failed payment, churn signal, and dunning automation." },
      { title: "Forecasting", desc: "AI-projected revenue with confidence intervals." },
      { title: "Revenue Attribution", desc: "Source → activation → expansion attribution." },
      { title: "Pricing Telemetry", desc: "Plan distribution, ARPA, expansion velocity." },
      { title: "Risk Ledger", desc: "Revenue at risk by client, by stage, by signal." },
    ]} />;
}
