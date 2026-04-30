import { createClient } from "@/lib/supabase/server"
import { WeekHeatmap } from "@/components/scientist/week-heatmap"

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export async function WeekHeatmapSection() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? ""

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const { data: weekEntries } = await supabase
    .from("stage_entries")
    .select("created_at")
    .eq("operator_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())

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

  return <WeekHeatmap days={days} total={totalThisWeek} />
}
