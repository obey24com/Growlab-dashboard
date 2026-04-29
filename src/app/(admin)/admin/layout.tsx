import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminTopbar } from "@/components/layout/admin-topbar"
import { AdminPageTransition } from "@/components/layout/admin-page-transition"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto px-4 pt-6 pb-12 md:px-6 lg:px-10">
            <AdminPageTransition>{children}</AdminPageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
