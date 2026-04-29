'use client'

import { LayoutDashboard, Layers, PlusCircle, History, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { title: "Today", url: "/workspace", icon: LayoutDashboard },
  { title: "Batches", url: "/workspace/batches", icon: Layers },
  { title: "New Entry", url: "/workspace/entry/new", icon: PlusCircle, primary: true },
  { title: "History", url: "/workspace/history", icon: History },
  { title: "Profile", url: "/workspace/profile", icon: User },
]

export function ScientistBottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe-area">
      <nav className="flex items-center justify-around p-2">
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex flex-col items-center justify-center space-y-1 p-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.primary ? (
                <div className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.title}</span>
                </>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
