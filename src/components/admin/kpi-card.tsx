'use client'

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"

type Tone = "primary" | "destructive" | "neutral"

export type KpiCardProps = {
  label: string
  value: string
  hint?: string
  /** Pre-rendered icon element, e.g. <Layers className="size-4" /> */
  icon: React.ReactNode
  tone?: Tone
  /** absolute or formatted delta, e.g. "+3" or "-1.2%" */
  delta?: string
  /** "up" / "down" / "flat". For destructive metrics, "down" is good. */
  deltaDirection?: "up" | "down" | "flat"
  /** semantic meaning of the delta — "positive" makes it green */
  deltaIntent?: "positive" | "negative" | "neutral"
  spark?: number[]
  index?: number
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  delta,
  deltaDirection = "flat",
  deltaIntent = "neutral",
  spark,
  index = 0,
}: KpiCardProps) {
  const intentColor =
    deltaIntent === "positive"
      ? "text-primary bg-primary/10"
      : deltaIntent === "negative"
      ? "text-destructive bg-destructive/10"
      : "text-muted-foreground bg-muted"

  const DeltaIcon =
    deltaDirection === "up"
      ? ArrowUpRight
      : deltaDirection === "down"
      ? ArrowDownRight
      : Minus

  const iconChip =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "neutral"
      ? "bg-muted text-muted-foreground"
      : "bg-primary/10 text-primary"

  return (
    <Card
      className="group/kpi relative overflow-hidden rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "backwards", animationDuration: "500ms" }}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "font-serif text-4xl leading-none tabular-nums",
                tone === "destructive" ? "text-destructive" : "text-foreground"
              )}
            >
              {value}
            </p>
          </div>
          <div className={cn("flex size-9 items-center justify-center rounded-lg [&>svg]:size-4", iconChip)}>
            {icon}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums",
                  intentColor
                )}
              >
                <DeltaIcon className="size-3" />
                {delta}
              </span>
            )}
            {hint && (
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
            )}
          </div>
          <div className="w-1/2 max-w-[140px]">
            <Sparkline data={spark ?? []} tone={tone} height={32} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
