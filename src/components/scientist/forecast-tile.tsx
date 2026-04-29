'use client'

import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/admin/sparkline"

type Week = {
  week_starting: string
  ready_seedlings: number
}

export function ForecastTile({
  weeks,
}: {
  weeks: Week[]
}) {
  const next = weeks[0]
  const numbers = weeks.map((w) => Number(w.ready_seedlings) || 0)

  return (
    <Card className="rounded-xl border-primary/30 bg-primary/5 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Production forecast
            </p>
            {next ? (
              <>
                <p className="mt-1 font-serif text-3xl tabular-nums leading-none text-primary">
                  {Number(next.ready_seedlings).toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Seedlings ready week of{" "}
                  {new Date(next.week_starting).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 font-serif text-2xl leading-none text-primary">—</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  No forecast generated yet
                </p>
              </>
            )}
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
        </div>
        {numbers.length > 1 && (
          <div className="-mx-1">
            <Sparkline data={numbers} tone="primary" height={48} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
