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
import { AlertCircle } from 'lucide-react'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [persona, setPersona] = useState('admin')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

    const email = persona === 'admin' ? 'admin@growlab.demo' : 'scientist@growlab.demo'

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
        router.push(persona === 'admin' ? '/admin' : '/workspace')
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <Image
              src="/logo transparent.png"
              alt="Growlab"
              width={240}
              height={90}
              priority
            />
          </div>
          <p className="text-muted-foreground mt-2">Phase 1 Demo Access</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Select your persona to explore the demo.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Persona</Label>
                <Tabs value={persona} onValueChange={setPersona} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="scientist">Scientist</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Demo Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter 'grow'"
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    {error === 'Invalid login credentials'
                      ? 'Incorrect password. Try "grow".'
                      : error}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Enter Demo'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
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
