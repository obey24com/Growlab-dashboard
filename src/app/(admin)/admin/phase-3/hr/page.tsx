import { Wireframe } from "@/components/admin/wireframe"
import { HrMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="HR & Onboarding"
      phase="Phase 3"
      description="Employee directory and training progress."
      mockupDescription="Employee directory, onboarding checklist, rotation calendar."
      mockup={<HrMockup />}
    />
  )
}
