import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { Stack, StyledPage, StyledPressable, theme } from 'fluent-styles'
import { Text } from '../src/components/Text'
import { PinPad } from '../src/components/PinPad'
import { useColors, useIsDark, SECURITY_CONFIG } from '../src/constants'
import { LockIcon, FingerprintIcon, FaceIdIcon } from '../src/icons'
import { securityService } from '../src/services/securityService'
import { useAuthStore } from '../src/stores'

// Not a route the app ever pushes onto the stack — _layout.tsx renders this
// screen directly in place of the normal <Stack> whenever isLocked is true,
// so there's no back button, no way to swipe/dismiss past it, and nothing
// else mounted underneath it that a screenshot or the app-switcher preview
// could expose.
export default function LockScreen() {
  const C      = useColors()
  const isDark = useIsDark()
  const { attempts, addAttempt, resetAttempts, setLocked, lockedUntil, lockout } = useAuthStore()
  const [error, setError] = useState('')
  const [biometricType, setBiometricType]   = useState<'fingerprint' | 'face' | 'none'>('none')
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [type, enabled] = await Promise.all([
        securityService.getBiometricType(),
        securityService.isBiometricEnabled(),
      ])
      setBiometricType(type)
      setBiometricEnabled(enabled)
      if (enabled && type !== 'none') tryBiometric()
    }
    init()
    // Only ever run once per mount — re-running on every render would
    // re-trigger the native Face ID/Touch ID prompt on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tryBiometric = async () => {
    const ok = await securityService.authenticateWithBiometric()
    if (ok) unlock()
  }

  const unlock = async () => {
    resetAttempts()
    await securityService.resetLockoutState()
    setLocked(false)
  }

  const handlePin = async (pin: string) => {
    if (lockedUntil && new Date() < lockedUntil) {
      const mins = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
      setError(`Too many attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`)
      return
    }

    const ok = await securityService.verifyPin(pin)
    if (ok) {
      unlock()
      return
    }

    addAttempt()
    const newAttempts = attempts + 1

    if (newAttempts >= SECURITY_CONFIG.maxPinAttempts) {
      const until = new Date(Date.now() + SECURITY_CONFIG.lockoutMinutes * 60 * 1000)
      lockout(until)
      // Persisted, not just held in the zustand store — otherwise
      // force-quitting mid-lockout resets the counter for free and the
      // lockout stops meaning anything.
      await securityService.recordFailedAttempt(newAttempts, until)
      setError(`Too many attempts. Locked for ${SECURITY_CONFIG.lockoutMinutes} minutes.`)
    } else {
      await securityService.recordFailedAttempt(newAttempts, null)
      setError(`Incorrect PIN. ${SECURITY_CONFIG.maxPinAttempts - newAttempts} attempt${SECURITY_CONFIG.maxPinAttempts - newAttempts === 1 ? '' : 's'} left.`)
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined} showStatusBar statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <Stack alignItems="center" paddingTop={64} gap={10}>
        <Stack width={64} height={64} borderRadius={20} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
          <LockIcon size={28} strokeWidth={2} color={C.primary} />
        </Stack>
    
      </Stack>

      <Stack flex={1}>
        <PinPad
          title="Enter your PIN"
          subtitle="Your business data is protected"
          onComplete={handlePin}
          error={error}
        />
      </Stack>

      {biometricEnabled && biometricType !== 'none' && (
        <Stack alignItems="center" paddingBottom={48}>
          <StyledPressable
            onPress={tryBiometric}
            backgroundColor={C.bgCard} borderRadius={30}
            paddingHorizontal={24} paddingVertical={14}
            flexDirection="row" alignItems="center" gap={10}
            borderWidth={1} borderColor={C.border}
            accessibilityRole="button"
            accessibilityLabel={`Use ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'}`}
          >
            {biometricType === 'face'
              ? <FaceIdIcon size={20} strokeWidth={2} color={C.primary} />
              : <FingerprintIcon size={20} strokeWidth={2} color={C.primary} />}
            <Text variant="label" color={C.textSecondary} fontWeight="600">
              Use {biometricType === 'face' ? 'Face ID' : 'Fingerprint'}
            </Text>
          </StyledPressable>
        </Stack>
      )}
    </StyledPage>
  )
}
