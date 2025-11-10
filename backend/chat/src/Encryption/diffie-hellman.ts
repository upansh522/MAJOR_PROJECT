import * as crypto from "crypto";
import { generateRandomBytes, deriveKeyFromPassphrase, validateAESKey } from "./crypto-utils.js";

/**
 * Generates an ECDH key pair.
 * @returns Object containing public and private keys
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const ecdh = crypto.createECDH("secp256k1");
  ecdh.generateKeys();

  return {
    publicKey: ecdh.getPublicKey("base64"),
    privateKey: ecdh.getPrivateKey("base64"),
  };
}

/**
 * Derives a shared secret from your private key and a peer's public key.
 * @param myPrivateKey - Your Base64 private key
 * @param peerPublicKey - Peer’s Base64 public key
 * @returns Shared secret as Base64 string
 */
export function deriveSharedSecret(myPrivateKey: string, peerPublicKey: string): string {
  const ecdh = crypto.createECDH("secp256k1");
  ecdh.setPrivateKey(Buffer.from(myPrivateKey, "base64"));
  const secret = ecdh.computeSecret(Buffer.from(peerPublicKey, "base64"));
  return secret.toString("base64");
}

/**
 * Converts the shared secret to an AES key string.
 * @param secret - Shared secret value
 * @returns Base64-encoded AES key
 */
/**
 * Deterministically derives a 256-bit AES key from the shared secret.
 * PBKDF2 with a random salt would produce different keys for each caller,
 * so instead derive the AES key deterministically by hashing the shared
 * secret with SHA-256. This yields a 32-byte key appropriate for AES-256.
 *
 * @param secret - Shared secret (Base64 or raw string)
 * @returns Base64-encoded 32-byte AES key
 */
export function getAESKeyFromSecret(secret: string): string {
  // If the secret is base64-encoded, decode it first; otherwise treat as utf8
  let secretBuf: Buffer;
  try {
    // Try decoding as base64; if it fails, fall back to utf8
    secretBuf = Buffer.from(secret, "base64");
    // If decoding base64 yields an empty buffer or looks invalid, fallback
    if (secretBuf.length === 0) throw new Error("empty base64");
  } catch (e) {
    secretBuf = Buffer.from(secret, "utf8");
  }

  const keyBuf = crypto.createHash("sha256").update(secretBuf).digest();
  validateAESKey(keyBuf);
  return keyBuf.toString("base64");
}
