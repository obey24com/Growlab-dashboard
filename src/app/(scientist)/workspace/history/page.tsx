import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle2, Clock } from "lucide-react"

export default async function ScientistHistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('stage_entries')
    .select(`
      id,
      status,
      created_at,
      jar_count,
      survival_count,
      batch:batches!batch_id ( batch_code, variety:varieties!variety_id(name) ),
      stage:stages!stage_id ( name )
    `)
    .eq('operator_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto md:max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My History</h1>
          <p className="text-muted-foreground">Your recent stage entries and observations.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {entries?.map((entry: any) => (
          <Card key={entry.id}>
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {entry.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{entry.batch?.batch_code}</div>
                  <div className="text-sm font-medium">{entry.batch?.variety?.name} • {entry.stage?.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-10 md:pl-0">
                <div className="text-sm bg-muted/50 px-3 py-1.5 rounded-md flex flex-col items-center">
                  <span className="text-xs text-muted-foreground uppercase">Survival</span>
                  <span className="font-semibold">{entry.survival_count || '-'} / {entry.jar_count}</span>
                </div>
                <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'} className={entry.status === 'completed' ? 'bg-primary' : ''}>
                  {entry.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!entries || entries.length === 0) && (
          <div className="p-8 text-center border rounded-md border-dashed text-muted-foreground">
            No history found.
          </div>
        )}
      </div>
    </div>
  )
}
