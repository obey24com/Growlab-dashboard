'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoCapture, CapturedPhoto } from '@/components/media/photo-capture'
import { CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function EntryWizard({ initialBatchId }: { initialBatchId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [batchId, setBatchId] = useState(initialBatchId || '')
  const [mode, setMode] = useState('aggregate')
  const [survivalCount, setSurvivalCount] = useState('')
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])

  const totalSteps = 4

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // In a real app, we would upload the photos to Supabase Storage first,
    // get the paths, then create the stage_entry, observations, and media records.
    
    // For this demo mock submission delay:
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(5) // Success step
    }, 1500)
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
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a batch..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo-batch-1">B-2024-001 (Multipuno)</SelectItem>
                  <SelectItem value="demo-batch-2">B-2025-009 (Multipuno)</SelectItem>
                  <SelectItem value="demo-batch-3">B-2026-014 (Multipuno)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {batchId && (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Moving from: <span className="font-normal text-muted-foreground">Callus Induction</span></p>
                <p className="text-sm font-medium mt-1">To stage: <span className="text-primary font-bold">Multiplication 1</span></p>
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
                className={`border rounded-lg p-4 cursor-pointer text-center ${mode === 'aggregate' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setMode('aggregate')}
              >
                <div className="font-semibold mb-1">Aggregate</div>
                <div className="text-xs text-muted-foreground">Count total survivors only</div>
              </div>
              <div 
                className={`border rounded-lg p-4 cursor-pointer text-center ${mode === 'per_jar' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/50'}`}
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
                <p className="text-xs text-muted-foreground">Out of 100 initial jars</p>
              </div>
            )}
            
            {mode === 'per_jar' && (
              <div className="p-4 bg-muted rounded-md text-sm text-center mt-6">
                Per-jar grid would render here (100 checkboxes). For this demo, please select Aggregate.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={nextStep} disabled={mode === 'aggregate' && !survivalCount}>
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
                <span className="font-medium">B-2026-014</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{mode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Survival:</span>
                <span className="font-medium text-primary">{survivalCount} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Photos:</span>
                <span className="font-medium">{photos.length} attached</span>
              </div>
            </div>
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
              ) : "Submit Entry"}
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
              <p className="text-muted-foreground">Your stage entry has been successfully recorded.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 mt-4">
            <Button className="w-full" onClick={() => router.push('/workspace')}>
              Back to Today
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              setStep(1)
              setBatchId('')
              setSurvivalCount('')
              setPhotos([])
            }}>
              Add Another Entry
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
