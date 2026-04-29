'use client'

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LineChart as LineIcon } from 'lucide-react'

type Point = {
  week_starting: string
  ready_seedlings: number
}

const PRIMARY = '#499a44'

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string | number
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value ?? 0
  let dateLabel: string = String(label ?? '')
  try {
    dateLabel = new Date(label as string).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {}
  return (
    <div className="rounded-md border border-border/60 bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-sm">
      <div className="font-medium">{dateLabel}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
        <span
          className="size-2 rounded-full"
          style={{ background: PRIMARY }}
          aria-hidden
        />
        <span className="tabular-nums text-foreground">
          {Number(value).toLocaleString()}
        </span>
        <span>seedlings</span>
      </div>
    </div>
  )
}

/**
 * Measured chart container — provides exact pixel dimensions to Recharts after
 * the parent box has laid out, eliminating the "width(-1) and height(-1)"
 * warnings that ResponsiveContainer emits during the first measurement pass.
 */
function MeasuredChart({
  height,
  children,
}: {
  height: number
  children: (size: { width: number; height: number }) => React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0)
      if (w > 0) setWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ width: "100%", height }} className="min-w-0">
      {width > 0 ? children({ width, height }) : null}
    </div>
  )
}

export function ForecastChart({ data }: { data: Point[] }) {
  if (!data?.length) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <LineIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium text-foreground">
          Forecast not generated yet
        </div>
        <p className="max-w-xs text-xs text-muted-foreground">
          Run the forecasting agent to project ready seedlings across the next 90 days.
        </p>
      </div>
    )
  }

  return (
    <MeasuredChart height={260}>
      {({ width, height }) => (
        <AreaChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.32} />
              <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="week_starting"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(value: string) => {
              try {
                return new Date(value).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              } catch {
                return value
              }
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            content={<ChartTooltip />}
          />
          <Area
            type="monotone"
            dataKey="ready_seedlings"
            stroke={PRIMARY}
            strokeWidth={2}
            fill="url(#forecastGradient)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
          />
        </AreaChart>
      )}
    </MeasuredChart>
  )
}
