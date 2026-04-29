import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { ForecastChart } from "@/components/admin/forecast-chart"
import { Layers, Activity, AlertTriangle, TrendingUp } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // KPIs run in parallel
  const [
    activeBatchesRes,
    jarsRes,
    anomaliesRes,
    recentYieldRes,
    forecastRes,
    recentAuditRes,
  ] = await Promise.all([
    supabase
      .from("batches")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("batches")
      .select("current_jar_count")
      .eq("status", "active"),
    supabase
      .from("observations")
      .select("*", { count: "exact", head: true })
      .eq("category", "anomaly")
      .eq("resolved", false),
    supabase
      .from("stage_entries")
      .select("yield_ratio, completed_at")
      .eq("status", "completed")
      .gte("completed_at", thirtyDaysAgo)
      .not("yield_ratio", "is", null),
    supabase
      .from("forecasts")
      .select("forecast_data, generated_at")
      .eq("horizon", "90_day")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("audit_log")
      .select("id, action, entity_type, actor_email, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const totalJars =
    jarsRes.data?.reduce((acc, curr) => acc + (curr.current_jar_count || 0), 0) || 0

  const yields = (recentYieldRes.data ?? [])
    .map((r) => Number(r.yield_ratio))
    .filter((n) => Number.isFinite(n))
  const avgYield = yields.length
    ? (yields.reduce((a, b) => a + b, 0) / yields.length) * 100
    : null

  const forecastWeeks = ((forecastRes.data?.forecast_data?.weeks as
    | { week_starting: string; ready_seedlings: number }[]
    | undefined) ?? []).slice(0, 14)

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
            <div className="text-2xl font-bold">{activeBatchesRes.count || 0}</div>
            <p className="text-xs text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Jars</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJars.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently in production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {avgYield === null ? "—" : `${avgYield.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {yields.length === 0
                ? "No completed entries in the last 30 days"
                : `Across ${yields.length} entries (last 30 days)`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {anomaliesRes.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>90-Day Forecast</CardTitle>
            <CardDescription>
              {forecastRes.data?.generated_at
                ? `Generated ${formatDistanceToNow(new Date(forecastRes.data.generated_at), {
                    addSuffix: true,
                  })}`
                : "Projected ready seedlings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart data={forecastWeeks} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentAuditRes.data ?? []).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className={
                      log.action === "INSERT"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : log.action === "UPDATE"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {log.action}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium capitalize">
                      {log.entity_type.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.actor_email || "System"} ·{" "}
                      {format(new Date(log.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
              ))}
              {(!recentAuditRes.data || recentAuditRes.data.length === 0) && (
                <div className="text-sm text-muted-foreground py-2">
                  No recent activity yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
