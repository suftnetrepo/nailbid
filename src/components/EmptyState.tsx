import React from 'react'
import { Stack, StyledCard, StyledButton } from 'fluent-styles'
import { Text } from './Text'
import { useColors } from '../constants'

interface EmptyStateProps {
  emoji:     string
  title:     string
  subtitle?: string
  action?:   { label: string; onPress: () => void }
  style?:    { marginTop?: number }
}

// The "nothing here yet" card — emoji, title, subtitle, optional CTA — was
// the same StyledCard/Stack shell duplicated across every list and detail
// screen with an empty state, differing only in copy and whether a button
// was present.
export function EmptyState({ emoji, title, subtitle, action, style }: EmptyStateProps) {
  const C = useColors()

  return (
    <StyledCard backgroundColor={C.bgCard} borderRadius={14} padding={32} marginTop={style?.marginTop ?? 8}>
      <Stack alignItems="center" gap={8}>
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
        <Text variant="subtitle" color={C.textPrimary} fontWeight="700">{title}</Text>
        {subtitle && (
          <Text variant="body" color={C.textSecondary} textAlign="center">{subtitle}</Text>
        )}
        {action && (
          <StyledButton
            backgroundColor={C.primary} borderRadius={10}
            paddingHorizontal={20} paddingVertical={10}
            onPress={action.onPress}
            style={{ marginTop: 8 }}
          >
            <Text variant="button" color={C.white}>{action.label}</Text>
          </StyledButton>
        )}
      </Stack>
    </StyledCard>
  )
}
