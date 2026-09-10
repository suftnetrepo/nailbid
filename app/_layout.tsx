import React, { useEffect, useState } from 'react'
import { LogBox, AppState } from 'react-native'
import { Stack } from 'expo-router'
import { GlobalPortalProvider, PortalManager } from 'fluent-styles'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { runMigrations, seedDatabase } from '../src/db'
import { seedDemoData } from '../src/db/seed'
import { useThemeStore, usePremiumStore, useAuthStore, useCurrencyStore } from '../src/stores'
import { initializeRevenueCat, getEntitlement, subscribeToEntitlementUpdates } from '../src/services/premiumService'
import { securityService } from '../src/services/securityService'
import LockScreen from './lock-screen'

SplashScreen.preventAutoHideAsync()

// RevenueCat logs both of these via its own internal console.error, ahead
// of (and regardless of) whatever premiumService.ts's own try/catch does —
// so suppressing them here is the only way to keep either from surfacing as
// a full-screen LogBox crash during dev. Both are expected, non-error states:
// - "Error configuring Purchases" — no native module (Expo Go) or keys not
//   set up yet.
// - "Purchase was cancelled" — the user tapped Cancel on Apple's purchase
//   sheet; premiumService.ts already treats this as a normal `false` return,
//   not a thrown error (see purchaseByPackageKey's PurchaseCancelledError
//   check). Neither of these shows to real users either way — LogBox only
//   renders in Debug builds, never in the Release build the App Store ships.
LogBox.ignoreLogs(['Error configuring Purchases', 'Purchase was cancelled'])

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false)

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Only UI-critical work gates the splash screen: DB, theme, and PIN
        // lock state. All local and fast — there's nothing here that can hang.
        await Promise.all([
          (async () => { await runMigrations(); await seedDatabase(); await seedDemoData() })(),
          useThemeStore.getState().hydrate(),
          useCurrencyStore.getState().hydrate(),
          (async () => {
            const hasPin = await securityService.hasPin()
            useAuthStore.getState().setHasPin(hasPin)
            // Lock on cold launch only if a PIN actually exists — a user who's
            // never set one should never see a lock screen. Re-locking on
            // backgrounding during a session is handled separately below.
            if (hasPin) useAuthStore.getState().setLocked(true)

            // Restore any persisted lockout (e.g. mid-lockout from before the
            // app was force-quit) — must not reset on relaunch, or the
            // brute-force lockout could be bypassed just by killing the app.
            const { attempts, lockedUntil } = await securityService.getLockoutState()
            useAuthStore.getState().hydrateLockout(attempts, lockedUntil)
          })(),
        ])
      } catch (e) {
        console.error('[Bootstrap]', e)
      } finally {
        setAppReady(true)
      }
    }
    bootstrap()

    // RevenueCat runs detached, after the UI is already up — deliberately
    // NOT inside the Promise.all above. initializeRevenueCat() is guarded
    // against throwing, but not against hanging (a slow/unreachable network
    // wouldn't error, it would just never resolve), and premium status isn't
    // needed to render the app at all. Gating first paint on it would mean a
    // RevenueCat outage blanks the entire app, not just Pro features.
    const boot = async () => {
      try {
        await initializeRevenueCat()
        const entitlement = await getEntitlement()
        usePremiumStore.getState().setEntitlement(entitlement.isActive, entitlement.plan)
      } catch (err) {
        console.error('[Bootstrap] Premium phase failed:', err)
      }
    }
    boot()
  }, [])

  // Keep entitlement current without needing a full app relaunch:
  // - subscribeToEntitlementUpdates fires the instant RevenueCat pushes a
  //   change (renewal, expiration, cross-device restore, a dashboard-granted
  //   promotional entitlement).
  // - The AppState listener covers everything RevenueCat wouldn't proactively
  //   push on its own — e.g. a subscription that quietly lapsed while the
  //   app sat backgrounded for days.
  useEffect(() => {
    const unsubscribe = subscribeToEntitlementUpdates((info) => {
      usePremiumStore.getState().setEntitlement(info.isActive, info.plan)
    })

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      // Re-lock the instant the app leaves the foreground, not only on cold
      // launch. The PIN lock this was ported from (vela) only ever locks at
      // process start — once unlocked, it stays unlocked for the rest of
      // that process's life, including across backgrounding, so picking up
      // an unlocked phone mid-session bypasses the PIN entirely. For a
      // financial app specifically, that gap isn't worth carrying over.
      // 'background' only (not 'inactive') — 'inactive' also fires for
      // transient system UI (control center, a call, the app switcher
      // itself) that immediately returns to 'active', which would make this
      // re-lock on nearly every interaction instead of only on a real exit.
      if (nextState === 'background') {
        if (useAuthStore.getState().hasPin) useAuthStore.getState().setLocked(true)
        return
      }

      if (nextState !== 'active') return
      getEntitlement()
        .then((info) => usePremiumStore.getState().setEntitlement(info.isActive, info.plan))
        .catch((err) => console.error('[Premium] Foreground refresh failed:', err))
    })

    return () => {
      unsubscribe()
      appStateSubscription.remove()
    }
  }, [])

  const isReady  = appReady && (fontsLoaded || !!fontError)
  const isLocked = useAuthStore((s) => s.isLocked)
  const hasPin   = useAuthStore((s) => s.hasPin)

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync()
  }, [isReady])

  if (!isReady) return null

  // Rendered in place of the whole app, not navigated to — the rest of the
  // navigation tree (every screen, all their state) simply isn't mounted
  // while this is showing, so there's nothing a screenshot, the app-switcher
  // preview, or a deep link could expose underneath it.
  if (isLocked && hasPin) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlobalPortalProvider>
          <PortalManager>
            <LockScreen />
          </PortalManager>
        </GlobalPortalProvider>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalPortalProvider>
        <PortalManager>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(tabs)"           options={{ headerShown: false }} />
            <Stack.Screen name="customer/[id]"    options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="customer/new"     options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="quote/new"        options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="quote/[id]"       options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="quote/[id]/items" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="invoice/[id]"     options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="settings"         options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="security"         options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="premium"          options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
          </Stack>
        </PortalManager>
      </GlobalPortalProvider>
    </GestureHandlerRootView>
  )
}
