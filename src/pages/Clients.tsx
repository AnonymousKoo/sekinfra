import { StubPage } from "@/components/stub-page";
import { Building2 } from "lucide-react";
export default function Clients() {
  return <StubPage title="Clients" description="Multi-tenant client roster with operational health, ARR, and activation state." icon={Building2}
    modules={[
      { title: "Client Roster", desc: "All organizations with health score and ARR." },
      { title: "Activation State", desc: "Where each client is in the activation flow." },
      { title: "Health Score", desc: "Composite score from usage, support, and billing." },
      { title: "Account Notes", desc: "CSM notes, escalations, expansion signals." },
    ]} />;
}
