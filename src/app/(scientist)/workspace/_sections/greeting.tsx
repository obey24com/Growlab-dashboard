import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function Greeting() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? ""

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", userId)
    .single()

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <header className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        {format(new Date(), "EEEE · MMM d")}
      </p>
      <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
        {greeting}, {profile?.display_name || "Scientist"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Here is your workspace for today.
      </p>
    </header>
  )
}
