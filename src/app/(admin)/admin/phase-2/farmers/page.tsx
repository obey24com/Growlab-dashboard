import { Wireframe } from "@/components/admin/wireframe"
import { FarmersMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Farmer Relations"
      phase="Phase 2"
      description="Manage farmer profiles and interactions."
      mockupDescription="Farmer list, last contact, order history sparkline."
      mockup={<FarmersMockup />}
    />
  )
}
