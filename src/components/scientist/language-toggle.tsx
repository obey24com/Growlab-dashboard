'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useLanguageStore } from '@/lib/i18n'

export function LanguageToggle() {
  const language = useLanguageStore((s) => s.language)
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const current = hydrated ? language : 'en'

  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="space-y-0.5">
        <Label className="text-base">Language</Label>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {current === 'en' ? 'Currently English' : 'Đang dùng Tiếng Việt'}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={toggleLanguage}>
        {current === 'en' ? 'Switch to Tiếng Việt' : 'Switch to English'}
      </Button>
    </div>
  )
}
