'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const labelMap: Record<string, string> = {
  admin: "Admin",
  batches: "Batches",
  stages: "Stages",
  users: "Users",
  audit: "Audit",
  health: "System Health",
  "phase-2": "Phase 2",
  "phase-3": "Phase 3",
  "phase-4": "Phase 4",
  sales: "Sales",
  inventory: "Inventory",
  farmers: "Farmers",
  hr: "HR",
  finance: "Finance",
  investor: "Investor",
  compliance: "Compliance",
  traceability: "Traceability",
  esg: "ESG",
  workspace: "Workspace",
  entry: "Entry",
  new: "New",
  history: "History",
  profile: "Profile",
}

function prettify(segment: string) {
  if (labelMap[segment]) return labelMap[segment]
  if (/^[0-9a-f-]{16,}$/i.test(segment)) return "Detail"
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/"
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => ({
    label: prettify(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("hidden items-center gap-1 text-sm text-muted-foreground md:flex", className)}
    >
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50" />}
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="rounded px-1 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
