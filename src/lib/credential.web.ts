import { idbDeleteRaw, idbGetRaw, idbPutRaw } from './webIdb';
import type { CredentialRecord } from './credential.rules';

const CREDENTIAL_KEY = 'coffre.credential.v1';
const META_DB = 'coffre-secure-meta';
const META_STORES = ['keys', 'credentials'] as const;
const DB_VERSION = 2;
/** PBKDF2 natif du navigateur, plus rapide qu'un hachage JS itéré. */
export const CREDENTIAL_ROUNDS = 150_000;

function subtle(): SubtleCrypto {
  const cryptoRef = globalThis.crypto;
  if (!cryptoRef?.subtle) {
    throw new Error(
      'WebCrypto indisponible : le code de secours requiert une connexion sécurisée (HTTPS).',
    );
  }
  return cryptoRef.subtle;
}

/** PBKDF2-SHA256 — le secret n'est jamais stocké, seule l'empreinte l'est. */
export async function hashSecret(secret: string, salt: string, _rounds?: number): Promise<string> {
  const encoder = new TextEncoder();
  const key = await subtle().importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await subtle().deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(`coffre.v1:${salt}`),
      iterations: CREDENTIAL_ROUNDS,
      hash: 'SHA-256',
    },
    key,
    256,
  );
  let binary = '';
  for (const byte of new Uint8Array(bits)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function serialize(record: CredentialRecord): string {
  return JSON.stringify(record);
}

function deserialize(raw: string): CredentialRecord | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CredentialRecord>;
    if (
      (parsed.kind === 'pin' || parsed.kind === 'password') &&
      typeof parsed.salt === 'string' &&
      typeof parsed.hash === 'string' &&
      typeof parsed.rounds === 'number'
    ) {
      return {
        kind: parsed.kind,
        salt: parsed.salt,
        hash: parsed.hash,
        rounds: parsed.rounds,
        createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const credentialStore = {
  async store(record: CredentialRecord): Promise<void> {
    await idbPutRaw(
      META_DB,
      [...META_STORES],
      'credentials',
      CREDENTIAL_KEY,
      serialize(record),
      DB_VERSION,
    );
  },
  async read(): Promise<CredentialRecord | null> {
    const raw = await idbGetRaw(
      META_DB,
      [...META_STORES],
      'credentials',
      CREDENTIAL_KEY,
      DB_VERSION,
    );
    return raw ? deserialize(raw) : null;
  },
  async remove(): Promise<void> {
    await idbDeleteRaw(META_DB, [...META_STORES], 'credentials', CREDENTIAL_KEY, DB_VERSION);
  },
};

export function newSalt(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
