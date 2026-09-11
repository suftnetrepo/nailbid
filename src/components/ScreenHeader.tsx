import React from 'react'
import { StyledPage, Stack } from 'fluent-styles'
import { Text } from './Text'
import { useColors, getBackArrowProps, getBackShapeProps } from '../constants'

interface ScreenHeaderProps {
  title:       string
  onBackPress: () => void
  /**
   * 'compact' — small centered bold title, the default used by every detail,
   * form and settings-style screen (Quote, Invoice, Settings, Security…).
   * 'large' — big left-aligned title folded into the header row, used by the
   * three tab list screens (Quotes, Invoices, Customers) for a bolder feel.
   */
  variant?:    'compact' | 'large'
  rightIcon?:  React.ReactNode
  /** compact variant only — detail screens use 17 (the default); the item
   *  picker screen uses 15 to fit its longer "Add items · Q-0001" titles. */
  fontSize?:   number
  /** Extra space above the header row. Defaults to 0 — every pushed screen
   *  already gets the right top inset for free. Modal-presented screens
   *  (currently just the paywall) don't, and need this passed explicitly so
   *  the back/close button isn't flush against the top edge of the sheet. */
  marginTop?:  number
}

// Ported out of ~11 screens that were each hand-rolling the identical
// StyledPage.Header block (same backArrowProps/shapeProps/titleProps every
// time, only title/onBackPress/rightIcon actually varying) — a change to the
// header's look used to mean editing every screen individually.
export function ScreenHeader({ title, onBackPress, variant = 'compact', rightIcon, fontSize = 17, marginTop = 0 }: ScreenHeaderProps) {
  const C = useColors()

  if (variant === 'large') {
    return (
      <StyledPage.Header
        backgroundColor={C.bg}
        marginHorizontal={16}
        marginTop={marginTop}
        showBackArrow
        backArrowProps={getBackArrowProps(C)}
        shapeProps={getBackShapeProps(C, 48)}
        onBackPress={onBackPress}
        title=" "
        titleAlignment="left"
        leftIcon={
          <Stack paddingHorizontal={16}>
            <Text variant="header" color={C.textPrimary}>{title}</Text>
          </Stack>
        }
        rightIcon={rightIcon}
      />
    )
  }

  return (
    <StyledPage.Header
      backgroundColor={C.bg}
      marginHorizontal={16}
      marginTop={marginTop}
      showBackArrow
      backArrowProps={getBackArrowProps(C)}
      shapeProps={getBackShapeProps(C, 48)}
      onBackPress={onBackPress}
      title={title}
      titleAlignment="center"
      titleProps={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize, color: C.textPrimary }}
      rightIcon={rightIcon}
    />
  )
}
