// ─── NailBid theme ─────────────────────────────────────────────────────────
// `Colors` is the static light palette, kept for the handful of call sites
// that run outside a component (module-level constants, etc). Everywhere
// inside a component, prefer `useColors()` so the screen follows the
// light/dark theme.

import type { ThemeColors } from './themes'

export { LightColors as Colors, DarkColors } from './themes'
export type { ThemeColors } from './themes'
export { useColors, getColors, useIsDark } from './useColors'
export type { ThemeMode } from '../stores'
export * from './premium'
export * from './security'

// ─── Header back button — circular outlined chevron, shared everywhere ───────

export const getBackArrowProps = (C: ThemeColors) => ({
  size: 18, strokeWidth: 2.25, color: C.textPrimary,
})

export const getBackShapeProps = (C: ThemeColors, size = 38) => ({
  size, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
})

// ─── Popup — bottom sheets don't follow the theme on their own, they need ────
// their surface/header colours passed explicitly via the `colors` prop.

export const getPopupColors = (C: ThemeColors) => ({
  background:     C.bgCard,
  overlay:        'rgba(0,0,0,0.5)',
  handle:         C.border,
  headerTitle:    C.textPrimary,
  headerSubtitle: C.textSecondary,
  headerBorder:   C.border,
  closeIcon:      C.textSecondary,
  closeIconBg:    C.bgMuted,
})

// ─── Form fields — inputs, dropdowns, date pickers ───────────────────────────
// The one place every form field's resting-state palette is defined. Pass
// this to `colors` on StyledForm.Input / StyledForm.Select / StyledDropdown /
// StyledForm.DatePicker — the library keeps focus (accent) and error (red)
// colours computed internally, so this only ever governs the *resting*
// look, and never has to fight those states. `bgInput` sits a shade lighter
// than `bgCard` by design, precisely so a field stays identifiable whether
// it's on the bare page or inside a card.

export const getFieldColors = (C: ThemeColors) => ({
  background:      C.bgInput,
  border:          C.border,
  text:            C.textPrimary,
  placeholder:     C.textMuted,
  label:           C.textPrimary,
  // Dropdown-only keys — StyledForm.Input ignores these.
  panelBackground: C.bgCard,
  panelBorder:     C.border,
  panelText:       C.textPrimary,
  panelDivider:    C.bgMuted,
})

// StyledForm.Switch and StyledForm.DatePicker use their own differently-
// shaped `colors` props (track/thumb tokens, calendar tokens) rather than
// the field shape above — same idea, just matched to what each accepts.

export const getSwitchColors = (C: ThemeColors) => ({
  inactiveTrack:  C.bgMuted,
  inactiveBorder: C.border,
})

export const getDatePickerColors = (C: ThemeColors) => ({
  background:    C.bgInput,
  inputBorder:   C.border,
  dayText:       C.textPrimary,
  disabledText:  C.textMuted,
  headerText:    C.textPrimary,
  selected:      C.primary,
  selectedText:  C.white,
  confirmBg:     C.primary,
  confirmText:   C.white,
})

// ─── Status badge colours — shared across quotes/invoices screens ───────────
// Theme-aware: call inside a component with the current useColors() palette.

export const getStatusColors = (C: ThemeColors): Record<string, { bg: string; text: string }> => ({
  draft:     { bg: C.draftBg,     text: C.draft },
  sent:      { bg: C.sentBg,      text: C.sent },
  accepted:  { bg: C.acceptedBg,  text: C.accepted },
  declined:  { bg: C.declinedBg,  text: C.declined },
  converted: { bg: C.convertedBg, text: C.converted },
  unpaid:    { bg: C.unpaidBg,    text: C.unpaid },
  paid:      { bg: C.paidBg,      text: C.paid },
  overdue:   { bg: C.overdueBg,   text: C.overdue },
  cancelled: { bg: C.cancelledBg, text: C.cancelled },
})

// ─── Avatar palette — deterministic colour per customer ───────────────────────
// Kept theme-independent: these are small accent chips (pastel bg + dark
// text), not surfaces, so they read fine in both light and dark mode.

const AVATAR_PALETTES = [
  { bg: '#E6F1FB', text: '#0C447C' },
  { bg: '#EAF3DE', text: '#27500A' },
  { bg: '#FAEEDA', text: '#633806' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FBEAF0', text: '#72243E' },
]

export const avatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}
