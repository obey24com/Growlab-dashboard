import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForecastChart } from "@/components/admin/forecast-chart"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"

export async function ForecastSection() {
  const supabase = await createClient()
  const { data: forecast } = await supabase
    .from("forecasts")
    .select("forecast_data, generated_at")
    .eq("horizon", "90_day")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const forecastWeeks = ((forecast?.forecast_data?.weeks as
    | { week_starting: string; ready_seedlings: number }[]
    | undefined) ?? []).slice(0, 14)

  return (
    <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] lg:col-span-4">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            90-Day forecast
          </CardTitle>
          <CardDescription className="text-xs">
            {forecastWeeks.length
              ? `${forecastWeeks.length} weeks projected`
              : "Production projection across upcoming weeks"}
          </CardDescription>
        </div>
        {forecast?.generated_at && (
          <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
            Generated{" "}
            {formatDistanceToNow(new Date(forecast.generated_at), {
              addSuffix: true,
            })}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <ForecastChart data={forecastWeeks} />
      </CardContent>
    </Card>
  )
}
