import { StubPage } from "@/components/stub-page";
import { Server } from "lucide-react";
export default function Infrastructure() {
  return <StubPage title="Infrastructure" description="VPS, container, and API health across the SekInfra operating layer." icon={Server}
    modules={[
      { title: "VPS Fleet", desc: "Uptime, CPU/memory, network telemetry per node." },
      { title: "Container Status", desc: "Docker / orchestration state across services." },
      { title: "API Health", desc: "Latency, error rate, throughput per endpoint." },
      { title: "Edge Functions", desc: "Cold starts, invocations, p95 latency." },
      { title: "Database", desc: "Connections, replication lag, slow queries." },
      { title: "Storage & CDN", desc: "Bucket usage, cache hit rate, egress." },
    ]} />;
}
