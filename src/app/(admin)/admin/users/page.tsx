export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"
import { AddUserDialog } from "./add-user-dialog"

type ProfileRow = {
  id: string
  full_name: string
  display_name: string | null
  email: string
  role: string
  is_active: boolean
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, full_name, display_name, email, role, is_active")
    .order("created_at", { ascending: false })

  const list = (users as ProfileRow[] | null) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Access
          </p>
          <h1 className="font-serif text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">
            Users &amp; permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage roles and access for the platform.
          </p>
        </div>
        <AddUserDialog />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_0_rgba(16,24,16,0.04)]">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Role</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 ring-1 ring-border/70">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {initials(user.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {user.full_name || user.display_name || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active ? "default" : "secondary"}
                    className={
                      user.is_active
                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                        : ""
                    }
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" className="rounded-full">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  No users yet — click <span className="font-medium text-foreground">Add User</span> to invite the first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
