import React, { useState } from 'react'
import { Stack, StyledPressable } from 'fluent-styles'
import { Text } from './Text'
import { useColors } from '../constants'
import { SECURITY_CONFIG } from '../constants/security'

interface PinPadProps {
  title:      string
  subtitle?:  string
  onComplete: (pin: string) => void
  error?:     string
  loading?:   boolean
}

// Layout: 1-9 then empty/0/backspace
const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['',  '0', '⌫'],
]

export function PinPad({ title, subtitle, onComplete, error, loading }: PinPadProps) {
  const C   = useColors()
  const [pin, setPin] = useState('')
  const len = SECURITY_CONFIG.pinLength

  const handleKey = (key: string) => {
    if (loading) return
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (key === '') return
    const next = pin + key
    setPin(next)
    if (next.length === len) {
      onComplete(next)
      setPin('')
    }
  }

  return (
    <Stack alignItems="center" gap={36} flex={1} justifyContent="center">
      {/* Title */}
      <Stack alignItems="center" gap={8}>
        <Text variant="header" color={C.textPrimary} fontWeight="800">{title}</Text>
        {subtitle ? (
          <Text variant="body" color={C.textSecondary} textAlign="center" style={{ paddingHorizontal: 32 }}>
            {subtitle}
          </Text>
        ) : null}
      </Stack>

      {/* PIN dots */}
      <Stack
        horizontal gap={20} alignItems="center"
        accessible
        accessibilityLabel={`${pin.length} of ${len} digits entered`}
        accessibilityLiveRegion="polite"
      >
        {Array.from({ length: len }).map((_, i) => (
          <Stack
            key={i}
            width={16} height={16} borderRadius={8}
            backgroundColor={i < pin.length ? C.primary : 'transparent'}
            borderWidth={2.5}
            borderColor={error ? C.error : i < pin.length ? C.primary : C.primaryBg}
          />
        ))}
      </Stack>

      {/* Error */}
      {error ? (
        <Text variant="bodySmall" color={C.error} textAlign="center" style={{ paddingHorizontal: 32 }}>
          {error}
        </Text>
      ) : null}

      {/* Keypad */}
      <Stack gap={14} alignItems="center">
        {KEY_ROWS.map((row, ri) => (
          <Stack key={ri} horizontal gap={16}>
            {row.map((key, ki) => {
              const isEmpty = key === ''
              return (
                <StyledPressable
                  key={ki}
                  width={80} height={80} borderRadius={40}
                  backgroundColor={isEmpty ? 'transparent' : C.bgMuted}
                  alignItems="center" justifyContent="center"
                  onPress={() => handleKey(key)}
                  disabled={isEmpty || loading}
                  {...(isEmpty
                    ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const }
                    : {
                        accessibilityRole: 'button' as const,
                        accessibilityLabel: key === '⌫' ? 'Delete last digit' : `Digit ${key}`,
                        accessibilityState: { disabled: loading },
                      })}
                >
                  <Text variant="title" color={isEmpty ? 'transparent' : C.textPrimary} fontWeight="600">
                    {key}
                  </Text>
                </StyledPressable>
              )
            })}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
