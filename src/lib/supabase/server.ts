import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function readEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.length === 0) {
    throw new Error(
      `Missing environment variable ${name}. Set it in your Vercel project (Settings → Environment Variables) for Production, Preview, and Development.`
    )
  }
  return v
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    readEnv('NEXT_PUBLIC_SUPABASE_URL'),
    readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      db: { schema: 'demo' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
