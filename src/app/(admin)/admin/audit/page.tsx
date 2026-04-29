import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type AuditRow = {
  id: string
  created_at: string
  actor_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  before_state: Record<string, unknown> | null
  after_state: Record<string, unknown> | null
}

function diffSummary(action: string, before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  if (action === 'INSERT') return 'Created new record'
  if (action === 'DELETE') return 'Deleted record'
  if (!before || !after) return 'Modified fields'
  const changedKeys = Object.keys(after).filter(
    (k) => JSON.stringify(after[k]) !== JSON.stringify(before[k])
  )
  if (!changedKeys.length) return 'Modified fields'
  const preview = changedKeys.slice(0, 3).join(', ')
  return changedKeys.length > 3
    ? `Modified ${preview}, +${changedKeys.length - 3} more`
    : `Modified ${preview}`
}

export default async function AuditLogPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('audit_log')
    .select('id, created_at, actor_email, action, entity_type, entity_id, before_state, after_state')
    .order('created_at', { ascending: false })
    .limit(100)

  const auditLogs = (data ?? []) as AuditRow[]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">Immutable record of all system changes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground bg-muted/40 border-b">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-3">Actor</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-2">Entity</div>
          <div className="col-span-2">Details</div>
        </div>

        <ul className="divide-y">
          {auditLogs.map((log) => (
            <li key={log.id}>
              <details className="group">
                <summary className="grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer hover:bg-muted/30 list-none [&::-webkit-details-marker]:hidden">
                  <div className="col-span-3 whitespace-nowrap text-sm">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                  <div className="col-span-3 text-sm">{log.actor_email || 'System'}</div>
                  <div className="col-span-2">
                    <Badge
                      variant="outline"
                      className={
                        log.action === 'INSERT'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : log.action === 'UPDATE'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }
                    >
                      {log.action}
                    </Badge>
                  </div>
                  <div className="col-span-2 capitalize text-sm">
                    {log.entity_type.replace(/_/g, ' ')}
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground truncate">
                    {diffSummary(log.action, log.before_state, log.after_state)}
                  </div>
                </summary>

                <div className="px-4 pb-4 pt-1 grid gap-3 md:grid-cols-2 bg-muted/20 border-t">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Before
                    </div>
                    <pre className="text-xs bg-background border rounded-md p-3 overflow-auto max-h-64 font-mono">
                      {log.before_state ? JSON.stringify(log.before_state, null, 2) : '—'}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      After
                    </div>
                    <pre className="text-xs bg-background border rounded-md p-3 overflow-auto max-h-64 font-mono">
                      {log.after_state ? JSON.stringify(log.after_state, null, 2) : '—'}
                    </pre>
                  </div>
                </div>
              </details>
            </li>
          ))}
          {auditLogs.length === 0 && (
            <li className="p-8 text-center text-muted-foreground">No audit logs found.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
