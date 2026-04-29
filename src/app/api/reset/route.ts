import { NextResponse } from 'next/server'
import { runSeed } from '@/supabase/seed/seed'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabaseAdmin = createAdminClient()

  // Validate session and admin role using normal SSR client (demo schema)
  const cookieStore = await cookies()
  const supabaseSession = createServerClient(
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
  } = await supabaseSession.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    // 1. Truncate all demo tables via the stored procedure
    const { error: resetErr } = await supabaseAdmin.rpc('demo_reset_tables')

    if (resetErr) {
      // Fallback: delete from each table sequentially.
      const tables = [
        'forecasts',
        'audit_log',
        'permissions',
        'user_profiles',
        'media',
        'observations',
        'jar_entries',
        'stage_entries',
        'batches',
        'observation_types',
        'stages',
        'varieties',
      ] as const
      for (const table of tables) {
        await supabaseAdmin
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    // 2. Clear storage buckets if they exist
    const buckets = ['demo-media-original', 'demo-media-thumbnail']
    for (const bucket of buckets) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list()
      if (files?.length) {
        await supabaseAdmin.storage.from(bucket).remove(files.map((f) => f.name))
      }
    }

    // 3. Re-seed
    const summary = await runSeed(supabaseAdmin)

    return NextResponse.json({ success: true, ...summary })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Reset error', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
