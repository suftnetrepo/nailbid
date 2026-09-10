import { eq, desc, like, sql } from 'drizzle-orm'
import { db } from '../db'
import { customers, quotes, invoices } from '../db/schema'
import type { Customer, NewCustomer } from '../db/schema'
import { generateId } from '../utils'

export type CustomerWithStats = Customer & {
  quoteCount:   number
  invoiceCount: number
  totalValue:   number
}

export const customerService = {

  getAll: async (): Promise<CustomerWithStats[]> => {
    const rows = await db
      .select({
        id:           customers.id,
        name:         customers.name,
        email:        customers.email,
        phone:        customers.phone,
        address:      customers.address,
        notes:        customers.notes,
        sortOrder:    customers.sortOrder,
        createdAt:    customers.createdAt,
        updatedAt:    customers.updatedAt,
        quoteCount:   sql<number>`(SELECT COUNT(*) FROM quotes WHERE quotes.customer_id = customers.id)`,
        invoiceCount: sql<number>`(SELECT COUNT(*) FROM invoices WHERE invoices.customer_id = customers.id)`,
        totalValue:   sql<number>`(
          SELECT COALESCE(SUM(qi.quantity * qi.unit_price), 0)
          FROM quotes q
          JOIN quote_items qi ON qi.quote_id = q.id
          WHERE q.customer_id = customers.id
        )`,
      })
      .from(customers)
      .orderBy(desc(customers.createdAt))
    return rows as CustomerWithStats[]
  },

  getById: async (id: string): Promise<CustomerWithStats | null> => {
    const rows = await db
      .select({
        id:           customers.id,
        name:         customers.name,
        email:        customers.email,
        phone:        customers.phone,
        address:      customers.address,
        notes:        customers.notes,
        sortOrder:    customers.sortOrder,
        createdAt:    customers.createdAt,
        updatedAt:    customers.updatedAt,
        quoteCount:   sql<number>`(SELECT COUNT(*) FROM quotes WHERE quotes.customer_id = customers.id)`,
        invoiceCount: sql<number>`(SELECT COUNT(*) FROM invoices WHERE invoices.customer_id = customers.id)`,
        totalValue:   sql<number>`(
          SELECT COALESCE(SUM(qi.quantity * qi.unit_price), 0)
          FROM quotes q
          JOIN quote_items qi ON qi.quote_id = q.id
          WHERE q.customer_id = customers.id
        )`,
      })
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1)
    return (rows[0] as CustomerWithStats) ?? null
  },

  create: async (input: Omit<NewCustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const ts  = new Date()
    const row: NewCustomer = { ...input, id: generateId(), createdAt: ts, updatedAt: ts }
    await db.insert(customers).values(row)
    return row as Customer
  },

  update: async (id: string, input: Partial<Customer>): Promise<void> => {
    await db.update(customers)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(customers.id, id))
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(customers).where(eq(customers.id, id))
  },
}
