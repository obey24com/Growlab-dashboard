import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { KpiCards } from "./_sections/kpi-cards"
import { ForecastSection } from "./_sections/forecast-section"
import { RecentActivity } from "./_sections/recent-activity"
import { ThroughputAndVarieties } from "./_sections/throughput-and-varieties"
import {
  KpiCardsSkeleton,
  ForecastSkeleton,
  RecentActivitySkeleton,
  ThroughputAndVarietiesSkeleton,
} from "./_sections/skeletons"

export const dynamic = "force-dynamic"

export default function AdminDashboardPage() {
  const now = new Date()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Overview
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Snapshot of the production system as of{" "}
            <span className="font-medium text-foreground/80">
              {format(now, "MMM d, h:mm a")}
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Last 30 days
          </span>
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            Export
          </Button>
        </div>
      </div>

      <Suspense fallback={<KpiCardsSkeleton />}>
        <KpiCards />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-7">
        <Suspense fallback={<ForecastSkeleton />}>
          <ForecastSection />
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>

      <Suspense fallback={<ThroughputAndVarietiesSkeleton />}>
        <ThroughputAndVarieties />
      </Suspense>
    </div>
  )
}
