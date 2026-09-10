import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { CURRENCIES, DEFAULT_CURRENCY_CODE } from '../constants/currencies'

// ─── Currency store — one app-wide currency, used by every formatCurrency()
// call (quotes, invoices, dashboard, exported PDFs). Read via getState() from
// formatCurrency() itself (see src/utils/index.ts) rather than threaded
// through as a parameter, since ~60 existing call sites all just call
// formatCurrency(amount) with no currency argument.

const CURRENCY_STORAGE_KEY = 'quickbid_currency_code'
const VALID_CODES = new Set(CURRENCIES.map((c) => c.code))

interface CurrencyState {
  code:     string
  hydrated: boolean
  setCode:  (code: string) => void
  hydrate:  () => Promise<void>
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  code:     DEFAULT_CURRENCY_CODE,
  hydrated: false,

  setCode: (code) => {
    set({ code })
    SecureStore.setItemAsync(CURRENCY_STORAGE_KEY, code).catch(() => {})
  },

  hydrate: async () => {
    try {
      const saved = await SecureStore.getItemAsync(CURRENCY_STORAGE_KEY)
      if (saved && VALID_CODES.has(saved)) set({ code: saved })
    } catch {
      // No saved preference yet — keep the GBP default
    } finally {
      set({ hydrated: true })
    }
  },
}))

// ─── Theme store — light / dark / system, persisted on device ────────────────

export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'quickbid_theme_mode'

interface ThemeState {
  mode:      ThemeMode
  hydrated:  boolean
  setMode:   (mode: ThemeMode) => void
  hydrate:   () => Promise<void>
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode:     'system',
  hydrated: false,

  setMode: (mode) => {
    set({ mode })
    SecureStore.setItemAsync(THEME_STORAGE_KEY, mode).catch(() => {})
  },

  hydrate: async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY)
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        set({ mode: saved })
      }
    } catch {
      // No saved preference yet — keep the 'system' default
    } finally {
      set({ hydrated: true })
    }
  },
}))

// ─── Premium store — entitlement state, hydrated from the cache on launch ────
// The source of truth for "is this purchase real" is always RevenueCat
// (via premiumService); this store just holds the last-known answer so the
// UI has something to render immediately instead of flashing "free" first.

import type { PremiumPlan } from '../services/premiumService'

interface PremiumState {
  isPremium: boolean
  plan:      PremiumPlan
  hydrated:  boolean
  setEntitlement: (isPremium: boolean, plan: PremiumPlan) => void
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  plan:      null,
  hydrated:  false,

  setEntitlement: (isPremium, plan) => set({ isPremium, plan, hydrated: true }),
}))

// ─── Auth store — PIN lock state, ported from vela's auth.store.ts ───────────
// isLocked starts false so the very first render (before _layout.tsx's boot
// phase has had a chance to check securityService.hasPin()) never briefly
// flashes a lock screen for a user who's never set a PIN — _layout.tsx sets
// it true on launch only if a PIN actually exists.

interface AuthState {
  isLocked:       boolean
  hasPin:         boolean
  attempts:       number
  lockedUntil:    Date | null
  setLocked:      (locked: boolean) => void
  setHasPin:      (has: boolean) => void
  addAttempt:     () => void
  resetAttempts:  () => void
  lockout:        (until: Date) => void
  hydrateLockout: (attempts: number, lockedUntil: Date | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLocked:    false,
  hasPin:      false,
  attempts:    0,
  lockedUntil: null,

  setLocked:      (locked) => set({ isLocked: locked }),
  setHasPin:      (has)    => set({ hasPin: has }),
  addAttempt:     ()       => set((s) => ({ attempts: s.attempts + 1 })),
  resetAttempts:  ()       => set({ attempts: 0, lockedUntil: null }),
  lockout:        (until)  => set({ lockedUntil: until }),
  hydrateLockout: (attempts, lockedUntil) => set({ attempts, lockedUntil }),
}))

// ─── Data version store — invalidate all queries ──────────────────────────────

interface DataState {
  version: number
  invalidate: () => void
}

export const useDataStore = create<DataState>((set) => ({
  version:    0,
  invalidate: () => set((s) => ({ version: s.version + 1 })),
}))
