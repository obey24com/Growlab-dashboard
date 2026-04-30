import { TableSkeleton } from "@/components/loaders/page-skeletons"

export default function WorkspaceBatchesLoading() {
  return <TableSkeleton columns={4} rows={8} />
}
