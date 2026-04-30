import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function AdminGreeting() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", user?.id ?? "")
    .single()

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  })()

  const now = new Date()

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Overview
      </p>
      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {greeting}, {profile?.display_name || "Admin"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Snapshot of the production system as of{" "}
        <span className="font-medium text-foreground/80">
          {format(now, "MMM d, h:mm a")}
        </span>
        .
      </p>
    </div>
  )
}
