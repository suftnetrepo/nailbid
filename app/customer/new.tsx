import React, { useState } from 'react'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledButton, StyledForm, useToast,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import { useColors, useIsDark, getFieldColors } from '../../src/constants'
import { useCustomers } from '../../src/hooks'
import { goBack } from '../../src/utils'

export default function NewCustomerScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const { create } = useCustomers()
  const toast = useToast()

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [address, setAddress] = useState('')
  const [notes,   setNotes]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const nameError  = name.trim().length === 0
  const [touched, setTouched] = useState(false)

  const handleSave = async () => {
    setTouched(true)
    if (!name.trim()) return
    setSaving(true)
    try {
      await create({ name: name.trim(), phone: phone || null, email: email || null, address: address || null, notes: notes || null, sortOrder: 0 })
      toast.success('Customer added')
      // Always land on the customer list (not wherever this form happened to
      // be opened from, e.g. the dashboard's quick action) so the new
      // customer is immediately visible.
      router.replace('/(tabs)/customers')
    } catch (e: any) {
      toast.error('Failed to save', e?.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
      <ScreenHeader title="New customer" onBackPress={() => goBack('/(tabs)/customers')} />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <StyledForm gap={14} avoidKeyboard scrollable={false}>
          <Text variant="overline" color={C.textMuted} style={{ marginBottom: 4 }}>
            Contact details
          </Text>

          <StyledForm.Input
            label="Full name"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="e.g. John Johnson"
            required
            value={name}
            onChangeText={setName}
            error={touched && nameError}
            errorMessage="Name is required"
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <StyledForm.Input
            label="Phone number"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="e.g. 07700 900123"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <StyledForm.Input
            label="Email address"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="e.g. john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <StyledForm.Input
            label="Address"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="Job site or billing address"
            multiline
            value={address}
            onChangeText={setAddress}
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <StyledForm.Input
            label="Notes"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder="Any notes about this customer…"
            multiline
            showCounter
            maxLength={300}
            value={notes}
            onChangeText={setNotes}
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />

          <StyledForm.Actions style={{ marginTop: 8 }}>
            <StyledButton
              block
              loading={saving}
              backgroundColor={C.primary}
              borderRadius={12}
              paddingVertical={14}
              onPress={handleSave}
            >
              <Text variant="button" color={C.white}>
                {saving ? 'Saving…' : 'Add customer'}
              </Text>
            </StyledButton>
          </StyledForm.Actions>
        </StyledForm>
      </StyledScrollView>
    </StyledPage>
  )
}
