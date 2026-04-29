import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default async function ScientistProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('demo.user_profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto md:max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Full Name</Label>
              <div className="font-medium">{profile?.full_name || 'Scientist User'}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Email</Label>
              <div className="font-medium">{profile?.email || user?.email}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Role</Label>
              <div className="font-medium capitalize">{profile?.role || 'Scientist'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label className="text-base">Language</Label>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Currently English
                </div>
              </div>
              <Button variant="outline" size="sm">Switch to Tiếng Việt</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
