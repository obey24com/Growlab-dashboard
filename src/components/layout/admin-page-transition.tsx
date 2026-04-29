'use client'

import * as React from "react"
import { usePathname } from "next/navigation"

export function AdminPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div
      key={pathname}
      className="animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      {children}
    </div>
  )
}
