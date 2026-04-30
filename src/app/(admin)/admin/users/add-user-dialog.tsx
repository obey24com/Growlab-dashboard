'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, AlertCircle, Eye, EyeOff, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createUserAction } from './actions'

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full platform access' },
  { value: 'scientist', label: 'Scientist', desc: 'Field workspace access' },
  { value: 'qc_lead', label: 'QC Lead', desc: 'Quality oversight' },
  { value: 'production_manager', label: 'Production Manager', desc: 'Operations oversight' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only' },
] as const

function suggestPassword() {
  const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 12; i++) {
    out += charset[Math.floor(Math.random() * charset.length)]
  }
  return out
}

export function AddUserDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPw, setShowPw] = React.useState(false)

  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<(typeof ROLES)[number]['value']>('scientist')
  const [password, setPassword] = React.useState(suggestPassword())

  React.useEffect(() => {
    if (open) {
      setFullName('')
      setEmail('')
      setRole('scientist')
      setPassword(suggestPassword())
      setShowPw(false)
      setError(null)
    }
  }, [open])

  const onSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const res = await createUserAction({
      fullName,
      email,
      role,
      password,
    })
    if (!res.ok) {
      setError(res.error)
      setSubmitting(false)
      return
    }
    toast.success('User created', {
      description: `${email} can sign in with the assigned password.`,
    })
    setSubmitting(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <Plus className="size-3.5" />
            Add User
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Create an account on the demo workspace. The user can sign in with the password you set here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Full name
            </Label>
            <Input
              id="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@growlab.demo"
              className="font-mono"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Role
            </Label>
            <Select value={role} onValueChange={(v) => v && setRole(v as typeof role)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <span>
                      <span className="font-medium">{r.label}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {r.desc}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Initial password
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-9 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPassword(suggestPassword())}
                title="Generate"
              >
                <Wand2 className="size-3.5" />
                Generate
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Share this password with the user — they can change it later.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={submitting} />}
          >
            Cancel
          </DialogClose>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                Create user
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
