'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { en } from './strings/en'
import { vi } from './strings/vi'

export type Language = 'en' | 'vi'

const dictionaries = { en, vi } as const
export type Dictionary = typeof en

type LanguageState = {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set({ language: get().language === 'en' ? 'vi' : 'en' }),
    }),
    { name: 'growlab-language' }
  )
)

export function useT(): Dictionary {
  const language = useLanguageStore((state) => state.language)
  return dictionaries[language]
}
