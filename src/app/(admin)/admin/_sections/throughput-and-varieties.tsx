import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { ThroughputList, type ThroughputRow } from "@/components/admin/throughput-list"
import { joinName, type NameJoin } from "./utils"

export async function ThroughputAndVarieties() {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [throughputRes, varietiesRes] = await Promise.all([
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
  )
}
