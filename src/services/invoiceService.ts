import { eq, desc, and, gte, lte, sum } from 'drizzle-orm'
import { db } from '../db'
import { invoices, quotes, quoteItems, customers, settings } from '../db/schema'
import type { Invoice, NewInvoice } from '../db/schema'
import { generateId, formatInvoiceNumber, calcTotals, addDays } from '../utils'

export type InvoiceWithRefs = Invoice & {
  customerName:  string
  customerPhone?: string | null
  customerEmail?: string | null
  quoteNumber?:  string | null
  subtotal:      number
  cisDeduction:  number
  vat:           number
  total:         number
}

export const invoiceService = {

  getAll: async (): Promise<InvoiceWithRefs[]> => {
    const rows = await db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .leftJoin(quotes, eq(invoices.quoteId, quotes.id))
      .orderBy(desc(invoices.createdAt))

    const result: InvoiceWithRefs[] = []
    for (const row of rows) {
      const items = row.invoices.quoteId
        ? await db.select().from(quoteItems).where(eq(quoteItems.quoteId, row.invoices.quoteId!))
        : []
      const q = row.quotes
      const totals = calcTotals(items, q?.vatRate ?? 20, q?.cisRate ?? 0)
      result.push({
        ...row.invoices,
        customerName:  row.customers?.name ?? '',
        customerPhone: row.customers?.phone,
        customerEmail: row.customers?.email,
        quoteNumber:   q?.number,
        ...totals,
      })
    }
    return result
  },

  getById: async (id: string): Promise<InvoiceWithRefs | null> => {
    const rows = await db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .leftJoin(quotes, eq(invoices.quoteId, quotes.id))
      .where(eq(invoices.id, id))
      .limit(1)
    if (!rows[0]) return null

    const items = rows[0].invoices.quoteId
      ? await db.select().from(quoteItems).where(eq(quoteItems.quoteId, rows[0].invoices.quoteId!))
      : []
    const q = rows[0].quotes
    const totals = calcTotals(items, q?.vatRate ?? 20, q?.cisRate ?? 0)
    return {
      ...rows[0].invoices,
      customerName:  rows[0].customers?.name ?? '',
      customerPhone: rows[0].customers?.phone,
      customerEmail: rows[0].customers?.email,
      quoteNumber:   q?.number,
      ...totals,
    }
  },

  // Convert an accepted quote into an invoice
  fromQuote: async (quoteId: string, paymentTermsDays: number): Promise<Invoice> => {
    const ts        = new Date()
    const dueDate   = addDays(ts, paymentTermsDays)

    const s       = await db.select().from(settings).limit(1)
    const counter = s[0]?.invoiceCounter ?? 1
    const number  = formatInvoiceNumber(counter)
    await db.update(settings).set({ invoiceCounter: counter + 1, updatedAt: ts })

    const q = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1)
    if (!q[0]) throw new Error('Quote not found')

    const row: NewInvoice = {
      id:         generateId(),
      number,
      quoteId,
      customerId: q[0].customerId,
      status:     'unpaid',
      issueDate:  ts,
      dueDate,
      createdAt:  ts,
      updatedAt:  ts,
    }
    await db.insert(invoices).values(row)
    // Mark quote as converted
    await db.update(quotes).set({ status: 'converted', updatedAt: ts }).where(eq(quotes.id, quoteId))
    return row as Invoice
  },

  markPaid: async (id: string): Promise<void> => {
    await db.update(invoices)
      .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
      .where(eq(invoices.id, id))
  },

  update: async (id: string, input: Partial<Invoice>): Promise<void> => {
    await db.update(invoices)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(invoices.id, id))
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(invoices).where(eq(invoices.id, id))
  },

  // Dashboard totals
  getTotals: async (): Promise<{
    outstanding: number
    overdueCount: number
    paidThisMonth: number
    paidLastMonth: number
    /** % change vs last month, or null when there's no last-month baseline to compare against. */
    paidTrendPercent: number | null
    openQuotes: number
    /** Unpaid + overdue invoice count — a count rather than a total so the
     *  home screen's stat card can't overflow the way a currency amount can. */
    openInvoicesCount: number
  }> => {
    const now       = new Date()
    const startThis = new Date(now.getFullYear(), now.getMonth(), 1)
    const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const allInvoices = await db
      .select()
      .from(invoices)
      .leftJoin(quotes, eq(invoices.quoteId, quotes.id))

    let outstanding = 0
    let overdueCount = 0
    let openInvoicesCount = 0
    let paidThisMonth = 0
    let paidLastMonth = 0

    for (const row of allInvoices) {
      const items = row.invoices.quoteId
        ? await db.select().from(quoteItems).where(eq(quoteItems.quoteId, row.invoices.quoteId!))
        : []
      const q = row.quotes
      const { total } = calcTotals(items, q?.vatRate ?? 20, q?.cisRate ?? 0)

      if (row.invoices.status === 'unpaid' || row.invoices.status === 'overdue') {
        outstanding += total
        openInvoicesCount++
        if (row.invoices.dueDate < now) overdueCount++
      }
      if (row.invoices.status === 'paid' && row.invoices.paidAt) {
        if (row.invoices.paidAt >= startThis) {
          paidThisMonth += total
        } else if (row.invoices.paidAt >= startLast && row.invoices.paidAt < startThis) {
          paidLastMonth += total
        }
      }
    }

    const paidTrendPercent =
      paidLastMonth > 0 ? Math.round(((paidThisMonth - paidLastMonth) / paidLastMonth) * 100)
      : paidThisMonth > 0 ? 100
      : null

    const openQuotesRows = await db
      .select()
      .from(quotes)
      .where(eq(quotes.status, 'sent'))
    const openQuotes = openQuotesRows.length

    return { outstanding, overdueCount, paidThisMonth, paidLastMonth, paidTrendPercent, openQuotes, openInvoicesCount }
  },
}
