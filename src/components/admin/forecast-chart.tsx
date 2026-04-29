'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Point = {
  week_starting: string
  ready_seedlings: number
}

export function ForecastChart({ data }: { data: Point[] }) {
  if (!data?.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
        No forecast data yet — generate one via the forecasting agent.
      </div>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="week_starting"
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
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(value) =>
              new Date(value).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            }
            formatter={(value) => [`${value ?? 0} seedlings`, 'Ready']}
          />
          <Area
            type="monotone"
            dataKey="ready_seedlings"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#forecastGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
