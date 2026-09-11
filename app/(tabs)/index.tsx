import React from 'react'
import { router } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledButton, StyledPressable,
  StyledDivider,
} from 'fluent-styles'
import { Image, Platform } from 'react-native'
import { Text } from '../../src/components/Text'
import { useColors, useIsDark, getStatusColors } from '../../src/constants'
import { useDashboard, useQuotes, useInvoices, useSettings } from '../../src/hooks'
import { formatCurrency, formatShortDate, LOGO_MIME_TYPE } from '../../src/utils'
import { useAuthStore } from '../../src/stores'
import {
  GearIcon, PlusIcon, PersonPlusIcon, DocumentIcon, ReceiptIcon,
  AlertTriangleIcon, CheckCircleIcon, ChevronRightIcon, ChevronDownIcon,
  TrendUpIcon, TrendDownIcon, BarChartIcon, PaperPlaneIcon, LockIcon,
} from '../../src/icons'

const greetingFor = (hour: number) =>
  hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

// Small icon shown inside each status pill — purely decorative, keyed off
// the same status string the badge text already renders.
const STATUS_ICON: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  sent:      PaperPlaneIcon,
  accepted:  CheckCircleIcon,
  converted: DocumentIcon,
  paid:      CheckCircleIcon,
  overdue:   AlertTriangleIcon,
  draft:     DocumentIcon,
  unpaid:    DocumentIcon,
  declined:  DocumentIcon,
  cancelled: DocumentIcon,
}

// Hero metric cards always sit on the dark navy hero card regardless of
// light/dark app theme (it's a deliberately fixed dark surface, same as the
// "Total" bands on the quote/invoice detail screens) — so these use fixed,
// theme-independent tints rather than the app's light/dark palette.
const HERO_TINTS = {
  overdue: { bg: 'rgba(239,68,68,0.16)',  solid: '#EF4444' },
  quotes:  { bg: 'rgba(59,130,246,0.16)', solid: '#3B82F6' },
  paid:    { bg: 'rgba(34,197,94,0.16)',  solid: '#22C55E' },
}

export default function DashboardScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const STATUS_COLORS = getStatusColors(C)
  const { data: dash }     = useDashboard()
  const { data: quotes }   = useQuotes()
  const { data: invoices } = useInvoices()
  const { data: settings } = useSettings()
  const hasPin = useAuthStore((s) => s.hasPin)

  const recentQuotes   = quotes.slice(0, 3)
  const recentInvoices = invoices.slice(0, 3)
  const now = new Date()

  const trend = dash.paidTrendPercent
  const TrendIcon = trend !== null && trend < 0 ? TrendDownIcon : TrendUpIcon
  const trendColor = trend !== null && trend < 0 ? '#F87171' : '#4ADE80'

  return (
    <StyledPage
      flex={1}
      backgroundColor={C.bg}
      showStatusBar
      statusBarStyle={isDark ? 'light-content' : 'dark-content'}
      statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}
    >
      <StyledPage.Header.Full>
         {/* Greeting header */}
        <Stack marginHorizontal={24} horizontal alignItems="flex-start" justifyContent="space-between">
          <Stack justifyContent='flex-start' alignItems="center" horizontal flex={1} gap={12}>
            <StyledPressable onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Open Settings">
              <Stack width={40} height={40} borderRadius={20} backgroundColor={C.primary} alignItems="center" justifyContent="center" style={{ overflow: 'hidden' }}>
                {settings?.logoBase64 ? (
                  <Image
                    source={{ uri: `data:${LOGO_MIME_TYPE};base64,${settings.logoBase64}` }}
                    style={{ width: 40, height: 40 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text variant="label" color={C.white} fontWeight="800">
                    {(settings?.businessName?.trim().charAt(0) || 'N').toUpperCase()}
                  </Text>
                )}
              </Stack>
            </StyledPressable>
            <Stack flex={1}>
              <Text variant="body" color={C.textSecondary}>{greetingFor(now.getHours())}</Text>
              <Text variant="title" color={C.textPrimary} numberOfLines={1} style={{ marginTop: 2 }}>
                {settings?.businessName || 'NailBid'}
              </Text>
            </Stack>
          </Stack>
          <Stack horizontal gap={10}>
            {hasPin && (
              <StyledPressable
                width={44} height={44} borderRadius={22}
                backgroundColor={C.bgMuted}
                alignItems="center" justifyContent="center"
                onPress={() => useAuthStore.getState().setLocked(true)}
                accessibilityRole="button"
                accessibilityLabel="Lock NailBid"
              >
                <LockIcon size={18} strokeWidth={1.8} color={C.textSecondary} />
              </StyledPressable>
            )}
            <StyledPressable
              width={44} height={44} borderRadius={22}
              backgroundColor={C.bgMuted}
              alignItems="center" justifyContent="center"
              onPress={() => router.push('/settings')}
            >
              <GearIcon size={19} strokeWidth={1.8} color={C.textSecondary} />
            </StyledPressable>
          </Stack>
        </Stack>
      
      </StyledPage.Header.Full>
      <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 40 }}>

       
        {/* Hero card — outstanding balance */}
        <Stack
          backgroundColor={C.navy} borderRadius={24} padding={22} marginBottom={16}
          style={{
            overflow: 'hidden',
            shadowColor: '#0d0d1a', shadowOpacity: 0.28, shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 }, elevation: 8,
          }}
        >
          {/* Decorative glow — purely visual, behind the content */}
          <Stack
            position="absolute" top={-110} right={-90} width={260} height={260} borderRadius={999}
            backgroundColor="rgba(232,71,10,0.07)" pointerEvents="none"
          />

          <Stack horizontal alignItems="flex-start" justifyContent="space-between">
            <Stack>
              <Text variant="bodySmall" color="rgba(255,255,255,0.6)">Outstanding</Text>
              <Text variant="amount" color={C.white} style={{ marginTop: 2 }}>
                {formatCurrency(dash.outstanding)}
              </Text>
              {trend !== null && (
                <Stack horizontal alignItems="center" gap={5} style={{ marginTop: 6 }}>
                  <TrendIcon size={12} strokeWidth={2.4} color={trendColor} />
                  <Text variant="caption" fontWeight="700" color={trendColor}>
                    {trend >= 0 ? '+' : ''}{trend}%
                  </Text>
                  <Text variant="caption" color="rgba(255,255,255,0.5)">vs last month</Text>
                </Stack>
              )}
            </Stack>

            <Stack
              horizontal alignItems="center" gap={5}
              backgroundColor="rgba(255,255,255,0.1)" borderRadius={999}
              paddingHorizontal={10} paddingVertical={7}
            >
              <BarChartIcon size={13} strokeWidth={2.2} color={C.white} />
              <Text variant="caption" color={C.white} fontWeight="700">This month</Text>
              <ChevronDownIcon size={11} strokeWidth={2.4} color="rgba(255,255,255,0.6)" />
            </Stack>
          </Stack>

          <Stack horizontal gap={10} style={{ marginTop: 18 }}>
            <StyledPressable flex={1} onPress={() => router.push('/(tabs)/invoices')}>
              <Stack backgroundColor={HERO_TINTS.overdue.bg} borderRadius={14} padding={12} gap={8}>
                <Stack width={30} height={30} borderRadius={15} backgroundColor={HERO_TINTS.overdue.solid} alignItems="center" justifyContent="center">
                  <AlertTriangleIcon size={14} strokeWidth={2.2} color={C.white} />
                </Stack>
                <Text variant="subtitle" paddingHorizontal={12} color={C.white} fontWeight="800">{dash.overdueCount}</Text>
                <Stack horizontal alignItems="center" justifyContent="space-between">
                  <Text variant="caption" color="rgba(255,255,255,0.65)">Overdue</Text>
                  <ChevronRightIcon size={11} strokeWidth={2.4} color="rgba(255,255,255,0.4)" />
                </Stack>
              </Stack>
            </StyledPressable>
            <StyledPressable flex={1} onPress={() => router.push('/(tabs)/quotes')}>
              <Stack backgroundColor={HERO_TINTS.quotes.bg} borderRadius={14} padding={12} gap={8}>
                <Stack width={30} height={30} borderRadius={15} backgroundColor={HERO_TINTS.quotes.solid} alignItems="center" justifyContent="center">
                  <DocumentIcon size={14} strokeWidth={2.2} color={C.white} />
                </Stack>
                <Text variant="subtitle"  paddingHorizontal={12} color={C.white} fontWeight="800">{dash.openQuotes}</Text>
                <Stack horizontal alignItems="center" justifyContent="space-between">
                  <Text variant="caption" color="rgba(255,255,255,0.65)">Quotes</Text>
                  <ChevronRightIcon size={11} strokeWidth={2.4} color="rgba(255,255,255,0.4)" />
                </Stack>
              </Stack>
            </StyledPressable>
            <StyledPressable flex={1} onPress={() => router.push('/(tabs)/invoices')}>
              <Stack backgroundColor={HERO_TINTS.paid.bg} borderRadius={14} padding={12} gap={8}>
                <Stack width={30} height={30} borderRadius={15} backgroundColor={HERO_TINTS.paid.solid} alignItems="center" justifyContent="center">
                  <ReceiptIcon size={14} strokeWidth={2.2} color={C.white} />
                </Stack>
                <Text variant="subtitle"  paddingHorizontal={12} color={C.white} fontWeight="800">{dash.openInvoicesCount}</Text>
                <Stack horizontal alignItems="center" justifyContent="space-between">
                  <Text variant="caption" color="rgba(255,255,255,0.65)">Invoices</Text>
                  <ChevronRightIcon size={11} strokeWidth={2.4} color="rgba(255,255,255,0.4)" />
                </Stack>
              </Stack>
            </StyledPressable>
          </Stack>
        </Stack>

        {/* Quick actions */}
        <Stack horizontal gap={10} marginBottom={8}>
          <StyledButton
            flex={1} backgroundColor={C.primary}
            borderRadius={14} paddingVertical={13}
            onPress={() => router.push('/quote/new')}
          >
            <Stack horizontal alignItems="center" justifyContent="center" gap={7}>
              <PlusIcon size={16} strokeWidth={2.4} color={C.white} />
              <Text variant="button" color={C.white}>New quote</Text>
            </Stack>
          </StyledButton>
          <StyledButton
            backgroundColor={C.bgCard} borderWidth={1} borderColor={C.border}
            borderRadius={14} paddingVertical={13} paddingHorizontal={16}
            onPress={() => router.push('/customer/new')}
          >
            <Stack horizontal alignItems="center" justifyContent="center" gap={7}>
              <PersonPlusIcon size={16} strokeWidth={2.2} color={C.textPrimary} />
              <Text variant="button" color={C.textPrimary}>Add customer</Text>
            </Stack>
          </StyledButton>
        </Stack>

        {/* Recent quotes */}
        <Stack horizontal paddingHorizontal={16} alignItems="center" justifyContent="space-between" marginBottom={10}>
          <Text variant="body" color={C.textMuted}>Recent quotes</Text>
          <StyledPressable onPress={() => router.push('/(tabs)/quotes')} hitSlop={8}>
            <Stack horizontal alignItems="center" gap={3}>
              <Text variant="caption" color={C.primary} fontWeight="700">See all</Text>
              <ChevronRightIcon size={12} strokeWidth={2.4} color={C.primary} />
            </Stack>
          </StyledPressable>
        </Stack>

        {recentQuotes.length === 0 ? (
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={20} marginBottom={8}
            borderWidth={1} borderColor={C.border}
          >
            <Text variant="body" color={C.textMuted} textAlign="center">
              No quotes yet — tap New quote to start
            </Text>
          </StyledCard>
        ) : (
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={18}
            borderWidth={1} borderColor={C.border} overflow="hidden" marginBottom={8}
            shadow="light"
          >
            {recentQuotes.map((q, i) => {
              const sc = STATUS_COLORS[q.status]
              const StatusIcon = STATUS_ICON[q.status] ?? DocumentIcon
              return (
                <React.Fragment key={q.id}>
                  {i > 0 && <StyledDivider height={0.4} borderBottomColor={C.border} marginLeft={62} />}
                  <StyledPressable onPress={() => router.push(`/quote/${q.id}`)}>
                    <Stack horizontal alignItems="center" gap={12} paddingHorizontal={14} paddingVertical={13}>
                      <Stack width={38} height={38} borderRadius={12} backgroundColor={sc?.bg} alignItems="center" justifyContent="center">
                        <DocumentIcon size={17} strokeWidth={2} color={sc?.text} />
                      </Stack>
                      <Stack flex={1}>
                        <Text variant="label" color={C.textPrimary} numberOfLines={1}>{q.customerName}</Text>
                        <Text variant="caption" color={C.textSecondary} numberOfLines={1}>{q.description}</Text>
                        <Text variant="caption" color={C.textMuted}>{formatShortDate(q.createdAt)}</Text>
                      </Stack>
                      <Stack alignItems="flex-end" gap={5}>
                        <Text variant="label" color={C.textPrimary} fontWeight="700">
                          {formatCurrency(q.total)}
                        </Text>
                        <Stack
                          horizontal alignItems="center" gap={3}
                          backgroundColor={sc?.bg}
                          paddingHorizontal={7} paddingVertical={3}
                          borderRadius={999}
                        >
                          <StatusIcon size={9} strokeWidth={2.4} color={sc?.text} />
                          <Text fontSize={10} fontWeight="600" color={sc?.text}>
                            {q.status === 'converted' ? 'Invoiced' : q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                          </Text>
                        </Stack>
                      </Stack>
                      <ChevronRightIcon size={15} strokeWidth={2} color={C.textMuted} />
                    </Stack>
                  </StyledPressable>
                </React.Fragment>
              )
            })}
          </StyledCard>
        )}

        {/* Recent invoices */}
        <Stack horizontal paddingHorizontal={16} alignItems="center" justifyContent="space-between" marginBottom={10}>
          <Text variant="body" color={C.textMuted}>Recent invoices</Text>
          <StyledPressable onPress={() => router.push('/(tabs)/invoices')} hitSlop={8}>
            <Stack horizontal alignItems="center" gap={3}>
              <Text variant="caption" color={C.primary} fontWeight="700">See all</Text>
              <ChevronRightIcon size={12} strokeWidth={2.4} color={C.primary} />
            </Stack>
          </StyledPressable>
        </Stack>

        {recentInvoices.length === 0 ? (
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={16} padding={20}
            borderWidth={1} borderColor={C.border}
          >
            <Text variant="body" color={C.textMuted} textAlign="center">No invoices yet</Text>
          </StyledCard>
        ) : (
          <StyledCard
            backgroundColor={C.bgCard} borderRadius={18}
            borderWidth={1} borderColor={C.border} overflow="hidden"
            shadow="light"
          >
            {recentInvoices.map((inv, i) => {
              const sc = STATUS_COLORS[inv.status]
              const StatusIcon = STATUS_ICON[inv.status] ?? ReceiptIcon
              return (
                <React.Fragment key={inv.id}>
                  {i > 0 && <StyledDivider height={0.4} borderBottomColor={C.border} marginLeft={62} />}
                  <StyledPressable onPress={() => router.push(`/invoice/${inv.id}`)}>
                    <Stack horizontal alignItems="center" gap={12} paddingHorizontal={14} paddingVertical={13}>
                      <Stack width={38} height={38} borderRadius={12} backgroundColor={sc?.bg} alignItems="center" justifyContent="center">
                        <ReceiptIcon size={17} strokeWidth={2} color={sc?.text} />
                      </Stack>
                      <Stack flex={1}>
                        <Text variant="label" color={C.textPrimary} numberOfLines={1}>{inv.customerName}</Text>
                        <Text variant="caption" color={C.textSecondary} numberOfLines={1}>
                          Due {formatShortDate(inv.dueDate)}
                        </Text>
                      </Stack>
                      <Stack alignItems="flex-end" gap={5}>
                        <Text variant="label" color={C.textPrimary} fontWeight="700">
                          {formatCurrency(inv.total)}
                        </Text>
                        <Stack
                          horizontal alignItems="center" gap={3}
                          backgroundColor={sc?.bg}
                          paddingHorizontal={7} paddingVertical={3}
                          borderRadius={999}
                        >
                          <StatusIcon size={9} strokeWidth={2.4} color={sc?.text} />
                          <Text fontSize={10} fontWeight="600" color={sc?.text}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </Text>
                        </Stack>
                      </Stack>
                      <ChevronRightIcon size={15} strokeWidth={2} color={C.textMuted} />
                    </Stack>
                  </StyledPressable>
                </React.Fragment>
              )
            })}
          </StyledCard>
        )}

      </StyledScrollView>
    </StyledPage>
  )
}
