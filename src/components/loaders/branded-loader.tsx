'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "fixed" | "inline"

const SUBTITLES = [
  "Preparing your workspace",
  "Warming the lab benches",
  "Watering the seedlings",
  "Aligning the dashboards",
]

/**
 * Branded full-screen transition loader.
 *
 * Uses a breathing leaf, a pulsing primary glow, and a soft sage gradient
 * background. When mounted on both sides of a route transition with the same
 * `view-transition-name` (`growlab-shell`), the browser cross-fades between
 * the two identical layers — making login → dashboard feel like one continuous
 * scene instead of a hard cut.
 */
export function BrandedLoader({
  variant = "fixed",
  subtitle,
  className,
}: {
  variant?: Variant
  subtitle?: string
  className?: string
}) {
  // Cycle subtitles every ~1.6s so the user sees something move even on slow networks.
  const [phraseIdx, setPhraseIdx] = React.useState(0)
  React.useEffect(() => {
    if (subtitle) return
    const t = window.setInterval(() => {
      setPhraseIdx((i) => (i + 1) % SUBTITLES.length)
    }, 1800)
    return () => window.clearInterval(t)
  }, [subtitle])

  const message = subtitle ?? SUBTITLES[phraseIdx]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading workspace"
      className={cn(
        "isolate flex flex-col items-center justify-center gap-7 overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(73,154,68,0.12),_transparent_55%),_radial-gradient(ellipse_at_bottom,_rgba(73,154,68,0.08),_transparent_60%)] bg-background",
        variant === "fixed"
          ? "fixed inset-0 z-[200] min-h-screen"
          : "relative w-full min-h-[60vh] rounded-2xl",
        className
      )}
      style={{ viewTransitionName: "growlab-shell" } as React.CSSProperties}
    >
      {/* Soft animated background blobs */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        style={{ animation: "growlab-glow 4.5s ease-in-out infinite" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/4 size-80 rounded-full bg-emerald-300/15 blur-3xl"
        style={{ animation: "growlab-glow 5.2s ease-in-out infinite reverse" }}
      />

      {/* Leaf mark */}
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className="absolute size-28 rounded-full bg-primary/15 blur-2xl"
          style={{ animation: "growlab-glow 2.6s ease-in-out infinite" }}
        />
        <svg
          viewBox="46 -1 32 32"
          className="relative size-16 text-primary"
          style={{
            animation: "growlab-breathe 2.6s ease-in-out infinite",
            transformOrigin: "62px 16px",
          }}
          aria-hidden
        >
          <path
            d="M52.3226 25.1066C52.3226 25.1066 50.8457 14.1362 58.6522 10.2679C66.4587 6.39973 73.1387 3.37594 74.2653 0C74.5473 7.73644 73.9131 19.7615 64.8417 24.052C55.7704 28.3424 52.8167 28.1304 50.5654 31.2261C51.3398 28.2023 53.4491 26.7955 57.6677 24.8263C61.888 22.8572 71.2415 16.6677 70.8192 7.31423C69.6927 11.5328 64.6998 20.2538 52.3226 25.1066Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Brand + cycling subtitle */}
      <div className="relative flex flex-col items-center gap-2 text-center">
        <p className="font-serif text-2xl tracking-tight text-foreground">
          Growlab
        </p>
        <p
          key={message}
          className="text-sm text-muted-foreground"
          style={{
            animation: "growlab-rise 320ms cubic-bezier(0.4, 0, 0.2, 1) both",
          }}
        >
          {message}…
        </p>
      </div>

      {/* Shimmer progress bar */}
      <div
        aria-hidden
        className="relative mt-1 h-[2px] w-44 overflow-hidden rounded-full bg-primary/15"
      >
        <span
          className="absolute inset-y-0 -left-1/2 w-1/2 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: "growlab-shimmer 1.6s linear infinite",
          }}
        />
      </div>
    </div>
  )
}
