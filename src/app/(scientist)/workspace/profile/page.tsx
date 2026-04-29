import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LanguageToggle } from "@/components/scientist/language-toggle"
import { Mail, ShieldCheck, Calendar } from "lucide-react"
import { format } from "date-fns"

export default async function ScientistProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single()

  // Activity stats
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const [{ count: total }, { count: completed }, { count: last30 }] = await Promise.all([
    supabase
      .from("stage_entries")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", user?.id ?? ""),
    supabase
      .from("stage_entries")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", user?.id ?? "")
      .eq("status", "completed"),
    supabase
      .from("stage_entries")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", user?.id ?? "")
      .gte("created_at", since30),
  ])

  const fullName: string = profile?.full_name || "Scientist User"
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const email: string = profile?.email || user?.email || "—"
  const role: string = profile?.role || "scientist"
  const joined = profile?.created_at
    ? format(new Date(profile.created_at), "MMM d, yyyy")
    : null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Account
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account, activity and workspace preferences.
        </p>
      </header>

      {/* Identity card */}
      <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
        <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
              {initials || "SC"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-2xl font-medium text-foreground">
                {fullName}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                {role === "admin" ? "Full access" : "Field access"}
              </span>
              {joined && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Joined {joined}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ActivityCard label="Total entries" value={total ?? 0} />
        <ActivityCard label="Completed" value={completed ?? 0} tone="primary" />
        <ActivityCard label="Last 30 days" value={last30 ?? 0} />
      </div>

      {/* Account + preferences */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account details</CardTitle>
            <CardDescription className="text-xs">
              Your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Full name" value={fullName} />
            <Row label="Email" value={email} mono />
            <Row label="Display name" value={profile?.display_name || fullName.split(" ")[0]} />
            <Row label="Role" value={role} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Preferences</CardTitle>
            <CardDescription className="text-xs">
              Customize your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <LanguageToggle />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ActivityCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone?: "neutral" | "primary"
}) {
  return (
    <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`font-serif text-3xl tabular-nums ${
            tone === "primary" ? "text-primary" : "text-foreground"
          }`}
        >
          {value.toLocaleString()}
        </span>
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 last:border-b-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-right text-sm font-medium text-foreground ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}
