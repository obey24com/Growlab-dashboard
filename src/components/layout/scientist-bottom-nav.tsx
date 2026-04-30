'use client'

import * as React from "react"
import {
  LayoutDashboard,
  Layers,
  History,
  User,
  ArrowRight,
  Camera,
  Check,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LeafMark } from "@/components/icons/leaf-mark"
import { useEntryWizardStore } from "@/lib/entry-wizard-store"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

const sideItems: NavItem[] = [
  { title: "Today", url: "/workspace", icon: LayoutDashboard, exact: true },
  { title: "Batches", url: "/workspace/batches", icon: Layers },
]

const tailItems: NavItem[] = [
  { title: "History", url: "/workspace/history", icon: History },
  { title: "Profile", url: "/workspace/profile", icon: User },
]

const ENTRY_PATH = "/workspace/entry/new"

export function ScientistBottomNav() {
  const pathname = usePathname() ?? ""
  const isOnEntry = pathname === ENTRY_PATH || pathname.startsWith(ENTRY_PATH + "/")

  const { step, canAdvance, isSubmitting, advance, totalSteps } = useEntryWizardStore()

  // Determine the FAB intent from wizard state.
  const onLastStep = step !== null && step >= totalSteps
  const onPhotoStep = step === 3
  const fabActive = isOnEntry && step !== null
  const disabled = fabActive && (!canAdvance || isSubmitting)

  // Pick icon + label per context.
  let Icon: React.ComponentType<{ className?: string }> = LeafMark
  let label = "New"
  let ariaLabel = "Start new entry"

  if (fabActive) {
    if (isSubmitting) {
      Icon = Loader2
      label = "Saving"
      ariaLabel = "Saving entry"
    } else if (onLastStep) {
      Icon = Check
      label = "Submit"
      ariaLabel = "Submit entry"
    } else if (onPhotoStep) {
      Icon = Camera
      label = "Capture"
      ariaLabel = "Capture photos and continue"
    } else {
      Icon = ArrowRight
      label = "Next"
      ariaLabel = "Continue to next step"
    }
  }

  const handleFabClick = (e: React.MouseEvent) => {
    if (fabActive) {
      e.preventDefault()
      if (!disabled) advance()
    }
    // Otherwise: let the <Link> navigate to the entry page.
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1">
        {sideItems.map((item) => {
          const active =
            item.exact
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(item.url + "/")
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          )
        })}

        {/* Center FAB: leaf when idle, context icon while in the wizard */}
        <div className="relative flex justify-center">
          <Link
            href={ENTRY_PATH}
            onClick={handleFabClick}
            aria-label={ariaLabel}
            aria-disabled={disabled}
            data-active={fabActive ? "true" : "false"}
            data-disabled={disabled ? "true" : "false"}
            className={cn(
              "absolute -top-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-all duration-200",
              "hover:bg-primary/90 active:scale-95",
              "data-[disabled=true]:bg-primary/40 data-[disabled=true]:pointer-events-none",
              "data-[active=true]:bg-primary data-[active=true]:scale-105"
            )}
          >
            <Icon
              className={cn(
                "size-6 transition-transform duration-200",
                isSubmitting && "animate-spin"
              )}
            />
            <span className="sr-only">{ariaLabel}</span>
          </Link>
          <span className="mt-9 select-none text-[10px] font-medium text-muted-foreground">
            {fabActive ? label : "Capture"}
          </span>
        </div>

        {tailItems.map((item) => {
          const active = pathname === item.url || pathname.startsWith(item.url + "/")
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
