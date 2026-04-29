'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Sparkles, Activity, Leaf, ShieldCheck } from 'lucide-react'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [persona, setPersona] = useState('admin')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const reason = searchParams.get('error')
    if (reason === 'profile_lookup_failed') {
      setError(
        'We could not load your profile. The demo schema may not be exposed yet — see README §Setup.'
      )
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const email =
      persona === 'admin' ? 'admin@growlab.demo' : 'scientist@growlab.demo'

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (data.session) {
        const dest = persona === 'admin' ? '/admin' : '/workspace'
        // Crossfade out the login panel before navigating
        setIsExiting(true)
        setTimeout(() => {
          router.push(dest)
          router.refresh()
        }, 220)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div
      data-exiting={isExiting ? "true" : undefined}
      className="min-h-screen w-full bg-background transition-opacity duration-300 ease-out data-[exiting=true]:opacity-0 lg:grid lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.2fr_1fr]"
    >
      {/* ============== HERO PANEL ============== */}
      <section className="relative isolate overflow-hidden hidden lg:flex flex-col justify-between p-10 xl:p-14">
        {/* Background image */}
        <Image
          src="/growlab.jpeg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 1px"
          className="object-cover"
        />
        {/* Color wash + gradients */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[#0d2510]/65 mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-emerald-500/20"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"
        />

        {/* Foreground content */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <Image
            src="/logo transparent.png"
            alt="Growlab"
            width={140}
            height={52}
            priority
            className="invert brightness-0 contrast-200 mix-blend-screen opacity-95"
          />
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90">
            <Sparkles className="h-3 w-3" />
            Phase 1 · Live Demo
          </span>
        </div>

        <div className="relative z-10 max-w-xl space-y-6 text-white">
          <h1 className="text-4xl xl:text-5xl font-semibold leading-tight tracking-tight">
            AI-native operations for{' '}
            <span className="text-primary-foreground/95 bg-gradient-to-r from-emerald-300 to-primary-foreground bg-clip-text text-transparent">
              tissue culture production
            </span>
          </h1>
          <p className="text-base xl:text-lg text-white/80 leading-relaxed max-w-md">
            From mother-tree to delivered seedling — every batch, every stage,
            every observation captured, audited, and forecast in one workspace.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 max-w-2xl">
          {[
            { icon: Activity, label: '21-stage process', sub: 'tracked end-to-end' },
            { icon: Leaf, label: 'Real-time forecast', sub: '90-day horizon' },
            { icon: ShieldCheck, label: 'Immutable audit', sub: 'every change logged' },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-md p-4"
            >
              <f.icon className="h-5 w-5 text-emerald-200 mb-3" />
              <div className="text-sm font-semibold text-white">{f.label}</div>
              <div className="text-xs text-white/70 mt-0.5">{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== LOGIN PANEL ============== */}
      <section className="relative flex flex-col items-center justify-center px-4 py-10 sm:py-14 lg:py-10">
        {/* Mobile-only top brand strip */}
        <div className="lg:hidden absolute inset-x-0 top-0 h-44 -z-10">
          <Image
            src="/growlab.jpeg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 1px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0d2510]/70" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <Image
              src="/logo transparent.png"
              alt="Growlab"
              width={180}
              height={68}
              priority
              className="invert brightness-0 contrast-200 mix-blend-screen mb-3"
            />
            <p className="text-sm text-white/80 font-medium">
              Phase 1 Demo Access
            </p>
          </div>

          {/* Desktop-only mini header above the card */}
          <div className="hidden lg:block text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Pick a persona, enter the demo password, and explore the workspace.
            </p>
          </div>

          <Card className="border shadow-xl shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>
                Choose Admin to see the full operational view, or Scientist for
                the field workspace.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-6 pb-6">
                <div className="space-y-2">
                  <Label>Persona</Label>
                  <Tabs value={persona} onValueChange={setPersona} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                      <TabsTrigger value="scientist">Scientist</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground pt-1">
                    {persona === 'admin'
                      ? 'Full dashboard, batch oversight, user management.'
                      : 'Today’s tasks, photo capture, batch entries on mobile.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Demo Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {error === 'Invalid login credentials'
                        ? 'Incorrect password. Please try again.'
                        : error}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Enter Demo'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Demo data resets on request from the System Health page.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
