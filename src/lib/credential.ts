import * as ExpoCrypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { randomBytes, toBase64 } from './crypto';
import type { CredentialRecord } from './credential.rules';

const CREDENTIAL_KEY = 'coffre.credential.v1';
/** Nombre de passes du hachage itéré (via JSI, coûte ~0,5 s). */
export const CREDENTIAL_ROUNDS = 500;

/**
 * Hachage salé et étiré du secret. Le secret (PIN ou mot de passe) n'est
 * jamais stocké : seule cette empreinte l'est.
 */
export async function hashSecret(
  secret: string,
  salt: string,
  rounds: number,
): Promise<string> {
  let digest = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    `coffre.v1:${salt}:${secret}`,
    { encoding: ExpoCrypto.CryptoEncoding.HEX },
  );
  for (let index = 1; index < rounds; index += 1) {
    digest = await ExpoCrypto.digestStringAsync(
      ExpoCrypto.CryptoDigestAlgorithm.SHA256,
      `${digest}:${salt}`,
      { encoding: ExpoCrypto.CryptoEncoding.HEX },
    );
  }
  return digest;
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
    await SecureStore.setItemAsync(CREDENTIAL_KEY, serialize(record), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async read(): Promise<CredentialRecord | null> {
    const raw = await SecureStore.getItemAsync(CREDENTIAL_KEY);
    return raw ? deserialize(raw) : null;
  },
  async remove(): Promise<void> {
    await SecureStore.deleteItemAsync(CREDENTIAL_KEY);
  },
};

export function newSalt(): string {
  return toBase64(randomBytes(16));
}
