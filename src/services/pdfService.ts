import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { formatCurrency, formatFullDate, formatShortDate, LOGO_MIME_TYPE } from '../utils'
import type { QuoteWithRefs } from './quoteService'
import type { InvoiceWithRefs } from './invoiceService'
import type { Settings } from '../db/schema'

// ─── Shared CSS ───────────────────────────────────────────────────────────────

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    color: #1a1a1e;
    background: #fff;
    padding: 0;
  }
  .page { padding: 40px 44px; max-width: 740px; margin: 0 auto; }

  /* Header */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #1a1a2e;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: #E8470A;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px; font-weight: 800; line-height: 36px;
    text-align: center;
    object-fit: cover; /* no-op on the <div> fallback, only affects the <img> */
  }
  .brand-name { font-size: 20px; font-weight: 800; color: #1a1a2e; }
  .brand-sub  { font-size: 11px; color: #6b7280; margin-top: 1px; }
  .doc-type   { text-align: right; }
  .doc-type h1 {
    font-size: 28px; font-weight: 800;
    color: #E8470A; letter-spacing: -0.5px;
  }
  .doc-type .doc-number { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .doc-type .doc-date   { font-size: 12px; color: #9ca3af; margin-top: 1px; }

  /* Meta row */
  .meta-row {
    display: flex; justify-content: space-between;
    margin-bottom: 28px; gap: 24px;
  }
  .meta-block { flex: 1; }
  .meta-block h4 {
    font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
    text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
  }
  .meta-block p  { font-size: 13px; color: #1a1a1e; line-height: 1.6; }
  .meta-block .name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }

  /* Items table */
  table {
    width: 100%; border-collapse: collapse;
    margin-bottom: 0;
  }
  thead tr { background: #1a1a2e; }
  thead th {
    padding: 10px 12px; text-align: left;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.75);
  }
  thead th:last-child { text-align: right; }
  tbody tr { border-bottom: 1px solid #f0ede8; }
  tbody tr:nth-child(even) { background: #fafaf9; }
  tbody td { padding: 10px 12px; font-size: 13px; color: #1a1a1e; vertical-align: top; }
  tbody td:last-child { text-align: right; font-weight: 600; white-space: nowrap; }
  .item-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  /* Section label row in table */
  .section-row td {
    background: #f8f7f5; font-size: 10px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    color: #6b7280; padding: 6px 12px;
  }

  /* Totals */
  .totals-wrap {
    display: flex; justify-content: flex-end; margin-top: 0;
  }
  .totals-table { width: 280px; }
  .totals-row {
    display: flex; justify-content: space-between;
    padding: 6px 12px; font-size: 13px;
  }
  .totals-row .label { color: #6b7280; }
  .totals-row .value { font-weight: 600; color: #1a1a1e; }
  .totals-row.cis .value { color: #791F1F; }
  .totals-row.grand {
    background: #1a1a2e; border-radius: 8px;
    margin-top: 6px; padding: 10px 12px;
  }
  .totals-row.grand .label { color: rgba(255,255,255,0.7); font-weight: 700; }
  .totals-row.grand .value { color: #fff; font-size: 16px; font-weight: 800; }

  /* Footer */
  .doc-footer {
    margin-top: 36px; padding-top: 18px;
    border-top: 1px solid #e5e4e0;
    display: flex; justify-content: space-between;
    align-items: flex-end;
  }
  .footer-notes { max-width: 60%; }
  .footer-notes h4 {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 5px;
  }
  .footer-notes p { font-size: 12px; color: #6b7280; line-height: 1.6; }
  .footer-brand { text-align: right; }
  .footer-brand p { font-size: 11px; color: #9ca3af; line-height: 1.6; }
  .footer-brand .qb { font-size: 12px; font-weight: 700; color: #E8470A; }

  /* Status badge */
  .status-badge {
    display: inline-block; padding: 3px 10px; border-radius: 999px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
  }
  .status-accepted  { background: #EAF3DE; color: #27500A; }
  .status-sent      { background: #FAEEDA; color: #854F0B; }
  .status-draft     { background: #F3F4F6; color: #6b7280; }
  .status-unpaid    { background: #FAEEDA; color: #854F0B; }
  .status-paid      { background: #EAF3DE; color: #27500A; }
  .status-overdue   { background: #FCEBEB; color: #791F1F; }

  /* Free-tier watermark — removed entirely on NailBid Pro */
  .watermark-banner {
    margin-top: 20px; padding: 10px 16px;
    border-radius: 8px; background: #E8470A;
    text-align: center;
  }
  .watermark-banner p {
    color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.2px;
  }
`

// Free-tier exports carry this; NailBid Pro removes it. This is the only
// thing that differs between the two tiers — see premiumService.ts.
const watermarkHtml = (isPremium: boolean): string => isPremium ? '' : `
  <div class="watermark-banner">
    <p>⚡ Made with NailBid — upgrade to NailBid Pro to remove this watermark</p>
  </div>
`

// The uploaded business logo (Settings → tap the profile avatar), if any —
// falls back to the plain "N" letter mark otherwise. Same 36x36 box either
// way via the shared .brand-icon class, just an <img> instead of a <div>.
const brandMarkHtml = (settings: Settings | null): string =>
  settings?.logoBase64
    ? `<img class="brand-icon" src="data:${LOGO_MIME_TYPE};base64,${settings.logoBase64}" />`
    : `<div class="brand-icon">N</div>`

// ─── Quote HTML ───────────────────────────────────────────────────────────────

export const buildQuoteHtml = (
  quote:     QuoteWithRefs,
  settings:  Settings | null,
  isPremium: boolean = false,
): string => {
  const biz = settings?.businessName  || 'NailBid'
  const tel = settings?.businessPhone || ''
  const email = settings?.businessEmail || ''
  const vat = settings?.vatNumber || ''

  const labourItems   = quote.items.filter((i) => i.type === 'labour')
  const materialItems = quote.items.filter((i) => i.type === 'material')

  const labourRows = labourItems.map((i) => `
    <tr>
      <td>
        ${i.description}
        <div class="item-sub">${i.quantity} × ${formatCurrency(i.unitPrice)}</div>
      </td>
      <td>${formatCurrency(i.quantity * i.unitPrice)}</td>
    </tr>
  `).join('')

  const materialRows = materialItems.map((i) => `
    <tr>
      <td>
        ${i.description}
        <div class="item-sub">${i.quantity} × ${formatCurrency(i.unitPrice)}</div>
      </td>
      <td>${formatCurrency(i.quantity * i.unitPrice)}</td>
    </tr>
  `).join('')

  const cisRow = quote.cisDeduction > 0 ? `
    <div class="totals-row cis">
      <span class="label">CIS deduction (${quote.cisRate}%)</span>
      <span class="value">−${formatCurrency(quote.cisDeduction)}</span>
    </div>
  ` : ''

  const validUntilMeta = quote.validUntil ? `
    <div class="meta-block">
      <h4>Valid until</h4>
      <p class="name">${formatFullDate(quote.validUntil)}</p>
    </div>
  ` : ''

  const referenceMeta = quote.reference ? `
    <div class="meta-block">
      <h4>Reference</h4>
      <p class="name">${quote.reference}</p>
    </div>
  ` : ''

  const notesSection = quote.notes ? `
    <div class="footer-notes">
      <h4>Notes</h4>
      <p>${quote.notes}</p>
    </div>
  ` : '<div></div>'

  const vatLine = vat ? `<p>VAT No. ${vat}</p>` : ''
  const telLine = tel   ? `<p>${tel}</p>`   : ''
  const emailLine = email ? `<p>${email}</p>` : ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>${BASE_CSS}</style>
    </head>
    <body>
      <div class="page">

        <div class="doc-header">
          <div class="brand">
            ${brandMarkHtml(settings)}
            <div>
              <div class="brand-name">${biz}</div>
              ${telLine}${emailLine}${vatLine}
            </div>
          </div>
          <div class="doc-type">
            <h1>QUOTE</h1>
            <div class="doc-number">${quote.number}</div>
            <div class="doc-date">${formatFullDate(quote.createdAt)}</div>
          </div>
        </div>

        <div class="meta-row">
          <div class="meta-block">
            <h4>Prepared for</h4>
            <p class="name">${quote.customerName}</p>
            ${quote.description ? `<p>${quote.description}</p>` : ''}
          </div>
          ${validUntilMeta}
          ${referenceMeta}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${labourItems.length > 0 ? `<tr class="section-row"><td colspan="2">Labour</td></tr>${labourRows}` : ''}
            ${materialItems.length > 0 ? `<tr class="section-row"><td colspan="2">Materials</td></tr>${materialRows}` : ''}
          </tbody>
        </table>

        <div class="totals-wrap">
          <div class="totals-table">
            <div class="totals-row">
              <span class="label">Subtotal</span>
              <span class="value">${formatCurrency(quote.subtotal)}</span>
            </div>
            ${cisRow}
            <div class="totals-row">
              <span class="label">VAT (${quote.vatRate}%)</span>
              <span class="value">${formatCurrency(quote.vat)}</span>
            </div>
            <div class="totals-row grand">
              <span class="label">Total</span>
              <span class="value">${formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        <div class="doc-footer">
          ${notesSection}
          <div class="footer-brand">
            <p class="qb">NailBid</p>
            ${telLine}${emailLine}
            <p style="margin-top:4px;color:#9ca3af;font-size:10px">
              This quote is valid until ${quote.validUntil ? formatFullDate(quote.validUntil) : '—'}
            </p>
          </div>
        </div>
        ${watermarkHtml(isPremium)}

      </div>
    </body>
    </html>
  `
}

// ─── Invoice HTML ─────────────────────────────────────────────────────────────

export const buildInvoiceHtml = (
  inv:       InvoiceWithRefs,
  settings:  Settings | null,
  isPremium: boolean = false,
): string => {
  const biz   = settings?.businessName  || 'NailBid'
  const tel   = settings?.businessPhone || ''
  const email = settings?.businessEmail || ''
  const vat   = settings?.vatNumber     || ''

  const statusClass = inv.status === 'paid' ? 'status-paid'
    : inv.status === 'overdue'              ? 'status-overdue'
    : 'status-unpaid'

  const statusLabel = inv.status === 'paid'    ? 'PAID'
    : inv.status === 'overdue'                 ? 'OVERDUE'
    : 'PAYMENT DUE'

  const cisRow = inv.cisDeduction > 0 ? `
    <div class="totals-row cis">
      <span class="label">CIS deduction</span>
      <span class="value">−${formatCurrency(inv.cisDeduction)}</span>
    </div>
  ` : ''

  const paidRow = inv.paidAt ? `
    <div class="meta-block">
      <h4>Paid on</h4>
      <p class="name">${formatFullDate(inv.paidAt)}</p>
    </div>
  ` : ''

  const vatLine   = vat   ? `<p>VAT No. ${vat}</p>` : ''
  const telLine   = tel   ? `<p>${tel}</p>`          : ''
  const emailLine = email ? `<p>${email}</p>`        : ''

  const notesSection = inv.notes ? `
    <div class="footer-notes">
      <h4>Notes / payment details</h4>
      <p>${inv.notes}</p>
    </div>
  ` : '<div></div>'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>${BASE_CSS}</style>
    </head>
    <body>
      <div class="page">

        <div class="doc-header">
          <div class="brand">
            ${brandMarkHtml(settings)}
            <div>
              <div class="brand-name">${biz}</div>
              ${telLine}${emailLine}${vatLine}
            </div>
          </div>
          <div class="doc-type">
            <h1>INVOICE</h1>
            <div class="doc-number">${inv.number}</div>
            <div class="doc-date">${formatFullDate(inv.issueDate)}</div>
            <div style="margin-top:6px">
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>

        <div class="meta-row">
          <div class="meta-block">
            <h4>Billed to</h4>
            <p class="name">${inv.customerName}</p>
            ${inv.quoteNumber ? `<p>Ref: ${inv.quoteNumber}</p>` : ''}
          </div>
          <div class="meta-block">
            <h4>Issue date</h4>
            <p class="name">${formatFullDate(inv.issueDate)}</p>
          </div>
          <div class="meta-block">
            <h4>Due date</h4>
            <p class="name" style="${inv.status === 'overdue' ? 'color:#791F1F' : ''}">${formatFullDate(inv.dueDate)}</p>
          </div>
          ${paidRow}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Services rendered
                ${inv.quoteNumber ? `<div class="item-sub">Ref: ${inv.quoteNumber}</div>` : ''}
              </td>
              <td>${formatCurrency(inv.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-wrap">
          <div class="totals-table">
            <div class="totals-row">
              <span class="label">Subtotal</span>
              <span class="value">${formatCurrency(inv.subtotal)}</span>
            </div>
            ${cisRow}
            <div class="totals-row">
              <span class="label">VAT</span>
              <span class="value">${formatCurrency(inv.vat)}</span>
            </div>
            <div class="totals-row grand">
              <span class="label">Amount due</span>
              <span class="value">${formatCurrency(inv.total)}</span>
            </div>
          </div>
        </div>

        <div class="doc-footer">
          ${notesSection}
          <div class="footer-brand">
            <p class="qb">NailBid</p>
            ${telLine}${emailLine}
            <p style="margin-top:4px;color:#9ca3af;font-size:10px">
              Please pay by ${formatFullDate(inv.dueDate)}
            </p>
          </div>
        </div>
        ${watermarkHtml(isPremium)}

      </div>
    </body>
    </html>
  `
}

// ─── Export helpers ───────────────────────────────────────────────────────────

export type ExportResult =
  | { ok: true;  uri: string }
  | { ok: false; error: string }

export const exportQuotePdf = async (
  quote:     QuoteWithRefs,
  settings:  Settings | null,
  isPremium: boolean = false,
): Promise<ExportResult> => {
  try {
    const html = buildQuoteHtml(quote, settings, isPremium)
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    })
    // Rename with quote number
    const dest = uri.replace(/[^/]+$/, `Quote_${quote.number}_${quote.customerName.replace(/\s+/g, '_')}.pdf`)
    await FileSystem.moveAsync({ from: uri, to: dest })
    return { ok: true, uri: dest }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'PDF generation failed' }
  }
}

export const exportInvoicePdf = async (
  inv:       InvoiceWithRefs,
  settings:  Settings | null,
  isPremium: boolean = false,
): Promise<ExportResult> => {
  try {
    const html = buildInvoiceHtml(inv, settings, isPremium)
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    })
    const dest = uri.replace(/[^/]+$/, `Invoice_${inv.number}_${inv.customerName.replace(/\s+/g, '_')}.pdf`)
    await FileSystem.moveAsync({ from: uri, to: dest })
    return { ok: true, uri: dest }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'PDF generation failed' }
  }
}

export const sharePdf = async (uri: string): Promise<void> => {
  const available = await Sharing.isAvailableAsync()
  if (available) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF',
      UTI: 'com.adobe.pdf',
    })
  }
}
