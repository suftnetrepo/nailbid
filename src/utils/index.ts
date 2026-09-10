import { format, startOfMonth, endOfMonth, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { useCurrencyStore } from '../stores'
import { getCurrency } from '../constants/currencies'

export { goBack } from './navigation'

// ─── ID generator ─────────────────────────────────────────────────────────────

export const generateId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

// ─── Currency ─────────────────────────────────────────────────────────────────
// `symbol` is only an explicit override — every real call site in the app
// just calls formatCurrency(amount) and gets whatever currency is currently
// selected in Settings → Currency. Reading the store directly here (rather
// than threading a currency through every caller) is what let this become
// multi-currency without touching any of the ~60 existing call sites.
//
// This is a symbol swap, not full locale-aware formatting — every currency
// still renders with UK-style grouping (comma thousands, dot decimal, 2dp),
// even ones that don't conventionally use 2 decimal places. Good enough for
// "pick a currency, see its symbol everywhere"; a real per-currency decimal
// and grouping system would be a separate, bigger piece of work.
export const formatCurrency = (amount: number, symbol?: string): string => {
  const sym = symbol ?? getCurrency(useCurrencyStore.getState().code).symbol
  const formatted = Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sym}${formatted}`
}

// ─── Quote / Invoice math ─────────────────────────────────────────────────────

export interface QuoteTotals {
  subtotal:     number
  cisDeduction: number
  vat:          number
  total:        number
}

export const calcTotals = (
  items: { quantity: number; unitPrice: number; type: string }[],
  vatRate: number,
  cisRate: number,
): QuoteTotals => {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  // CIS applies to labour only
  const labourTotal = items
    .filter((i) => i.type === 'labour')
    .reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const cisDeduction = cisRate > 0 ? (labourTotal * cisRate) / 100 : 0
  const vat = ((subtotal - cisDeduction) * vatRate) / 100
  const total = subtotal - cisDeduction + vat
  return { subtotal, cisDeduction, vat, total }
}

// ─── Quote / Invoice number generators ───────────────────────────────────────

export const formatQuoteNumber = (counter: number): string =>
  `QT-${String(counter).padStart(4, '0')}`

export const formatInvoiceNumber = (counter: number): string =>
  `IN-${String(counter).padStart(4, '0')}`

// ─── Dates ────────────────────────────────────────────────────────────────────

export const formatShortDate = (date: Date): string => {
  if (isToday(date))     return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'd MMM yyyy')
}

export const formatFullDate = (date: Date): string =>
  format(date, 'd MMMM yyyy')

export const formatRelative = (date: Date): string =>
  formatDistanceToNow(date, { addSuffix: true })

export const getMonthRange = (date: Date) => ({
  start: startOfMonth(date),
  end:   endOfMonth(date),
})

export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export { format, isToday, isYesterday }

// ─── Status helpers ───────────────────────────────────────────────────────────

export const quoteStatusLabel: Record<string, string> = {
  draft:     'Draft',
  sent:      'Sent',
  accepted:  'Accepted',
  declined:  'Declined',
  converted: 'Invoiced',
}

export const invoiceStatusLabel: Record<string, string> = {
  unpaid:    'Unpaid',
  paid:      'Paid',
  overdue:   'Overdue',
  cancelled: 'Cancelled',
}

// ─── Initials from name ───────────────────────────────────────────────────────

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

// ─── "Preset + Custom" dropdowns ─────────────────────────────────────────────
// Shared by any rate/terms dropdown that offers fixed presets plus a
// free-entry "Custom…" option (VAT rate, CIS rate, payment terms, …).

export const isPreset = (value: string, options: { value: string }[]) =>
  options.some((o) => o.value !== 'custom' && o.value === value)

// Keep only digits (and one leading decimal point for percentages) as the
// user types, so a stray letter can't end up on a quote/invoice.
export const sanitizeNumeric = (text: string, allowDecimal: boolean) => {
  const pattern = allowDecimal ? /[^0-9.]/g : /[^0-9]/g
  const cleaned = text.replace(pattern, '')
  return allowDecimal ? cleaned.replace(/(\..*)\./g, '$1') : cleaned
}

// `Number(raw) || fallback` looks safe but silently discards a real `0`
// (0% VAT, "due on receipt") because 0 is falsy — clamp explicitly instead.
export const parseClamped = (raw: string, fallback: number, max: number) => {
  const n = Number(raw)
  if (!raw.trim() || Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, 0), max)
}
