import { Wireframe } from "@/components/admin/wireframe"
import { SalesMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Sales & Orders"
      phase="Phase 2"
      description="Manage incoming orders and track the sales pipeline."
      mockupDescription="Order intake feed from WhatsApp, pending confirmations queue."
      mockup={<SalesMockup />}
    />
  )
}
