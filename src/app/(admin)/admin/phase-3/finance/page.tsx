import { Wireframe } from "@/components/admin/wireframe"
import { FinanceMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Finance & Reporting"
      phase="Phase 3"
      description="Financial metrics and automated reporting."
      mockupDescription="KPI cards, runway projection, board pack draft."
      mockup={<FinanceMockup />}
    />
  )
}
