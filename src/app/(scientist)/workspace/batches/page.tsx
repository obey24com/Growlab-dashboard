export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { differenceInDays } from "date-fns"
import Link from "next/link"
import { Layers, ArrowRight, Calendar } from "lucide-react"

type NameJoin = { name?: string | null } | { name?: string | null }[] | null
const joinName = (rel: NameJoin) =>
  Array.isArray(rel) ? rel[0]?.name ?? undefined : rel?.name ?? undefined

export default async function ScientistBatchesPage() {
  const supabase = await createClient()

  const { data: batches } = await supabase
    .from("batches")
    .select(
      `id, batch_code, status, started_at, current_jar_count,
       variety:varieties!variety_id ( name ),
       stage:stages!current_stage_id ( name, sort_order, expected_duration_days )`
    )
    .eq("status", "active")
    .order("started_at", { ascending: false })

  const { data: stages } = await supabase
    .from("stages")
    .select("id")
    .order("sort_order")

  const totalStages = stages?.length || 1

  type BatchRow = {
    id: string
    batch_code: string
    status: string
    started_at: string
    current_jar_count: number | null
    variety: NameJoin
    stage:
      | { name?: string | null; sort_order?: number | null; expected_duration_days?: number | null }
      | { name?: string | null; sort_order?: number | null; expected_duration_days?: number | null }[]
      | null
  }
  const list = (batches as BatchRow[] | null) ?? []
  const activeCount = list.length
  const totalJars = list.reduce(
    (acc, b) => acc + (Number(b.current_jar_count) || 0),
    0
  )

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Production
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
            My batches
          </h1>
          <p className="text-sm text-muted-foreground">
            Active production batches you can record data against.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Stat label="Active" value={activeCount} />
          <Stat label="Jars" value={totalJars.toLocaleString()} />
        </div>
      </header>

      {list.length === 0 ? (
        <Card className="rounded-xl border-dashed border-border/60 bg-card">
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Layers className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No active batches</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Once batches enter production they&apos;ll appear here for data entry.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => {
            const variety = joinName(b.variety) ?? "Unknown variety"
            const stage = Array.isArray(b.stage) ? b.stage[0] : b.stage
            const stageName = stage?.name ?? "—"
            const stageIdx = (stage?.sort_order ?? 0) + 1
            const days = differenceInDays(new Date(), new Date(b.started_at))
            const pct = Math.max(
              4,
              Math.min(100, Math.round((stageIdx / totalStages) * 100))
            )
            return (
              <Link
                key={b.id}
                href={`/workspace/batches/${b.id}`}
                className="group block"
              >
                <Card className="h-full rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] transition-all duration-200 group-hover:-translate-y-px group-hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-mono text-sm font-semibold text-foreground">
                          {b.batch_code}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {variety}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                      <Mini label="Stage" value={stageName} />
                      <Mini
                        label="Days"
                        value={
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span className="tabular-nums">{days}</span>
                          </span>
                        }
                      />
                    </div>

                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center justify-between text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Stage progress</span>
                        <span className="tabular-nums">
                          {stageIdx} / {totalStages}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/80 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground tabular-nums">
                        {b.current_jar_count ?? "—"} jars
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        Open
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5">
      <span className="font-serif text-base tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-[12.5px] font-medium text-foreground">{value}</div>
    </div>
  )
}
