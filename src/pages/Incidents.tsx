import { StubPage } from "@/components/stub-page";
import { AlertOctagon } from "lucide-react";
export default function Incidents() {
  return <StubPage title="Incidents" description="Active and historical incidents with severity, escalation, and post-mortems." icon={AlertOctagon}
    modules={[
      { title: "Active Incidents", desc: "Live severity, owner, escalation level." },
      { title: "Postmortems", desc: "Root cause, blast radius, action items." },
      { title: "On-Call Schedule", desc: "Rotation, escalation policy, paging." },
      { title: "MTTR Trends", desc: "Mean time to detect, acknowledge, resolve." },
    ]} />;
}
