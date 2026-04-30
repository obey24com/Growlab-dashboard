import { createClient } from "@/lib/supabase/server"
import { KpiCard } from "@/components/admin/kpi-card"
import { Layers, Activity, AlertTriangle, TrendingUp } from "lucide-react"
import { bucketByDay, cumulative } from "./utils"

export async function KpiCards() {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [
    activeBatchesRes,
    jarsRes,
    anomaliesRes,
    recentYieldRes,
    batchesTrendRes,
    anomaliesTrendRes,
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
      .from("batches")
      .select("created_at")
      .gte("created_at", fourteenDaysAgo),
    supabase
      .from("observations")
      .select("created_at")
      .eq("category", "anomaly")
      .gte("created_at", fourteenDaysAgo),
  ])

  const totalJars =
    jarsRes.data?.reduce((acc, curr) => acc + (curr.current_jar_count || 0), 0) || 0

  const yields = (recentYieldRes.data ?? [])
    .map((r) => Number(r.yield_ratio))
    .filter((n) => Number.isFinite(n))
  const avgYield = yields.length
    ? (yields.reduce((a, b) => a + b, 0) / yields.length) * 100
    : null

  const batchesPerDay = bucketByDay(batchesTrendRes.data, 14)
  const batchesSpark = cumulative(batchesPerDay)
  const newBatchesLast7 = batchesPerDay.slice(-7).reduce((a, b) => a + b, 0)
  const newBatchesPrev7 = batchesPerDay.slice(0, 7).reduce((a, b) => a + b, 0)

  const anomaliesPerDay = bucketByDay(anomaliesTrendRes.data, 14)
  const anomaliesLast7 = anomaliesPerDay.slice(-7).reduce((a, b) => a + b, 0)
  const anomaliesPrev7 = anomaliesPerDay.slice(0, 7).reduce((a, b) => a + b, 0)
  const anomaliesDelta = anomaliesLast7 - anomaliesPrev7

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

  const avgJarsPerBatch = jarsRes.data?.length
    ? totalJars / jarsRes.data.length
    : 0
  const jarsSpark = batchesSpark.map((c) => Math.round(c * Math.max(1, avgJarsPerBatch)))

  return (
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
  )
}
