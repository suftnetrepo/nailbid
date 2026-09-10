import { eq } from 'drizzle-orm'
import { db } from '../db'
import { settings } from '../db/schema'
import type { Settings } from '../db/schema'

export const settingsService = {

  get: async (): Promise<Settings> => {
    const rows = await db.select().from(settings).limit(1)
    if (!rows[0]) throw new Error('Settings not initialised')
    return rows[0]
  },

  update: async (input: Partial<Settings>): Promise<void> => {
    await db.update(settings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(settings.id, 'singleton'))
  },
}
