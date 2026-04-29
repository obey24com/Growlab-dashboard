'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [persona, setPersona] = useState('admin')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const email = persona === 'admin' ? 'admin@growlab.demo' : 'scientist@growlab.demo'

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (data.session) {
        router.push(persona === 'admin' ? '/admin' : '/workspace')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-3xl">G</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Growlab</h1>
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
                  <span>{error === 'Invalid login credentials' ? 'Incorrect password. Try "grow".' : error}</span>
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
