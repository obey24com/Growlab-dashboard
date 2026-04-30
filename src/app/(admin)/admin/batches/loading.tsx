import { TableSkeleton } from "@/components/loaders/page-skeletons"

export default function BatchesLoading() {
  return <TableSkeleton columns={6} rows={10} />
}
