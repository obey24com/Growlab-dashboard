import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Layers, Activity, AlertTriangle, TrendingUp } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch KPIs
  const { count: activeBatches } = await supabase
    .from('demo.batches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: batchesData } = await supabase
    .from('demo.batches')
    .select('current_jar_count')
    .eq('status', 'active')

  const totalJars = batchesData?.reduce((acc, curr) => acc + (curr.current_jar_count || 0), 0) || 0

  const { count: anomaliesOpen } = await supabase
    .from('demo.observations')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'anomaly')
    .eq('resolved', false)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBatches || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all stages
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Jars</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJars.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Currently in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">92.4%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{anomaliesOpen || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>90-Day Forecast</CardTitle>
            <CardDescription>Projected ready seedlings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
            <div className="text-muted-foreground flex flex-col items-center">
              <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
              <span>Forecast Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Activity feed placeholder...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
