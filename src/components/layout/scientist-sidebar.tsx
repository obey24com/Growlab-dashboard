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
  LayoutDashboard,
  Layers,
  PlusCircle,
  History,
  User,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { title: "Today", url: "/workspace", icon: LayoutDashboard, exact: true },
  { title: "My Batches", url: "/workspace/batches", icon: Layers },
  { title: "New Entry", url: "/workspace/entry/new", icon: PlusCircle },
  { title: "My History", url: "/workspace/history", icon: History },
  { title: "Profile", url: "/workspace/profile", icon: User },
]

export function ScientistSidebar() {
  const pathname = usePathname()

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/")

  return (
    <Sidebar className="hidden border-r border-border/60 md:flex">
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
            Scientist
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url, item.exact)}
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
