import { TableSkeleton } from "@/components/loaders/page-skeletons"

export default function UsersLoading() {
  return <TableSkeleton columns={4} rows={8} />
}
