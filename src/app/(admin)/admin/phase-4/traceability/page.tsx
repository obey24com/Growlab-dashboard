import { Wireframe } from "@/components/admin/wireframe"
import { TraceabilityMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Traceability"
      phase="Phase 4"
      description="End-to-end lineage tracking."
      mockupDescription="Chain of custody view from mother tree to delivery."
      mockup={<TraceabilityMockup />}
    />
  )
}
