export const SQL_MIGRATIONS: string[] = [
  // migration_0001 — initial schema
  `
    CREATE TABLE IF NOT EXISTS customers (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT,
      phone      TEXT,
      address    TEXT,
      notes      TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id           TEXT PRIMARY KEY,
      number       TEXT NOT NULL,
      customer_id  TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      description  TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'draft',
      valid_until  INTEGER,
      reference    TEXT,
      notes        TEXT,
      vat_rate     REAL NOT NULL DEFAULT 20,
      cis_rate     REAL NOT NULL DEFAULT 0,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_items (
      id          TEXT PRIMARY KEY,
      quote_id    TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity    REAL NOT NULL DEFAULT 1,
      unit_price  REAL NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id          TEXT PRIMARY KEY,
      number      TEXT NOT NULL,
      quote_id    TEXT REFERENCES quotes(id) ON DELETE SET NULL,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      status      TEXT NOT NULL DEFAULT 'unpaid',
      issue_date  INTEGER NOT NULL,
      due_date    INTEGER NOT NULL,
      paid_at     INTEGER,
      notes       TEXT,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id                    TEXT PRIMARY KEY DEFAULT 'singleton',
      business_name         TEXT NOT NULL DEFAULT '',
      business_phone        TEXT NOT NULL DEFAULT '',
      business_email        TEXT NOT NULL DEFAULT '',
      vat_number            TEXT NOT NULL DEFAULT '',
      cis_enabled           INTEGER NOT NULL DEFAULT 0,
      default_vat_rate      REAL NOT NULL DEFAULT 20,
      default_cis_rate      REAL NOT NULL DEFAULT 20,
      default_payment_terms INTEGER NOT NULL DEFAULT 14,
      quote_counter         INTEGER NOT NULL DEFAULT 1,
      invoice_counter       INTEGER NOT NULL DEFAULT 1,
      updated_at            INTEGER NOT NULL
    );
  `,

  // migration_0002 — business logo (shown in Settings, the home header, and
  // exported quote/invoice PDFs in place of the plain letter mark). Always
  // JPEG — that's what expo-image-picker's base64 output always is,
  // regardless of the source image's original format.
  `
    ALTER TABLE settings ADD COLUMN logo_base64 TEXT;
  `,
]
