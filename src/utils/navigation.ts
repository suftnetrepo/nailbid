import { router } from 'expo-router'

// `router.back()` on its own is a silent no-op when there's no history to
// pop — which happens any time a screen is entered directly rather than
// pushed from within the app (a deep link, a fresh Expo Go reload landing
// mid-stack, a notification tap). The user's then stuck looking at a back
// arrow that does nothing. Check first, and fall back to a sensible route
// instead of leaving them stranded.
export const goBack = (fallback: string = '/(tabs)') => {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace(fallback as any)
  }
}
