import { TableSkeleton } from "@/components/loaders/page-skeletons"

export default function AuditLoading() {
  return <TableSkeleton columns={5} rows={10} />
}
