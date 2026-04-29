'use client'

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Home,
  Layers,
  GitMerge,
  Users,
  Activity,
  HeartPulse,
  ShoppingCart,
  Package,
  Users2,
  FileText,
  PieChart,
  ShieldCheck,
  Search,
  Anchor,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const phase1Items = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Batches", url: "/admin/batches", icon: Layers },
  { title: "Stages & Process", url: "/admin/stages", icon: GitMerge },
  { title: "Users & Permissions", url: "/admin/users", icon: Users },
  { title: "Audit Log", url: "/admin/audit", icon: Activity },
  { title: "System Health", url: "/admin/health", icon: HeartPulse },
]

const roadmapItems = [
  { title: "Sales & Orders", url: "/admin/phase-2/sales", icon: ShoppingCart, phase: "P2" },
  { title: "Inventory", url: "/admin/phase-2/inventory", icon: Package, phase: "P2" },
  { title: "Farmer Relations", url: "/admin/phase-2/farmers", icon: Users2, phase: "P2" },
  { title: "HR & Onboarding", url: "/admin/phase-3/hr", icon: Users, phase: "P3" },
  { title: "Finance & Reporting", url: "/admin/phase-3/finance", icon: PieChart, phase: "P3" },
  { title: "Investor Portal", url: "/admin/phase-3/investor", icon: FileText, phase: "P3" },
  { title: "Compliance & Export", url: "/admin/phase-4/compliance", icon: ShieldCheck, phase: "P4" },
  { title: "Traceability", url: "/admin/phase-4/traceability", icon: Search, phase: "P4" },
  { title: "ESG Reporting", url: "/admin/phase-4/esg", icon: Anchor, phase: "P4" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (url: string) =>
    url === "/admin" ? pathname === url : pathname === url || pathname.startsWith(url + "/")

  return (
    <Sidebar className="border-r border-border/60">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2.5 px-1">
          <Image
            src="/logo transparent.png"
            alt="Growlab"
            width={132}
            height={48}
            priority
            sizes="132px"
            className="h-9 w-auto"
            style={{ width: "auto", height: "2.25rem" }}
          />
          <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Admin
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase1Items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    render={<Link href={item.url} />}
                    className={cn(
                      "group/nav relative h-9 gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-foreground/70 transition-all duration-150",
                      "hover:bg-muted/70 hover:text-foreground",
                      "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold",
                      "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-80",
                      "data-[active=true]:[&>svg]:opacity-100",
                      "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[2px] before:rounded-r-full before:bg-primary before:scale-y-0 before:transition-transform before:duration-200",
                      "data-[active=true]:before:scale-y-100"
                    )}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <details open className="group/roadmap" name="admin-nav-roadmap">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors">
              <Sparkles className="size-3" />
              <span>Roadmap</span>
              <ChevronDown className="ml-auto size-3.5 transition-transform duration-200 group-open/roadmap:rotate-180" />
            </summary>
            <SidebarGroupContent className="mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <SidebarMenu>
                {roadmapItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      render={<Link href={item.url} />}
                      className={cn(
                        "h-8 gap-2.5 rounded-lg px-2.5 text-[12.5px] font-normal text-muted-foreground/70 transition-colors duration-150",
                        "hover:bg-muted/60 hover:text-foreground",
                        "data-[active=true]:bg-muted data-[active=true]:text-foreground",
                        "[&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:opacity-70"
                      )}
                    >
                      <item.icon />
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="rounded bg-muted px-1 py-px text-[9px] font-medium tracking-wide text-muted-foreground/80">
                        {item.phase}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </details>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 pt-3">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-2.5 py-2">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-medium text-foreground/80">Phase 1</span>
            <span className="text-[11px] text-muted-foreground">Live demo</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
