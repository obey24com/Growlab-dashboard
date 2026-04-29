import { Wireframe } from "@/components/admin/wireframe"
import { InvestorMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Investor Portal"
      phase="Phase 3"
      description="Read-only access for stakeholders."
      mockupDescription="Read-only KPI view, narrative report."
      mockup={<InvestorMockup />}
    />
  )
}
