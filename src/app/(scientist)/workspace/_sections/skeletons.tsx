import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function GreetingSkeleton() {
  return (
    <header className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-4 w-56" />
    </header>
  )
}

export function WeekHeatmapSkeleton() {
  return (
    <Card className="rounded-xl border-border/60 bg-card">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TodayTasksSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-xl border-border/60 bg-card">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function RecentEntriesSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <Skeleton className="h-4 w-32" />
      <Card className="rounded-xl border-border/60 bg-card">
        <CardContent className="space-y-4 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-4 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
