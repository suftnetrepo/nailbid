import { eq, desc, and } from 'drizzle-orm'
import { db } from '../db'
import { quotes, quoteItems, customers, settings } from '../db/schema'
import type { Quote, NewQuote, QuoteItem, NewQuoteItem } from '../db/schema'
import { generateId, formatQuoteNumber, calcTotals } from '../utils'

export type QuoteWithRefs = Quote & {
  customerName: string
  customerPhone?: string | null
  customerEmail?: string | null
  items:          QuoteItem[]
  subtotal:       number
  cisDeduction:   number
  vat:            number
  total:          number
}

export const quoteService = {

  getAll: async (): Promise<QuoteWithRefs[]> => {
    const rows = await db
      .select()
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .orderBy(desc(quotes.createdAt))

    const result: QuoteWithRefs[] = []
    for (const row of rows) {
      const items = await db.select().from(quoteItems)
        .where(eq(quoteItems.quoteId, row.quotes.id))
        .orderBy(quoteItems.sortOrder)
      const totals = calcTotals(items, row.quotes.vatRate, row.quotes.cisRate)
      result.push({
        ...row.quotes,
        customerName:  row.customers?.name ?? '',
        customerPhone: row.customers?.phone,
        customerEmail: row.customers?.email,
        items,
        ...totals,
      })
    }
    return result
  },

  getById: async (id: string): Promise<QuoteWithRefs | null> => {
    const rows = await db
      .select()
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .where(eq(quotes.id, id))
      .limit(1)
    if (!rows[0]) return null

    const items = await db.select().from(quoteItems)
      .where(eq(quoteItems.quoteId, id))
      .orderBy(quoteItems.sortOrder)

    const totals = calcTotals(items, rows[0].quotes.vatRate, rows[0].quotes.cisRate)
    return {
      ...rows[0].quotes,
      customerName:  rows[0].customers?.name ?? '',
      customerPhone: rows[0].customers?.phone,
      customerEmail: rows[0].customers?.email,
      items,
      ...totals,
    }
  },

  getByCustomer: async (customerId: string): Promise<QuoteWithRefs[]> => {
    const rows = await db
      .select()
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .where(eq(quotes.customerId, customerId))
      .orderBy(desc(quotes.createdAt))

    const result: QuoteWithRefs[] = []
    for (const row of rows) {
      const items = await db.select().from(quoteItems)
        .where(eq(quoteItems.quoteId, row.quotes.id))
        .orderBy(quoteItems.sortOrder)
      const totals = calcTotals(items, row.quotes.vatRate, row.quotes.cisRate)
      result.push({
        ...row.quotes,
        customerName:  row.customers?.name ?? '',
        customerPhone: row.customers?.phone,
        customerEmail: row.customers?.email,
        items,
        ...totals,
      })
    }
    return result
  },

  create: async (
    input: Omit<NewQuote, 'id' | 'number' | 'createdAt' | 'updatedAt'>,
  ): Promise<Quote> => {
    const ts = new Date()

    // Atomically bump the quote counter and get the new number
    const s = await db.select().from(settings).limit(1)
    const counter = (s[0]?.quoteCounter ?? 1)
    const number  = formatQuoteNumber(counter)
    await db.update(settings).set({ quoteCounter: counter + 1, updatedAt: ts })

    const row: NewQuote = {
      ...input,
      id:        generateId(),
      number,
      createdAt: ts,
      updatedAt: ts,
    }
    await db.insert(quotes).values(row)
    return row as Quote
  },

  update: async (id: string, input: Partial<Quote>): Promise<void> => {
    await db.update(quotes)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(quotes.id, id))
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(quotes).where(eq(quotes.id, id))
  },

  // ─── Items ──────────────────────────────────────────────────────────────────

  addItem: async (input: Omit<NewQuoteItem, 'id' | 'createdAt'>): Promise<QuoteItem> => {
    const ts  = new Date()
    const row: NewQuoteItem = { ...input, id: generateId(), createdAt: ts }
    await db.insert(quoteItems).values(row)
    await db.update(quotes).set({ updatedAt: ts }).where(eq(quotes.id, input.quoteId))
    return row as QuoteItem
  },

  updateItem: async (id: string, input: Partial<QuoteItem>): Promise<void> => {
    await db.update(quoteItems).set(input).where(eq(quoteItems.id, id))
  },

  removeItem: async (itemId: string, quoteId: string): Promise<void> => {
    await db.delete(quoteItems).where(eq(quoteItems.id, itemId))
    await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, quoteId))
  },
}
