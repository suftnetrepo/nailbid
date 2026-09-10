import React, { useState } from 'react'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledDivider, StyledPressable, StyledForm,
  dialogueService, toastService,
} from 'fluent-styles'
import { Text } from '../src/components/Text'
import { PinPad } from '../src/components/PinPad'
import { ScreenHeader } from '../src/components/ScreenHeader'
import {
  useColors, useIsDark, getSwitchColors,
} from '../src/constants'
import { useBiometric } from '../src/hooks/useBiometric'
import { securityService } from '../src/services/securityService'
import { useAuthStore } from '../src/stores'
import { goBack } from '../src/utils'
import { KeyIcon, TrashIcon, FingerprintIcon, FaceIdIcon, ShieldCheckIcon, ChevronRightIcon, LockIcon } from '../src/icons'

type View = 'main' | 'create_pin' | 'confirm_pin'

export default function SecurityScreen() {
  const C      = useColors()
  const isDark = useIsDark()
  const biometric = useBiometric()
  const hasPin    = useAuthStore((s) => s.hasPin)
  const setHasPin = useAuthStore((s) => s.setHasPin)

  const [view, setView]         = useState<View>('main')
  const [newPin, setNewPin]     = useState('')
  const [pinError, setPinError] = useState('')

  // Locks immediately rather than waiting for the app to background —
  // handing the phone to someone else, or just stepping away, shouldn't
  // require actually leaving the app first.
  const handleLockNow = () => {
    useAuthStore.getState().setLocked(true)
  }

  const handleRemovePin = async () => {
    const ok = await dialogueService.confirm({
      title: 'Remove PIN?',
      message: 'NailBid will no longer ask for a PIN when you open the app.',
      icon: '🔓',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      destructive: true,
      theme: isDark ? 'dark' : 'light',
    })
    if (!ok) return
    await securityService.clearPin()
    setHasPin(false)
    toastService.info('PIN removed')
  }

  const handleFirstPin = (pin: string) => {
    setNewPin(pin)
    setView('confirm_pin')
    setPinError('')
  }

  const handleConfirmPin = async (pin: string) => {
    if (pin !== newPin) {
      setPinError('PINs do not match. Try again.')
      setView('create_pin')
      setNewPin('')
      return
    }
    await securityService.setPin(pin)
    setHasPin(true)
    toastService.success(hasPin ? 'PIN updated' : 'PIN set', 'Your data is now protected.')
    setView('main')
  }

  if (view === 'create_pin' || view === 'confirm_pin') {
    return (
      <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
        <ScreenHeader
          title={view === 'create_pin' ? 'Set PIN' : 'Confirm PIN'}
          onBackPress={() => { setView('main'); setPinError('') }}
        />
        <Stack flex={1}>
          <PinPad
            title={view === 'create_pin' ? 'Create your PIN' : 'Confirm your PIN'}
            subtitle={view === 'create_pin' ? 'Choose a 4-digit PIN to protect your data' : 'Enter the same PIN again'}
            onComplete={view === 'create_pin' ? handleFirstPin : handleConfirmPin}
            error={pinError}
          />
        </Stack>
      </StyledPage>
    )
  }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <ScreenHeader title="Security" onBackPress={() => goBack('/settings')} />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>

        {/* Lock now */}
        {hasPin && (
          <StyledPressable
            onPress={handleLockNow}
            backgroundColor={C.primary} borderRadius={16} padding={16}
            flexDirection="row" alignItems="center" gap={12}
            accessibilityRole="button"
            accessibilityLabel="Lock NailBid now"
          >
            <Stack width={38} height={38} borderRadius={11} backgroundColor="rgba(255,255,255,0.18)" alignItems="center" justifyContent="center">
              <LockIcon size={18} strokeWidth={2} color={C.white} />
            </Stack>
            <Stack flex={1} gap={2}>
              <Text variant="label" color={C.white} fontWeight="700">Lock now</Text>
              <Text variant="caption" color="rgba(255,255,255,0.75)">Require your PIN the next time NailBid opens</Text>
            </Stack>
          </StyledPressable>
        )}

        {/* PIN section */}
        <StyledCard backgroundColor={C.bgCard} borderRadius={16} borderWidth={1} borderColor={C.border} overflow="hidden">
          <Stack paddingHorizontal={16} paddingTop={14} paddingBottom={4}>
            <Text variant="overline" color={C.textMuted}>PIN lock</Text>
          </Stack>

          <StyledPressable
            onPress={() => setView('create_pin')}
            flexDirection="row" alignItems="center"
            paddingVertical={14} paddingHorizontal={16} gap={14}
            accessibilityRole="button"
            accessibilityLabel={hasPin ? 'Change PIN' : 'Set up PIN'}
            accessibilityHint={hasPin ? '4-digit PIN is active' : 'No PIN set — app is unprotected'}
          >
            <Stack width={38} height={38} borderRadius={11} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
              <KeyIcon size={18} strokeWidth={2} color={C.primary} />
            </Stack>
            <Stack flex={1} gap={2}>
              <Text variant="label" color={C.textPrimary} fontWeight="600">
                {hasPin ? 'Change PIN' : 'Set up PIN'}
              </Text>
              <Text variant="caption" color={C.textMuted}>
                {hasPin ? '4-digit PIN is active' : 'No PIN set — app is unprotected'}
              </Text>
            </Stack>
            <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
          </StyledPressable>

          {hasPin && (
            <>
              <StyledDivider borderBottomColor={C.border} style={{ marginHorizontal: 16 }} />
              <StyledPressable
                onPress={handleRemovePin}
                flexDirection="row" alignItems="center"
                paddingVertical={14} paddingHorizontal={16} gap={14}
                accessibilityRole="button"
                accessibilityLabel="Remove PIN"
                accessibilityHint="This action cannot be undone"
              >
                <Stack width={38} height={38} borderRadius={11} backgroundColor={C.bgMuted} alignItems="center" justifyContent="center">
                  <TrashIcon size={18} strokeWidth={2} color={C.error} />
                </Stack>
                <Text variant="label" color={C.error} fontWeight="600" style={{ flex: 1 }}>
                  Remove PIN
                </Text>
              </StyledPressable>
            </>
          )}
        </StyledCard>

        {/* Biometric section */}
        {biometric.available && (
          <StyledCard backgroundColor={C.bgCard} borderRadius={16} borderWidth={1} borderColor={C.border} overflow="hidden">
            <Stack paddingHorizontal={16} paddingTop={14} paddingBottom={4}>
              <Text variant="overline" color={C.textMuted}>Biometric</Text>
            </Stack>
            <Stack horizontal alignItems="center" paddingVertical={14} paddingHorizontal={16} gap={14}>
              <Stack width={38} height={38} borderRadius={11} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                {biometric.type === 'face'
                  ? <FaceIdIcon size={18} strokeWidth={2} color={C.primary} />
                  : <FingerprintIcon size={18} strokeWidth={2} color={C.primary} />}
              </Stack>
              <Stack flex={1} gap={2}>
                <Text variant="label" color={C.textPrimary} fontWeight="600">
                  {biometric.type === 'face' ? 'Face ID' : 'Fingerprint'}
                </Text>
                <Text variant="caption" color={C.textMuted}>Unlock NailBid with biometrics</Text>
              </Stack>
              <StyledForm.Switch
                value={biometric.enabled}
                onChange={biometric.toggleBiometric}
                activeColor={C.primary}
                colors={getSwitchColors(C)}
                disabled={!hasPin}
              />
            </Stack>
            {!hasPin && (
              <Stack paddingHorizontal={16} paddingBottom={12}>
                <Text variant="caption" color={C.textMuted}>Set up a PIN first to enable biometrics.</Text>
              </Stack>
            )}
          </StyledCard>
        )}

        <Stack backgroundColor={C.acceptedBg} borderRadius={16} padding={16} gap={8}>
          <Stack horizontal alignItems="center" gap={8}>
            <ShieldCheckIcon size={15} strokeWidth={2} color={C.accepted} />
            <Text variant="label" color={C.textPrimary} fontWeight="600">Your data is local</Text>
          </Stack>
          <Text variant="caption" color={C.textSecondary} style={{ lineHeight: 18 }}>
            Even without a PIN, your customers, quotes and invoices never leave your phone. Nothing is uploaded to a server.
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  )
}
