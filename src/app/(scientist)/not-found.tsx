import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export default function WorkspaceNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-serif text-2xl tracking-tight">Page not found</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          That route doesn’t exist in the workspace.
        </p>
      </div>
      <Button variant="default" nativeButton={false} render={<Link href="/workspace" />}>
        Back to workspace
      </Button>
    </div>
  )
}
