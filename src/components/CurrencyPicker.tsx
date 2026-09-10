import React, { useMemo } from 'react'
import { Dimensions, SectionList } from 'react-native'
import { Popup, Stack, StyledPressable } from 'fluent-styles'
import { Text } from './Text'
import { useColors, getPopupColors } from '../constants'
import { CURRENCIES, type Currency } from '../constants/currencies'
import { CheckCircleIcon } from '../icons'

// Half the screen's height — fluent-styles' own Popup examples (see
// TallContent in the library's example app) cap a scrollable body with
// `maxHeight` on the ScrollView/list itself rather than forcing a `height`
// onto the Popup surface; the surface then just sizes to that content.
const HALF_SCREEN_HEIGHT = Dimensions.get('window').height * 0.5

const SECTIONS = (() => {
  const byRegion = new Map<string, Currency[]>()
  for (const c of CURRENCIES) {
    const list = byRegion.get(c.region) ?? []
    list.push(c)
    byRegion.set(c.region, list)
  }
  return Array.from(byRegion.entries()).map(([title, data]) => ({ title, data }))
})()

interface CurrencyPickerProps {
  visible:      boolean
  selectedCode: string
  onClose:      () => void
  onSelect:     (code: string) => void
}

// A dedicated picker rather than StyledDropdown's built-in searchable list —
// that combination (searchable + groupBy + ~50 rows) froze the app on
// scroll. A plain SectionList, height-capped at half the screen and grouped
// by region, is enough to find a currency by scrolling — no search input.
export function CurrencyPicker({ visible, selectedCode, onClose, onSelect }: CurrencyPickerProps) {
  const C = useColors()

  return (
    <Popup
      visible={visible}
      onClose={onClose}
      colors={getPopupColors(C)}
      title="Select currency"
      showClose
      safeAreaBottom
    >
      <SectionList
        style={{ maxHeight: HALF_SCREEN_HEIGHT }}
        showsVerticalScrollIndicator
        sections={SECTIONS}
        keyExtractor={(item) => item.code}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        renderSectionHeader={({ section }) => (
          <Stack backgroundColor={C.bg} paddingHorizontal={16} paddingTop={14} paddingBottom={6}>
            <Text variant="overline" color={C.textMuted}>{section.title}</Text>
          </Stack>
        )}
        renderItem={({ item }) => {
          const selected = item.code === selectedCode
          return (
            <StyledPressable
              onPress={() => { onSelect(item.code); onClose() }}
              flexDirection="row" alignItems="center"
              paddingHorizontal={16} paddingVertical={12} gap={12}
              backgroundColor={selected ? C.primaryBg : 'transparent'}
              accessibilityRole="button"
              accessibilityLabel={`${item.code} — ${item.name}`}
            >
              <Stack width={36} height={36} borderRadius={10} backgroundColor={C.bgMuted} alignItems="center" justifyContent="center">
                <Text variant="label" color={C.textPrimary} fontWeight="700">{item.symbol}</Text>
              </Stack>
              <Stack flex={1}>
                <Text variant="label" color={C.textPrimary} fontWeight={selected ? '700' : '500'}>{item.code}</Text>
                <Text variant="caption" color={C.textSecondary}>{item.name}</Text>
              </Stack>
              {selected && <CheckCircleIcon size={18} strokeWidth={2} color={C.primary} />}
            </StyledPressable>
          )
        }}
      />
    </Popup>
  )
}
