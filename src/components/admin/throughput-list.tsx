'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export type ThroughputRow = {
  label: string
  value: number
  hint?: string
}

export function ThroughputList({
  rows,
  emptyLabel = "No data yet.",
  className,
}: {
  rows: ThroughputRow[]
  emptyLabel?: string
  className?: string
}) {
  if (!rows?.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {rows.map((row) => {
        const pct = Math.max(2, Math.round((row.value / max) * 100))
        return (
          <li key={row.label} className="group/row">
            <div className="mb-1 flex items-baseline justify-between gap-2 text-[12.5px]">
              <span className="truncate font-medium text-foreground">
                {row.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {row.value.toLocaleString()}
                {row.hint ? (
                  <span className="ml-1 text-[10.5px] text-muted-foreground/70">
                    {row.hint}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80 transition-all duration-500 ease-out group-hover/row:bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
