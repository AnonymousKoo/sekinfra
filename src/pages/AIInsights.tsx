import { StubPage } from "@/components/stub-page";
import { Sparkles } from "lucide-react";
export default function AIInsights() {
  return <StubPage title="Coming Soon — AI Intelligence Layer" description="Operational intelligence layer — observations, predictions, and recommended actions." icon={Sparkles}
    modules={[
      { title: "Observations", desc: "Patterns detected across revenue, infra, and lead behavior." },
      { title: "Recommendations", desc: "Suggested operational actions with impact estimate." },
      { title: "Predictive Warnings", desc: "Early signals on churn, infra drift, and conversion risk." },
      { title: "AI Action Log", desc: "What the AI co-pilot did, when, and why." },
    ]} />;
}
