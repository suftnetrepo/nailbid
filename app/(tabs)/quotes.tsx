import React, { useState } from 'react'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledPressable, StyledButton,
  TabBar, type TabItem,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import { StatusBadge } from '../../src/components/StatusBadge'
import { EmptyState } from '../../src/components/EmptyState'
import { useColors, useIsDark, getStatusColors } from '../../src/constants'
import { useQuotes } from '../../src/hooks'
import { formatCurrency, formatShortDate } from '../../src/utils'
import type { Quote } from '../../src/db/schema'

type StatusFilter = 'all' | Quote['status']

const TABS: TabItem<StatusFilter>[] = [
  { value: 'all',       label: 'All'       },
  { value: 'draft',     label: 'Draft'     },
  { value: 'sent',      label: 'Sent'      },
  { value: 'accepted',  label: 'Accepted'  },
  { value: 'converted', label: 'Invoiced'  },
]

export default function QuotesScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const STATUS_COLORS = getStatusColors(C)
  const { data: quotes, loading } = useQuotes()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const filtered = filter === 'all' ? quotes : quotes.filter((q) => q.status === filter)

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
      <ScreenHeader title="Quotes" variant="large" onBackPress={() => router.push('/(tabs)')} />

      <TabBar
        options={TABS}
        value={filter}
        onChange={setFilter}
        indicator="line"
        showBorder
        tabAlign="scroll"
        style={{ marginTop: 12, marginHorizontal: 16 }}
        colors={{
          background:  C.bgCard,
          activeText:  C.primary,
          indicator:   C.primary,
          text:        C.textSecondary,
          border:      C.border,
        }}
      />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {loading && (
          <Text variant="body" color={C.textMuted} textAlign="center" style={{ marginTop: 32 }}>
            Loading…
          </Text>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            emoji="📄"
            title={filter === 'all' ? 'No quotes yet' : `No ${filter} quotes`}
            subtitle={filter === 'all' ? 'Create your first quote in 2 minutes' : 'Nothing here'}
          />
        )}

        {filtered.map((q) => (
          <StyledPressable key={q.id} onPress={() => router.push(`/quote/${q.id}`)}>
            <StyledCard
              backgroundColor={C.bgCard} borderRadius={14}
              padding={14} marginBottom={10}
            >
              <Stack horizontal alignItems="flex-start" justifyContent="space-between">
                <Stack flex={1} gap={2}>
                  <Stack horizontal alignItems="center" gap={8}>
                    <Text variant="label" color={C.textPrimary}>{q.customerName}</Text>
                    <StatusBadge
                      status={q.status}
                      colors={STATUS_COLORS[q.status]}
                      label={q.status === 'converted' ? 'Invoiced' : undefined}
                    />
                  </Stack>
                  <Text variant="bodySmall" color={C.textSecondary} numberOfLines={1}>
                    {q.description}
                  </Text>
                  <Stack horizontal alignItems="center" gap={8} style={{ marginTop: 2 }}>
                    <Text variant="caption" color={C.textMuted}>{q.number}</Text>
                    {q.validUntil && (
                      <Text variant="caption" color={C.textMuted}>
                        · Valid to {formatShortDate(q.validUntil)}
                      </Text>
                    )}
                  </Stack>
                </Stack>
                <Stack alignItems="flex-end" gap={4} style={{ marginLeft: 12 }}>
                  <Text variant="label" color={C.textPrimary} fontWeight="700">
                    {formatCurrency(q.total)}
                  </Text>
                  <Text variant="caption" color={C.textMuted}>
                    {q.items.length} item{q.items.length !== 1 ? 's' : ''}
                  </Text>
                </Stack>
              </Stack>
            </StyledCard>
          </StyledPressable>
        ))}
      </StyledScrollView>

      {/* FAB */}
      <Stack position="absolute" bottom={80} right={20}>
        <StyledButton
          backgroundColor={C.primary}
          borderRadius={28}
          paddingHorizontal={20} paddingVertical={14}
          onPress={() => router.push('/quote/new')}
        >
          <Stack horizontal alignItems="center" gap={6}>
            <Text style={{ fontSize: 16 }}>⚡</Text>
            <Text variant="button" color={C.white}>New quote</Text>
          </Stack>
        </StyledButton>
      </Stack>
    </StyledPage>
  )
}
