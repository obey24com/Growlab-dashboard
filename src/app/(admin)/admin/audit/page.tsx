import { createClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function AuditLogPage() {
  const supabase = await createClient()

  // Fetch audit log
  const { data: auditLogs } = await supabase
    .from('demo.audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">Immutable record of all system changes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs?.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>{log.actor_email || 'System'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{log.entity_type.replace('demo.', '')}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                  {log.action === 'INSERT' ? 'Created new record' :
                   log.action === 'UPDATE' ? 'Modified fields' : 'Deleted record'}
                </TableCell>
              </TableRow>
            ))}
            {(!auditLogs || auditLogs.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
