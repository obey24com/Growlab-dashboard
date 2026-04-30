'use client'

import * as React from "react"
import { Bell, Settings, RotateCcw, LogOut, User, Loader2 } from "lucide-react"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function AdminTopbar() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [resetOpen, setResetOpen] = React.useState(false)
  const [resetting, setResetting] = React.useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/reset', { method: 'POST' })
      if (!res.ok) throw new Error('failed')
      toast.success("Demo data reset", {
        description: "All seed data has been restored.",
      })
      setResetOpen(false)
      // give the toast a beat before reloading
      setTimeout(() => window.location.reload(), 400)
    } catch {
      toast.error("Reset failed", {
        description: "Please try again in a moment.",
      })
      setResetting(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setResetOpen(true)}
          className="hidden gap-1.5 text-[12px] md:inline-flex"
        >
          <RotateCcw className="size-3.5" />
          Reset Demo
        </Button>
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
              <AvatarImage src="" alt="Prof. Dr. Nguyen Phuong Thao" />
              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                NT
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Open user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                <span className="text-sm font-semibold text-foreground">Prof. Dr. Nguyen Phuong Thao</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  admin@growlab.demo
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="size-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>
              All batches, observations, audit entries and uploaded photos
              will be restored to the original seed state. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={resetting} />}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Resetting…
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5" />
                  Reset everything
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
