import * as crypto from "crypto";

/**
 * Generates a cryptographically secure random byte string.
 * @param length - Number of random bytes to generate
 * @returns Base64-encoded random string
 */
export function generateRandomBytes(length: number): string {
  return crypto.randomBytes(length).toString("base64");
}

/**
 * Derives a strong 256-bit key from a passphrase and salt using PBKDF2.
 * Can be used for AES-256 encryption key generation.
 *
 * @param passphrase - User-supplied password or secret phrase
 * @param salt - Random salt (Base64 or hex string)
 * @param iterations - Number of PBKDF2 iterations (default: 150,000)
 * @returns Buffer containing derived key (32 bytes)
 */
export function deriveKeyFromPassphrase(
  passphrase: string,
  salt: string,
  iterations = 150_000
): Buffer {
  return crypto.pbkdf2Sync(passphrase, Buffer.from(salt, "base64"), iterations, 32, "sha256");
}

/**
 * Converts a derived key (Buffer) to a Base64-encoded string.
 * @param key - Key as Buffer
 * @returns Base64 string
 */
export function keyToBase64(key: Buffer): string {
  return key.toString("base64");
}

/**
 * Securely compares two Buffers or strings in constant time
 * to prevent timing attacks.
 *
 * @param a - First value
 * @param b - Second value
 * @returns boolean - true if both are equal
 */
export function timingSafeCompare(a: Buffer | string, b: Buffer | string): boolean {
  const bufA = typeof a === "string" ? Buffer.from(a) : a;
  const bufB = typeof b === "string" ? Buffer.from(b) : b;

  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hashes arbitrary data (UTF-8 string) using SHA-256.
 * Useful for generating fingerprints or message digests.
 *
 * @param data - Input string
 * @returns Base64-encoded SHA-256 hash
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("base64");
}

/**
 * Validates that a given key length is 32 bytes (256-bit) for AES-256.
 * Throws an error if invalid.
 * @param key - Buffer key
 */
export function validateAESKey(key: Buffer): void {
  if (key.length !== 32) {
    throw new Error("Invalid AES key length. Expected 32 bytes (256-bit).");
  }
}
