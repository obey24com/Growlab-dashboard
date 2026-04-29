import { EntryWizard } from "@/components/entry/entry-wizard"

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>
}) {
  const { batchId } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Capture
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          New entry
        </h1>
        <p className="text-sm text-muted-foreground">
          Record observations, survival counts and photo evidence for an active batch.
        </p>
      </header>

      <EntryWizard initialBatchId={batchId} />
    </div>
  )
}
