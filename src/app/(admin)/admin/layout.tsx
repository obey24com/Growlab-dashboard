import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminTopbar } from "@/components/layout/admin-topbar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Auth-gated app shell — never prerender at build time.
export const dynamic = "force-dynamic"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main
            className="flex-1 overflow-y-auto px-3 pt-4 pb-10 sm:px-4 sm:pt-6 sm:pb-12 md:px-6 lg:px-10"
            style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
