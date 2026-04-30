'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createBatchAction } from './actions'

export type Variety = { id: string; name: string; code: string }
export type Stage = { id: string; name: string; code: string; sequence_order: number }

function suggestBatchCode(prefix = 'B') {
  const d = new Date()
  const yyyy = d.getFullYear()
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `${prefix}-${yyyy}-${seq}`
}

export function CreateBatchDialog({
  varieties,
  stages,
}: {
  varieties: Variety[]
  stages: Stage[]
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const defaultVariety = varieties[0]?.id ?? ''
  const defaultStage = stages[0]?.id ?? ''

  const [batchCode, setBatchCode] = React.useState(suggestBatchCode())
  const [varietyId, setVarietyId] = React.useState(defaultVariety)
  const [stageId, setStageId] = React.useState(defaultStage)
  const [initialJars, setInitialJars] = React.useState('100')
  const [notes, setNotes] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setBatchCode(suggestBatchCode())
      setVarietyId(defaultVariety)
      setStageId(defaultStage)
      setInitialJars('100')
      setNotes('')
      setError(null)
    }
  }, [open, defaultVariety, defaultStage])

  const onSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const res = await createBatchAction({
      batchCode,
      varietyId,
      startingStageId: stageId,
      initialJarCount: Number(initialJars),
      notes,
    })
    if (!res.ok) {
      setError(res.error)
      setSubmitting(false)
      return
    }
    toast.success('Batch created', {
      description: `${batchCode} is now active.`,
    })
    setSubmitting(false)
    setOpen(false)
    router.refresh()
  }

  const disabled = submitting || varieties.length === 0 || stages.length === 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <Plus className="size-3.5" />
            Create Batch
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create batch</DialogTitle>
          <DialogDescription>
            Register a new production batch. It becomes available immediately for stage entries.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="batchCode" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Batch code
            </Label>
            <div className="flex gap-2">
              <Input
                id="batchCode"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                placeholder="B-2026-001"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBatchCode(suggestBatchCode())}
              >
                Suggest
              </Button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Variety
            </Label>
            <Select value={varietyId} onValueChange={(v) => setVarietyId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a variety" />
              </SelectTrigger>
              <SelectContent>
                {varieties.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                    <span className="ml-1 text-xs text-muted-foreground">
                      · {v.code}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Starting stage
              </Label>
              <Select value={stageId} onValueChange={(v) => setStageId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {s.code}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="initialJars" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Initial jars
              </Label>
              <Input
                id="initialJars"
                type="number"
                min={1}
                inputMode="numeric"
                value={initialJars}
                onChange={(e) => setInitialJars(e.target.value)}
                className="tabular-nums"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notes <span className="font-normal normal-case text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. mother tree #14, callus from harvest A"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={submitting} />}
          >
            Cancel
          </DialogClose>
          <Button onClick={onSubmit} disabled={disabled}>
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                Create batch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
