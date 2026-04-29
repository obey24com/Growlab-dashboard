'use client'

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Day = {
  date: Date
  count: number
}

export function WeekHeatmap({
  days,
  total,
  label = "My week",
}: {
  days: Day[]
  total: number
  label?: string
}) {
  const max = Math.max(...days.map((d) => d.count), 1)

  return (
    <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-serif text-2xl tabular-nums leading-none">
            {total}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            entries logged · last 7 days
          </p>
        </div>
        <div className="flex shrink-0 items-end gap-1">
          {days.map((day, i) => {
            const intensity = day.count === 0 ? 0 : 0.2 + (day.count / max) * 0.8
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
                title={`${day.date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })} · ${day.count} entries`}
              >
                <div
                  className={cn(
                    "size-6 rounded-md transition-all duration-200",
                    day.count === 0
                      ? "bg-muted ring-1 ring-inset ring-border/40"
                      : "bg-primary"
                  )}
                  style={day.count === 0 ? undefined : { opacity: intensity }}
                />
                <span className="text-[9px] font-medium uppercase text-muted-foreground/70">
                  {day.date.toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
