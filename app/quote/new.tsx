import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledButton, StyledForm, StyledDropdown, useToast,
  StyledCard,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import {
  useColors, useIsDark,
  getFieldColors, getSwitchColors, getDatePickerColors,
} from '../../src/constants'
import { useQuotes, useCustomers, useSettings } from '../../src/hooks'
import { addDays, isPreset, sanitizeNumeric, parseClamped, goBack } from '../../src/utils'

// Same UK-VAT presets as Settings, plus "Custom…" for the rare rate outside
// the three legally-defined ones (see settings.tsx for the fuller rationale).
const VAT_RATE_OPTIONS = [
  { value: '0',  label: '0% (Zero-rated)' },
  { value: '5',  label: '5% (Reduced)'    },
  { value: '20', label: '20% (Standard)'  },
  { value: 'custom', label: 'Custom…'     },
]

export default function NewQuoteScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const params = useLocalSearchParams<{ customerId?: string }>()
  const { create } = useQuotes()
  const { data: customers } = useCustomers()
  const { data: settings }  = useSettings()
  const toast = useToast()

  const [customerId,   setCustomerId]   = useState(params.customerId ?? '')
  const [description,  setDescription]  = useState('')
  const [reference,    setReference]    = useState('')
  const [notes,        setNotes]        = useState('')
  const [validUntil,   setValidUntil]   = useState<Date | null>(addDays(new Date(), 30))
  const [vatRate,      setVatRate]      = useState(String(settings?.defaultVatRate ?? 20))
  const [vatRateCustom, setVatRateCustom] = useState(
    !isPreset(String(settings?.defaultVatRate ?? 20), VAT_RATE_OPTIONS)
  )
  const [cisEnabled,   setCisEnabled]   = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [touched,      setTouched]      = useState(false)

  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }))

  const handleNext = async () => {
    setTouched(true)
    if (!customerId || !description.trim()) return

    setSaving(true)
    try {
      const q = await create({
        customerId,
        description:  description.trim(),
        reference:    reference || null,
        notes:        notes || null,
        status:       'draft',
        validUntil,
        vatRate:      parseClamped(vatRate, 20, 100),
        cisRate:      cisEnabled ? (settings?.defaultCisRate ?? 20) : 0,
      })
      toast.success('Quote created')
      router.replace(`/quote/${q.id}/items`)
    } catch (e: any) {
      toast.error('Failed to create quote', e?.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <ScreenHeader
        title="New quote"
        onBackPress={() => goBack()}
        rightIcon={
          <Text variant="caption" fontWeight="700" color={C.textMuted}>1/2</Text>
        }
      />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <StyledForm gap={14} avoidKeyboard scrollable={false}>

          <Text variant="overline" color={C.textMuted} style={{ marginBottom: 4 }}>
            Job details
          </Text>

          {/* Customer picker */}
          <Text variant="label" color={C.textPrimary} style={{ marginBottom: 6 }}>
            Customer
          </Text>
          <StyledDropdown
            placeholder="Select a customer…"
            data={customerOptions}
            value={customerId}
            onChange={(item) => setCustomerId(item.value)}
            variant="outline"
            size="md"
            colors={getFieldColors(C)}
            focusColor={C.primary}
          />
          {touched && !customerId && (
            <Text variant="caption" color={C.error} style={{ marginTop: -8 }}>
              Please select a customer
            </Text>
          )}

          <StyledForm.Input
            label="Job description"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="e.g. Kitchen extension — rear wall"
            required
            value={description}
            onChangeText={setDescription}
            error={touched && !description.trim()}
            errorMessage="Description is required"
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <Stack horizontal gap={12}>
            <Stack flex={1}>
              <StyledForm.Input
                label="Reference (optional)"
                labelProps={{ color: C.textPrimary }}
                variant="outline"
                placeholder="e.g. EXT-001"
                value={reference}
                onChangeText={setReference}
                focusColor={C.primary}
                colors={getFieldColors(C)}
              />
            </Stack>
            <Stack flex={1}>
              <Text variant="label" color={C.textPrimary} style={{ marginBottom: 6 }}>
                Valid until
              </Text>
              <StyledForm.DatePicker
                mode="date"
                variant="input"
                value={validUntil}
                onChange={setValidUntil}
                onConfirm={setValidUntil}
                colors={getDatePickerColors(C)}
              />
            </Stack>
          </Stack>

          <StyledForm.Input
            label="Notes for customer (optional)"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="Payment terms, site access, exclusions…"
            multiline
            showCounter
            maxLength={500}
            value={notes}
            onChangeText={setNotes}
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <Text variant="overline" color={C.textMuted} style={{ marginTop: 8, marginBottom: 4 }}>
            Tax settings
          </Text>

          <StyledCard backgroundColor={C.bgCard} borderRadius={12} padding={14}>
            <Stack horizontal alignItems="center" justifyContent="space-between" style={{ marginBottom: vatRateCustom ? 10 : 12 }}>
              <Stack>
                <Text variant="label" color={C.textPrimary}>VAT rate</Text>
                <Text variant="caption" color={C.textMuted}>Applied to total</Text>
              </Stack>
              <StyledDropdown
                placeholder="Select"
                minWidth={170}
                data={VAT_RATE_OPTIONS}
                value={vatRateCustom ? 'custom' : vatRate}
                onChange={(item) => {
                  if (item.value === 'custom') { setVatRateCustom(true); return }
                  setVatRateCustom(false)
                  setVatRate(item.value)
                }}
                variant="outline"
                size="sm"
                colors={getFieldColors(C)}
                focusColor={C.primary}
              />
            </Stack>

            {vatRateCustom && (
              <Stack style={{ marginBottom: 12 }}>
                <StyledForm.Input
                  variant="outline"
                  size="sm"
                  placeholder="e.g. 12.5"
                  keyboardType="decimal-pad"
                  rightIcon={<Text variant="label" color={C.textMuted}>%</Text>}
                  value={vatRate}
                  onChangeText={(t: string) => setVatRate(sanitizeNumeric(t, true))}
                  focusColor={C.primary}
                  colors={getFieldColors(C)}
                />
              </Stack>
            )}

            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack>
                <Text variant="label" color={C.textPrimary}>CIS deduction</Text>
                <Text variant="caption" color={C.textMuted}>Construction Industry Scheme</Text>
              </Stack>
              <StyledForm.Switch
                value={cisEnabled}
                onChange={setCisEnabled}
                activeColor={C.primary}
                colors={getSwitchColors(C)}
              />
            </Stack>
          </StyledCard>

          <StyledForm.Actions style={{ marginTop: 8 }}>
            <StyledButton
              block loading={saving}
              backgroundColor={C.primary}
              borderRadius={12} paddingVertical={14}
              onPress={handleNext}
            >
              <Stack horizontal alignItems="center" gap={8}>
                <Text variant="button" color={C.white}>
                  {saving ? 'Creating…' : 'Next: add items'}
                </Text>
                <Text style={{ fontSize: 16 }}>→</Text>
              </Stack>
            </StyledButton>
          </StyledForm.Actions>

        </StyledForm>
      </StyledScrollView>
    </StyledPage>
  )
}
