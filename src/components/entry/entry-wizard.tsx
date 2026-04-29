'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoCapture, CapturedPhoto } from '@/components/media/photo-capture'
import { CheckCircle2, ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export function EntryWizard({ initialBatchId }: { initialBatchId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [batches, setBatches] = useState<BatchOption[]>([])
  const [batchesLoading, setBatchesLoading] = useState(true)

  const [batchId, setBatchId] = useState(initialBatchId || '')
  const [mode, setMode] = useState<'aggregate' | 'per_jar'>('aggregate')
  const [survivalCount, setSurvivalCount] = useState('')
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])

  const totalSteps = 4
  const selectedBatch = batches.find((b) => b.id === batchId)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          id,
          batch_code,
          current_jar_count,
          current_stage_id,
          variety:varieties!variety_id ( name ),
          stage:stages!current_stage_id ( id, name ),
          stage_entries:stage_entries!batch_id ( id, status, jar_count, stage_id )
        `)
        .eq('status', 'active')
        .order('started_at', { ascending: false })

      if (cancelled) return
      if (error) {
        console.error('Failed to load batches', error)
        setBatches([])
        setBatchesLoading(false)
        return
      }

      const options: BatchOption[] = (data ?? []).map((b: any) => {
        const inProgress = (b.stage_entries ?? []).find(
          (e: any) => e.status === 'in_progress' && e.stage_id === b.current_stage_id
        )
        return {
          id: b.id,
          batch_code: b.batch_code,
          current_jar_count: b.current_jar_count,
          variety_name: b.variety?.name ?? 'Unknown variety',
          stage_name: b.stage?.name ?? 'Unknown stage',
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

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

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

      // 1. Locate or create the in-progress stage entry for this batch's current stage.
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

      // 2. Record a survival_count observation.
      const { error: obsErr } = await supabase.from('observations').insert({
        org_id: '00000000-0000-0000-0000-000000000001',
        stage_entry_id: stageEntryId,
        category: 'count',
        data: { count: survival, total: jarCount },
        created_by: user.id,
      })
      if (obsErr) throw obsErr

      // 3. Upload photos via /api/upload, then create media rows.
      for (const photo of photos) {
        const formData = new FormData()
        formData.append('original', photo.file, photo.file.name)
        formData.append('thumbnail', photo.thumbnailFile, photo.file.name)
        formData.append('batchCode', selectedBatch.batch_code)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
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

  return (
    <div className="w-full max-w-lg mx-auto">
      {step < 5 && (
        <div className="mb-6 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Batch</CardTitle>
            <CardDescription>Which batch are you recording data for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Active Batches</Label>
              <Select
                value={batchId}
                onValueChange={(value) => setBatchId(value ?? '')}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={batchesLoading ? 'Loading…' : 'Select a batch...'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batch_code} ({b.variety_name})
                    </SelectItem>
                  ))}
                  {!batchesLoading && batches.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No active batches
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedBatch && (
              <div className="bg-muted p-4 rounded-md space-y-1 text-sm">
                <p className="font-medium">
                  Current stage:{' '}
                  <span className="text-primary font-semibold">
                    {selectedBatch.stage_name}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Jar count: {selectedBatch.current_jar_count ?? '—'}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={nextStep} disabled={!batchId}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Entry Mode</CardTitle>
            <CardDescription>How do you want to record data?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer text-center ${
                  mode === 'aggregate'
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setMode('aggregate')}
              >
                <div className="font-semibold mb-1">Aggregate</div>
                <div className="text-xs text-muted-foreground">Count total survivors only</div>
              </div>
              <div
                className={`border rounded-lg p-4 cursor-pointer text-center ${
                  mode === 'per_jar'
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setMode('per_jar')}
              >
                <div className="font-semibold mb-1">Per-Jar</div>
                <div className="text-xs text-muted-foreground">Record status for each jar</div>
              </div>
            </div>

            {mode === 'aggregate' && (
              <div className="space-y-2 mt-6">
                <Label>Survival Count</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Number of surviving jars"
                  value={survivalCount}
                  onChange={(e) => setSurvivalCount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Out of {selectedBatch?.current_jar_count ?? '—'} initial jars
                </p>
              </div>
            )}

            {mode === 'per_jar' && (
              <div className="p-4 bg-muted rounded-md text-sm text-center mt-6">
                Per-jar grid coming in a future iteration. Pick Aggregate for the demo.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={mode === 'per_jar' || !survivalCount}
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Photo Evidence</CardTitle>
            <CardDescription>Capture photos for this entry.</CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoCapture onPhotosChange={setPhotos} />
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button variant="ghost" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={nextStep}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Verify your data before submitting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch:</span>
                <span className="font-medium">
                  {selectedBatch?.batch_code ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stage:</span>
                <span className="font-medium">{selectedBatch?.stage_name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{mode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Survival:</span>
                <span className="font-medium text-primary">
                  {survivalCount} / {selectedBatch?.current_jar_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Photos:</span>
                <span className="font-medium">{photos.length} attached</span>
              </div>
            </div>

            {submitError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={prevStep} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </div>
              ) : (
                'Submit Entry'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 5 && (
        <Card className="text-center py-6">
          <CardContent className="flex flex-col items-center pt-6 space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Entry Saved</h2>
              <p className="text-muted-foreground">
                Your stage entry has been successfully recorded.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 mt-4">
            <Button className="w-full" onClick={() => router.push('/workspace')}>
              Back to Today
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep(1)
                setBatchId('')
                setSurvivalCount('')
                setPhotos([])
              }}
            >
              Add Another Entry
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
