import React, { useState } from 'react'
import { Share, Platform } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import {
  StyledPage, StyledScrollView, Stack,
  StyledCard, StyledButton, StyledPressable, StyledDivider,
  Popup, useDialogue, useToast,
} from 'fluent-styles'
import { Text } from '../../src/components/Text'
import { ScreenHeader } from '../../src/components/ScreenHeader'
import { StatusBadge } from '../../src/components/StatusBadge'
import { useColors, useIsDark, getStatusColors, getPopupColors } from '../../src/constants'
import { useQuotes, useInvoices, useSettings } from '../../src/hooks'
import { usePremium } from '../../src/hooks/usePremium'
import { formatCurrency, formatShortDate, goBack } from '../../src/utils'
import { exportQuotePdf, sharePdf } from '../../src/services/pdfService'
import {
  MoreHorizontalIcon, DocumentIcon, ShareIcon, ReceiptIcon, CheckCircleIcon,
  PencilIcon, TrashIcon,
} from '../../src/icons'

export default function QuoteDetailScreen() {
  const C = useColors()
  const isDark = useIsDark()
  const STATUS_COLORS = getStatusColors(C)
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: quotes, update, remove } = useQuotes()
  const { fromQuote } = useInvoices()
  const { data: settings } = useSettings()
  const { isPremium } = usePremium()
  const dialogue = useDialogue()
  const toast    = useToast()

  const [convertVisible, setConvertVisible] = useState(false)
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [paymentTerms,   setPaymentTerms]   = useState(
    String(settings?.defaultPaymentTerms ?? 14),
  )
  const [converting,   setConverting]   = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const quote = quotes.find((q) => q.id === id)

  if (!quote) {
    return (
      <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
        <ScreenHeader title="Quote" onBackPress={() => goBack('/(tabs)/quotes')} />
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text variant="body" color={C.textMuted}>Loading…</Text>
        </Stack>
      </StyledPage>
    )
  }

  const sc = STATUS_COLORS[quote.status]

  const handleShare = async () => {
    const lines: string[] = [
      `*QUOTE ${quote.number}*`,
      `From: ${settings?.businessName || 'NailBid'}`,
      `To: ${quote.customerName}`,
      ``,
      `*${quote.description}*`,
      ``,
      ...quote.items.map(
        (i) => `${i.description}: ${i.quantity} × £${i.unitPrice.toFixed(2)} = £${(i.quantity * i.unitPrice).toFixed(2)}`,
      ),
      ``,
      `Subtotal: ${formatCurrency(quote.subtotal)}`,
      quote.cisDeduction > 0 ? `CIS (${quote.cisRate}%): -${formatCurrency(quote.cisDeduction)}` : '',
      `VAT (${quote.vatRate}%): ${formatCurrency(quote.vat)}`,
      `*TOTAL: ${formatCurrency(quote.total)}*`,
      quote.validUntil ? `\nValid until: ${formatShortDate(quote.validUntil)}` : '',
      quote.notes ? `\nNotes: ${quote.notes}` : '',
    ].filter(Boolean)

    await Share.share({ message: lines.join('\n') })

    if (quote.status === 'draft') {
      await update(id, { status: 'sent' })
      toast.success('Quote marked as sent')
    }
  }

  const handleMarkAccepted = async () => {
    await update(id, { status: 'accepted' })
    toast.success('Quote marked as accepted')
  }

  const handleDelete = async () => {
    const ok = await dialogue.confirm({
      title: 'Delete quote?',
      message: 'This cannot be undone.',
      icon: '⚠️',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (ok) {
      await remove(id)
      goBack('/(tabs)/quotes')
    }
  }

  const handleConvert = async () => {
    setConverting(true)
    try {
      const inv = await fromQuote(id, Number(paymentTerms) || 14)
      setConvertVisible(false)
      toast.success(`Invoice ${inv.number} created`)
      router.replace(`/invoice/${inv.id}`)
    } catch (e: any) {
      toast.error('Failed to create invoice', e?.message)
    } finally {
      setConverting(false)
    }
  }

  const handleExportPdf = async () => {
    if (!quote) return
    setExportingPdf(true)
    try {
      const result = await exportQuotePdf(quote, settings, isPremium)
      if (!result.ok) {
        toast.error('PDF failed', result.error)
        return
      }
      await sharePdf(result.uri)
      // Mark as sent if still draft
      if (quote.status === 'draft') {
        await update(id, { status: 'sent' })
        toast.success('Quote PDF shared · marked as sent')
      } else {
        toast.success('Quote PDF shared')
      }
    } catch (e: any) {
      toast.error('Export failed', e?.message)
    } finally {
      setExportingPdf(false)
    }
  }

  const labour   = quote.items.filter((i) => i.type === 'labour')
  const material = quote.items.filter((i) => i.type === 'material')

  return (
    <StyledPage flex={1} backgroundColor={C.bg} statusBarStyle={isDark ? 'light-content' : 'dark-content'} statusBarBackgroundColor={Platform.OS === 'android' ? C.bg : undefined}>
      <ScreenHeader
        title={quote.number}
        onBackPress={() => goBack('/(tabs)/quotes')}
        rightIcon={
          <StyledPressable paddingHorizontal={16} onPress={() => setOptionsVisible(true)}>
            <MoreHorizontalIcon size={22} strokeWidth={2} color={C.textSecondary} />
          </StyledPressable>
        }
      />

      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>

        {/* Status + customer */}
        <StyledCard backgroundColor={C.bgCard} borderRadius={16} padding={16} marginBottom={12}>
          <Stack horizontal alignItems="flex-start" justifyContent="space-between" style={{ marginBottom: 12 }}>
            <Stack>
              <Text variant="overline" color={C.textMuted}>Customer</Text>
              <Text variant="title" color={C.textPrimary} fontWeight="700">{quote.customerName}</Text>
              <Text variant="bodySmall" color={C.textSecondary} style={{ marginTop: 2 }}>
                {quote.description}
              </Text>
            </Stack>
            <StatusBadge
              status={quote.status} colors={sc} size="md"
              label={quote.status === 'converted' ? 'Invoiced' : undefined}
            />
          </Stack>

          <Stack horizontal gap={16}>
            {quote.reference && (
              <Stack>
                <Text variant="caption" color={C.textMuted}>Reference</Text>
                <Text variant="bodySmall" color={C.textPrimary} fontWeight="600">{quote.reference}</Text>
              </Stack>
            )}
            {quote.validUntil && (
              <Stack>
                <Text variant="caption" color={C.textMuted}>Valid until</Text>
                <Text variant="bodySmall" color={C.textPrimary} fontWeight="600">
                  {formatShortDate(quote.validUntil)}
                </Text>
              </Stack>
            )}
            <Stack>
              <Text variant="caption" color={C.textMuted}>Created</Text>
              <Text variant="bodySmall" color={C.textPrimary} fontWeight="600">
                {formatShortDate(quote.createdAt)}
              </Text>
            </Stack>
          </Stack>
        </StyledCard>

        {/* Items */}
        <StyledCard backgroundColor={C.bgCard} borderRadius={16} padding={16} marginBottom={12}>
          {labour.length > 0 && (
            <>
              <Text variant="overline" color={C.textMuted} style={{ marginBottom: 8 }}>Labour</Text>
              {labour.map((item) => (
                <Stack key={item.id} horizontal justifyContent="space-between" style={{ marginBottom: 8 }}>
                  <Stack flex={1}>
                    <Text variant="body" color={C.textPrimary}>{item.description}</Text>
                    <Text variant="caption" color={C.textSecondary}>
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </Text>
                  </Stack>
                  <Text variant="label" color={C.textPrimary} fontWeight="600">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </Text>
                </Stack>
              ))}
            </>
          )}

          {material.length > 0 && (
            <>
              {labour.length > 0 && <StyledDivider borderBottomColor={C.border} marginVertical={10} />}
              <Text variant="overline" color={C.textMuted} style={{ marginBottom: 8 }}>Materials</Text>
              {material.map((item) => (
                <Stack key={item.id} horizontal justifyContent="space-between" style={{ marginBottom: 8 }}>
                  <Stack flex={1}>
                    <Text variant="body" color={C.textPrimary}>{item.description}</Text>
                    <Text variant="caption" color={C.textSecondary}>
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </Text>
                  </Stack>
                  <Text variant="label" color={C.textPrimary} fontWeight="600">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </Text>
                </Stack>
              ))}
            </>
          )}

          {quote.items.length === 0 && (
            <Text variant="body" color={C.textMuted} textAlign="center" style={{ paddingVertical: 8 }}>
              No items yet — tap Edit items to add
            </Text>
          )}

          <StyledDivider borderBottomColor={C.border} marginVertical={10} />

          <Stack horizontal justifyContent="space-between" style={{ marginBottom: 5 }}>
            <Text variant="body" color={C.textSecondary}>Subtotal</Text>
            <Text variant="body" color={C.textPrimary}>{formatCurrency(quote.subtotal)}</Text>
          </Stack>
          {quote.cisDeduction > 0 && (
            <Stack horizontal justifyContent="space-between" style={{ marginBottom: 5 }}>
              <Text variant="body" color={C.textSecondary}>CIS ({quote.cisRate}%)</Text>
              <Text variant="body" color={C.error}>-{formatCurrency(quote.cisDeduction)}</Text>
            </Stack>
          )}
          <Stack horizontal justifyContent="space-between" style={{ marginBottom: 10 }}>
            <Text variant="body" color={C.textSecondary}>VAT ({quote.vatRate}%)</Text>
            <Text variant="body" color={C.textPrimary}>{formatCurrency(quote.vat)}</Text>
          </Stack>
          <StyledCard backgroundColor={C.navy} borderRadius={10} padding={12}>
            <Stack horizontal alignItems="center" justifyContent="space-between">
              <Text variant="label" color="rgba(255,255,255,0.7)">Total</Text>
              <Text variant="subtitle" color={C.white} fontWeight="800">
                {formatCurrency(quote.total)}
              </Text>
            </Stack>
          </StyledCard>
        </StyledCard>

        {/* Notes */}
        {quote.notes && (
          <StyledCard backgroundColor={C.bgCard} borderRadius={14} padding={14} marginBottom={12}>
            <Text variant="overline" color={C.textMuted} style={{ marginBottom: 6 }}>Notes</Text>
            <Text variant="body" color={C.textSecondary}>{quote.notes}</Text>
          </StyledCard>
        )}

      </StyledScrollView>

      {/* Bottom actions */}
      <Stack
        position="absolute" bottom={0} left={0} right={0}
        backgroundColor={C.bgCard} padding={16} gap={10}
        style={{ borderTopWidth: 0.5, borderTopColor: C.border }}
      >
        {/* Export PDF + Share text — always show unless converted */}
        {quote.status !== 'converted' && (
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
        )}

        {/* Convert to invoice — only when accepted */}
        {quote.status === 'accepted' && (
          <StyledButton
            block backgroundColor={C.accepted}
            borderRadius={12} paddingVertical={13}
            onPress={() => setConvertVisible(true)}
          >
            <Stack horizontal alignItems="center" gap={8}>
              <ReceiptIcon size={16} strokeWidth={2} color={C.white} />
              <Text variant="button" color={C.white}>Convert to invoice</Text>
            </Stack>
          </StyledButton>
        )}

        {/* Converted — show badge + still allow PDF export */}
        {quote.status === 'converted' && (
          <Stack gap={10}>
            <StyledCard backgroundColor={C.paidBg} borderRadius={12} padding={12}>
              <Stack horizontal alignItems="center" justifyContent="center" gap={6}>
                <CheckCircleIcon size={15} strokeWidth={2} color={C.paid} />
                <Text variant="body" color={C.paid} fontWeight="600">
                  Converted to invoice
                </Text>
              </Stack>
            </StyledCard>
            <StyledButton
              block loading={exportingPdf}
              backgroundColor={C.bgInput}
              borderRadius={12} paddingVertical={12}
              onPress={handleExportPdf}
            >
              <Stack horizontal alignItems="center" justifyContent="center" gap={6}>
                <DocumentIcon size={16} strokeWidth={2} color={C.textSecondary} />
                <Text variant="button" color={C.textSecondary}>
                  {exportingPdf ? 'Generating…' : 'Export quote PDF'}
                </Text>
              </Stack>
            </StyledButton>
          </Stack>
        )}
      </Stack>

      {/* Quote options popup */}
      <Popup
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        colors={getPopupColors(C)}
        title="Quote options"
        showClose round safeAreaBottom
      >
        <Stack padding={16} gap={2}>
          <StyledPressable
            paddingVertical={12}
            onPress={() => { setOptionsVisible(false); router.push(`/quote/${id}/items`) }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={36} height={36} borderRadius={12} backgroundColor={C.primaryBg} alignItems="center" justifyContent="center">
                <PencilIcon size={17} strokeWidth={2} color={C.primary} />
              </Stack>
              <Text variant="label" color={C.textPrimary}>Edit items</Text>
            </Stack>
          </StyledPressable>

          <StyledDivider borderBottomColor={C.border} marginVertical={2} />

          <StyledPressable
            paddingVertical={12}
            opacity={quote.status === 'accepted' ? 0.4 : 1}
            disabled={quote.status === 'accepted'}
            onPress={() => { setOptionsVisible(false); handleMarkAccepted() }}
          >
            <Stack horizontal alignItems="center" gap={12}>
              <Stack width={36} height={36} borderRadius={12} backgroundColor={C.acceptedBg} alignItems="center" justifyContent="center">
                <CheckCircleIcon size={17} strokeWidth={2} color={C.accepted} />
              </Stack>
              <Text variant="label" color={C.textPrimary}>Mark as accepted</Text>
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
              <Text variant="label" color={C.error}>Delete quote</Text>
            </Stack>
          </StyledPressable>
        </Stack>
      </Popup>

      {/* Convert popup */}
      <Popup
        visible={convertVisible}
        onClose={() => setConvertVisible(false)}
        colors={getPopupColors(C)}
        title="Convert to invoice"
        showClose round safeAreaBottom
      >
        <Stack padding={16} gap={14}>
          <StyledCard backgroundColor={C.acceptedBg} borderRadius={12} padding={14}>
            <Stack horizontal alignItems="center" gap={6}>
              <CheckCircleIcon size={14} strokeWidth={2} color={C.accepted} />
              <Text variant="bodySmall" color={C.accepted} fontWeight="600">
                Quote accepted — {quote.customerName}
              </Text>
            </Stack>
            <Text variant="label" color={C.accepted} fontWeight="800" style={{ marginTop: 4 }}>
              {formatCurrency(quote.total)}
            </Text>
          </StyledCard>

          <Stack>
            <Text variant="label" color={C.textPrimary} style={{ marginBottom: 6 }}>
              Payment terms
            </Text>
            <Stack horizontal gap={8}>
              {['7', '14', '30'].map((d) => (
                <StyledPressable
                  key={d}
                  flex={1}
                  backgroundColor={paymentTerms === d ? C.navy : C.bgInput}
                  borderRadius={10}
                  paddingVertical={10}
                  alignItems="center"
                  onPress={() => setPaymentTerms(d)}
                >
                  <Text variant="label"
                    color={paymentTerms === d ? C.white : C.textSecondary}
                    fontWeight="700"
                  >
                    {d} days
                  </Text>
                </StyledPressable>
              ))}
            </Stack>
          </Stack>

          <StyledButton
            block loading={converting}
            backgroundColor={C.primary}
            borderRadius={12} paddingVertical={14}
            onPress={handleConvert}
          >
            <Text variant="button" color={C.white}>
              {converting ? 'Creating…' : 'Create invoice'}
            </Text>
          </StyledButton>
        </Stack>
      </Popup>
    </StyledPage>
  )
}
