'use client'

import * as React from "react"
import { Search, Bell, Settings, RotateCcw, LogOut, User, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

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

      <div className="ml-auto flex items-center gap-2">
        <form
          className="hidden md:block"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="search"
              placeholder="Search…"
              className="h-9 w-full rounded-lg border-border/60 bg-muted/40 pl-8 pr-12 text-[13px] shadow-none transition-colors focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>
        </form>

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
              <AvatarImage src="" alt="Admin" />
              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                AD
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Open user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                <span className="text-sm font-semibold text-foreground">Admin User</span>
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
