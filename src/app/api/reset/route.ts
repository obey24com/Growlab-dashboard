import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runSeed } from '@/supabase/seed/seed'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  // Use admin client for destructive operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Validate session and admin role using normal SSR client
  const cookieStore = await cookies()
  const supabaseSession = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {}
      }
    }
  )

  const { data: { user } } = await supabaseSession.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('demo.user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    // 1. We must execute the truncate function in the database
    // The RPC needs to be created in the SQL migration, but we can also execute raw SQL 
    // or just delete rows if we have cascading deletes. We'll rely on the RLS bypassing
    // power of the service role key to delete from the root tables.
    
    // Instead of raw TRUNCATE, we can delete the top level data (varieties) which might cascade,
    // or we can truncate using an RPC. Let's assume demo_reset_tables RPC is created.
    const { error: resetErr } = await supabaseAdmin.rpc('demo_reset_tables')
    
    if (resetErr) {
      // Fallback: Delete all data sequentially
      const tables = [
        'forecasts', 'audit_log', 'permissions', 'user_profiles',
        'media', 'observations', 'jar_entries', 'stage_entries', 'batches',
        'observation_types', 'stages', 'varieties'
      ];
      for (const table of tables) {
        await supabaseAdmin.from(`demo.${table}`).delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      }
    }

    // 2. Clear storage buckets
    const buckets = ['demo-media-original', 'demo-media-thumbnail']
    for (const bucket of buckets) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list()
      if (files?.length) {
        await supabaseAdmin.storage.from(bucket).remove(files.map(f => f.name))
      }
    }

    // 3. Re-seed
    const summary = await runSeed(supabaseAdmin)

    return NextResponse.json({ success: true, ...summary })
  } catch (error: any) {
    console.error("Reset error", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
