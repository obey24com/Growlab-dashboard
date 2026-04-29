import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle2, Circle, Clock } from "lucide-react"

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const { id } = await params

  // Fetch batch details
  const { data: batch } = await supabase
    .from('batches')
    .select(`
      *,
      variety:varieties!variety_id ( name, code ),
      stage:stages!current_stage_id ( name, code )
    `)
    .eq('id', id)
    .single()

  if (!batch) {
    notFound()
  }

  // Fetch stage entries
  const { data: entries } = await supabase
    .from('stage_entries')
    .select(`
      *,
      stage:stages!stage_id ( name, code, sequence_order, expected_duration_days )
    `)
    .eq('batch_id', batch.id)
    .order('stage(sequence_order)' as never, { ascending: true })

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{batch.batch_code}</h1>
            <Badge variant={batch.status === 'active' ? 'default' : 'secondary'} className={batch.status === 'active' ? 'bg-primary hover:bg-primary' : ''}>
              {batch.status}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>{batch.variety?.name} ({batch.variety?.code})</span>
            <span>•</span>
            <span>Started {format(new Date(batch.started_at), 'MMM d, yyyy')}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.stage?.name}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.current_jar_count} <span className="text-sm font-normal text-muted-foreground">/ {batch.initial_jar_count}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {batch.initial_jar_count > 0 ? Math.round((batch.current_jar_count / batch.initial_jar_count) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Origin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{batch.origin_facility}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stage Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {entries?.map((entry: any) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {entry.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : entry.status === 'in_progress' ? (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div className="w-px h-full bg-border my-2" />
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{entry.stage?.name}</h3>
                    <Badge variant="outline">{entry.stage?.code}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 mb-3">
                    {format(new Date(entry.started_at), 'MMM d, yyyy')} 
                    {entry.completed_at ? ` - ${format(new Date(entry.completed_at), 'MMM d, yyyy')}` : ' (Current)'}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-muted/30 p-4 rounded-lg border">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Survival</div>
                      <div className="font-medium">{entry.survival_count || '-'} / {entry.jar_count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yield Ratio</div>
                      <div className="font-medium">{entry.yield_ratio ? `${(entry.yield_ratio * 100).toFixed(1)}%` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                      <div className="font-medium capitalize">{entry.status.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
