import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'demo' },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') || path.startsWith('/workspace')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Fast path: read role from JWT app_metadata, populated by the
    // `custom_access_token_hook` Supabase auth hook (see README §Auth).
    // Falls back to a DB query for tokens issued before the hook was
    // installed, so existing sessions keep working until they refresh.
    let role = (user.app_metadata?.role as string | undefined) ?? null

    if (!role) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        const url = new URL('/', request.url)
        url.searchParams.set('error', 'profile_lookup_failed')
        return NextResponse.redirect(url)
      }

      role = profile?.role ?? null
    }

    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/workspace', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/workspace/:path*'],
}
