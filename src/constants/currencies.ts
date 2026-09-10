// ─── Multi-currency support ───────────────────────────────────────────────────
// One currency is selected app-wide (Settings → Currency) and used by every
// formatCurrency() call — quotes, invoices, dashboard totals, exported PDFs.
// This isn't a full i18n/locale system: every currency still formats with
// UK-style grouping (comma thousands, dot decimals, 2dp) — only the symbol
// changes. That matches what was actually asked for (pick a currency, see
// its symbol everywhere) without taking on locale-aware number formatting
// for currencies that don't use 2 decimal places, which is a separate,
// bigger piece of work than a symbol swap.

export interface Currency {
  code:   string
  symbol: string
  name:   string
  region: 'Europe' | 'Americas' | 'Africa'
}

export const DEFAULT_CURRENCY_CODE = 'GBP'

export const CURRENCIES: Currency[] = [
  // ─── Europe ─────────────────────────────────────────────────────────────────
  { code: 'GBP', symbol: '£',   name: 'British Pound',    region: 'Europe' },
  { code: 'EUR', symbol: '€',   name: 'Euro',             region: 'Europe' },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',      region: 'Europe' },
  { code: 'NOK', symbol: 'kr',  name: 'Norwegian Krone',  region: 'Europe' },
  { code: 'SEK', symbol: 'kr',  name: 'Swedish Krona',    region: 'Europe' },
  { code: 'DKK', symbol: 'kr',  name: 'Danish Krone',     region: 'Europe' },
  { code: 'ISK', symbol: 'kr',  name: 'Icelandic Króna',  region: 'Europe' },
  { code: 'PLN', symbol: 'zł',  name: 'Polish Złoty',     region: 'Europe' },
  { code: 'CZK', symbol: 'Kč',  name: 'Czech Koruna',     region: 'Europe' },
  { code: 'HUF', symbol: 'Ft',  name: 'Hungarian Forint', region: 'Europe' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu',     region: 'Europe' },
  { code: 'BGN', symbol: 'лв',  name: 'Bulgarian Lev',    region: 'Europe' },
  { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar',    region: 'Europe' },
  { code: 'UAH', symbol: '₴',   name: 'Ukrainian Hryvnia', region: 'Europe' },
  { code: 'TRY', symbol: '₺',   name: 'Turkish Lira',     region: 'Europe' },
  { code: 'RUB', symbol: '₽',   name: 'Russian Ruble',    region: 'Europe' },

  // ─── Americas ───────────────────────────────────────────────────────────────
  { code: 'USD', symbol: '$',    name: 'US Dollar',              region: 'Americas' },
  { code: 'CAD', symbol: '$',    name: 'Canadian Dollar',        region: 'Americas' },
  { code: 'MXN', symbol: '$',    name: 'Mexican Peso',           region: 'Americas' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',         region: 'Americas' },
  { code: 'ARS', symbol: '$',    name: 'Argentine Peso',         region: 'Americas' },
  { code: 'CLP', symbol: '$',    name: 'Chilean Peso',           region: 'Americas' },
  { code: 'COP', symbol: '$',    name: 'Colombian Peso',         region: 'Americas' },
  { code: 'PEN', symbol: 'S/',   name: 'Peruvian Sol',           region: 'Americas' },
  { code: 'UYU', symbol: '$U',   name: 'Uruguayan Peso',         region: 'Americas' },
  { code: 'BOB', symbol: 'Bs',   name: 'Bolivian Boliviano',     region: 'Americas' },
  { code: 'PYG', symbol: '₲',    name: 'Paraguayan Guaraní',     region: 'Americas' },
  { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar',     region: 'Americas' },
  { code: 'DOP', symbol: 'RD$',  name: 'Dominican Peso',         region: 'Americas' },
  { code: 'JMD', symbol: 'J$',   name: 'Jamaican Dollar',        region: 'Americas' },
  { code: 'TTD', symbol: 'TT$',  name: 'Trinidad & Tobago Dollar', region: 'Americas' },
  { code: 'GTQ', symbol: 'Q',    name: 'Guatemalan Quetzal',     region: 'Americas' },
  { code: 'CRC', symbol: '₡',    name: 'Costa Rican Colón',      region: 'Americas' },
  { code: 'HNL', symbol: 'L',    name: 'Honduran Lempira',       region: 'Americas' },
  { code: 'PAB', symbol: 'B/.',  name: 'Panamanian Balboa',      region: 'Americas' },

  // ─── Africa ─────────────────────────────────────────────────────────────────
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',         region: 'Africa' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand',     region: 'Africa' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound',         region: 'Africa' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',        region: 'Africa' },
  { code: 'GHS', symbol: '₵',    name: 'Ghanaian Cedi',          region: 'Africa' },
  { code: 'TZS', symbol: 'TSh',  name: 'Tanzanian Shilling',     region: 'Africa' },
  { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling',       region: 'Africa' },
  { code: 'ETB', symbol: 'Br',   name: 'Ethiopian Birr',         region: 'Africa' },
  { code: 'MAD', symbol: 'DH',   name: 'Moroccan Dirham',        region: 'Africa' },
  { code: 'DZD', symbol: 'DA',   name: 'Algerian Dinar',         region: 'Africa' },
  { code: 'TND', symbol: 'DT',   name: 'Tunisian Dinar',         region: 'Africa' },
  { code: 'XOF', symbol: 'CFA',  name: 'West African CFA Franc', region: 'Africa' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', region: 'Africa' },
  { code: 'RWF', symbol: 'FRw',  name: 'Rwandan Franc',          region: 'Africa' },
  { code: 'ZMW', symbol: 'ZK',   name: 'Zambian Kwacha',         region: 'Africa' },
  { code: 'BWP', symbol: 'P',    name: 'Botswana Pula',          region: 'Africa' },
  { code: 'NAD', symbol: 'N$',   name: 'Namibian Dollar',        region: 'Africa' },
  { code: 'MZN', symbol: 'MT',   name: 'Mozambican Metical',     region: 'Africa' },
  { code: 'AOA', symbol: 'Kz',   name: 'Angolan Kwanza',         region: 'Africa' },
  { code: 'SOS', symbol: 'Sh',   name: 'Somali Shilling',        region: 'Africa' },
]

const CURRENCY_BY_CODE: Record<string, Currency> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
)

export const getCurrency = (code: string): Currency =>
  CURRENCY_BY_CODE[code] ?? CURRENCY_BY_CODE[DEFAULT_CURRENCY_CODE]
