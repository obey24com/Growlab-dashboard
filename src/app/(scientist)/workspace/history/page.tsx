import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import { CheckCircle2, Clock, History as HistoryIcon } from "lucide-react"

type NameJoin = { name?: string | null } | { name?: string | null }[] | null
const joinName = (rel: NameJoin) =>
  Array.isArray(rel) ? rel[0]?.name ?? undefined : rel?.name ?? undefined

type EntryRow = {
  id: string
  status: string
  created_at: string
  jar_count: number | null
  survival_count: number | null
  batch:
    | {
        batch_code?: string | null
        variety?: NameJoin
      }
    | {
        batch_code?: string | null
        variety?: NameJoin
      }[]
    | null
  stage: NameJoin
}

function dayHeader(d: Date) {
  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"
  return format(d, "EEEE · MMM d, yyyy")
}

export default async function ScientistHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from("stage_entries")
    .select(
      `id, status, created_at, jar_count, survival_count,
       batch:batches!batch_id ( batch_code, variety:varieties!variety_id(name) ),
       stage:stages!stage_id ( name )`
    )
    .eq("operator_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(60)

  const list = (entries as EntryRow[] | null) ?? []
  const total = list.length
  const completed = list.filter((e) => e.status === "completed").length
  const inProgress = list.filter((e) => e.status === "in_progress").length

  // Group by day
  const groups = new Map<string, EntryRow[]>()
  for (const e of list) {
    const d = new Date(e.created_at)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString()
    const arr = groups.get(key) ?? []
    arr.push(e)
    groups.set(key, arr)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Activity
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
            My history
          </h1>
          <p className="text-sm text-muted-foreground">
            Your most recent stage entries and observations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Stat label="Total" value={total} />
          <Stat label="Done" value={completed} tone="primary" />
          <Stat label="In progress" value={inProgress} tone="amber" />
        </div>
      </header>

      {list.length === 0 ? (
        <Card className="rounded-xl border-dashed border-border/60 bg-card">
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <HistoryIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No entries yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Your recorded entries will show up here, grouped by day.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from(groups.entries()).map(([dayKey, items]) => (
            <section key={dayKey} className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {dayHeader(new Date(dayKey))}
                </h2>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {items.length} {items.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
                <CardContent className="p-0">
                  <ul className="divide-y divide-border/60">
                    {items.map((entry) => {
                      const batch = Array.isArray(entry.batch)
                        ? entry.batch[0]
                        : entry.batch
                      const stage = joinName(entry.stage)
                      const variety = joinName(batch?.variety ?? null)
                      const surv = entry.survival_count
                      const jars = entry.jar_count
                      const ratio =
                        surv != null && jars
                          ? ((Number(surv) / Number(jars)) * 100).toFixed(0)
                          : null
                      const done = entry.status === "completed"
                      return (
                        <li
                          key={entry.id}
                          className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <div className="flex items-start gap-3 sm:flex-1">
                            {done ? (
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            ) : (
                              <Clock className="mt-0.5 size-4 shrink-0 text-amber-500" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                <span className="font-mono">{batch?.batch_code ?? "—"}</span>
                                <span className="ml-1.5 font-normal text-muted-foreground">
                                  · {stage ?? "—"}
                                </span>
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {variety ?? "Unknown variety"}
                                <span className="mx-1.5 text-muted-foreground/50">·</span>
                                {formatDistanceToNow(new Date(entry.created_at), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-7 sm:pl-0">
                            <div className="flex items-baseline gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs">
                              <span className="font-semibold tabular-nums text-foreground">
                                {surv ?? "—"}
                              </span>
                              <span className="text-muted-foreground">
                                / {jars ?? "—"}
                              </span>
                              {ratio != null && (
                                <span className="ml-1 text-[10px] font-medium text-primary">
                                  {ratio}%
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                done
                                  ? "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                                  : "rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                              }
                            >
                              {entry.status.replace("_", " ")}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: React.ReactNode
  tone?: "neutral" | "primary" | "amber"
}) {
  const valueColor =
    tone === "primary"
      ? "text-primary"
      : tone === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : "text-foreground"
  return (
    <div className="flex items-baseline gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5">
      <span className={`font-serif text-base tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
