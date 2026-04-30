'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

const ORG_ID = '00000000-0000-0000-0000-000000000001'

async function requireAdmin() {
  const cookieStore = await cookies()
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'demo' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  const {
    data: { user },
  } = await supa.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const { data: profile } = await supa
    .from('user_profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return { userId: user.id, email: profile.email as string }
}

export type CreateBatchInput = {
  batchCode: string
  varietyId: string
  startingStageId: string
  initialJarCount: number
  notes?: string
}

export async function createBatchAction(
  input: CreateBatchInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { userId } = await requireAdmin()

    const code = input.batchCode.trim()
    const initial = Math.floor(Number(input.initialJarCount))
    if (!code) return { ok: false, error: 'Batch code is required.' }
    if (!input.varietyId) return { ok: false, error: 'Pick a variety.' }
    if (!input.startingStageId) return { ok: false, error: 'Pick a starting stage.' }
    if (!Number.isFinite(initial) || initial < 1) {
      return { ok: false, error: 'Initial jar count must be at least 1.' }
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('batches')
      .insert({
        org_id: ORG_ID,
        batch_code: code,
        variety_id: input.varietyId,
        current_stage_id: input.startingStageId,
        status: 'active',
        initial_jar_count: initial,
        current_jar_count: initial,
        started_at: new Date().toISOString(),
        notes: input.notes?.trim() || null,
        created_by: userId,
      })
      .select('id')
      .single()

    if (error) {
      const msg = /duplicate|unique/i.test(error.message)
        ? `A batch with code "${code}" already exists.`
        : error.message
      return { ok: false, error: msg }
    }

    revalidatePath('/admin/batches')
    revalidatePath('/admin')
    return { ok: true, id: data.id as string }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return { ok: false, error: message }
  }
}
