export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Clock, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { WeekHeatmap } from "@/components/scientist/week-heatmap"
import { ForecastTile } from "@/components/scientist/forecast-tile"
import { cn } from "@/lib/utils"

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export default async function ScientistTodayPage() {
  const supabase = await createClient()

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? ""

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    { data: profile },
    { data: batches },
    { data: recentEntries },
    { data: weekEntries },
    { data: stagesAll },
    { data: forecast },
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", userId)
      .single(),
    supabase
      .from("batches")
      .select(
        `id, batch_code, current_jar_count, variety:varieties!variety_id ( name ), stage:stages!current_stage_id ( id, name, sort_order )`
      )
      .eq("status", "active")
      .limit(4),
    supabase
      .from("stage_entries")
      .select(
        `id, status, created_at, batch:batches!batch_id ( batch_code ), stage:stages!stage_id ( name )`
      )
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("stage_entries")
      .select("created_at")
      .eq("operator_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("stages").select("id, sort_order").order("sort_order"),
    supabase
      .from("forecasts")
      .select("forecast_data")
      .eq("horizon", "90_day")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  })()

  // Build 7-day heatmap (oldest → newest)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    return { date: d, count: 0 }
  })
  for (const e of weekEntries ?? []) {
    if (!e.created_at) continue
    const d = startOfDay(new Date(e.created_at))
    const idx = Math.floor((d.getTime() - sevenDaysAgo.getTime()) / 86_400_000)
    if (idx >= 0 && idx < 7) days[idx].count += 1
  }
  const totalThisWeek = days.reduce((a, b) => a + b.count, 0)

  // Stage progress per batch
  const totalStages = stagesAll?.length || 1
  type StageRow = { id: string; sort_order: number }
  const stageOrder = new Map<string, number>(
    (stagesAll ?? []).map((s: StageRow) => [s.id, s.sort_order])
  )

  const forecastWeeks =
    ((forecast?.forecast_data?.weeks as
      | { week_starting: string; ready_seedlings: number }[]
      | undefined) ?? []).slice(0, 8)

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 md:max-w-5xl">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {format(new Date(), "EEEE · MMM d")}
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          {greeting}, {profile?.display_name || "Scientist"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is your workspace for today.
        </p>
      </header>

      <div className="md:hidden">
        <Button
          className="h-16 w-full bg-primary text-lg shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-[0.99]"
          nativeButton={false}
          render={<Link href="/workspace/entry/new" />}
        >
          <PlusCircle className="mr-2 size-6" />
          Quick Entry
        </Button>
      </div>

      <WeekHeatmap days={days} total={totalThisWeek} />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold tracking-tight">
              Today&apos;s tasks
            </h2>
            <Link
              href="/workspace/batches"
              className="group inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
            >
              All batches
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {batches?.length ? (
            (batches as Array<{
              id: string
              batch_code: string
              current_jar_count: number | null
              variety: { name?: string | null } | { name?: string | null }[] | null
              stage: { id?: string; name?: string | null } | { id?: string; name?: string | null }[] | null
            }>).map((batch) => {
              const variety = Array.isArray(batch.variety) ? batch.variety[0] : batch.variety
              const stage = Array.isArray(batch.stage) ? batch.stage[0] : batch.stage
              const stageIdx = stageOrder.get(stage?.id ?? "") ?? 0
              const pct = Math.max(
                4,
                Math.min(100, Math.round(((stageIdx + 1) / totalStages) * 100))
              )
              return (
                <Card
                  key={batch.id}
                  className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] transition-all hover:-translate-y-px hover:shadow-md"
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold text-foreground">
                          {batch.batch_code}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {variety?.name}
                          </span>
                          <span className="mx-1.5 text-muted-foreground/50">·</span>
                          {stage?.name}
                          {batch.current_jar_count ? (
                            <>
                              <span className="mx-1.5 text-muted-foreground/50">·</span>
                              {batch.current_jar_count} jars
                            </>
                          ) : null}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/workspace/entry/new?batchId=${batch.id}`}
                          />
                        }
                      >
                        Update
                      </Button>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Stage progress</span>
                        <span className="tabular-nums">
                          {stageIdx + 1} / {totalStages}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full bg-primary/80 transition-all duration-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="rounded-xl border-dashed border-border/70 bg-card">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No immediate tasks assigned to you.
              </CardContent>
            </Card>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold tracking-tight">
            Recent activity
          </h2>

          <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
            <CardContent className="p-0">
              {recentEntries?.length ? (
                <ul className="divide-y divide-border/60">
                  {(recentEntries as Array<{
                    id: string
                    status: string
                    created_at: string
                    batch: { batch_code?: string } | { batch_code?: string }[] | null
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
                          <span className="font-mono">
                            {eb?.batch_code}
                          </span>
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
      </div>
    </div>
  )
}
