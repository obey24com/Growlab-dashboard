import { TableSkeleton } from "@/components/loaders/page-skeletons"

export default function HistoryLoading() {
  return <TableSkeleton columns={4} rows={10} />
}
