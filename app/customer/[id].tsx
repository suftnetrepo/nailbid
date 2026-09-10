import React, { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledPressable, StyledButton, StyledShape,
  StyledSpacer, StyledSeperator, StyledDivider, Popup,
  useDialogue, useToast,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import { StatusBadge } from '../../src/components/StatusBadge'
import {
  useColors, useIsDark, avatarColor,
  getBackShapeProps, getStatusColors, getPopupColors,
} from '../../src/constants'
import { useCustomers, useQuotes } from '../../src/hooks'
import { formatCurrency, formatShortDate, getInitials, goBack } from '../../src/utils'
import { customerService } from '../../src/services/customerService'
import type { CustomerWithStats } from '../../src/hooks'
import {
  TrashIcon, PlusIcon, MailIcon, PhoneIcon, MapPinIcon, MoreHorizontalIcon,
  DocumentIcon, ReceiptIcon, WalletIcon, ChevronRightIcon,
} from '../../src/icons'

export default function CustomerDetailScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const STATUS_COLORS = getStatusColors(C)
  const { id } = useLocalSearchParams<{ id: string }>()
  const { remove } = useCustomers()
  const { data: quotes } = useQuotes(id)
  const dialogue = useDialogue()
  const toast    = useToast()

  const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
  const [moreVisible, setMoreVisible] = useState(false)

  useEffect(() => {
    if (id) customerService.getById(id).then(setCustomer)
  }, [id])

  const handleDelete = async () => {
    const ok = await dialogue.confirm({
      title:        'Delete customer?',
      message:      'This will also delete all their quotes and invoices.',
      icon:         '⚠️',
      confirmLabel: 'Delete',
      destructive:  true,
    })
    if (ok) {
      await remove(id)
      toast.success('Customer deleted')
      goBack('/(tabs)/customers')
    }
  }

  if (!customer) {
    return (
      <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
        <ScreenHeader title="Customer" onBackPress={() => goBack('/(tabs)/customers')} />
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text variant="body" color={C.textMuted}>Loading…</Text>
        </Stack>
      </StyledPage>
    )
  }

  const av = avatarColor(customer.name)

  // Quick actions only ever expose what this customer's data can actually
  // back — an email tile with no email address would just be a dead tap.
  const quickActions = [
    customer.email && {
      key: 'email', label: 'Email', Icon: MailIcon,
      bg: C.convertedBg, solid: C.converted,
      onPress: () => Linking.openURL(`mailto:${customer.email}`),
    },
    customer.phone && {
      key: 'call', label: 'Call', Icon: PhoneIcon,
      bg: C.acceptedBg, solid: C.accepted,
      onPress: () => Linking.openURL(`tel:${customer.phone}`),
    },
    customer.address && {
      key: 'address', label: 'View address', Icon: MapPinIcon,
      bg: C.sentBg, solid: C.sent,
      onPress: () => Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(customer.address!)}`),
    },
    {
      key: 'more', label: 'More', Icon: MoreHorizontalIcon,
      bg: C.bgMuted, solid: C.textSecondary,
      onPress: () => setMoreVisible(true),
    },
  ].filter(Boolean) as { key: string; label: string; Icon: typeof MailIcon; bg: string; solid: string; onPress: () => void }[]

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'}>
      <ScreenHeader
        title={customer.name}
        onBackPress={() => goBack('/(tabs)/customers')}
        fontSize={16}
        rightIcon={
          <StyledPressable onPress={handleDelete}>
            <StyledShape cycle {...getBackShapeProps(C, 48)}>
              <TrashIcon size={18} strokeWidth={2} color={C.textSecondary} />
            </StyledShape>
          </StyledPressable>
        }
      />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Customer summary card */}
        <StyledCard
          backgroundColor={C.bgCard} borderRadius={20} padding={18} marginBottom={16}
          borderWidth={1} borderColor={C.border}
          style={{ overflow: 'hidden' }}
        >
          {/* Decorative glow — subtle, matches the dashboard hero card */}
          <Stack
            position="absolute" top={-70} right={-70} width={130} height={130}
            borderRadius={65} backgroundColor={C.acceptedBg} opacity={0.5} pointerEvents="none"
          />

          <Stack horizontal alignItems="flex-start" justifyContent="space-between" style={{ marginBottom: 14 }}>
            <Stack horizontal alignItems="center" gap={14} flex={1}>
              <Stack
                width={60} height={60} borderRadius={30}
                backgroundColor={av.bg}
                alignItems="center" justifyContent="center"
              >
                <Text variant="title" color={av.text} fontWeight="800">
                  {getInitials(customer.name)}
                </Text>
              </Stack>
              <Stack flex={1} gap={2}>
                <Text variant="title" color={C.textPrimary} fontWeight="800" numberOfLines={2}>
                  {customer.name}
                </Text>
              </Stack>
            </Stack>

            <Stack
              horizontal alignItems="center" gap={5}
              backgroundColor={C.acceptedBg} borderRadius={999}
              paddingHorizontal={10} paddingVertical={5}
            >
              <Stack width={6} height={6} borderRadius={3} backgroundColor={C.accepted} />
              <Text variant="caption" color={C.accepted} fontWeight="700">Active</Text>
            </Stack>
          </Stack>

          {(customer.email || customer.address) && (
            <Stack gap={8} style={{ marginBottom: 14 }}>
              {customer.email && (
                <Stack horizontal alignItems="center" gap={8}>
                  <MailIcon size={14} strokeWidth={2} color={C.textMuted} />
                  <Text variant="bodySmall" color={C.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                    {customer.email}
                  </Text>
                </Stack>
              )}
              {customer.address && (
                <Stack horizontal alignItems="flex-start" gap={8}>
                  <Stack style={{ marginTop: 2 }}>
                    <MapPinIcon size={14} strokeWidth={2} color={C.textMuted} />
                  </Stack>
                  <Text variant="bodySmall" color={C.textSecondary} style={{ flex: 1 }}>
                    {customer.address}
                  </Text>
                </Stack>
              )}
            </Stack>
          )}

          <StyledDivider backgroundColor={C.border} marginBottom={14} />

          <Stack horizontal gap={10}>
            <StyledCard flex={1} backgroundColor={C.bg} borderRadius={12} padding={12} gap={8}>
              <Stack width={30} height={30} borderRadius={9} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                <DocumentIcon size={14} strokeWidth={2.2} color={C.primary} />
              </Stack>
              <Text variant="metric" color={C.textPrimary} fontWeight="800">{customer.quoteCount}</Text>
              <Text variant="caption" color={C.textSecondary}>Quotes</Text>
            </StyledCard>
            <StyledCard flex={1} backgroundColor={C.bg} borderRadius={12} padding={12} gap={8}>
              <Stack width={30} height={30} borderRadius={9} backgroundColor={C.convertedBg} alignItems="center" justifyContent="center">
                <ReceiptIcon size={14} strokeWidth={2.2} color={C.converted} />
              </Stack>
              <Text variant="metric" color={C.textPrimary} fontWeight="800">{customer.invoiceCount}</Text>
              <Text variant="caption" color={C.textSecondary}>Invoices</Text>
            </StyledCard>
            <StyledCard flex={1} backgroundColor={C.bg} borderRadius={12} padding={12} gap={8}>
              <Stack width={30} height={30} borderRadius={9} backgroundColor={C.acceptedBg} alignItems="center" justifyContent="center">
                <WalletIcon size={14} strokeWidth={2.2} color={C.accepted} />
              </Stack>
              <Text variant="subLabel" color={C.textPrimary} fontWeight="800" numberOfLines={1}>
                {formatCurrency(customer.totalValue)}
              </Text>
              <Text variant="caption" color={C.textSecondary}>Total value</Text>
            </StyledCard>
          </Stack>
        </StyledCard>

        {/* Quotes */}
        <StyledSeperator
          leftLabel="Quotes"
          rightLabel="New quote"
          marginBottom={10}
          rightLabelProps={{
            color: C.primary, fontWeight: '600', fontSize: 13,
            onPress: () => router.push({ pathname: '/quote/new', params: { customerId: id } }),
          } as any}
        />

        {quotes.length === 0 ? (
          <StyledCard backgroundColor={C.bgCard} borderRadius={12} padding={20} marginBottom={8}
            borderWidth={1} borderColor={C.border}>
            <Text variant="body" color={C.textMuted} textAlign="center">No quotes yet</Text>
          </StyledCard>
        ) : quotes.map((q) => {
          const sc = STATUS_COLORS[q.status]
          return (
            <StyledPressable key={q.id} onPress={() => router.push(`/quote/${q.id}`)}>
              <StyledCard
                backgroundColor={C.bgCard} borderRadius={14}
                padding={14} marginBottom={8}
                borderWidth={1} borderColor={C.border}
              >
                <Stack horizontal alignItems="center" justifyContent="space-between" gap={10}>
                  <Stack flex={1} gap={2}>
                    <Text variant="label" color={C.textPrimary} numberOfLines={1}>
                      {q.description}
                    </Text>
                    <Stack horizontal alignItems="center" gap={6}>
                      <Text variant="caption" color={C.textMuted}>{q.number}</Text>
                      {q.validUntil && (
                        <Text variant="caption" color={C.textMuted}>
                          · {formatShortDate(q.validUntil)}
                        </Text>
                      )}
                    </Stack>
                  </Stack>
                  <Stack alignItems="flex-end" gap={4}>
                    <Text variant="label" color={C.textPrimary}>{formatCurrency(q.total)}</Text>
                    <StatusBadge status={q.status} colors={sc} />
                  </Stack>
                  <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
                </Stack>
              </StyledCard>
            </StyledPressable>
          )
        })}

        <StyledSpacer height={16} />

        <StyledButton
          block backgroundColor={C.primary}
          borderRadius={12} paddingVertical={14}
          onPress={() => router.push({ pathname: '/quote/new', params: { customerId: id } })}
        >
          <Stack horizontal alignItems="center" gap={6}>
            <PlusIcon size={16} strokeWidth={2.4} color={C.white} />
            <Text variant="button" color={C.white}>New quote</Text>
          </Stack>
        </StyledButton>

        {/* Quick actions */}
        <Text variant="overline" color={C.textMuted} style={{ marginTop: 24, marginBottom: 10 }}>
          Quick actions
        </Text>
        <Stack horizontal gap={10}>
          {quickActions.map(({ key, label, Icon, bg, solid, onPress }) => (
            <StyledPressable key={key} flex={1} onPress={onPress}>
              <StyledCard
                backgroundColor={C.bgCard} borderRadius={14} padding={12}
                borderWidth={1} borderColor={C.border}
                alignItems="center" gap={8}
              >
                <Stack width={34} height={34} borderRadius={11} backgroundColor={bg} alignItems="center" justifyContent="center">
                  <Icon size={16} strokeWidth={2} color={solid} />
                </Stack>
                <Text variant="caption" color={C.textSecondary} textAlign="center" numberOfLines={1}>
                  {label}
                </Text>
              </StyledCard>
            </StyledPressable>
          ))}
        </Stack>

        {/* Additional navigation */}
        <StyledCard
          backgroundColor={C.bgCard} borderRadius={14} padding={4}
          borderWidth={1} borderColor={C.border}
          style={{ marginTop: 16 }}
        >
          <StyledPressable onPress={() => router.push('/(tabs)/quotes')}>
            <Stack horizontal alignItems="center" gap={12} paddingHorizontal={12} paddingVertical={12}>
              <DocumentIcon size={17} strokeWidth={2} color={C.textSecondary} />
              <Text variant="label" color={C.textPrimary} style={{ flex: 1 }}>View all quotes</Text>
              <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
            </Stack>
          </StyledPressable>
          <StyledDivider backgroundColor={C.border} marginHorizontal={12} />
          <StyledPressable onPress={() => router.push('/(tabs)/invoices')}>
            <Stack horizontal alignItems="center" gap={12} paddingHorizontal={12} paddingVertical={12}>
              <ReceiptIcon size={17} strokeWidth={2} color={C.textSecondary} />
              <Text variant="label" color={C.textPrimary} style={{ flex: 1 }}>View all invoices</Text>
              <ChevronRightIcon size={16} strokeWidth={2} color={C.textMuted} />
            </Stack>
          </StyledPressable>
        </StyledCard>
      </StyledScrollView>

      {/* More options */}
      <Popup
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        colors={getPopupColors(C)}
        title="More options"
        showClose round safeAreaBottom
      >
        <Stack padding={16} gap={2}>
          <StyledPressable
            paddingVertical={12}
            onPress={() => { setMoreVisible(false); handleDelete() }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={36} height={36} borderRadius={12} backgroundColor={C.declinedBg} alignItems="center" justifyContent="center">
                <TrashIcon size={17} strokeWidth={2} color={C.error} />
              </Stack>
              <Text variant="label" color={C.error}>Delete customer</Text>
            </Stack>
          </StyledPressable>
        </Stack>
      </Popup>
    </StyledPage>
  )
}
