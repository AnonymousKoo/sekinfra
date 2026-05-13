import { StubPage } from "@/components/stub-page";
import { FileCog } from "lucide-react";
export default function Compliance() {
  return <StubPage title="Compliance" description="SOC 2, GDPR, audit logs, and policy enforcement across the platform." icon={FileCog}
    modules={[
      { title: "Controls", desc: "SOC 2 / ISO 27001 control status." },
      { title: "Audit Trail", desc: "Immutable log of operator and system actions." },
      { title: "Data Residency", desc: "Region pinning and processor inventory." },
      { title: "Policy Enforcement", desc: "Automated guardrails and exceptions." },
    ]} />;
}
