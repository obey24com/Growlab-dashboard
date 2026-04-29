import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import type { ReactNode } from "react"

export function Wireframe({
  title,
  phase,
  description,
  mockupDescription,
  mockup,
}: {
  title: string
  phase: string
  description: string
  mockupDescription: string
  mockup?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              Coming Soon
            </Badge>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
            {phase}
          </Badge>
        </div>
      </div>

      <Card className="border-dashed border-2 bg-muted/20 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Illustrative Mockup
          </CardTitle>
          <CardDescription>
            This screen is illustrative. {phase} build commences after Phase 1 sign-off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockup ? (
            <div className="border bg-background rounded-md p-4 md:p-6">{mockup}</div>
          ) : (
            <div className="aspect-[16/9] md:aspect-[21/9] w-full border bg-background rounded-md flex items-center justify-center p-8 text-center text-muted-foreground">
              <p className="max-w-md">{mockupDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
