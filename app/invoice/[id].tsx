import React, { useState } from 'react'
import { Share, Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledButton, StyledPressable, StyledDivider,
  Popup, useDialogue, useToast,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import { StatusBadge } from '../../src/components/StatusBadge'
import { useColors, useIsDark, getStatusColors, getPopupColors } from '../../src/constants'
import { useInvoices, useSettings } from '../../src/hooks'
import { usePremium } from '../../src/hooks/usePremium'
import { formatCurrency, formatShortDate, goBack } from '../../src/utils'
import { exportInvoicePdf, sharePdf } from '../../src/services/pdfService'
import {
  MoreHorizontalIcon, DocumentIcon, ShareIcon, CheckCircleIcon,
  TrashIcon, AlertTriangleIcon,
} from '../../src/icons'

export default function InvoiceDetailScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const STATUS_COLORS = getStatusColors(C)
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: invoices, markPaid, update, remove } = useInvoices()
  const { data: settings } = useSettings()
  const { isPremium } = usePremium()
  const dialogue = useDialogue()
  const toast    = useToast()

  const [exportingPdf, setExportingPdf] = useState(false)
  const [optionsVisible, setOptionsVisible] = useState(false)

  const inv = invoices.find((i) => i.id === id)

  // Auto-flag overdue
  const status = inv && inv.status === 'unpaid' && inv.dueDate < new Date()
    ? 'overdue' as const
    : inv?.status

  if (!inv) {
    return (
      <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
        <ScreenHeader title="Invoice" onBackPress={() => goBack('/(tabs)/invoices')} />
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text variant="body" color={C.textMuted}>Loading…</Text>
        </Stack>
      </StyledPage>
    )
  }

  const sc = STATUS_COLORS[status!]

  const handleShare = async () => {
    const lines = [
      `*INVOICE ${inv.number}*`,
      `From: ${settings?.businessName || 'NailBid'}`,
      `To: ${inv.customerName}`,
      ``,
      `Amount due: *${formatCurrency(inv.total)}*`,
      `Issue date: ${formatShortDate(inv.issueDate)}`,
      `Due date: ${formatShortDate(inv.dueDate)}`,
      inv.quoteNumber ? `\nRef quote: ${inv.quoteNumber}` : '',
      inv.notes ? `\nNotes: ${inv.notes}` : '',
    ].filter(Boolean)

    await Share.share({ message: lines.join('\n') })
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const result = await exportInvoicePdf(inv, settings, isPremium)
      if (!result.ok) {
        toast.error('PDF failed', result.error)
        return
      }
      await sharePdf(result.uri)
      toast.success('Invoice PDF shared')
    } catch (e: any) {
      toast.error('Export failed', e?.message)
    } finally {
      setExportingPdf(false)
    }
  }

  const handleMarkPaid = async () => {
    const ok = await dialogue.confirm({
      title: `Mark ${inv.number} as paid?`,
      message: 'This will record the invoice as settled.',
      icon: '✅',
      confirmLabel: 'Mark paid',
      cancelLabel: 'Cancel',
    })
    if (ok) {
      await markPaid(id)
      toast.success('Invoice marked as paid')
    }
  }

  const handleDelete = async () => {
    const ok = await dialogue.confirm({
      title: 'Delete invoice?',
      message: 'This cannot be undone.',
      icon: '⚠️',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (ok) {
      await remove(id)
      goBack('/(tabs)/invoices')
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
      <ScreenHeader
        title={inv.number}
        onBackPress={() => goBack('/(tabs)/invoices')}
        rightIcon={
          <StyledPressable paddingHorizontal={16} onPress={() => setOptionsVisible(true)}>
            <MoreHorizontalIcon size={22} strokeWidth={2} color={C.textSecondary} />
          </StyledPressable>
        }
      />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>

        {/* Overdue banner */}
        {status === 'overdue' && (
          <StyledCard backgroundColor={C.overdueBg} borderRadius={12} padding={12} marginBottom={12}>
            <Stack horizontal alignItems="center" gap={6}>
              <AlertTriangleIcon size={14} strokeWidth={2} color={C.overdue} />
              <Text variant="label" color={C.overdue} fontWeight="700">
                This invoice is overdue
              </Text>
            </Stack>
            <Text variant="caption" color={C.overdue} style={{ marginTop: 2 }}>
              Was due {formatShortDate(inv.dueDate)} — chase payment by WhatsApp or email
            </Text>
          </StyledCard>
        )}

        {/* Customer + status */}
        <StyledCard backgroundColor={C.bgCard} borderRadius={16} padding={16} marginBottom={12}>
          <Stack horizontal alignItems="flex-start" justifyContent="space-between" style={{ marginBottom: 12 }}>
            <Stack>
              <Text variant="overline" color={C.textMuted}>Customer</Text>
              <Text variant="title" color={C.textPrimary} fontWeight="700">{inv.customerName}</Text>
              {inv.quoteNumber && (
                <Text variant="bodySmall" color={C.textSecondary} style={{ marginTop: 2 }}>
                  From quote {inv.quoteNumber}
                </Text>
              )}
            </Stack>
            <StatusBadge status={status ?? ''} colors={sc} size="md" />
          </Stack>

          <Stack horizontal gap={20}>
            <Stack>
              <Text variant="caption" color={C.textMuted}>Issue date</Text>
              <Text variant="bodySmall" color={C.textPrimary} fontWeight="600">
                {formatShortDate(inv.issueDate)}
              </Text>
            </Stack>
            <Stack>
              <Text variant="caption" color={C.textMuted}>Due date</Text>
              <Text variant="bodySmall"
                color={status === 'overdue' ? C.overdue : C.textPrimary}
                fontWeight="600"
              >
                {formatShortDate(inv.dueDate)}
              </Text>
            </Stack>
            {inv.paidAt && (
              <Stack>
                <Text variant="caption" color={C.textMuted}>Paid on</Text>
                <Text variant="bodySmall" color={C.paid} fontWeight="600">
                  {formatShortDate(inv.paidAt)}
                </Text>
              </Stack>
            )}
          </Stack>
        </StyledCard>

        {/* Amount */}
        <StyledCard backgroundColor={C.bgCard} borderRadius={16} padding={16} marginBottom={12}>
          <Stack horizontal justifyContent="space-between" style={{ marginBottom: 5 }}>
            <Text variant="body" color={C.textSecondary}>Subtotal</Text>
            <Text variant="body" color={C.textPrimary}>{formatCurrency(inv.subtotal)}</Text>
          </Stack>
          {inv.cisDeduction > 0 && (
            <Stack horizontal justifyContent="space-between" style={{ marginBottom: 5 }}>
              <Text variant="body" color={C.textSecondary}>CIS deduction</Text>
              <Text variant="body" color={C.error}>-{formatCurrency(inv.cisDeduction)}</Text>
            </Stack>
          )}
          <Stack horizontal justifyContent="space-between" style={{ marginBottom: 10 }}>
            <Text variant="body" color={C.textSecondary}>VAT</Text>
            <Text variant="body" color={C.textPrimary}>{formatCurrency(inv.vat)}</Text>
          </Stack>
          <StyledCard backgroundColor={C.navy} borderRadius={10} padding={12}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Text variant="label" color="rgba(255,255,255,0.7)">Amount due</Text>
              <Text variant="subtitle" color={C.white} fontWeight="800">
                {formatCurrency(inv.total)}
              </Text>
            </Stack>
          </StyledCard>
        </StyledCard>

        {inv.notes && (
          <StyledCard backgroundColor={C.bgCard} borderRadius={14} padding={14}>
            <Text variant="overline" color={C.textMuted} style={{ marginBottom: 6 }}>Notes</Text>
            <Text variant="body" color={C.textSecondary}>{inv.notes}</Text>
          </StyledCard>
        )}

      </StyledScrollView>

      {/* Bottom actions */}
      <Stack
        position="absolute" bottom={0} left={0} right={0}
        backgroundColor={C.bgCard} padding={16} gap={10}
        style={{ borderTopWidth: 0.5, borderTopColor: C.border }}
      >
        {/* Export PDF + Share text */}
        <Stack horizontal gap={10}>
          <StyledButton
            flex={1}
            loading={exportingPdf}
            backgroundColor={C.primary}
            borderRadius={12} paddingVertical={13}
            onPress={handleExportPdf}
          >
            <Stack horizontal alignItems="center" justifyContent="center" gap={6}>
              <DocumentIcon size={16} strokeWidth={2} color={C.white} />
              <Text variant="button" color={C.white}>
                {exportingPdf ? 'Generating…' : 'Export PDF'}
              </Text>
            </Stack>
          </StyledButton>
          <StyledButton
            backgroundColor={C.navy}
            borderRadius={12} paddingVertical={13} paddingHorizontal={18}
            onPress={handleShare}
          >
            <Stack horizontal alignItems="center" gap={5}>
              <ShareIcon size={16} strokeWidth={2} color={C.white} />
              <Text variant="button" color={C.white}>Share</Text>
            </Stack>
          </StyledButton>
        </Stack>

        {/* Mark paid — only for unpaid/overdue */}
        {(status === 'unpaid' || status === 'overdue') && (
          <StyledButton
            block backgroundColor={C.accepted}
            borderRadius={12} paddingVertical={13}
            onPress={handleMarkPaid}
          >
            <Stack horizontal alignItems="center" gap={8}>
              <CheckCircleIcon size={16} strokeWidth={2} color={C.white} />
              <Text variant="button" color={C.white}>Mark as paid</Text>
            </Stack>
          </StyledButton>
        )}
      </Stack>

      {/* Invoice options popup */}
      <Popup
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        colors={getPopupColors(C)}
        title="Invoice options"
        showClose round safeAreaBottom
      >
        <Stack padding={16} gap={2}>
          <StyledPressable
            paddingVertical={12}
            onPress={() => { setOptionsVisible(false); handleShare() }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={36} height={36} borderRadius={12} backgroundColor={C.bgMuted} alignItems="center" justifyContent="center">
                <ShareIcon size={17} strokeWidth={2} color={C.textSecondary} />
              </Stack>
              <Text variant="label" color={C.textPrimary}>Share / resend</Text>
            </Stack>
          </StyledPressable>

          <StyledDivider borderBottomColor={C.border} marginVertical={2} />

          <StyledPressable
            paddingVertical={12}
            opacity={status === 'paid' ? 0.4 : 1}
            disabled={status === 'paid'}
            onPress={() => { setOptionsVisible(false); handleMarkPaid() }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={36} height={36} borderRadius={12} backgroundColor={C.acceptedBg} alignItems="center" justifyContent="center">
                <CheckCircleIcon size={17} strokeWidth={2} color={C.accepted} />
              </Stack>
              <Text variant="label" color={C.textPrimary}>Mark as paid</Text>
            </Stack>
          </StyledPressable>

          <StyledDivider borderBottomColor={C.border} marginVertical={2} />

          <StyledPressable
            paddingVertical={12}
            onPress={() => { setOptionsVisible(false); handleDelete() }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={36} height={36} borderRadius={12} backgroundColor={C.declinedBg} alignItems="center" justifyContent="center">
                <TrashIcon size={17} strokeWidth={2} color={C.error} />
              </Stack>
              <Text variant="label" color={C.error}>Delete invoice</Text>
            </Stack>
          </StyledPressable>
        </Stack>
      </Popup>
    </StyledPage>
  )
}
