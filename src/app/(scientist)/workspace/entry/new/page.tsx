import { EntryWizard } from "@/components/entry/entry-wizard"

export default function NewEntryPage({ searchParams }: { searchParams: { batchId?: string } }) {
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto md:max-w-4xl pt-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Entry</h1>
        <p className="text-muted-foreground">Record observations and progress for a batch.</p>
      </div>

      <div className="mt-4">
        <EntryWizard initialBatchId={searchParams.batchId} />
      </div>
    </div>
  )
}
