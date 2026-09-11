import { sqliteTable, text, real, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = sqliteTable('customers', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  email:     text('email'),
  phone:     text('phone'),
  address:   text('address'),
  notes:     text('notes'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const quotes = sqliteTable('quotes', {
  id:          text('id').primaryKey(),
  number:      text('number').notNull(),          // QT-0001
  customerId:  text('customer_id').notNull()
               .references(() => customers.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  status:      text('status', {
                 enum: ['draft', 'sent', 'accepted', 'declined', 'converted'],
               }).notNull().default('draft'),
  validUntil:  integer('valid_until', { mode: 'timestamp' }),
  reference:   text('reference'),
  notes:       text('notes'),
  vatRate:     real('vat_rate').notNull().default(20),
  cisRate:     real('cis_rate').notNull().default(0),   // 0 = no CIS, 20 = CIS applies
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Quote Items ──────────────────────────────────────────────────────────────

export const quoteItems = sqliteTable('quote_items', {
  id:          text('id').primaryKey(),
  quoteId:     text('quote_id').notNull()
               .references(() => quotes.id, { onDelete: 'cascade' }),
  type:        text('type', { enum: ['labour', 'material'] }).notNull(),
  description: text('description').notNull(),
  quantity:    real('quantity').notNull().default(1),
  unitPrice:   real('unit_price').notNull(),
  sortOrder:   integer('sort_order').notNull().default(0),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
})

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const invoices = sqliteTable('invoices', {
  id:          text('id').primaryKey(),
  number:      text('number').notNull(),          // IN-0001
  quoteId:     text('quote_id')
               .references(() => quotes.id, { onDelete: 'set null' }),
  customerId:  text('customer_id').notNull()
               .references(() => customers.id, { onDelete: 'cascade' }),
  status:      text('status', {
                 enum: ['unpaid', 'paid', 'overdue', 'cancelled'],
               }).notNull().default('unpaid'),
  issueDate:   integer('issue_date', { mode: 'timestamp' }).notNull(),
  dueDate:     integer('due_date', { mode: 'timestamp' }).notNull(),
  paidAt:      integer('paid_at', { mode: 'timestamp' }),
  notes:       text('notes'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Settings (singleton) ────────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  id:              text('id').primaryKey().default('singleton'),
  businessName:    text('business_name').notNull().default(''),
  businessPhone:   text('business_phone').notNull().default(''),
  businessEmail:   text('business_email').notNull().default(''),
  vatNumber:       text('vat_number').notNull().default(''),
  cisEnabled:      integer('cis_enabled', { mode: 'boolean' }).notNull().default(false),
  defaultVatRate:  real('default_vat_rate').notNull().default(20),
  defaultCisRate:  real('default_cis_rate').notNull().default(20),
  defaultPaymentTerms: integer('default_payment_terms').notNull().default(14), // days
  quoteCounter:    integer('quote_counter').notNull().default(1),
  invoiceCounter:  integer('invoice_counter').notNull().default(1),
  // Business logo — base64-encoded JPEG, no data: URI prefix (that's what
  // expo-image-picker's base64 output always is). Shown in Settings, the
  // home header, and exported PDFs in place of the plain letter mark.
  logoBase64:      text('logo_base64'),
  updatedAt:       integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Customer    = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type Quote       = typeof quotes.$inferSelect
export type NewQuote    = typeof quotes.$inferInsert
export type QuoteItem   = typeof quoteItems.$inferSelect
export type NewQuoteItem = typeof quoteItems.$inferInsert
export type Invoice     = typeof invoices.$inferSelect
export type NewInvoice  = typeof invoices.$inferInsert
export type Settings    = typeof settings.$inferSelect
