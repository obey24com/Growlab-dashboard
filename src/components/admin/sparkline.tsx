'use client'

import * as React from "react"

type Tone = "primary" | "destructive" | "neutral"

const toneColor: Record<Tone, string> = {
  primary: "#499a44",
  destructive: "var(--destructive)",
  neutral: "var(--muted-foreground)",
}

/**
 * Pure-SVG sparkline. No layout/measurement dependency, no chart library.
 * Renders a smooth area path inside a viewBox so it scales fluidly to any
 * parent width while keeping the requested pixel height.
 */
export function Sparkline({
  data,
  tone = "primary",
  height = 32,
}: {
  data: number[]
  tone?: Tone
  height?: number
}) {
  const series = (data ?? []).filter((v) => Number.isFinite(v))

  if (series.length < 2) {
    return <div style={{ height }} className="w-full" aria-hidden />
  }

  const W = 100 // viewBox width — actual width comes from CSS
  const H = 100 // viewBox height — squashed by preserveAspectRatio="none"
  const padY = 6
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1

  const stepX = W / (series.length - 1)
  const points = series.map((v, i) => {
    const x = i * stepX
    const y = H - padY - ((v - min) / range) * (H - padY * 2)
    return [x, y] as const
  })

  // Smooth-ish path using monotone-cubic-like control points
  const linePath = points
    .map(([x, y], i) => {
      if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`
      const [px, py] = points[i - 1]
      const cx = (px + x) / 2
      return `C ${cx.toFixed(2)} ${py.toFixed(2)}, ${cx.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")

  const areaPath = `${linePath} L ${W.toFixed(2)} ${H.toFixed(2)} L 0 ${H.toFixed(2)} Z`

  const color = toneColor[tone]
  const gradId = React.useId()

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      className="block"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
