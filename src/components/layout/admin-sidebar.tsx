'use client'

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, Layers, GitMerge, Users, Activity, HeartPulse, ShoppingCart, Package, Users2, FileText, PieChart, ShieldCheck, Search, Anchor } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const phase1Items = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Batches", url: "/admin/batches", icon: Layers },
  { title: "Stages & Process", url: "/admin/stages", icon: GitMerge },
  { title: "Users & Permissions", url: "/admin/users", icon: Users },
  { title: "Audit Log", url: "/admin/audit", icon: Activity },
  { title: "System Health", url: "/admin/health", icon: HeartPulse },
]

const phase2Items = [
  { title: "Sales & Orders", url: "/admin/phase-2/sales", icon: ShoppingCart },
  { title: "Inventory", url: "/admin/phase-2/inventory", icon: Package },
  { title: "Farmer Relations", url: "/admin/phase-2/farmers", icon: Users2 },
]

const phase3Items = [
  { title: "HR & Onboarding", url: "/admin/phase-3/hr", icon: Users },
  { title: "Finance & Reporting", url: "/admin/phase-3/finance", icon: PieChart },
  { title: "Investor Portal", url: "/admin/phase-3/investor", icon: FileText },
]

const phase4Items = [
  { title: "Compliance & Export", url: "/admin/phase-4/compliance", icon: ShieldCheck },
  { title: "Traceability", url: "/admin/phase-4/traceability", icon: Search },
  { title: "ESG Reporting", url: "/admin/phase-4/esg", icon: Anchor },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center px-3">
          <Image
            src="/logo transparent.png"
            alt="Growlab"
            width={160}
            height={60}
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>PHASE 1 (Functional)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase1Items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PHASE 2 (Coming Soon)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase2Items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PHASE 3 (Coming Soon)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase3Items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PHASE 4 (Coming Soon)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase4Items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
