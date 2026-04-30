'use client'

import { create } from 'zustand'

/**
 * Bridges the EntryWizard state with the mobile bottom-nav so its primary FAB
 * can drive the wizard. The wizard `register`s its current step + a callback
 * each render; the bottom-nav reads them to compute icon, label, and behavior.
 */
type AdvanceFn = () => void | Promise<void>

type EntryWizardState = {
  /** Active step number, or null when no wizard is mounted. */
  step: number | null
  /** Whether the user can advance from the current step. */
  canAdvance: boolean
  /** True while the final step is submitting. */
  isSubmitting: boolean
  /** Action invoked when the FAB is tapped. */
  advance: AdvanceFn
  /** Total step count (4 for the current wizard). */
  totalSteps: number
  /** Mount/sync from the wizard. */
  register: (s: {
    step: number
    canAdvance: boolean
    isSubmitting: boolean
    advance: AdvanceFn
    totalSteps?: number
  }) => void
  /** Unmount when the wizard is removed from the page. */
  reset: () => void
}

const noop = () => {}

export const useEntryWizardStore = create<EntryWizardState>((set) => ({
  step: null,
  canAdvance: false,
  isSubmitting: false,
  advance: noop,
  totalSteps: 4,
  register: ({ step, canAdvance, isSubmitting, advance, totalSteps = 4 }) =>
    set({ step, canAdvance, isSubmitting, advance, totalSteps }),
  reset: () =>
    set({
      step: null,
      canAdvance: false,
      isSubmitting: false,
      advance: noop,
      totalSteps: 4,
    }),
}))
