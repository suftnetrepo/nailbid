import { db } from './index'
import { customers } from './schema'
import { customerService } from '../services/customerService'
import { quoteService } from '../services/quoteService'
import { invoiceService } from '../services/invoiceService'
import { settingsService } from '../services/settingsService'
import { addDays } from '../utils'

// ─── Demo data ──────────────────────────────────────────────────────────────
// Populates a fresh install with a realistic set of customers, quotes
// (covering every status) and invoices (covering every status) so the app
// can be navigated end to end without manually typing test data.
//
// Dev-only and one-shot: skipped entirely in production builds, and skipped
// on top of any existing data (real or already-seeded) so it never
// duplicates or clobbers what's already in the database.

const DEMO_BUSINESS = {
  businessName:  'JD Building & Renovations',
  businessPhone: '07712 345678',
  businessEmail: 'info@jdbuilding.co.uk',
  vatNumber:     'GB 234 567 891',
  cisEnabled:    true,
  defaultVatRate: 20,
  defaultCisRate: 20,
  defaultPaymentTerms: 14,
}

const DEMO_CUSTOMERS = [
  { name: 'Sarah Jenkins',              phone: '07911 123456', email: 'sarah.jenkins@gmail.com',      address: '12 Oak Lane, Bristol BS6 5TF' },
  { name: 'Tom & Claire Whitfield',     phone: '07922 234567', email: null as string | null,          address: '45 Mill Road, Bath BA1 2QW' },
  { name: 'Riverside Cafe Ltd',         phone: '01179 876543', email: 'hello@riversidecafe.co.uk',    address: '8 Quay Street, Bristol BS1 4EW' },
  { name: 'Mark Ferris',                phone: '07933 345678', email: null as string | null,          address: null as string | null },
  { name: 'Green Valley Primary School',phone: null as string | null, email: 'office@greenvalley.sch.uk', address: 'School Lane, Bristol BS9 1AA' },
  { name: 'Aisha Patel',                phone: '07944 456789', email: 'aisha.patel@outlook.com',      address: '3 Elm Court, Bristol BS8 2RT' },
]

export const seedDemoData = async (): Promise<void> => {
  if (!__DEV__) return

  try {
    const existing = await db.select().from(customers).limit(1)
    if (existing.length > 0) return // already seeded, or the user has real data — never touch it

    await settingsService.update(DEMO_BUSINESS)

    const [sarah, whitfield, riverside, mark, greenValley, aisha] =
      await Promise.all(DEMO_CUSTOMERS.map((c) => customerService.create({ ...c, notes: null, sortOrder: 0 })))

    // ── Quotes — items + one create() call each ────────────────────────────
    const q1 = await quoteService.create({
      customerId: sarah.id, description: 'Kitchen extension — rear wall',
      status: 'accepted', validUntil: addDays(new Date(), 30),
      reference: 'EXT-014', notes: 'Access via side gate. Skip to be delivered Monday.',
      vatRate: 20, cisRate: 20,
    })
    await quoteService.addItem({ quoteId: q1.id, type: 'labour',   description: 'Groundwork & foundations (3 days)', quantity: 3, unitPrice: 220, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q1.id, type: 'material', description: 'Bricks & blocks',                   quantity: 1, unitPrice: 850, sortOrder: 1 })
    await quoteService.addItem({ quoteId: q1.id, type: 'material', description: 'Worktop & fittings',                quantity: 1, unitPrice: 600, sortOrder: 2 })

    const q2 = await quoteService.create({
      customerId: whitfield.id, description: 'Bathroom refit',
      status: 'sent', validUntil: addDays(new Date(), 30),
      reference: null, notes: null, vatRate: 20, cisRate: 20,
    })
    await quoteService.addItem({ quoteId: q2.id, type: 'labour',   description: 'Strip out & re-plumb (4 days)', quantity: 4, unitPrice: 200, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q2.id, type: 'material', description: 'Tiles',                        quantity: 1, unitPrice: 450, sortOrder: 1 })
    await quoteService.addItem({ quoteId: q2.id, type: 'material', description: 'Sanitaryware',                  quantity: 1, unitPrice: 900, sortOrder: 2 })

    const q3 = await quoteService.create({
      customerId: riverside.id, description: 'Shopfront repaint & signage',
      status: 'accepted', validUntil: addDays(new Date(), 14),
      reference: 'SIGN-002', notes: null, vatRate: 20, cisRate: 0,
    })
    await quoteService.addItem({ quoteId: q3.id, type: 'labour',   description: 'Prep & repaint (2 days)', quantity: 2, unitPrice: 180, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q3.id, type: 'material', description: 'Paint & materials',       quantity: 1, unitPrice: 220, sortOrder: 1 })

    const q4 = await quoteService.create({
      customerId: mark.id, description: 'Garden decking installation',
      status: 'draft', validUntil: addDays(new Date(), 30),
      reference: null, notes: null, vatRate: 20, cisRate: 20,
    })
    await quoteService.addItem({ quoteId: q4.id, type: 'labour',   description: 'Decking build (1.5 days)', quantity: 1.5, unitPrice: 200, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q4.id, type: 'material', description: 'Decking boards & joists',  quantity: 1,   unitPrice: 680, sortOrder: 1 })

    const q5 = await quoteService.create({
      customerId: greenValley.id, description: 'Classroom flooring replacement',
      status: 'accepted', validUntil: addDays(new Date(), 21),
      reference: 'PO-3391', notes: 'Term-time work only — weekends and holidays.', vatRate: 0, cisRate: 20,
    })
    await quoteService.addItem({ quoteId: q5.id, type: 'labour',   description: 'Removal & lay (3 days)', quantity: 3, unitPrice: 210, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q5.id, type: 'material', description: 'Vinyl flooring',          quantity: 1, unitPrice: 1200, sortOrder: 1 })

    const q6 = await quoteService.create({
      customerId: aisha.id, description: 'Loft insulation top-up',
      status: 'declined', validUntil: addDays(new Date(), 30),
      reference: null, notes: null, vatRate: 5, cisRate: 0,
    })
    await quoteService.addItem({ quoteId: q6.id, type: 'labour',   description: 'Install (1 day)', quantity: 1, unitPrice: 180, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q6.id, type: 'material', description: 'Insulation roll',  quantity: 1, unitPrice: 150, sortOrder: 1 })

    const q7 = await quoteService.create({
      customerId: sarah.id, description: 'Garden wall repair',
      status: 'draft', validUntil: addDays(new Date(), 30),
      reference: null, notes: null, vatRate: 20, cisRate: 0,
    })
    await quoteService.addItem({ quoteId: q7.id, type: 'labour', description: 'Repoint & rebuild coping (1 day)', quantity: 1, unitPrice: 220, sortOrder: 0 })

    const q8 = await quoteService.create({
      customerId: riverside.id, description: 'Outdoor seating area',
      status: 'sent', validUntil: addDays(new Date(), 21),
      reference: null, notes: null, vatRate: 20, cisRate: 20,
    })
    await quoteService.addItem({ quoteId: q8.id, type: 'labour',   description: 'Build & assemble (2 days)', quantity: 2, unitPrice: 180, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q8.id, type: 'material', description: 'Treated timber',            quantity: 1, unitPrice: 500, sortOrder: 1 })

    const q9 = await quoteService.create({
      customerId: whitfield.id, description: 'Loft conversion — staircase',
      status: 'accepted', validUntil: addDays(new Date(), 30),
      reference: 'LOFT-007', notes: 'Building control sign-off required before final fix.', vatRate: 20, cisRate: 20,
    })
    await quoteService.addItem({ quoteId: q9.id, type: 'labour',   description: 'Install staircase (5 days)', quantity: 5, unitPrice: 220, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q9.id, type: 'material', description: 'Staircase kit',              quantity: 1, unitPrice: 2200, sortOrder: 1 })

    const q10 = await quoteService.create({
      customerId: mark.id, description: 'Driveway resurfacing',
      status: 'accepted', validUntil: addDays(new Date(), 14),
      reference: null, notes: null, vatRate: 20, cisRate: 0,
    })
    await quoteService.addItem({ quoteId: q10.id, type: 'labour',   description: 'Prep & resurface (2 days)', quantity: 2, unitPrice: 200, sortOrder: 0 })
    await quoteService.addItem({ quoteId: q10.id, type: 'material', description: 'Tarmac & aggregate',        quantity: 1, unitPrice: 780, sortOrder: 1 })

    // ── Invoices — convert four of the accepted quotes, then vary status ───
    const invPaid = await invoiceService.fromQuote(q3.id, 14)
    await invoiceService.markPaid(invPaid.id)

    const invPending = await invoiceService.fromQuote(q5.id, 14)
    void invPending // fresh, still within terms — left as "unpaid" to test "Mark as paid"

    const invOverdue = await invoiceService.fromQuote(q9.id, 14)
    await invoiceService.update(invOverdue.id, {
      issueDate: addDays(new Date(), -20),
      dueDate:   addDays(new Date(), -6),
    })

    const invCancelled = await invoiceService.fromQuote(q10.id, 7)
    await invoiceService.update(invCancelled.id, { status: 'cancelled' })

    console.log('[DB] Demo data seeded')
  } catch (e) {
    console.error('[DB] Demo seed error:', e)
  }
}
