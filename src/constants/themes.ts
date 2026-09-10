// ─── NailBid theme palettes ──────────────────────────────────────────────────
// Both palettes share the exact same keys, so every screen that reads
// `C.textPrimary`, `C.bgCard`, etc. via useColors() works unchanged in
// either mode — only the values differ.

export const LightColors = {
  // Brand
  primary:       '#E8470A',
  primaryDark:   '#C23A08',
  primaryLight:  '#F57244',
  primaryBg:     '#FEF0EB',

  // Dark navy (used for hero cards, headers)
  navy:          '#1a1a2e',
  navyLight:     '#2d2d4e',

  // Backgrounds
  bg:            '#F8F7F5',
  bgCard:        '#FFFFFF',
  bgInput:       '#F3F2F0',
  bgMuted:       '#EEEDE9',

  // Text
  textPrimary:   '#1a1a1e',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',
  textOnDark:    '#FFFFFF',

  // Status — quotes
  draft:         '#6b7280',
  draftBg:       '#F3F4F6',
  sent:          '#854F0B',
  sentBg:        '#FAEEDA',
  accepted:      '#27500A',
  acceptedBg:    '#EAF3DE',
  declined:      '#791F1F',
  declinedBg:    '#FCEBEB',
  converted:     '#0C447C',
  convertedBg:   '#E6F1FB',

  // Status — invoices
  unpaid:        '#854F0B',
  unpaidBg:      '#FAEEDA',
  paid:          '#27500A',
  paidBg:        '#EAF3DE',
  overdue:       '#791F1F',
  overdueBg:     '#FCEBEB',
  cancelled:     '#6b7280',
  cancelledBg:   '#F3F4F6',

  // Misc
  border:        '#E5E4E0',
  borderFocus:   '#E8470A',
  success:       '#27500A',
  error:         '#791F1F',
  warning:       '#854F0B',
  white:         '#FFFFFF',
  black:         '#1a1a1e',
}

export const DarkColors: typeof LightColors = {
  // Brand — primary bumped up slightly for vibrancy against dark surfaces
  primary:       '#FF6B3D',
  primaryDark:   '#E8470A',
  primaryLight:  '#FF9166',
  primaryBg:     'rgba(255,107,61,0.16)',

  // Hero cards sit even darker than the page background
  navy:          '#0E0E17',
  navyLight:     '#22222F',

  // Backgrounds
  bg:            '#121218',
  bgCard:        '#1C1C24',
  bgInput:       '#25252E',
  bgMuted:       '#292933',

  // Text
  textPrimary:   '#F3F2F0',
  textSecondary: '#A6A5AC',
  textMuted:     '#75747C',
  textOnDark:    '#FFFFFF',

  // Status — quotes
  draft:         '#A6A5AC',
  draftBg:       '#292933',
  sent:          '#F0B255',
  sentBg:        'rgba(240,178,85,0.14)',
  accepted:      '#78D65E',
  acceptedBg:    'rgba(120,214,94,0.14)',
  declined:      '#F1726F',
  declinedBg:    'rgba(241,114,111,0.14)',
  converted:     '#63AAF0',
  convertedBg:   'rgba(99,170,240,0.14)',

  // Status — invoices
  unpaid:        '#F0B255',
  unpaidBg:      'rgba(240,178,85,0.14)',
  paid:          '#78D65E',
  paidBg:        'rgba(120,214,94,0.14)',
  overdue:       '#F1726F',
  overdueBg:     'rgba(241,114,111,0.14)',
  cancelled:     '#A6A5AC',
  cancelledBg:   '#292933',

  // Misc
  border:        '#33333D',
  borderFocus:   '#FF6B3D',
  success:       '#78D65E',
  error:         '#F1726F',
  warning:       '#F0B255',
  white:         '#FFFFFF',
  black:         '#0d0d10',
}

export type ThemeColors = typeof LightColors
