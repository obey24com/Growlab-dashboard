import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ForecastTile } from "@/components/scientist/forecast-tile"
import { format } from "date-fns"

export async function RecentEntriesAndForecast() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? ""

  const [{ data: recentEntries }, { data: forecast }] = await Promise.all([
    supabase
      .from("stage_entries")
      .select(
        `id, status, created_at, batch:batches!batch_id ( batch_code ), stage:stages!stage_id ( name )`
      )
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("forecasts")
      .select("forecast_data")
      .eq("horizon", "90_day")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const forecastWeeks =
    ((forecast?.forecast_data?.weeks as
      | { week_starting: string; ready_seedlings: number }[]
      | undefined) ?? []).slice(0, 8)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">Recent activity</h2>

      <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
        <CardContent className="p-0">
          {recentEntries?.length ? (
            <ul className="divide-y divide-border/60">
              {(recentEntries as Array<{
                id: string
                status: string
                created_at: string
                batch:
                  | { batch_code?: string }
                  | { batch_code?: string }[]
                  | null
                stage: { name?: string } | { name?: string }[] | null
              }>).map((entry) => {
                const eb = Array.isArray(entry.batch) ? entry.batch[0] : entry.batch
                const es = Array.isArray(entry.stage) ? entry.stage[0] : entry.stage
                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    {entry.status === "completed" ? (
                      <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                    ) : (
                      <Clock className="mt-0.5 size-4 text-amber-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        <span className="font-mono">{eb?.batch_code}</span>
                        <span className="ml-1.5 text-muted-foreground">
                          · {es?.name}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, h:mm a")}
                        <span className="mx-1.5 text-muted-foreground/50">·</span>
                        {String(entry.status).replace(/_/g, " ")}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No recent entries found.
            </div>
          )}
        </CardContent>
      </Card>

      <ForecastTile weeks={forecastWeeks} />
    </section>
  )
}
