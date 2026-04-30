'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoCapture, CapturedPhoto } from '@/components/media/photo-capture'
import {
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Layers,
  ListChecks,
  Boxes,
  Camera,
  ClipboardCheck,
  Loader2,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEntryWizardStore } from '@/lib/entry-wizard-store'

type BatchOption = {
  id: string
  batch_code: string
  current_jar_count: number | null
  variety_name: string
  stage_name: string
  stage_id: string
  in_progress_entry_id: string | null
  in_progress_jar_count: number | null
}

const STEPS = [
  { id: 1, key: 'batch', label: 'Batch', icon: Layers },
  { id: 2, key: 'mode', label: 'Method', icon: ListChecks },
  { id: 3, key: 'photos', label: 'Photos', icon: Camera },
  { id: 4, key: 'review', label: 'Review', icon: ClipboardCheck },
] as const

export function EntryWizard({ initialBatchId }: { initialBatchId?: string }) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [batches, setBatches] = useState<BatchOption[]>([])
  const [batchesLoading, setBatchesLoading] = useState(true)
  const [batchSearch, setBatchSearch] = useState('')

  const [batchId, setBatchId] = useState(initialBatchId || '')
  const [mode, setMode] = useState<'aggregate' | 'per_jar'>('aggregate')
  const [survivalCount, setSurvivalCount] = useState('')
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])

  const totalSteps = STEPS.length
  const selectedBatch = batches.find((b) => b.id === batchId)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('batches')
        .select(
          `id, batch_code, current_jar_count, current_stage_id,
           variety:varieties!variety_id ( name ),
           stage:stages!current_stage_id ( id, name ),
           stage_entries:stage_entries!batch_id ( id, status, jar_count, stage_id )`
        )
        .eq('status', 'active')
        .order('started_at', { ascending: false })

      if (cancelled) return
      if (error) {
        console.error('Failed to load batches', error)
        setBatches([])
        setBatchesLoading(false)
        return
      }

      type Row = {
        id: string
        batch_code: string
        current_jar_count: number | null
        current_stage_id: string
        variety: { name?: string | null } | { name?: string | null }[] | null
        stage: { id?: string; name?: string | null } | { id?: string; name?: string | null }[] | null
        stage_entries:
          | Array<{ id: string; status: string; jar_count: number | null; stage_id: string }>
          | null
      }

      const options: BatchOption[] = (data as Row[] | null ?? []).map((b) => {
        const variety = Array.isArray(b.variety) ? b.variety[0] : b.variety
        const stage = Array.isArray(b.stage) ? b.stage[0] : b.stage
        const inProgress = (b.stage_entries ?? []).find(
          (e) => e.status === 'in_progress' && e.stage_id === b.current_stage_id
        )
        return {
          id: b.id,
          batch_code: b.batch_code,
          current_jar_count: b.current_jar_count,
          variety_name: variety?.name ?? 'Unknown variety',
          stage_name: stage?.name ?? 'Unknown stage',
          stage_id: b.current_stage_id,
          in_progress_entry_id: inProgress?.id ?? null,
          in_progress_jar_count: inProgress?.jar_count ?? null,
        }
      })
      setBatches(options)
      setBatchesLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const filteredBatches = batches.filter((b) => {
    if (!batchSearch.trim()) return true
    const q = batchSearch.toLowerCase()
    return (
      b.batch_code.toLowerCase().includes(q) ||
      b.variety_name.toLowerCase().includes(q) ||
      b.stage_name.toLowerCase().includes(q)
    )
  })

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  // Bridge wizard state to the mobile bottom-nav so its FAB drives the flow.
  const registerWizard = useEntryWizardStore((s) => s.register)
  const resetWizard = useEntryWizardStore((s) => s.reset)
  React.useEffect(() => {
    if (step === 5) {
      // Success state — let the FAB go back to leaf-idle.
      resetWizard()
      return
    }
    const canAdvance =
      (step === 1 && !!batchId) ||
      (step === 2 && mode !== 'per_jar' && !!survivalCount) ||
      step === 3 ||
      (step === 4 && !isSubmitting)
    const advance = step === 4 ? handleSubmit : nextStep
    registerWizard({ step, canAdvance, isSubmitting, advance, totalSteps })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, batchId, mode, survivalCount, isSubmitting])

  React.useEffect(() => () => resetWizard(), [resetWizard])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (!selectedBatch) throw new Error('Select a batch first.')
      const survival = Number(survivalCount)
      if (Number.isNaN(survival) || survival < 0) {
        throw new Error('Enter a valid survival count.')
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in.')

      let stageEntryId = selectedBatch.in_progress_entry_id
      const jarCount =
        selectedBatch.in_progress_jar_count ??
        selectedBatch.current_jar_count ??
        survival

      if (!stageEntryId) {
        const { data: created, error: createErr } = await supabase
          .from('stage_entries')
          .insert({
            org_id: '00000000-0000-0000-0000-000000000001',
            batch_id: selectedBatch.id,
            stage_id: selectedBatch.stage_id,
            entry_mode: mode,
            status: 'in_progress',
            jar_count: jarCount,
            survival_count: survival,
            started_at: new Date().toISOString(),
            operator_id: user.id,
          })
          .select('id')
          .single()
        if (createErr) throw createErr
        stageEntryId = created.id
      } else {
        const { error: updateErr } = await supabase
          .from('stage_entries')
          .update({
            survival_count: survival,
            entry_mode: mode,
          })
          .eq('id', stageEntryId)
        if (updateErr) throw updateErr
      }

      const { error: obsErr } = await supabase.from('observations').insert({
        org_id: '00000000-0000-0000-0000-000000000001',
        stage_entry_id: stageEntryId,
        category: 'count',
        data: { count: survival, total: jarCount },
        created_by: user.id,
      })
      if (obsErr) throw obsErr

      for (const photo of photos) {
        const formData = new FormData()
        formData.append('original', photo.file, photo.file.name)
        formData.append('thumbnail', photo.thumbnailFile, photo.file.name)
        formData.append('batchCode', selectedBatch.batch_code)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const payload = await res.json()
        if (!res.ok || !payload.success) {
          throw new Error(payload.error || 'Photo upload failed')
        }

        const { error: mediaErr } = await supabase.from('media').insert({
          org_id: '00000000-0000-0000-0000-000000000001',
          stage_entry_id: stageEntryId,
          media_type: 'photo',
          storage_path_original: payload.storage_path_original,
          storage_path_thumbnail: payload.storage_path_thumbnail,
          file_name: payload.file_name,
          mime_type: payload.mime_type,
          file_size_bytes: payload.file_size_bytes,
          uploaded_by: user.id,
        })
        if (mediaErr) throw mediaErr
      }

      setStep(5)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----- Success screen -----
  if (step === 5) {
    return (
      <Card className="mx-auto w-full max-w-xl rounded-2xl border-border/60 shadow-sm animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-3xl font-medium text-foreground">Entry saved</h2>
            <p className="text-sm text-muted-foreground">
              Your stage entry has been successfully recorded.
            </p>
          </div>
          <div className="mt-2 grid w-full grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep(1)
                setBatchId('')
                setSurvivalCount('')
                setPhotos([])
              }}
            >
              Add another
            </Button>
            <Button onClick={() => router.push('/workspace')}>Back to Today</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ----- Wizard -----
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Step indicator */}
      <ol className="mb-8 flex items-center gap-1.5">
        {STEPS.map((s, i) => {
          const status =
            step > s.id ? 'done' : step === s.id ? 'current' : 'todo'
          const Icon = s.icon
          return (
            <React.Fragment key={s.id}>
              <li className="flex flex-1 flex-col items-start gap-1">
                <div className="flex w-full items-center gap-2">
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border text-[10.5px] font-semibold transition-all duration-200',
                      status === 'done' &&
                        'border-primary bg-primary text-primary-foreground',
                      status === 'current' &&
                        'border-primary bg-primary/10 text-primary',
                      status === 'todo' &&
                        'border-border/70 bg-card text-muted-foreground'
                    )}
                  >
                    {status === 'done' ? <CheckCircle2 className="size-3.5" /> : s.id}
                  </span>
                  <span
                    className={cn(
                      'hidden text-[12px] font-medium transition-colors duration-200 md:inline',
                      status === 'todo' ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                <div
                  className={cn(
                    'h-0.5 w-full rounded-full bg-muted transition-colors duration-300',
                    status !== 'todo' && 'bg-primary/70'
                  )}
                />
              </li>
              {i < STEPS.length - 1 && (
                <span className="hidden md:inline-block size-1 self-end mb-1 rounded-full bg-border" aria-hidden />
              )}
            </React.Fragment>
          )
        })}
      </ol>

      {/* ---- Step 1: select batch ---- */}
      {step === 1 && (
        <Card className="rounded-2xl border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-medium tracking-tight">
                Select a batch
              </h2>
              <p className="text-sm text-muted-foreground">
                Pick the active batch you&apos;re recording data for.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                placeholder="Search by code, variety, or stage…"
                className="h-10 pl-9"
              />
            </div>

            <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {batchesLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[88px] animate-pulse rounded-xl border border-border/60 bg-muted/40"
                  />
                ))}

              {!batchesLoading &&
                filteredBatches.map((b) => {
                  const selected = batchId === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBatchId(b.id)}
                      className={cn(
                        'group/batch flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-all duration-150',
                        selected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border/60 hover:border-primary/50 hover:shadow-sm'
                      )}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="font-mono text-sm font-semibold text-foreground">
                          {b.batch_code}
                        </div>
                        {b.in_progress_entry_id ? (
                          <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            In progress
                          </span>
                        ) : null}
                        {selected && (
                          <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {b.variety_name}
                        </span>
                        <span className="mx-1.5 text-muted-foreground/50">·</span>
                        {b.stage_name}
                      </div>
                      <div className="mt-auto flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="tabular-nums">
                          {b.current_jar_count ?? '—'} jars
                        </span>
                      </div>
                    </button>
                  )
                })}

              {!batchesLoading && filteredBatches.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No active batches match your search.
                </div>
              )}
            </div>

            <WizardFooter
              onBack={null}
              onNext={nextStep}
              nextDisabled={!batchId}
              nextLabel="Continue"
            />
          </CardContent>
        </Card>
      )}

      {/* ---- Step 2: entry mode + survival count ---- */}
      {step === 2 && (
        <Card className="rounded-2xl border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-medium tracking-tight">
                How are you recording?
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose the entry method, then enter the result.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'aggregate',
                    title: 'Aggregate',
                    desc: 'Count total surviving jars in one number.',
                    icon: Layers,
                  },
                  {
                    id: 'per_jar',
                    title: 'Per-jar',
                    desc: 'Record status for each individual jar.',
                    icon: Boxes,
                  },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon
                const active = mode === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={cn(
                      'group flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-all duration-150',
                      active
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border/60 hover:border-primary/50 hover:shadow-sm'
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {opt.title}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {mode === 'aggregate' ? (
              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4">
                <Label htmlFor="survival" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Survival count
                </Label>
                <div className="flex items-baseline gap-3">
                  <Input
                    id="survival"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={survivalCount}
                    onChange={(e) => setSurvivalCount(e.target.value)}
                    className="h-12 max-w-[140px] font-serif text-2xl tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">
                    of{' '}
                    <span className="font-medium text-foreground">
                      {selectedBatch?.current_jar_count ?? '—'}
                    </span>{' '}
                    initial jars
                  </span>
                </div>
                {Number(survivalCount) > 0 && selectedBatch?.current_jar_count ? (
                  <p className="text-[11px] text-muted-foreground">
                    Yield ≈{' '}
                    <span className="font-medium text-primary tabular-nums">
                      {(
                        (Number(survivalCount) /
                          (selectedBatch.current_jar_count || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Per-jar grid arrives in a future iteration. For the demo, switch
                to <span className="font-medium text-foreground">Aggregate</span>.
              </div>
            )}

            <WizardFooter
              onBack={prevStep}
              onNext={nextStep}
              nextDisabled={mode === 'per_jar' || !survivalCount}
              nextLabel="Continue"
            />
          </CardContent>
        </Card>
      )}

      {/* ---- Step 3: photos ---- */}
      {step === 3 && (
        <Card className="rounded-2xl border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-medium tracking-tight">
                Add photo evidence
              </h2>
              <p className="text-sm text-muted-foreground">
                Optional. Photos help with audit trails and downstream analysis.
              </p>
            </div>

            <PhotoCapture onPhotosChange={setPhotos} />

            <WizardFooter
              onBack={prevStep}
              onNext={nextStep}
              nextLabel={photos.length ? 'Continue' : 'Skip for now'}
            />
          </CardContent>
        </Card>
      )}

      {/* ---- Step 4: review ---- */}
      {step === 4 && (
        <Card className="rounded-2xl border-border/60 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-medium tracking-tight">
                Review &amp; submit
              </h2>
              <p className="text-sm text-muted-foreground">
                Verify the details below before saving.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
              <Field label="Batch" value={selectedBatch?.batch_code ?? '—'} mono />
              <Field label="Variety" value={selectedBatch?.variety_name ?? '—'} />
              <Field label="Stage" value={selectedBatch?.stage_name ?? '—'} />
              <Field
                label="Mode"
                value={mode === 'aggregate' ? 'Aggregate' : 'Per-jar'}
              />
              <Field
                label="Survival"
                value={`${survivalCount || '0'} / ${
                  selectedBatch?.current_jar_count ?? '—'
                }`}
                accent
              />
              <Field
                label="Photos"
                value={`${photos.length} attached`}
              />
            </dl>

            {submitError && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <WizardFooter
              onBack={prevStep}
              onNext={handleSubmit}
              nextLabel={
                isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Submit entry
                    <ChevronRight className="size-3.5" />
                  </>
                )
              }
              nextDisabled={isSubmitting}
              backDisabled={isSubmitting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  accent,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          'text-sm font-medium text-foreground',
          mono && 'font-mono',
          accent && 'text-primary'
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function WizardFooter({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  backDisabled,
}: {
  onBack: (() => void) | null
  onNext: () => void
  nextLabel: React.ReactNode
  nextDisabled?: boolean
  backDisabled?: boolean
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} disabled={backDisabled}>
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
      ) : (
        <span />
      )}
      {/* On mobile the bottom-nav FAB drives "Next/Submit", so the in-card */}
      {/* primary button is hidden to avoid being covered by the nav bar. */}
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        className="hidden md:inline-flex"
      >
        {nextLabel}
      </Button>
    </div>
  )
}
