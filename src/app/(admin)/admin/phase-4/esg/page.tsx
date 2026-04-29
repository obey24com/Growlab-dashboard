import { Wireframe } from "@/components/admin/wireframe"
import { EsgMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="ESG Reporting"
      phase="Phase 4"
      description="Environmental and social impact metrics."
      mockupDescription="Farmer income uplift, carbon estimates, impact metrics."
      mockup={<EsgMockup />}
    />
  )
}
