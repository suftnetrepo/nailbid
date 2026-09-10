import React, { useState } from 'react'
import { router } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledPressable, StyledButton, StyledTextInput,
  StyledSpacer, StyledShape,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import { EmptyState } from '../../src/components/EmptyState'
import {
  useColors, useIsDark, avatarColor, getFieldColors,
} from '../../src/constants'
import { useCustomers } from '../../src/hooks'
import { formatCurrency, getInitials } from '../../src/utils'

export default function CustomersScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const { data: customers, loading } = useCustomers()
  const [search, setSearch] = useState('')

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <ScreenHeader title="Customers" variant="large" onBackPress={() => router.push('/(tabs)')} />

      <Stack paddingHorizontal={16} paddingTop={12} paddingBottom={4}>
        <StyledTextInput
          variant="filled"
          placeholder="Search by name, phone or email…"
          value={search}
          onChangeText={setSearch}
          clearable
          focusColor={C.primary}
          colors={getFieldColors(C)}
        />
      </Stack>

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}>
        {loading && (
          <Text variant="body" color={C.textMuted} textAlign="center" style={{ marginTop: 32 }}>
            Loading…
          </Text>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            emoji="👷"
            title={search ? 'No results' : 'No customers yet'}
            subtitle={search ? 'Try a different search' : 'Add your first customer to get started'}
            action={search ? undefined : { label: 'Add customer', onPress: () => router.push('/customer/new') }}
          />
        )}

        {filtered.map((c) => {
          const av = avatarColor(c.name)
          return (
            <StyledPressable key={c.id} onPress={() => router.push(`/customer/${c.id}`)}>
              <StyledCard
                backgroundColor={C.bgCard} borderRadius={14}
                padding={14} marginBottom={10}
              >
                <Stack horizontal alignItems="center" gap={12}>
                  <StyledShape
                    size={44} borderRadius={22}
                    backgroundColor={av.bg}
                    alignItems="center" justifyContent="center"
                  >
                    <Text variant="label" color={av.text} fontWeight="700">
                      {getInitials(c.name)}
                    </Text>
                  </StyledShape>

                  <Stack flex={1}>
                    <Text variant="label" color={C.textPrimary}>{c.name}</Text>
                    {c.phone ? (
                      <Text variant="bodySmall" color={C.textSecondary}>{c.phone}</Text>
                    ) : c.email ? (
                      <Text variant="bodySmall" color={C.textSecondary}>{c.email}</Text>
                    ) : (
                      <Text variant="bodySmall" color={C.textMuted}>No contact info</Text>
                    )}
                    <Text variant="caption" color={C.textMuted}>
                      {c.quoteCount} quote{c.quoteCount !== 1 ? 's' : ''}
                      {c.totalValue > 0 ? ` · ${formatCurrency(c.totalValue)}` : ''}
                    </Text>
                  </Stack>

                  <Text style={{ fontSize: 18, color: C.textMuted }}>›</Text>
                </Stack>
              </StyledCard>
            </StyledPressable>
          )
        })}
      </StyledScrollView>

      {/* FAB */}
      <Stack
        position="absolute" bottom={80} right={20}
      >
        <StyledButton
          backgroundColor={C.primary}
          borderRadius={28}
          paddingHorizontal={20} paddingVertical={14}
          onPress={() => router.push('/customer/new')}
        >
          <Stack horizontal alignItems="center" gap={6}>
            <Text style={{ fontSize: 16 }}>➕</Text>
            <Text variant="button" color={C.white}>Add customer</Text>
          </Stack>
        </StyledButton>
      </Stack>
    </StyledPage>
  )
}
