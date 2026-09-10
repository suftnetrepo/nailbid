/**
 * crypto.ts
 *
 * PIN hashing for securityService. SHA-256 via expo-crypto's native
 * implementation — NOT the Web Crypto API (`crypto.subtle`), which generally
 * isn't available in React Native/Hermes and silently falls back to a
 * trivial, insecure checksum on real devices if relied on directly.
 *
 * No legacy-hash migration path here (unlike vela's version of this file) —
 * NailBid has no existing users with PINs set under an older format, so
 * there's nothing to stay compatible with.
 */
import * as Crypto from 'expo-crypto'

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `nailbid_pin_v1_${pin}`)
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === storedHash
}
