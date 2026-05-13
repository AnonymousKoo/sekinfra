import { StubPage } from "@/components/stub-page";
import { Workflow } from "lucide-react";
export default function Workflows() {
  return <StubPage title="Workflows" description="Automation graphs, triggers, queues, and execution telemetry." icon={Workflow}
    modules={[
      { title: "Workflow Graph", desc: "Visual graph of triggers, steps, and dependencies." },
      { title: "Queue Depth", desc: "Pending, in-flight, and dead-letter queues." },
      { title: "Execution History", desc: "Per-run timeline with success/failure detail." },
      { title: "Triggers", desc: "Webhooks, schedules, and event subscriptions." },
    ]} />;
}
