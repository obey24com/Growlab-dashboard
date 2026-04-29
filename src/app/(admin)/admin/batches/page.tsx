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
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default async function BatchesPage() {
  const supabase = await createClient()

  // Fetch batches with their variety and stage details
  const { data: batches } = await supabase
    .from('demo.batches')
    .select(`
      id,
      batch_code,
      status,
      initial_jar_count,
      current_jar_count,
      started_at,
      expected_completion_at,
      demo_varieties:variety_id ( name ),
      demo_stages:current_stage_id ( name, stage_group )
    `)
    .order('started_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">Manage and track production batches.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Create Batch
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Code</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Jars</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches?.map((batch: any) => (
              <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link href={`/admin/batches/${batch.id}`} className="hover:underline">
                    {batch.batch_code}
                  </Link>
                </TableCell>
                <TableCell>{batch.demo_varieties?.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{batch.demo_stages?.name}</span>
                    <span className="text-xs text-muted-foreground">{batch.demo_stages?.stage_group}</span>
                  </div>
                </TableCell>
                <TableCell>{batch.current_jar_count} / {batch.initial_jar_count}</TableCell>
                <TableCell>{format(new Date(batch.started_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={batch.status === 'active' ? 'default' : 'secondary'} className={batch.status === 'active' ? 'bg-primary hover:bg-primary' : ''}>
                    {batch.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!batches || batches.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No batches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
