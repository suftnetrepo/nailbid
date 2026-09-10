import { useCallback } from 'react'
import { customerService, type CustomerWithStats } from '../services/customerService'
import { quoteService, type QuoteWithRefs } from '../services/quoteService'
import { invoiceService, type InvoiceWithRefs } from '../services/invoiceService'
import { settingsService } from '../services/settingsService'
import type { Customer, Quote, QuoteItem, Invoice, Settings, NewQuoteItem } from '../db/schema'
import { useDataStore } from '../stores'
import { useAsync } from './useAsync'

export type { CustomerWithStats, QuoteWithRefs, InvoiceWithRefs }

// ─── useCustomers ─────────────────────────────────────────────────────────────

export function useCustomers() {
  const { version, invalidate } = useDataStore()

  const state = useAsync<CustomerWithStats[]>(
    () => customerService.getAll(),
    [],
    [version],
  )

  const create = useCallback(
    async (input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      await customerService.create(input)
      invalidate()
    },
    [invalidate],
  )

  const update = useCallback(
    async (id: string, input: Partial<Customer>) => {
      await customerService.update(id, input)
      invalidate()
    },
    [invalidate],
  )

  const remove = useCallback(
    async (id: string) => {
      await customerService.remove(id)
      invalidate()
    },
    [invalidate],
  )

  return { ...state, create, update, remove }
}

// ─── useQuotes ────────────────────────────────────────────────────────────────

export function useQuotes(customerId?: string) {
  const { version, invalidate } = useDataStore()

  const state = useAsync<QuoteWithRefs[]>(
    () => customerId ? quoteService.getByCustomer(customerId) : quoteService.getAll(),
    [],
    [version, customerId ?? ''],
  )

  const create = useCallback(
    async (input: Omit<Quote, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
      const q = await quoteService.create(input)
      invalidate()
      return q
    },
    [invalidate],
  )

  const update = useCallback(
    async (id: string, input: Partial<Quote>) => {
      await quoteService.update(id, input)
      invalidate()
    },
    [invalidate],
  )

  const remove = useCallback(
    async (id: string) => {
      await quoteService.remove(id)
      invalidate()
    },
    [invalidate],
  )

  const addItem = useCallback(
    async (input: Omit<NewQuoteItem, 'id' | 'createdAt'>) => {
      await quoteService.addItem(input)
      invalidate()
    },
    [invalidate],
  )

  const removeItem = useCallback(
    async (itemId: string, quoteId: string) => {
      await quoteService.removeItem(itemId, quoteId)
      invalidate()
    },
    [invalidate],
  )

  return { ...state, create, update, remove, addItem, removeItem }
}

// ─── useInvoices ──────────────────────────────────────────────────────────────

export function useInvoices() {
  const { version, invalidate } = useDataStore()

  const state = useAsync<InvoiceWithRefs[]>(
    () => invoiceService.getAll(),
    [],
    [version],
  )

  const fromQuote = useCallback(
    async (quoteId: string, paymentTermsDays: number) => {
      const inv = await invoiceService.fromQuote(quoteId, paymentTermsDays)
      invalidate()
      return inv
    },
    [invalidate],
  )

  const markPaid = useCallback(
    async (id: string) => {
      await invoiceService.markPaid(id)
      invalidate()
    },
    [invalidate],
  )

  const update = useCallback(
    async (id: string, input: Partial<Invoice>) => {
      await invoiceService.update(id, input)
      invalidate()
    },
    [invalidate],
  )

  const remove = useCallback(
    async (id: string) => {
      await invoiceService.remove(id)
      invalidate()
    },
    [invalidate],
  )

  return { ...state, fromQuote, markPaid, update, remove }
}

// ─── useDashboard ─────────────────────────────────────────────────────────────

export function useDashboard() {
  const { version } = useDataStore()

  return useAsync(
    () => invoiceService.getTotals(),
    { outstanding: 0, overdueCount: 0, paidThisMonth: 0, paidLastMonth: 0, paidTrendPercent: null, openQuotes: 0, openInvoicesCount: 0 },
    [version],
  )
}

// ─── useSettings ──────────────────────────────────────────────────────────────

export function useSettings() {
  const { version, invalidate } = useDataStore()

  const state = useAsync<Settings | null>(
    () => settingsService.get(),
    null,
    [version],
  )

  const save = useCallback(
    async (input: Partial<Settings>) => {
      await settingsService.update(input)
      invalidate()
    },
    [invalidate],
  )

  return { ...state, save }
}
