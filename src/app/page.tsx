'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Activity, Leaf, ShieldCheck } from 'lucide-react'
import { BrandedLoader } from '@/components/loaders/branded-loader'
import { cn } from '@/lib/utils'

type Persona = 'admin' | 'scientist'

const FEATURES = [
  { icon: Activity, label: '21-stage process', sub: 'tracked end-to-end' },
  { icon: Leaf, label: 'Real-time forecast', sub: '90-day horizon' },
  { icon: ShieldCheck, label: 'Immutable audit', sub: 'every change logged' },
]

const loginSchema = z.object({
  persona: z.enum(['admin', 'scientist']),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [authError, setAuthError] = useState('')
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const reason = searchParams.get('error')
    if (reason === 'profile_lookup_failed') {
      setAuthError(
        'We could not load your profile. The demo schema may not be exposed yet — see README §Setup.'
      )
    }
  }, [searchParams])

  const handleAuthenticate = async (persona: Persona, password: string) => {
    setAuthError('')
    const email =
      persona === 'admin' ? 'admin@growlab.demo' : 'scientist@growlab.demo'

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAuthError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect password. Please try again.'
          : error.message
      )
      return
    }

    if (data.session) {
      const dest = persona === 'admin' ? '/admin' : '/workspace'
      // Mount the branded transition overlay first, then push.
      // The destination route's loading.tsx renders the same overlay,
      // and the View Transitions API crossfades between them — making
      // the whole login → dashboard handoff feel like one scene.
      setIsExiting(true)
      setTimeout(() => {
        router.push(dest)
        router.refresh()
      }, 180)
    }
  }

  const formProps = {
    onAuthenticate: handleAuthenticate,
    authError,
  }

  return (
    <>
      {isExiting && <BrandedLoader />}
      <div
        data-exiting={isExiting ? 'true' : undefined}
        className="min-h-screen w-full bg-background transition-opacity duration-300 ease-out data-[exiting=true]:pointer-events-none data-[exiting=true]:opacity-0"
      >
        {/* ============================================================ */}
        {/*                       MOBILE LAYOUT                            */}
        {/* ============================================================ */}
        <div className="lg:hidden">
          <section className="relative isolate overflow-hidden">
            <div className="relative h-[58vh] min-h-[440px] w-full">
              <Image
                src="/growlab.jpeg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[#0d2510]/70 mix-blend-multiply"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-primary/45 via-transparent to-emerald-500/25"
              />
              <div
                aria-hidden
                className="absolute -top-24 -right-20 size-72 rounded-full bg-primary/35 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-24 -left-16 size-60 rounded-full bg-emerald-300/25 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
              />

              <div className="relative z-10 flex items-center gap-3 px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
                <Image
                  src="/logo transparent.png"
                  alt="Growlab"
                  width={140}
                  height={52}
                  priority
                  sizes="140px"
                  className="h-8 w-auto invert brightness-0 contrast-200 mix-blend-screen"
                  style={{ width: 'auto', height: '2rem' }}
                />
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                  Phase 1 · Live demo
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-32 z-10 px-5 text-white animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight">
                  AI-native operations for{' '}
                  <span className="bg-gradient-to-r from-emerald-200 to-white bg-clip-text text-transparent">
                    tissue culture
                  </span>{' '}
                  production
                </h1>
                <p className="mt-3 max-w-[34ch] text-[13.5px] leading-relaxed text-white/80">
                  Every batch, stage, and observation — captured, audited and
                  forecast in one workspace.
                </p>
              </div>
            </div>

            <div className="relative z-20 -mt-16 px-4 pb-6">
              <Card className="rounded-2xl border-border/60 shadow-2xl shadow-primary/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LoginForm {...formProps} compact />
              </Card>
            </div>
          </section>

          <section className="px-4 pb-10 pt-2">
            <p className="mb-3 text-center text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Built for the lab floor
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="snap-start shrink-0 w-[68%] rounded-xl border border-border/60 bg-card p-4 shadow-[0_1px_0_rgba(16,24,16,0.04)]"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-4" />
                  </div>
                  <div className="mt-3 text-[13.5px] font-semibold text-foreground">
                    {f.label}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {f.sub}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-[11px] text-muted-foreground/80">
              © Growlab · {new Date().getFullYear()}
            </p>
          </section>
        </div>

        {/* ============================================================ */}
        {/*                       DESKTOP LAYOUT                           */}
        {/* ============================================================ */}
        <div className="hidden lg:grid lg:min-h-screen lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.2fr_1fr]">
          <section className="relative isolate flex flex-col justify-between overflow-hidden p-10 xl:p-14">
            <Image
              src="/growlab.jpeg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 1px"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-[#0d2510]/65 mix-blend-multiply" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-emerald-500/20" />
            <div aria-hidden className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
            <div aria-hidden className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative z-10 flex items-center gap-3 text-white">
              <Image
                src="/logo transparent.png"
                alt="Growlab"
                width={140}
                height={52}
                priority
                sizes="140px"
                className="h-9 w-auto invert brightness-0 contrast-200 mix-blend-screen opacity-95"
                style={{ width: 'auto', height: '2.25rem' }}
              />
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                Phase 1 · Live Demo
              </span>
            </div>

            <div className="relative z-10 max-w-xl space-y-6 text-white">
              <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight xl:text-5xl">
                AI-native operations for{' '}
                <span className="bg-gradient-to-r from-emerald-300 to-primary-foreground bg-clip-text text-transparent">
                  tissue culture production
                </span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-white/80 xl:text-lg">
                From mother-tree to delivered seedling — every batch, every stage,
                every observation captured, audited, and forecast in one workspace.
              </p>
            </div>

            <div className="relative z-10 grid max-w-2xl grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-md"
                >
                  <f.icon className="mb-3 h-5 w-5 text-emerald-200" />
                  <div className="text-sm font-semibold text-white">{f.label}</div>
                  <div className="mt-0.5 text-xs text-white/70">{f.sub}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative flex flex-col items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2 text-center">
                <h2 className="font-serif text-3xl font-medium tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pick a persona, enter the demo password, and explore the workspace.
                </p>
              </div>

              <Card className="border shadow-xl shadow-primary/5">
                <LoginForm {...formProps} />
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

type LoginFormProps = {
  onAuthenticate: (persona: Persona, password: string) => Promise<void>
  authError: string
  compact?: boolean
}

function LoginForm({ onAuthenticate, authError, compact }: LoginFormProps) {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { persona: 'admin', password: '' },
  })

  const persona = form.watch('persona')
  const isSubmitting = form.formState.isSubmitting
  const passwordError = form.formState.errors.password?.message
  const setPersona = (p: Persona) => form.setValue('persona', p)
  const register = form.register

  const onSubmit = form.handleSubmit(async ({ persona, password }) => {
    await onAuthenticate(persona, password)
  })

  return (
    <>
      <CardHeader className={cn('space-y-1', compact && 'pt-5 pb-2')}>
        <CardTitle className={cn('text-xl', compact && 'text-lg')}>
          {compact ? 'Welcome back' : 'Sign In'}
        </CardTitle>
        <CardDescription className={cn(compact && 'text-[12.5px]')}>
          {compact
            ? 'Choose a persona to enter the workspace.'
            : 'Choose Admin to see the full operational view, or User for the field workspace.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className={cn('space-y-5 pb-6', compact && 'space-y-4 px-4')}>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Persona
            </Label>
            <Tabs
              value={persona}
              onValueChange={(v) => setPersona((v as Persona) ?? 'admin')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="scientist">User</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="pt-1 text-xs text-muted-foreground">
              {persona === 'admin'
                ? 'Full dashboard, batch oversight, user management.'
                : 'Today’s tasks, photo capture, batch entries on mobile.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={passwordError ? 'true' : undefined}
              className={cn(
                compact && 'h-11 text-base',
                passwordError && 'border-destructive focus-visible:ring-destructive/30'
              )}
              {...register('password')}
            />
            {passwordError ? (
              <p className="text-xs text-destructive" role="alert">
                {passwordError}
              </p>
            ) : null}
          </div>

          {authError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className={cn('flex-col gap-3', compact && 'px-4 pb-5')}>
          <Button
            type="submit"
            className={cn(
              'w-full font-semibold',
              compact && 'h-12 text-base shadow-md shadow-primary/20'
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Enter Demo'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo data resets on request from the System Health page.
          </p>
        </CardFooter>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
