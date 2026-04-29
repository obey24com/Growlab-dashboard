import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import Link from "next/link"

export default async function ScientistBatchesPage() {
  const supabase = await createClient()

  // For the demo, just show all active batches 
  const { data: batches } = await supabase
    .from('demo.batches')
    .select(`
      id,
      batch_code,
      status,
      started_at,
      demo_varieties:variety_id ( name ),
      demo_stages:current_stage_id ( name, expected_duration_days )
    `)
    .eq('status', 'active')
    .order('started_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto md:max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">Active production batches.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {batches?.map((batch: any) => {
          const daysInSystem = differenceInDays(new Date(), new Date(batch.started_at))
          
          return (
            <Link key={batch.id} href={`/workspace/batches/${batch.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">{batch.batch_code}</div>
                      <div className="text-muted-foreground text-sm">{batch.demo_varieties?.name}</div>
                    </div>
                    <Badge className="bg-primary hover:bg-primary">{batch.status}</Badge>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md grid grid-cols-2 gap-2 mt-auto">
                    <div>
                      <div className="text-xs text-muted-foreground">Current Stage</div>
                      <div className="font-medium text-sm">{batch.demo_stages?.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Days in System</div>
                      <div className="font-medium text-sm">{daysInSystem} days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {(!batches || batches.length === 0) && (
          <div className="col-span-full p-8 text-center border rounded-md border-dashed text-muted-foreground">
            No active batches found.
          </div>
        )}
      </div>
    </div>
  )
}
