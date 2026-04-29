import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ScientistTodayPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('demo.user_profiles')
    .select('display_name')
    .eq('id', user?.id)
    .single()

  // Fetch some "tasks" (batches currently in progress that might need attention)
  const { data: batches } = await supabase
    .from('demo.batches')
    .select(`
      id,
      batch_code,
      demo_varieties:variety_id ( name ),
      demo_stages:current_stage_id ( name )
    `)
    .eq('status', 'active')
    .limit(3)

  // Fetch recent history
  const { data: recentEntries } = await supabase
    .from('demo.stage_entries')
    .select(`
      id,
      status,
      created_at,
      demo_batches:batch_id ( batch_code ),
      demo_stages:stage_id ( name )
    `)
    .eq('operator_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto md:max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning, {profile?.display_name || 'Scientist'}</h1>
        <p className="text-muted-foreground">Here is your workspace for today.</p>
      </div>

      <div className="md:hidden">
        <Button className="w-full h-16 text-lg bg-primary hover:bg-primary/90" asChild>
          <Link href="/workspace/entry/new">
            <PlusCircle className="mr-2 h-6 w-6" />
            Quick Entry
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Today's Tasks</h2>
          
          {batches?.map((batch: any) => (
            <Card key={batch.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{batch.batch_code}</div>
                  <div className="text-sm text-muted-foreground flex gap-1">
                    <span>{batch.demo_varieties?.name}</span>
                    <span>•</span>
                    <span>{batch.demo_stages?.name}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/workspace/entry/new?batchId=${batch.id}`}>Update</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {(!batches || batches.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No immediate tasks assigned to you.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentEntries?.map((entry: any) => (
                  <div key={entry.id} className="p-4 flex items-start gap-4">
                    {entry.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">
                        {entry.demo_batches?.batch_code} - {entry.demo_stages?.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(entry.created_at), 'MMM d, h:mm a')} • {entry.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
                {(!recentEntries || recentEntries.length === 0) && (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No recent entries found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Production Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">320</div>
                  <p className="text-xs text-muted-foreground">Seedlings ready next week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
