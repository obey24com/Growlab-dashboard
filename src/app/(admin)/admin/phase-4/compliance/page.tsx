import { Wireframe } from "@/components/admin/wireframe"
import { ComplianceMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Compliance & Export"
      phase="Phase 4"
      description="Export readiness and certifications."
      mockupDescription="Export readiness checklist, CITES status."
      mockup={<ComplianceMockup />}
    />
  )
}
