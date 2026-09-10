import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as SQLite from 'expo-sqlite'
import * as schema from './schema'
import { SQL_MIGRATIONS } from './migrations'

const sqlite = SQLite.openDatabaseSync('quickbid.db')

sqlite.execSync('PRAGMA foreign_keys = ON;')

export const db = drizzle(sqlite, { schema })

export const runMigrations = async (): Promise<void> => {
  try {
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS __quickbid_migrations (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        name   TEXT NOT NULL UNIQUE,
        ran_at INTEGER NOT NULL
      );
    `)

    for (let i = 0; i < SQL_MIGRATIONS.length; i++) {
      const name = `migration_${String(i + 1).padStart(4, '0')}`
      const row = await sqlite.getFirstAsync(
        'SELECT id FROM __quickbid_migrations WHERE name = ?',
        [name],
      )
      if (!row) {
        await sqlite.execAsync(SQL_MIGRATIONS[i])
        await sqlite.runAsync(
          'INSERT INTO __quickbid_migrations (name, ran_at) VALUES (?, ?)',
          [name, Date.now()],
        )
        console.log('[DB] Ran', name)
      }
    }
    console.log('[DB] Migrations complete')
  } catch (error) {
    console.error('[DB] Migration error:', error)
    throw error
  }
}

export const seedDatabase = async (): Promise<void> => {
  try {
    // Ensure settings singleton exists
    const existing = await sqlite.getFirstAsync(
      "SELECT id FROM settings WHERE id = 'singleton'",
    )
    if (!existing) {
      await sqlite.runAsync(
        `INSERT INTO settings (id, business_name, business_phone, business_email,
          vat_number, cis_enabled, default_vat_rate, default_cis_rate,
          default_payment_terms, quote_counter, invoice_counter, updated_at)
         VALUES ('singleton','','','','',0,20,20,14,1,1,?)`,
        [Date.now()],
      )
    }
    console.log('[DB] Seed complete')
  } catch (e) {
    console.error('[DB] Seed error:', e)
  }
}

export { schema }
