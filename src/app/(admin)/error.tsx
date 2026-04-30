"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-serif text-2xl tracking-tight">Something went wrong</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          An error occurred while loading this page. The team has been notified.
        </p>
        {error.digest ? (
          <p className="font-mono text-[11px] text-muted-foreground/80">
            ref · {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
