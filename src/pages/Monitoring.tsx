import { StubPage } from "@/components/stub-page";
import { Radio } from "lucide-react";
export default function Monitoring() {
  return <StubPage title="Monitoring" description="Wazuh SIEM, Loki log pipeline, and Grafana metric streams unified into one operational view." icon={Radio}
    modules={[
      { title: "Wazuh SIEM", desc: "Security events, agent status, alert rules." },
      { title: "Loki Logs", desc: "Streaming log ingestion, query, retention." },
      { title: "Metric Streams", desc: "Prometheus / Grafana telemetry pipelines." },
      { title: "Synthetic Probes", desc: "External uptime checks across regions." },
    ]} />;
}
