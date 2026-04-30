export function bucketByDay(
  rows: { created_at: string | null }[] | null | undefined,
  days: number
) {
  const buckets = new Array(days).fill(0)
  if (!rows?.length) return buckets
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  for (const r of rows) {
    if (!r.created_at) continue
    const d = new Date(r.created_at)
    if (Number.isNaN(d.getTime())) continue
    d.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - start.getTime()) / 86_400_000)
    if (diff >= 0 && diff < days) buckets[diff] += 1
  }
  return buckets
}

export function cumulative(arr: number[]) {
  let acc = 0
  return arr.map((v) => (acc += v))
}

export type NameJoin =
  | { name?: string | null }
  | { name?: string | null }[]
  | null

export const joinName = (rel: NameJoin | undefined) =>
  Array.isArray(rel) ? rel[0]?.name ?? undefined : rel?.name ?? undefined
