export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const GROUP_ORDER = [
  "Germination",
  "Callus",
  "Multiplication",
  "Shoot",
  "Rooting",
  "Transfer",
  "Growing",
]

type StageRow = {
  id: string
  code: string
  name: string
  stage_group: string
  sequence_order: number
  expected_duration_days: number
  expected_yield_low: number | null
  expected_yield_high: number | null
  jar_type: string | null
  jar_ratio: number | null
}

export default async function StagesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("stages")
    .select(
      "id, code, name, stage_group, sequence_order, expected_duration_days, expected_yield_low, expected_yield_high, jar_type, jar_ratio"
    )
    .order("sequence_order", { ascending: true })

  const stages = (data ?? []) as StageRow[]

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    stages: stages.filter((s) => s.stage_group === group),
  })).filter((g) => g.stages.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Stages & Process</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          The 21-stage Growlab tissue culture flow, from Germination through Growing.
        </p>
      </div>

      {grouped.map(({ group, stages: groupStages }) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span>{group}</span>
              <Badge variant="outline" className="text-xs">
                {groupStages.length} {groupStages.length === 1 ? "stage" : "stages"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Sequence order {groupStages[0].sequence_order}
              {groupStages.length > 1 ? `–${groupStages[groupStages.length - 1].sequence_order}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table className="min-w-[680px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap">Code</TableHead>
                    <TableHead className="whitespace-nowrap">Stage</TableHead>
                    <TableHead className="w-[120px] whitespace-nowrap">Duration</TableHead>
                    <TableHead className="w-[160px] whitespace-nowrap">Expected Yield</TableHead>
                    <TableHead className="w-[120px] whitespace-nowrap">Jar Type</TableHead>
                    <TableHead className="w-[100px] whitespace-nowrap text-right">Jar Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupStages.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {stage.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{stage.name}</TableCell>
                      <TableCell>{stage.expected_duration_days} days</TableCell>
                      <TableCell>
                        {stage.expected_yield_low !== null && stage.expected_yield_high !== null
                          ? `${stage.expected_yield_low}× – ${stage.expected_yield_high}×`
                          : "—"}
                      </TableCell>
                      <TableCell>{stage.jar_type ?? "—"}</TableCell>
                      <TableCell className="text-right">×{stage.jar_ratio ?? 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {stages.length === 0 && (
        <div className="p-8 text-center border rounded-md border-dashed text-muted-foreground">
          No stages configured yet. Run the seed to populate the 21 default stages.
        </div>
      )}
    </div>
  )
}
