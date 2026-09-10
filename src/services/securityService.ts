/**
 * securityService.ts
 *
 * PIN lock + biometric unlock, ported from vela's security.service.ts
 * (already shipping in production there). Two deliberate changes from the
 * vela original, both closing real gaps rather than copying them:
 *
 * 1. Storage: vela writes the PIN hash to both SecureStore and a generic
 *    settingsService (SQLite) — NailBid has no generic key-value settings
 *    table (its `settings` row is a fixed business-details schema), and
 *    SecureStore is the correct place for an auth secret anyway, so
 *    everything here lives there only.
 *
 * 2. Lockout persistence: vela defines recordFailedAttempt() specifically
 *    so a brute-force lockout survives a force-quit, but never actually
 *    calls it anywhere — attempts only ever live in the in-memory zustand
 *    store, so force-quitting mid-lockout resets the counter for free. This
 *    version's lock screen calls recordFailedAttempt() on every failed try,
 *    so the persisted state this function reads back is real.
 */
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import { hashPin, verifyPin } from '../utils/crypto'

const SECURE_PIN_KEY      = 'nailbid_pin_hash'
const SECURE_ATTEMPTS_KEY = 'nailbid_pin_attempts'
const SECURE_LOCKOUT_KEY  = 'nailbid_pin_lockout_until'
const SECURE_BIOMETRIC_KEY = 'nailbid_biometric_enabled'

export const securityService = {
  // ── PIN ────────────────────────────────────────────────────────────────────
  async setPin(pin: string): Promise<void> {
    const hash = await hashPin(pin)
    await SecureStore.setItemAsync(SECURE_PIN_KEY, hash)
  },

  async verifyPin(pin: string): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(SECURE_PIN_KEY)
    if (!stored) return false
    return verifyPin(pin, stored)
  },

  async hasPin(): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(SECURE_PIN_KEY)
    return !!stored
  },

  async clearPin(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_PIN_KEY)
    await this.setBiometricEnabled(false)
    await this.resetLockoutState()
  },

  // ── Lockout state (persisted so it survives force-quit/relaunch — an
  // in-memory-only counter can be bypassed just by killing the app) ──────────
  async getLockoutState(): Promise<{ attempts: number; lockedUntil: Date | null }> {
    const [attemptsStr, lockedUntilStr] = await Promise.all([
      SecureStore.getItemAsync(SECURE_ATTEMPTS_KEY),
      SecureStore.getItemAsync(SECURE_LOCKOUT_KEY),
    ])
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) || 0 : 0
    const lockedUntil = lockedUntilStr ? new Date(lockedUntilStr) : null
    return { attempts, lockedUntil }
  },

  async recordFailedAttempt(attempts: number, lockedUntil: Date | null): Promise<void> {
    await SecureStore.setItemAsync(SECURE_ATTEMPTS_KEY, String(attempts))
    if (lockedUntil) {
      await SecureStore.setItemAsync(SECURE_LOCKOUT_KEY, lockedUntil.toISOString())
    }
  },

  async resetLockoutState(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_ATTEMPTS_KEY).catch(() => {})
    await SecureStore.deleteItemAsync(SECURE_LOCKOUT_KEY).catch(() => {})
  },

  // ── Biometric ──────────────────────────────────────────────────────────────
  async isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    if (!compatible) return false
    return LocalAuthentication.isEnrolledAsync()
  },

  async getBiometricType(): Promise<'fingerprint' | 'face' | 'none'> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face'
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint'
    return 'none'
  },

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock NailBid',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: false,
      })
      return result.success
    } catch {
      return false
    }
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(SECURE_BIOMETRIC_KEY, enabled ? '1' : '0')
  },

  async isBiometricEnabled(): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(SECURE_BIOMETRIC_KEY)
    return stored === '1'
  },
}
