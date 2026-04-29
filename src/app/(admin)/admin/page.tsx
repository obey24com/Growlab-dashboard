import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ForecastChart } from "@/components/admin/forecast-chart"
import { KpiCard } from "@/components/admin/kpi-card"
import { ThroughputList, type ThroughputRow } from "@/components/admin/throughput-list"
import {
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CalendarDays,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

type EntityType = string
type ActionType = "INSERT" | "UPDATE" | "DELETE" | string

const ACTIVITY_DOT: Record<ActionType, string> = {
  INSERT: "bg-primary",
  UPDATE: "bg-blue-500",
  DELETE: "bg-destructive",
}

const ACTIVITY_LABEL: Record<ActionType, string> = {
  INSERT: "created",
  UPDATE: "updated",
  DELETE: "removed",
}

function bucketByDay(
  rows: { created_at: string | null }[] | null | undefined,
  days: number
) {
  const buckets = new Array(days).fill(0)
  if (!rows?.length) return buckets
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  for (const r of rows) {
    if (!r.created_at) continue
    const d = new Date(r.created_at)
    if (Number.isNaN(d.getTime())) continue
    d.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - start.getTime()) / 86_400_000)
    if (diff >= 0 && diff < days) buckets[diff] += 1
  }
  return buckets
}

function cumulative(arr: number[]) {
  let acc = 0
  return arr.map((v) => (acc += v))
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [
    activeBatchesRes,
    jarsRes,
    anomaliesRes,
    recentYieldRes,
    forecastRes,
    recentAuditRes,
    batchesTrendRes,
    anomaliesTrendRes,
    throughputRes,
    varietiesRes,
  ] = await Promise.all([
    supabase.from("batches").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("batches").select("current_jar_count, created_at").eq("status", "active"),
    supabase
      .from("observations")
      .select("*", { count: "exact", head: true })
      .eq("category", "anomaly")
      .eq("resolved", false),
    supabase
      .from("stage_entries")
      .select("yield_ratio, completed_at")
      .eq("status", "completed")
      .gte("completed_at", thirtyDaysAgo)
      .not("yield_ratio", "is", null),
    supabase
      .from("forecasts")
      .select("forecast_data, generated_at")
      .eq("horizon", "90_day")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("audit_log")
      .select("id, action, entity_type, actor_email, created_at")
      .order("created_at", { ascending: false })
      .limit(7),
    supabase
      .from("batches")
      .select("created_at")
      .gte("created_at", fourteenDaysAgo),
    supabase
      .from("observations")
      .select("created_at")
      .eq("category", "anomaly")
      .gte("created_at", fourteenDaysAgo),
    supabase
      .from("stage_entries")
      .select("stage:stages!stage_id ( name )")
      .eq("status", "completed")
      .gte("completed_at", thirtyDaysAgo),
    supabase
      .from("batches")
      .select("variety:varieties!variety_id ( name )")
      .eq("status", "active"),
  ])

  const totalJars =
    jarsRes.data?.reduce((acc, curr) => acc + (curr.current_jar_count || 0), 0) || 0

  const yields = (recentYieldRes.data ?? [])
    .map((r) => Number(r.yield_ratio))
    .filter((n) => Number.isFinite(n))
  const avgYield = yields.length
    ? (yields.reduce((a, b) => a + b, 0) / yields.length) * 100
    : null

  // Sparkline + trend data — last 14 days
  const batchesPerDay = bucketByDay(batchesTrendRes.data, 14)
  const batchesSpark = cumulative(batchesPerDay)
  const newBatchesLast7 = batchesPerDay.slice(-7).reduce((a, b) => a + b, 0)
  const newBatchesPrev7 = batchesPerDay.slice(0, 7).reduce((a, b) => a + b, 0)

  const anomaliesPerDay = bucketByDay(anomaliesTrendRes.data, 14)
  const anomaliesLast7 = anomaliesPerDay.slice(-7).reduce((a, b) => a + b, 0)
  const anomaliesPrev7 = anomaliesPerDay.slice(0, 7).reduce((a, b) => a + b, 0)
  const anomaliesDelta = anomaliesLast7 - anomaliesPrev7

  // Yields sparkline: chronological order
  const yieldSpark = (recentYieldRes.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.completed_at ?? 0).getTime() -
        new Date(b.completed_at ?? 0).getTime()
    )
    .map((r) => Number(r.yield_ratio) * 100)
    .filter((n) => Number.isFinite(n))
  const yieldHalf = Math.max(1, Math.floor(yieldSpark.length / 2))
  const yieldRecent = yieldSpark.slice(-yieldHalf)
  const yieldPrev = yieldSpark.slice(0, yieldHalf)
  const yieldDelta =
    yieldRecent.length && yieldPrev.length
      ? yieldRecent.reduce((a, b) => a + b, 0) / yieldRecent.length -
        yieldPrev.reduce((a, b) => a + b, 0) / yieldPrev.length
      : 0

  // Jars spark = active jars per day approximated by cumulative active batches with their current jar count averaged. Simple proxy: cumulative new batches × avg jars (still illustrative).
  const avgJarsPerBatch = jarsRes.data?.length
    ? totalJars / jarsRes.data.length
    : 0
  const jarsSpark = batchesSpark.map((c) => Math.round(c * Math.max(1, avgJarsPerBatch)))

  const forecastWeeks = ((forecastRes.data?.forecast_data?.weeks as
    | { week_starting: string; ready_seedlings: number }[]
    | undefined) ?? []).slice(0, 14)

  type NameJoin = { name?: string | null } | { name?: string | null }[] | null
  const joinName = (rel: NameJoin | undefined) =>
    Array.isArray(rel) ? rel[0]?.name ?? undefined : rel?.name ?? undefined

  // Stage throughput
  const throughputCounts = new Map<string, number>()
  for (const row of (throughputRes.data ?? []) as Array<{ stage: NameJoin }>) {
    const name = joinName(row?.stage)
    if (!name) continue
    throughputCounts.set(name, (throughputCounts.get(name) ?? 0) + 1)
  }
  const throughputRows: ThroughputRow[] = Array.from(throughputCounts.entries())
    .map(([label, value]) => ({ label, value, hint: "entries" }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Top varieties
  const varietyCounts = new Map<string, number>()
  for (const row of (varietiesRes.data ?? []) as Array<{ variety: NameJoin }>) {
    const name = joinName(row?.variety)
    if (!name) continue
    varietyCounts.set(name, (varietyCounts.get(name) ?? 0) + 1)
  }
  const varietyRows: ThroughputRow[] = Array.from(varietyCounts.entries())
    .map(([label, value]) => ({ label, value, hint: "active batches" }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Overview
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Snapshot of the production system as of{" "}
            <span className="font-medium text-foreground/80">
              {format(now, "MMM d, h:mm a")}
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Last 30 days
          </span>
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          index={0}
          label="Active batches"
          value={(activeBatchesRes.count ?? 0).toLocaleString()}
          hint="Across all stages"
          icon={<Layers />}
          tone="primary"
          spark={batchesSpark}
          delta={`${newBatchesLast7 - newBatchesPrev7 >= 0 ? "+" : ""}${
            newBatchesLast7 - newBatchesPrev7
          } / 7d`}
          deltaDirection={
            newBatchesLast7 > newBatchesPrev7
              ? "up"
              : newBatchesLast7 < newBatchesPrev7
              ? "down"
              : "flat"
          }
          deltaIntent={
            newBatchesLast7 > newBatchesPrev7
              ? "positive"
              : newBatchesLast7 < newBatchesPrev7
              ? "negative"
              : "neutral"
          }
        />

        <KpiCard
          index={1}
          label="Total active jars"
          value={totalJars.toLocaleString()}
          hint="Currently in production"
          icon={<Activity />}
          tone="primary"
          spark={jarsSpark}
        />

        <KpiCard
          index={2}
          label="Avg yield ratio"
          value={avgYield === null ? "—" : `${avgYield.toFixed(1)}%`}
          hint={
            yields.length === 0
              ? "No completed entries (30d)"
              : `${yields.length} entries · 30d`
          }
          icon={<TrendingUp />}
          tone="primary"
          spark={yieldSpark}
          delta={
            yields.length
              ? `${yieldDelta >= 0 ? "+" : ""}${yieldDelta.toFixed(1)} pts`
              : undefined
          }
          deltaDirection={
            yieldDelta > 0.1 ? "up" : yieldDelta < -0.1 ? "down" : "flat"
          }
          deltaIntent={
            yieldDelta > 0.1
              ? "positive"
              : yieldDelta < -0.1
              ? "negative"
              : "neutral"
          }
        />

        <KpiCard
          index={3}
          label="Open anomalies"
          value={(anomaliesRes.count ?? 0).toLocaleString()}
          hint={
            anomaliesRes.count
              ? "Requires attention"
              : "All clear · nothing to triage"
          }
          icon={<AlertTriangle />}
          tone="destructive"
          spark={anomaliesPerDay}
          delta={`${anomaliesDelta >= 0 ? "+" : ""}${anomaliesDelta} / 7d`}
          deltaDirection={
            anomaliesDelta > 0 ? "up" : anomaliesDelta < 0 ? "down" : "flat"
          }
          deltaIntent={
            anomaliesDelta > 0
              ? "negative"
              : anomaliesDelta < 0
              ? "positive"
              : "neutral"
          }
        />
      </div>

      {/* Forecast + Activity */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] lg:col-span-4">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                90-Day forecast
              </CardTitle>
              <CardDescription className="text-xs">
                {forecastWeeks.length
                  ? `${forecastWeeks.length} weeks projected`
                  : "Production projection across upcoming weeks"}
              </CardDescription>
            </div>
            {forecastRes.data?.generated_at && (
              <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                Generated{" "}
                {formatDistanceToNow(new Date(forecastRes.data.generated_at), {
                  addSuffix: true,
                })}
              </span>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            <ForecastChart data={forecastWeeks} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] lg:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Recent activity
              </CardTitle>
              <CardDescription className="text-xs">
                Latest events across the platform
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {(recentAuditRes.data?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-10 text-center">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Quiet so far
                </p>
                <p className="max-w-[220px] text-xs text-muted-foreground">
                  New events from the production floor will appear here.
                </p>
              </div>
            ) : (
              <ul className="-mx-2 flex flex-col">
                {(recentAuditRes.data ?? []).map((log) => (
                  <li
                    key={log.id}
                    title={format(new Date(log.created_at), "PPpp")}
                    className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        ACTIVITY_DOT[log.action] ?? "bg-muted-foreground"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="capitalize">
                          {(log.entity_type as EntityType).replace(/_/g, " ")}
                        </span>
                        <span className="ml-1 font-normal text-muted-foreground">
                          {ACTIVITY_LABEL[log.action] ?? (log.action as string).toLowerCase()}
                        </span>
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {log.actor_email || "System"} ·{" "}
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 border-t border-border/60 pt-3">
              <Link
                href="/admin/audit"
                className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                View full audit log
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Throughput + Varieties */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Stage throughput
            </CardTitle>
            <CardDescription className="text-xs">
              Completed entries per stage · last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThroughputList
              rows={throughputRows}
              emptyLabel="No completed entries in the last 30 days."
            />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Top varieties
            </CardTitle>
            <CardDescription className="text-xs">
              Most common varieties in active production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThroughputList
              rows={varietyRows}
              emptyLabel="No active batches yet."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
