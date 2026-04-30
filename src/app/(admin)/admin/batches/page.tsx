export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { CreateBatchDialog, type Variety, type Stage } from "./create-batch-dialog"

type NameJoin = { name?: string | null; stage_group?: string | null } | { name?: string | null; stage_group?: string | null }[] | null
const joinPart = (rel: NameJoin) =>
  Array.isArray(rel) ? rel[0] ?? null : rel

export default async function BatchesPage() {
  const supabase = await createClient()

  const [batchesRes, varietiesRes, stagesRes] = await Promise.all([
    supabase
      .from('batches')
      .select(
        `id, batch_code, status, initial_jar_count, current_jar_count, started_at, expected_completion_at,
         variety:varieties!variety_id ( name ),
         stage:stages!current_stage_id ( name, stage_group )`
      )
      .order('started_at', { ascending: false }),
    supabase.from('varieties').select('id, name, code').order('name'),
    supabase
      .from('stages')
      .select('id, name, code, sequence_order')
      .order('sequence_order'),
  ])

  type BatchRow = {
    id: string
    batch_code: string
    status: string
    initial_jar_count: number
    current_jar_count: number | null
    started_at: string
    expected_completion_at: string | null
    variety: NameJoin
    stage: NameJoin
  }

  const batches = (batchesRes.data as BatchRow[] | null) ?? []
  const varieties = (varietiesRes.data as Variety[] | null) ?? []
  const stages = (stagesRes.data as Stage[] | null) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Production
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
            Batches
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track production batches.
          </p>
        </div>
        <CreateBatchDialog varieties={varieties} stages={stages} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Batch Code</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Jars</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => {
              const variety = joinPart(batch.variety)
              const stage = joinPart(batch.stage)
              return (
                <TableRow key={batch.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-sm font-semibold">
                    <Link
                      href={`/admin/batches/${batch.id}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {batch.batch_code}
                    </Link>
                  </TableCell>
                  <TableCell>{variety?.name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{stage?.name ?? '—'}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {stage?.stage_group ?? ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {batch.current_jar_count ?? 0} / {batch.initial_jar_count}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(batch.started_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={batch.status === 'active' ? 'default' : 'secondary'}
                      className={
                        batch.status === 'active'
                          ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
                          : ''
                      }
                    >
                      {batch.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
            {batches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  No batches yet — click <span className="font-medium text-foreground">Create Batch</span> to add the first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
