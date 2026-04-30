import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Inbox, ArrowRight } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

const ACTIVITY_DOT: Record<string, string> = {
  INSERT: "bg-primary",
  UPDATE: "bg-blue-500",
  DELETE: "bg-destructive",
}

const ACTIVITY_LABEL: Record<string, string> = {
  INSERT: "created",
  UPDATE: "updated",
  DELETE: "removed",
}

export async function RecentActivity() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("audit_log")
    .select("id, action, entity_type, actor_email, created_at")
    .order("created_at", { ascending: false })
    .limit(7)

  const logs = data ?? []

  return (
    <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)] lg:col-span-3">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            Recent activity
          </CardTitle>
          <CardDescription className="text-xs">
            Latest events across the platform
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-10 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Quiet so far</p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              New events from the production floor will appear here.
            </p>
          </div>
        ) : (
          <ul className="-mx-2 flex flex-col">
            {logs.map((log) => (
              <li
                key={log.id}
                title={format(new Date(log.created_at), "PPpp")}
                className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                    ACTIVITY_DOT[log.action] ?? "bg-muted-foreground"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    <span className="capitalize">
                      {(log.entity_type as string).replace(/_/g, " ")}
                    </span>
                    <span className="ml-1 font-normal text-muted-foreground">
                      {ACTIVITY_LABEL[log.action] ?? (log.action as string).toLowerCase()}
                    </span>
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {log.actor_email || "System"} ·{" "}
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 border-t border-border/60 pt-3">
          <Link
            href="/admin/audit"
            className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            View full audit log
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
