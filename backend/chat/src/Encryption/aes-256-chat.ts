import { generateRandomBytes, deriveKeyFromPassphrase, validateAESKey } from "./crypto-utils.js";
import * as crypto from "crypto";

export type EncryptedPayload = {
  salt: string;
  iv: string;
  ciphertext: string;
  authTag: string;
};

/**
 * Encrypt a plaintext chat message using AES-256.
 * @param plaintext - Message to encrypt
 * @param passphrase - Encryption key or passphrase
 * @returns Base64 encoded encrypted payload
 */
export function encryptMessage(plaintext: string, passphrase: string): string {
  // generate a random salt (Base64) and derive a 256-bit key from the passphrase
  const salt = generateRandomBytes(16);
  const key = deriveKeyFromPassphrase(passphrase, salt);
  validateAESKey(key);

  // use a 96-bit (12 bytes) IV for AES-GCM
  const iv = generateRandomBytes(12);
  const ivBuf = Buffer.from(iv, "base64");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, ivBuf);
  const ciphertextBuf = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    salt,
    iv,
    ciphertext: ciphertextBuf.toString("base64"),
    authTag: authTag.toString("base64"),
  };

  // Return the JSON payload as a Base64 encoded string for safe transport/storage
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

/**
 * Decrypt an encrypted chat message payload.
 * @param payload - Encrypted Base64 payload
 * @param passphrase - Encryption key or passphrase
 * @returns Decrypted plaintext message
 */
export function decryptMessage(payload: string, passphrase: string): string {
  // Decode the Base64-encoded JSON payload
  const json = Buffer.from(payload, "base64").toString("utf8");
  let parsed: EncryptedPayload;
  try {
    parsed = JSON.parse(json) as EncryptedPayload;
  } catch (err) {
    throw new Error("Invalid encrypted payload format");
  }

  const { salt, iv, ciphertext, authTag } = parsed;

  const key = deriveKeyFromPassphrase(passphrase, salt);
  validateAESKey(key);

  const ivBuf = Buffer.from(iv, "base64");
  const cipherBuf = Buffer.from(ciphertext, "base64");
  const authTagBuf = Buffer.from(authTag, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuf);
  decipher.setAuthTag(authTagBuf);

  const decrypted = Buffer.concat([decipher.update(cipherBuf), decipher.final()]);
  return decrypted.toString("utf8");
}
