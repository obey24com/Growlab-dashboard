'use client'

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Layers, PlusCircle, History, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { title: "Today", url: "/workspace", icon: LayoutDashboard },
  { title: "My Batches", url: "/workspace/batches", icon: Layers },
  { title: "New Entry", url: "/workspace/entry/new", icon: PlusCircle },
  { title: "My History", url: "/workspace/history", icon: History },
  { title: "Profile", url: "/workspace/profile", icon: User },
]

export function ScientistSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader>
        <div className="flex h-12 items-center px-4 font-bold text-primary">
          <span className="text-xl">Growlab</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + '/')}>
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
