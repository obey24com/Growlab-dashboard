import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export async function TodayTasks() {
  const supabase = await createClient()

  const [{ data: batches }, { data: stagesAll }] = await Promise.all([
    supabase
      .from("batches")
      .select(
        `id, batch_code, current_jar_count, variety:varieties!variety_id ( name ), stage:stages!current_stage_id ( id, name, sort_order )`
      )
      .eq("status", "active")
      .limit(4),
    supabase.from("stages").select("id, sort_order").order("sort_order"),
  ])

  const totalStages = stagesAll?.length || 1
  type StageRow = { id: string; sort_order: number }
  const stageOrder = new Map<string, number>(
    (stagesAll ?? []).map((s: StageRow) => [s.id, s.sort_order])
  )

  return (
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
          stage:
            | { id?: string; name?: string | null }
            | { id?: string; name?: string | null }[]
            | null
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
                      <Link href={`/workspace/entry/new?batchId=${batch.id}`} />
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
  )
}
