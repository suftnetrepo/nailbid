import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledButton, StyledForm, StyledPressable, useToast,
} from 'fluent-styles'
import { Text } from '../src/components/Text'
import { ScreenHeader } from '../src/components/ScreenHeader'
import { CurrencyPicker } from '../src/components/CurrencyPicker'
import {
  useColors, useIsDark,
  getFieldColors, getSwitchColors,
} from '../src/constants'
import { getCurrency } from '../src/constants/currencies'
import { useSettings } from '../src/hooks'
import { usePremium } from '../src/hooks/usePremium'
import { useThemeStore, useAuthStore, useCurrencyStore, type ThemeMode } from '../src/stores'
import { isPreset, sanitizeNumeric, parseClamped, goBack } from '../src/utils'
import {
  BriefcaseIcon, PhoneIcon, MailIcon, HashIcon,
  PercentIcon, HardHatIcon, CalendarIcon, SparkleIcon,
  SunIcon, MoonIcon, DeviceIcon, ChevronRightIcon, LockIcon, WalletIcon,
} from '../src/icons'

const APPEARANCE_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof SunIcon }[] = [
  { mode: 'light',  label: 'Light',  Icon: SunIcon    },
  { mode: 'dark',   label: 'Dark',   Icon: MoonIcon   },
  { mode: 'system', label: 'System', Icon: DeviceIcon },
]

// ─── Dropdown presets ────────────────────────────────────────────────────────
// VAT/CIS presets cover the UK's legally-defined rates; payment terms are a
// business choice, not a regulated value — either way, a "Custom" option
// lets the rate/terms field fall back to free numeric entry so the presets
// never become a hard ceiling on what the user can actually charge.

const VAT_RATE_OPTIONS = [
  { value: '0',  label: '0%'  },
  { value: '5',  label: '5%'  },
  { value: '20', label: '20%' },
  { value: 'custom', label: 'Custom…' },
]

const CIS_RATE_OPTIONS = [
  { value: '20', label: '20% standard' },
  { value: '30', label: '30% higher'   },
  { value: 'custom', label: 'Custom…'  },
]

const PAYMENT_TERMS_OPTIONS = [
  { value: '0',  label: 'Due on receipt' },
  { value: '7',  label: '7 days'  },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '45', label: '45 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: 'custom', label: 'Custom…' },
]


export default function SettingsScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const { mode, setMode } = useThemeStore()
  const { data: settings, save } = useSettings()
  const { isPremium } = usePremium()
  const hasPin = useAuthStore((s) => s.hasPin)
  const currencyCode = useCurrencyStore((s) => s.code)
  const setCurrencyCode = useCurrencyStore((s) => s.setCode)
  const toast = useToast()

  const [businessName,      setBusinessName]      = useState('')
  const [businessPhone,     setBusinessPhone]     = useState('')
  const [businessEmail,     setBusinessEmail]     = useState('')
  const [vatNumber,         setVatNumber]         = useState('')
  const [cisEnabled,        setCisEnabled]        = useState(false)
  const [defaultVatRate,    setDefaultVatRate]    = useState('20')
  const [defaultCisRate,    setDefaultCisRate]    = useState('20')
  const [defaultTerms,      setDefaultTerms]      = useState('14')
  const [vatRateCustom,     setVatRateCustom]     = useState(false)
  const [cisRateCustom,     setCisRateCustom]     = useState(false)
  const [termsCustom,       setTermsCustom]       = useState(false)
  const [saving,            setSaving]            = useState(false)
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false)

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName)
      setBusinessPhone(settings.businessPhone)
      setBusinessEmail(settings.businessEmail)
      setVatNumber(settings.vatNumber)
      setCisEnabled(settings.cisEnabled)
      setDefaultVatRate(String(settings.defaultVatRate))
      setDefaultCisRate(String(settings.defaultCisRate))
      setDefaultTerms(String(settings.defaultPaymentTerms))
      // A value saved earlier that isn't one of the presets (e.g. a custom
      // rate typed in previously) should re-open in "Custom" mode, not
      // silently snap to the nearest preset.
      setVatRateCustom(!isPreset(String(settings.defaultVatRate), VAT_RATE_OPTIONS))
      setCisRateCustom(!isPreset(String(settings.defaultCisRate), CIS_RATE_OPTIONS))
      setTermsCustom(!isPreset(String(settings.defaultPaymentTerms), PAYMENT_TERMS_OPTIONS))
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await save({
        businessName,
        businessPhone,
        businessEmail,
        vatNumber,
        cisEnabled,
        defaultVatRate:      parseClamped(defaultVatRate, 20, 100),
        defaultCisRate:      parseClamped(defaultCisRate, 20, 100),
        defaultPaymentTerms: Math.round(parseClamped(defaultTerms, 14, 365)),
      })
      toast.success('Settings saved')
    } catch (e: any) {
      toast.error('Failed to save', e?.message)
    } finally {
      setSaving(false)
    }
  }

  const initial = businessName.trim().charAt(0).toUpperCase() || 'Q'

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <ScreenHeader title="Settings" onBackPress={() => goBack()} />

      <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Profile card */}
        <Stack
          backgroundColor={C.navy} borderRadius={20} padding={18} marginBottom={20}
          horizontal alignItems="center" gap={14}
          style={{
            shadowColor: '#0d0d1a', shadowOpacity: 0.22, shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 }, elevation: 6,
          }}
        >
          <Stack width={52} height={52} borderRadius={26} backgroundColor={C.primary} alignItems="center" justifyContent="center">
            <Text variant="title" color={C.white} fontWeight="800">{initial}</Text>
          </Stack>
          <Stack flex={1}>
            <Text variant="subtitle" color={C.white} fontWeight="700" numberOfLines={1}>
              {businessName.trim() || 'Your business'}
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.6)" style={{ marginTop: 2 }}>
              Business & invoicing settings
            </Text>
          </Stack>
        </Stack>

        {/* NailBid Pro */}
        <StyledPressable onPress={() => router.push('/premium')}>
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={16}
            borderWidth={1} borderColor={isPremium ? C.primary : C.border}
            style={{ marginBottom: 20 }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={40} height={40} borderRadius={12} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                <SparkleIcon size={18} strokeWidth={2} color={C.primary} />
              </Stack>
              <Stack flex={1}>
                <Text variant="label" color={C.textPrimary} fontWeight="700">
                  {isPremium ? 'NailBid Pro' : 'Go Pro'}
                </Text>
                <Text variant="caption" color={C.textSecondary}>
                  {isPremium ? 'Watermark-free exports — thanks for your support' : 'Remove the watermark from exported PDFs'}
                </Text>
              </Stack>
              <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
            </Stack>
          </StyledCard>
        </StyledPressable>

        <StyledForm gap={14} avoidKeyboard scrollable={false}>

          <Text variant="body" paddingHorizontal={16} color={C.textMuted} style={{ marginBottom: 4 }}>
            Business details
          </Text>
         

          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={16} gap={14}
            borderWidth={1} borderColor={C.border} shadow="light"
          >
            <StyledForm.Input
              label="Business name"
              labelProps={{ color: C.textPrimary }}
              variant="outline"
              placeholder="e.g. Dave Smith Builders"
              leftIcon={<BriefcaseIcon size={16} strokeWidth={2} color={C.textMuted} />}
              value={businessName}
              onChangeText={setBusinessName}
              focusColor={C.primary}
              colors={getFieldColors(C)}
            />
            <StyledForm.Input
              label="Phone number"
              labelProps={{ color: C.textPrimary }}
              variant="outline"
              placeholder="e.g. 07700 900123"
              keyboardType="phone-pad"
              leftIcon={<PhoneIcon size={16} strokeWidth={2} color={C.textMuted} />}
              value={businessPhone}
              onChangeText={setBusinessPhone}
              focusColor={C.primary}
              colors={getFieldColors(C)}
            />
            <StyledForm.Input
              label="Email address"
              labelProps={{ color: C.textPrimary }}
              variant="outline"
              placeholder="e.g. dave@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<MailIcon size={16} strokeWidth={2} color={C.textMuted} />}
              value={businessEmail}
              onChangeText={setBusinessEmail}
              focusColor={C.primary}
              colors={getFieldColors(C)}
            />
            <StyledForm.Input
              label="VAT number (optional)"
              labelProps={{ color: C.textPrimary }}
              variant="outline"
              placeholder="e.g. GB 123 456 789"
              leftIcon={<HashIcon size={16} strokeWidth={2} color={C.textMuted} />}
              value={vatNumber}
              onChangeText={setVatNumber}
              focusColor={C.primary}
              colors={getFieldColors(C)}
            />
          </StyledCard>

          <Text variant="body" paddingHorizontal={16} color={C.textMuted} style={{ marginTop: 8, marginBottom: 4 }}>
            Tax defaults
          </Text>

          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={16}
            borderWidth={1} borderColor={C.border} shadow="light"
          >
            <Stack horizontal alignItems="center" gap={12} justifyContent="space-between" style={{ marginBottom: vatRateCustom ? 10 : 14 }}>
              <Stack horizontal alignItems="center" gap={10} flex={1}>
                <Stack width={32} height={32} borderRadius={10} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                  <PercentIcon size={15} strokeWidth={2} color={C.primary} />
                </Stack>
                <Text variant="label" color={C.textPrimary}>Default VAT rate</Text>
              </Stack>
              <StyledForm.Select
                variant="outline"
                size="sm"
                minWidth={100}
                data={VAT_RATE_OPTIONS}
                value={vatRateCustom ? 'custom' : defaultVatRate}
                onChange={(item: any) => {
                  if (item.value === 'custom') { setVatRateCustom(true); return }
                  setVatRateCustom(false)
                  setDefaultVatRate(item.value)
                }}
                placeholder="Select"
                colors={getFieldColors(C)}
                focusColor={C.primary}
              />
            </Stack>

            {vatRateCustom && (
              <Stack style={{ marginBottom: 14 }}>
                <StyledForm.Input
                  variant="outline"
                  size="sm"
                  placeholder="e.g. 12.5"
                  keyboardType="decimal-pad"
                  rightIcon={<Text variant="label" color={C.textMuted}>%</Text>}
                  value={defaultVatRate}
                  onChangeText={(t: string) => setDefaultVatRate(sanitizeNumeric(t, true))}
                  focusColor={C.primary}
                  colors={getFieldColors(C)}
                />
              </Stack>
            )}

            <Stack horizontal alignItems="center" gap={12} justifyContent="space-between" style={{ marginBottom: 14 }}>
              <Stack horizontal alignItems="center" gap={10} flex={1}>
                <Stack width={32} height={32} borderRadius={10} backgroundColor={C.bgMuted} alignItems="center" justifyContent="center">
                  <HardHatIcon size={15} strokeWidth={2} color={C.textSecondary} />
                </Stack>
                <Stack flex={1}>
                  <Text variant="label" color={C.textPrimary}>CIS (Construction)</Text>
                  <Text variant="caption" color={C.textMuted}>Enable for subcontractors</Text>
                </Stack>
              </Stack>
              <StyledForm.Switch
                value={cisEnabled}
                onChange={setCisEnabled}
                activeColor={C.primary}
                colors={getSwitchColors(C)}
              />
            </Stack>

            {cisEnabled && (
              <Stack horizontal alignItems="center" gap={12} justifyContent="space-between" style={{ marginBottom: cisRateCustom ? 10 : 0 }}>
                <Stack horizontal alignItems="center" gap={10} flex={1}>
                  <Stack width={32} height={32} borderRadius={10} backgroundColor={C.bgMuted} alignItems="center" justifyContent="center">
                    <PercentIcon size={15} strokeWidth={2} color={C.textSecondary} />
                  </Stack>
                  <Text variant="label" color={C.textPrimary}>Default CIS rate</Text>
                </Stack>
                <StyledForm.Select
                  variant="outline"
                  size="sm"
                  minWidth={150}
                  data={CIS_RATE_OPTIONS}
                  value={cisRateCustom ? 'custom' : defaultCisRate}
                  onChange={(item: any) => {
                    if (item.value === 'custom') { setCisRateCustom(true); return }
                    setCisRateCustom(false)
                    setDefaultCisRate(item.value)
                  }}
                  placeholder="Select"
                  colors={getFieldColors(C)}
                  focusColor={C.primary}
                />
              </Stack>
            )}

            {cisEnabled && cisRateCustom && (
              <Stack>
                <StyledForm.Input
                  variant="outline"
                  size="sm"
                  placeholder="e.g. 25"
                  keyboardType="decimal-pad"
                  rightIcon={<Text variant="label" color={C.textMuted}>%</Text>}
                  value={defaultCisRate}
                  onChangeText={(t: string) => setDefaultCisRate(sanitizeNumeric(t, true))}
                  focusColor={C.primary}
                  colors={getFieldColors(C)}
                />
              </Stack>
            )}
          </StyledCard>

          <Text variant="body" paddingHorizontal={16} color={C.textMuted} style={{ marginTop: 8, marginBottom: 4 }}>
            Invoice defaults
          </Text>

          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={16}
            borderWidth={1} borderColor={C.border} shadow="light"
          >
            <Stack horizontal alignItems="center" gap={12} justifyContent="space-between" style={{ marginBottom: termsCustom ? 10 : 0 }}>
              <Stack horizontal alignItems="center" gap={10} flex={1}>
                <Stack width={32} height={32} borderRadius={10} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                  <CalendarIcon size={15} strokeWidth={2} color={C.primary} />
                </Stack>
                <Stack flex={1}>
                  <Text variant="label" color={C.textPrimary}>Payment terms</Text>
                  <Text variant="caption" color={C.textMuted}>Days until invoice due</Text>
                </Stack>
              </Stack>
              <StyledForm.Select
                variant="outline"
                size="sm"
                minWidth={130}
                data={PAYMENT_TERMS_OPTIONS}
                value={termsCustom ? 'custom' : defaultTerms}
                onChange={(item: any) => {
                  if (item.value === 'custom') { setTermsCustom(true); return }
                  setTermsCustom(false)
                  setDefaultTerms(item.value)
                }}
                placeholder="Select"
                colors={getFieldColors(C)}
                focusColor={C.primary}
              />
            </Stack>

            {termsCustom && (
              <Stack>
                <StyledForm.Input
                  variant="outline"
                  size="sm"
                  placeholder="e.g. 21"
                  keyboardType="number-pad"
                  rightIcon={<Text variant="label" color={C.textMuted}>days</Text>}
                  value={defaultTerms}
                  onChangeText={(t: string) => setDefaultTerms(sanitizeNumeric(t, false))}
                  focusColor={C.primary}
                  colors={getFieldColors(C)}
                />
              </Stack>
            )}
          </StyledCard>

          <StyledForm.Actions style={{ marginTop: 8 }}>
            <StyledButton
              block loading={saving}
              backgroundColor={C.primary}
              borderRadius={12} paddingVertical={14}
              onPress={handleSave}
            >
              <Text variant="button" color={C.white}>
                {saving ? 'Saving…' : 'Save settings'}
              </Text>
            </StyledButton>
          </StyledForm.Actions>

        </StyledForm>

         {/* Security */}
        <StyledPressable onPress={() => router.push('/security')} style={{ marginTop: 20 }}>
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={16}
            borderWidth={1} borderColor={C.border}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={40} height={40} borderRadius={12} backgroundColor={C.bgMuted} alignItems="center" justifyContent="center">
                <LockIcon size={18} strokeWidth={2} color={C.textSecondary} />
              </Stack>
              <Stack flex={1}>
                <Text variant="label" color={C.textPrimary} fontWeight="700">Security</Text>
                <Text variant="caption" color={C.textSecondary}>
                  {hasPin ? 'PIN lock is on' : 'Protect NailBid with a PIN'}
                </Text>
              </Stack>
              <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
            </Stack>
          </StyledCard>
        </StyledPressable>

        {/* Currency — moved right below Security. Opens a full-screen picker
            (see CurrencyPicker) rather than an inline dropdown — the dropdown's
            searchable+grouped list of ~50 currencies froze the screen on
            scroll. Selecting a currency applies instantly app-wide (quotes,
            invoices, dashboard, PDFs), no Save needed. */}
        <StyledPressable onPress={() => setCurrencyPickerVisible(true)} style={{ marginTop: 12 }}>
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={16}
            borderWidth={1} borderColor={C.border}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={40} height={40} borderRadius={12} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                <WalletIcon size={18} strokeWidth={2} color={C.primary} />
              </Stack>
              <Stack flex={1}>
                <Text variant="label" color={C.textPrimary} fontWeight="700">Currency</Text>
                <Text variant="caption" color={C.textSecondary}>
                  {getCurrency(currencyCode).symbol} · {getCurrency(currencyCode).name}
                </Text>
              </Stack>
              <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
            </Stack>
          </StyledCard>
        </StyledPressable>

        <Text variant="body" paddingHorizontal={16} color={C.textMuted} style={{ marginTop: 20, marginBottom: 4 }}>
          Appearance
        </Text>

        <Stack horizontal marginTop={16} gap={10}>
          {APPEARANCE_OPTIONS.map(({ mode: m, label, Icon }) => {
            const selected = mode === m
            return (
              <StyledPressable
                key={m}
                flex={1}
                backgroundColor={selected ? C.navy : C.bgCard}
                borderWidth={1} borderColor={selected ? C.navy : C.border}
                borderRadius={12} paddingVertical={14}
                alignItems="center" gap={6}
                onPress={() => setMode(m)}
              >
                <Icon size={18} strokeWidth={2} color={selected ? C.white : C.textSecondary} />
                <Text variant="caption" fontWeight="700" color={selected ? C.white : C.textSecondary}>
                  {label}
                </Text>
              </StyledPressable>
            )
          })}
        </Stack>

        {/* App info */}
        <Stack alignItems="center" gap={6} style={{ marginTop: 28 }}>
          <Stack width={36} height={36} borderRadius={12} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
            <SparkleIcon size={17} strokeWidth={2} color={C.primary} />
          </Stack>
          <Text variant="caption" color={C.textSecondary} fontWeight="700" style={{ marginTop: 4 }}>
            NailBid v1.0.0
          </Text>
          <Text variant="caption" color={C.textMuted}>Create professional quotes in 2 minutes</Text>
        </Stack>
      </StyledScrollView>

      <CurrencyPicker
        visible={currencyPickerVisible}
        selectedCode={currencyCode}
        onClose={() => setCurrencyPickerVisible(false)}
        onSelect={setCurrencyCode}
      />
    </StyledPage>
  )
}
