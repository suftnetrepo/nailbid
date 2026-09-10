import React from 'react'
import { StyledBadge } from 'fluent-styles'

interface StatusBadgeProps {
  status:  string
  /** From STATUS_COLORS[status] (see src/constants) — optional because a
   *  status not present in that map should still render, just untinted,
   *  rather than crashing on an undefined lookup. */
  colors?: { bg?: string; text?: string }
  /** 'sm' — list rows (Quotes/Invoices tabs, customer's quote history).
   *  'md' — detail screen headers (Quote/Invoice detail). Default 'sm'. */
  size?:   'sm' | 'md'
  /** Override the displayed text — e.g. quote status 'converted' reads as
   *  "Invoiced" on most (not all — customer detail keeps "Converted") screens. */
  label?:  string
}

// Same StyledBadge configuration (colors/padding/radius/weight) was
// hand-copied into every list row and detail header across 5 screens, with
// only the size (list vs detail) and occasional label override differing.
export function StatusBadge({ status, colors, size = 'sm', label }: StatusBadgeProps) {
  const isSm = size === 'sm'
  const text = label ?? (status.charAt(0).toUpperCase() + status.slice(1))

  return (
    <StyledBadge
      backgroundColor={colors?.bg} color={colors?.text}
      paddingHorizontal={isSm ? 7 : 10} paddingVertical={isSm ? 2 : 4}
      borderRadius={999} fontSize={isSm ? 10 : 12} fontWeight="600"
    >
      {text}
    </StyledBadge>
  )
}
