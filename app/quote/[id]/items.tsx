import React, { useState } from 'react'
import { Platform } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledButton, StyledPressable, StyledDivider,
  Popup, StyledForm, useToast,
} from 'fluent-styles'
import { Text } from '../../../src/components/Text'
import { ScreenHeader } from '../../../src/components/ScreenHeader'
import {
  useColors, useIsDark, getPopupColors, getFieldColors,
} from '../../../src/constants'
import { useQuotes } from '../../../src/hooks'
import { formatCurrency, calcTotals, goBack } from '../../../src/utils'
import { quoteService } from '../../../src/services/quoteService'
import { TrashIcon } from '../../../src/icons'

type ItemType = 'labour' | 'material'

export default function QuoteItemsScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: quotes, addItem, removeItem } = useQuotes()
  const toast = useToast()

  const quote = quotes.find((q) => q.id === id)

  const [addVisible,  setAddVisible]  = useState(false)
  const [itemType,    setItemType]    = useState<ItemType>('labour')
  const [description, setDescription] = useState('')
  const [quantity,    setQuantity]    = useState('1')
  const [unitPrice,   setUnitPrice]   = useState('')
  const [saving,      setSaving]      = useState(false)

  const resetForm = () => {
    setDescription('')
    setQuantity('1')
    setUnitPrice('')
    setItemType('labour')
  }

  const handleAdd = async () => {
    if (!description.trim() || !unitPrice || isNaN(Number(unitPrice))) {
      toast.error('Missing fields', 'Please fill in description and price')
      return
    }
    setSaving(true)
    try {
      await addItem({
        quoteId:     id,
        type:        itemType,
        description: description.trim(),
        quantity:    Number(quantity) || 1,
        unitPrice:   Number(unitPrice),
        sortOrder:   (quote?.items.length ?? 0),
      })
      setAddVisible(false)
      resetForm()
      toast.success('Item added')
    } catch (e: any) {
      toast.error('Failed to add item', e?.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId, id)
  }

  const handleFinish = async () => {
    router.replace(`/quote/${id}`)
  }

  const items    = quote?.items ?? []
  const labour   = items.filter((i) => i.type === 'labour')
  const material = items.filter((i) => i.type === 'material')
  const totals   = quote
    ? calcTotals(items, quote.vatRate, quote.cisRate)
    : { subtotal: 0, cisDeduction: 0, vat: 0, total: 0 }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
      <ScreenHeader
        title={quote?.number ? `Add items · ${quote.number}` : 'Add items'}
        onBackPress={() => goBack(`/quote/${id}`)}
        fontSize={15}
        rightIcon={
          <Text variant="caption" fontWeight="700" color={C.textMuted}>2/2</Text>
        }
      />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        {/* Labour */}
        <Stack horizontal alignItems="center" justifyContent="space-between" style={{ marginBottom: 8 }}>
          <Text variant="label" color={C.textPrimary}>Labour</Text>
          <StyledPressable
            onPress={() => { setItemType('labour'); setAddVisible(true) }}
            backgroundColor={C.primaryBg} borderRadius={8}
            paddingHorizontal={12} paddingVertical={5}
          >
            <Text variant="caption" color={C.primary} fontWeight="700">+ Add labour</Text>
          </StyledPressable>
        </Stack>

        {labour.length === 0 && (
          <StyledCard backgroundColor={C.bgCard} borderRadius={12} padding={14} marginBottom={12}>
            <Text variant="body" color={C.textMuted} textAlign="center">No labour items yet</Text>
          </StyledCard>
        )}
        {labour.map((item) => (
          <StyledCard key={item.id} backgroundColor={C.bgCard} borderRadius={12} padding={14} marginBottom={8}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack flex={1}>
                <Text variant="label" color={C.textPrimary}>{item.description}</Text>
                <Text variant="caption" color={C.textSecondary}>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </Text>
              </Stack>
              <Stack horizontal alignItems="center" gap={12}>
                <Text variant="label" color={C.textPrimary} fontWeight="700">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </Text>
                <StyledPressable
                  onPress={() => handleRemove(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.description}`}
                >
                  <TrashIcon size={18} strokeWidth={2} color={C.textMuted} />
                </StyledPressable>
              </Stack>
            </Stack>
          </StyledCard>
        ))}

        {/* Materials */}
        <Stack horizontal alignItems="center" justifyContent="space-between" style={{ marginTop: 8, marginBottom: 8 }}>
          <Text variant="label" color={C.textPrimary}>Materials</Text>
          <StyledPressable
            onPress={() => { setItemType('material'); setAddVisible(true) }}
            backgroundColor={C.primaryBg} borderRadius={8}
            paddingHorizontal={12} paddingVertical={5}
          >
            <Text variant="caption" color={C.primary} fontWeight="700">+ Add material</Text>
          </StyledPressable>
        </Stack>

        {material.length === 0 && (
          <StyledCard backgroundColor={C.bgCard} borderRadius={12} padding={14} marginBottom={12}>
            <Text variant="body" color={C.textMuted} textAlign="center">No material items yet</Text>
          </StyledCard>
        )}
        {material.map((item) => (
          <StyledCard key={item.id} backgroundColor={C.bgCard} borderRadius={12} padding={14} marginBottom={8}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Stack flex={1}>
                <Text variant="label" color={C.textPrimary}>{item.description}</Text>
                <Text variant="caption" color={C.textSecondary}>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </Text>
              </Stack>
              <Stack horizontal alignItems="center" gap={12}>
                <Text variant="label" color={C.textPrimary} fontWeight="700">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </Text>
                <StyledPressable
                  onPress={() => handleRemove(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.description}`}
                >
                  <TrashIcon size={18} strokeWidth={2} color={C.textMuted} />
                </StyledPressable>
              </Stack>
            </Stack>
          </StyledCard>
        ))}

        {/* Totals */}
        {items.length > 0 && (
          <StyledCard backgroundColor={C.bgCard} borderRadius={14} padding={16} style={{ marginTop: 12 }}>
            <Stack horizontal alignItems="center" justifyContent="space-between" style={{ marginBottom: 6 }}>
              <Text variant="body" color={C.textSecondary}>Subtotal</Text>
              <Text variant="body" color={C.textPrimary}>{formatCurrency(totals.subtotal)}</Text>
            </Stack>
            {totals.cisDeduction > 0 && (
              <Stack horizontal alignItems="center" justifyContent="space-between" style={{ marginBottom: 6 }}>
                <Text variant="body" color={C.textSecondary}>CIS ({quote?.cisRate}%)</Text>
                <Text variant="body" color={C.error}>-{formatCurrency(totals.cisDeduction)}</Text>
              </Stack>
            )}
            <Stack horizontal alignItems="center" justifyContent="space-between" style={{ marginBottom: 6 }}>
              <Text variant="body" color={C.textSecondary}>VAT ({quote?.vatRate}%)</Text>
              <Text variant="body" color={C.textPrimary}>{formatCurrency(totals.vat)}</Text>
            </Stack>
            <StyledDivider borderBottomColor={C.border} marginVertical={8} />
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Text variant="subtitle" color={C.textPrimary} fontWeight="700">Total</Text>
              <Text variant="subtitle" color={C.textPrimary} fontWeight="800">
                {formatCurrency(totals.total)}
              </Text>
            </Stack>
          </StyledCard>
        )}
      </StyledScrollView>

      {/* Bottom CTA */}
      <Stack
        position="absolute" bottom={0} left={0} right={0}
        backgroundColor={C.bgCard}
        padding={16}
        style={{ borderTopWidth: 0.5, borderTopColor: C.border }}
      >
        <StyledButton
          block backgroundColor={C.primary}
          borderRadius={12} paddingVertical={14}
          onPress={handleFinish}
        >
          <Text variant="button" color={C.white}>
            {items.length === 0 ? 'Skip & preview quote' : 'Preview quote'}
          </Text>
        </StyledButton>
      </Stack>

      {/* Add item popup */}
      <Popup
        visible={addVisible}
        onClose={() => { setAddVisible(false); resetForm() }}
        colors={getPopupColors(C)}
        title={itemType === 'labour' ? 'Add labour' : 'Add material'}
        showClose
        round
        safeAreaBottom
      >
        <Stack padding={16} gap={14}>
          <StyledForm.Input
            label="Description"
            labelProps={{ color: C.textPrimary }}
            variant="outline"
            placeholder={itemType === 'labour' ? 'e.g. Groundwork (2 days)' : 'e.g. Bricks (500 units)'}
            value={description}
            onChangeText={setDescription}
            focusColor={C.primary}
            colors={getFieldColors(C)}
          />
          <Stack horizontal gap={12}>
            <Stack flex={1}>
              <StyledForm.Input
                label="Quantity"
                labelProps={{ color: C.textPrimary }}
                variant="outline"
                keyboardType="decimal-pad"
                value={quantity}
                onChangeText={setQuantity}
                focusColor={C.primary}
                colors={getFieldColors(C)}
              />
            </Stack>
            <Stack flex={1}>
              <StyledForm.Input
                label={itemType === 'labour' ? 'Day rate (£)' : 'Unit price (£)'}
                labelProps={{ color: C.textPrimary }}
                variant="outline"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={unitPrice}
                onChangeText={setUnitPrice}
                focusColor={C.primary}
                colors={getFieldColors(C)}
              />
            </Stack>
          </Stack>

          {description && unitPrice && !isNaN(Number(unitPrice)) && (
            <StyledCard backgroundColor={C.primaryBg} borderRadius={10} padding={12}>
              <Stack horizontal alignItems="center" justifyContent="space-between">
                <Text variant="bodySmall" color={C.primary}>Line total</Text>
                <Text variant="label" color={C.primary} fontWeight="700">
                  {formatCurrency((Number(quantity) || 1) * Number(unitPrice))}
                </Text>
              </Stack>
            </StyledCard>
          )}

          <StyledButton
            block loading={saving}
            backgroundColor={C.primary}
            borderRadius={12} paddingVertical={13}
            onPress={handleAdd}
          >
            <Text variant="button" color={C.white}>
              {saving ? 'Adding…' : `Add ${itemType}`}
            </Text>
          </StyledButton>
        </Stack>
      </Popup>
    </StyledPage>
  )
}
