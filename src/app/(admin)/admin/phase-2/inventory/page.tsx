import { Wireframe } from "@/components/admin/wireframe"
import { InventoryMockup } from "@/components/admin/wireframe-mockups"

export default function Page() {
  return (
    <Wireframe
      title="Inventory"
      phase="Phase 2"
      description="Real-time stock tracking and low-stock alerts."
      mockupDescription="Stock by variety/location grid, low-stock flags."
      mockup={<InventoryMockup />}
    />
  )
}
