import { ScientistSidebar } from "@/components/layout/scientist-sidebar"
import { ScientistBottomNav } from "@/components/layout/scientist-bottom-nav"
import { ScientistTopbar } from "@/components/layout/scientist-topbar"
import { AdminPageTransition } from "@/components/layout/admin-page-transition"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30 pb-16 md:pb-0">
        <ScientistSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <ScientistTopbar />
          <main className="flex-1 overflow-y-auto px-4 pt-6 pb-12 md:px-6 lg:px-10">
            <AdminPageTransition>{children}</AdminPageTransition>
          </main>
        </div>
        <ScientistBottomNav />
      </div>
    </SidebarProvider>
  )
}
