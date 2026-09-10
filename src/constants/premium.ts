// ─── NailBid Pro configuration ──────────────────────────────────────────────
//
// Gating model: NailBid Pro does not cap usage — customers, quotes and
// invoices are unlimited on both tiers. The single gate is the watermark
// on exported PDFs (see pdfService.ts): free-tier exports carry a visible
// "Made with NailBid" banner, Pro removes it.

// ─── Product identifiers ─────────────────────────────────────────────────────
// These must exist as real subscription/one-time products in App Store
// Connect and Google Play Console, and be mirrored as products on the
// "nailbid_pro" entitlement in the RevenueCat dashboard, before purchases
// will resolve to a real offering. Update to match whatever you actually
// create.
export const PREMIUM_PRODUCTS = {
  MONTHLY:  'com.suftnet.quickbid.pro.monthly',
  YEARLY:   'com.suftnet.quickbid.pro.yearly',
  LIFETIME: 'com.suftnet.quickbid.pro.lifetime',
} as const

// ─── Pricing display ──────────────────────────────────────────────────────────
// Fallback strings shown only if RevenueCat's live offering prices haven't
// loaded yet. Real prices always come from the store via getPremiumPrices().
export const PREMIUM_PRICING = {
  MONTHLY:  { price: '£4.99',  period: 'per month', label: 'Monthly'  },
  YEARLY:   { price: '£29.99', period: 'per year',  label: 'Yearly', saving: 'Save 50%' },
  // ~2.7x yearly rather than 2x — priced far enough above one year's
  // subscription that lifetime doesn't quietly undercut recurring revenue.
  LIFETIME: { price: '£79.99', period: 'one-time',  label: 'Lifetime' },
} as const

// ─── Paywall copy ─────────────────────────────────────────────────────────────
// Kept honest to what Pro actually changes — no invented "unlimited"
// language, since nothing is capped on the free tier to begin with.
export const PREMIUM_FEATURES = [
  {
    title:       'No watermark',
    description: 'Every quote and invoice exports clean, with no NailBid branding',
  },
  {
    title:       'Support development',
    description: 'Your subscription keeps NailBid maintained and improving',
  },
  {
    title:       'Priority support',
    description: "If something's wrong, Pro customers hear back first",
  },
] as const

// Must match the entitlement identifier exactly as created in the RevenueCat
// dashboard (Entitlements page) — RevenueCat auto-namespaced ours to
// "nailbid_pro" rather than the plain "pro" originally assumed here.
export const PREMIUM_ENTITLEMENT_ID = 'nailbid_pro'

// ─── SecureStore key ──────────────────────────────────────────────────────────
export const PREMIUM_STORAGE_KEY = 'quickbid_premium_entitlement'
