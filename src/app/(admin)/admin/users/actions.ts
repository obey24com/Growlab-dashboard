'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

const ORG_ID = '00000000-0000-0000-0000-000000000001'

const ALLOWED_ROLES = [
  'admin',
  'scientist',
  'qc_lead',
  'production_manager',
  'viewer',
] as const
type Role = (typeof ALLOWED_ROLES)[number]

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
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return { userId: user.id }
}

export type CreateUserInput = {
  email: string
  fullName: string
  role: Role
  password: string
  displayName?: string
}

export async function createUserAction(
  input: CreateUserInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdmin()

    const email = input.email.trim().toLowerCase()
    const fullName = input.fullName.trim()
    const role = input.role
    const password = input.password

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return { ok: false, error: 'Enter a valid email address.' }
    }
    if (!fullName) return { ok: false, error: 'Full name is required.' }
    if (!ALLOWED_ROLES.includes(role)) {
      return { ok: false, error: 'Pick a valid role.' }
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' }
    }

    const admin = createAdminClient()

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    let userId: string | undefined = created?.user?.id
    const alreadyExists =
      createErr &&
      ((createErr as { code?: string }).code === 'email_exists' ||
        /already (exists|been registered)/i.test(createErr.message))

    if (createErr && !alreadyExists) {
      return { ok: false, error: createErr.message }
    }

    if (!userId) {
      const { data: existing } = await admin.auth.admin.listUsers()
      const match = existing?.users.find((u) => u.email === email)
      if (!match) {
        return { ok: false, error: 'Could not resolve user after creation.' }
      }
      userId = match.id
    }

    const display = (input.displayName?.trim() || fullName.split(' ')[0]) ?? fullName

    const { error: profileErr } = await admin.from('user_profiles').upsert({
      id: userId,
      org_id: ORG_ID,
      email,
      full_name: fullName,
      display_name: display,
      role,
      is_active: true,
      is_demo: true,
    })

    if (profileErr) {
      return { ok: false, error: profileErr.message }
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin')
    return { ok: true, id: userId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return { ok: false, error: message }
  }
}
