// ─── PIN lock configuration ──────────────────────────────────────────────────
// Values match vela's APP_CONFIG (already proven in production) — 4-digit
// PIN, 5 attempts before a 5-minute lockout.

export const SECURITY_CONFIG = {
  pinLength:      4,
  maxPinAttempts: 5,
  lockoutMinutes: 5,
} as const
