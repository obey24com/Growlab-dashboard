import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Greeting } from "./_sections/greeting"
import { WeekHeatmapSection } from "./_sections/week-heatmap-section"
import { TodayTasks } from "./_sections/today-tasks"
import { RecentEntriesAndForecast } from "./_sections/recent-entries"
import {
  GreetingSkeleton,
  WeekHeatmapSkeleton,
  TodayTasksSkeleton,
  RecentEntriesSkeleton,
} from "./_sections/skeletons"

export const dynamic = "force-dynamic"

export default function ScientistTodayPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 md:max-w-5xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Suspense fallback={<GreetingSkeleton />}>
          <Greeting />
        </Suspense>
        <Button
          className="hidden h-11 px-5 shadow-sm shadow-primary/20 md:inline-flex"
          nativeButton={false}
          render={<Link href="/workspace/entry/new" />}
        >
          <PlusCircle className="mr-2 size-4" />
          New Entry
        </Button>
      </div>

      <div className="md:hidden">
        <Button
          className="h-16 w-full bg-primary text-lg shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-[0.99]"
          nativeButton={false}
          render={<Link href="/workspace/entry/new" />}
        >
          <PlusCircle className="mr-2 size-6" />
          New Entry
        </Button>
      </div>

      <Suspense fallback={<WeekHeatmapSkeleton />}>
        <WeekHeatmapSection />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<TodayTasksSkeleton />}>
          <TodayTasks />
        </Suspense>

        <Suspense fallback={<RecentEntriesSkeleton />}>
          <RecentEntriesAndForecast />
        </Suspense>
      </div>
    </div>
  )
}
