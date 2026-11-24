import * as Crypto from 'expo-crypto';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { masterKeyStore } from './masterKeyStore';

const KEY_PREFIX = 'cx1';
const NONCE_LENGTH = 24;
const KEY_LENGTH = 32;

let cachedKey: Uint8Array | null = null;

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function toBase64(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += BASE64_ALPHABET[n >> 18] + BASE64_ALPHABET[(n >> 12) & 63];
    out += BASE64_ALPHABET[(n >> 6) & 63] + BASE64_ALPHABET[n & 63];
  }
  if (i + 1 === bytes.length) {
    const n = bytes[i] << 16;
    out += BASE64_ALPHABET[n >> 18] + BASE64_ALPHABET[(n >> 12) & 63] + '==';
  } else if (i + 2 === bytes.length) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out +=
      BASE64_ALPHABET[n >> 18] +
      BASE64_ALPHABET[(n >> 12) & 63] +
      BASE64_ALPHABET[(n >> 6) & 63] +
      '=';
  }
  return out;
}

export function fromBase64(encoded: string): Uint8Array {
  const values: number[] = [];
  const clean = encoded.replace(/=+\s*$/, '');
  for (const char of clean) {
    const index = BASE64_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error('données chiffrées illisibles');
    }
    values.push(index);
  }
  const byteCount = Math.floor((values.length * 6) / 8);
  const bytes = new Uint8Array(byteCount);
  let acc = 0;
  let bits = 0;
  let cursor = 0;
  for (const v of values) {
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[cursor++] = (acc >> bits) & 0xff;
    }
  }
  return bytes;
}

export function randomBytes(length: number): Uint8Array {
  return Crypto.getRandomBytes(length);
}

export async function loadMasterKey(): Promise<Uint8Array> {
  if (cachedKey) {
    return cachedKey;
  }
  const stored = await masterKeyStore.read();
  if (stored) {
    cachedKey = fromBase64(stored);
    return cachedKey;
  }
  const key = Crypto.getRandomBytes(KEY_LENGTH);
  await masterKeyStore.store(toBase64(key));
  cachedKey = key;
  return key;
}

export function isMasterKeyCached(): boolean {
  return cachedKey !== null;
}

export async function wipeMasterKey(): Promise<void> {
  cachedKey = null;
  await masterKeyStore.remove();
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function sealBytes(key: Uint8Array, plain: Uint8Array): Uint8Array {
  const nonce = randomBytes(NONCE_LENGTH);
  const aead = xchacha20poly1305(key, nonce);
  const sealed = aead.encrypt(plain);
  const out = new Uint8Array(NONCE_LENGTH + sealed.length);
  out.set(nonce, 0);
  out.set(sealed, NONCE_LENGTH);
  return out;
}

export function openBytes(key: Uint8Array, sealed: Uint8Array): Uint8Array {
  if (sealed.length < NONCE_LENGTH + 16) {
    throw new Error('données chiffrées tronquées');
  }
  const nonce = sealed.slice(0, NONCE_LENGTH);
  const ciphertext = sealed.slice(NONCE_LENGTH);
  const aead = xchacha20poly1305(key, nonce);
  return aead.decrypt(ciphertext);
}

export function sealJson(key: Uint8Array, data: unknown): string {
  const plain = encoder.encode(JSON.stringify(data));
  return `${KEY_PREFIX}.${toBase64(sealBytes(key, plain))}`;
}

export function openJson<T>(key: Uint8Array, blob: string): T {
  const parts = blob.split('.');
  if (parts.length !== 2 || parts[0] !== KEY_PREFIX) {
    throw new Error('format de données inconnu');
  }
  const plain = openBytes(key, fromBase64(parts[1]));
  return JSON.parse(decoder.decode(plain)) as T;
}
