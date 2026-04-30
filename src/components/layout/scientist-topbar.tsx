'use client'

import * as React from "react"
import Image from "next/image"
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function ScientistTopbar() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Mobile header — compact brand strip; navigation lives in ScientistBottomNav */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:hidden">
        <Image
          src="/logo transparent.png"
          alt="Growlab"
          width={120}
          height={45}
          priority
          sizes="120px"
          className="h-8 w-auto"
          style={{ width: "auto", height: "2rem" }}
        />
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full p-0 hover:bg-transparent"
                />
              }
            >
              <Avatar className="size-8 ring-1 ring-border/70">
                <AvatarImage src="" alt="Thu Hien" />
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  TH
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Open user menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                  <span className="text-sm font-semibold text-foreground">Thu Hien</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    scientist@growlab.demo
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop header */}
      <header className="sticky top-0 z-20 hidden h-14 items-center gap-4 border-b border-border/60 bg-background/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex lg:px-10">
        <Breadcrumbs />

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full p-0 hover:bg-transparent"
                />
              }
            >
              <Avatar className="size-8 ring-1 ring-border/70">
                <AvatarImage src="" alt="Thu Hien" />
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  TH
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Open user menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                  <span className="text-sm font-semibold text-foreground">Thu Hien</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    scientist@growlab.demo
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
