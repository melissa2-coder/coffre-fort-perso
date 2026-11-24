import { idbDeleteRaw, idbGetRaw, idbPutRaw } from './webIdb';
import type { MasterKeyStore } from './masterKeyStore.types';

const KEYS_DB = 'coffre-secure-meta';
const KEYS_STORE = ['keys'] as const;
const KEY_ID = 'coffre.master.key.v1';

export const masterKeyStore: MasterKeyStore = {
  async store(encoded: string): Promise<void> {
    await idbPutRaw(KEYS_DB, [...KEYS_STORE], 'keys', KEY_ID, encoded);
  },
  async read(): Promise<string | null> {
    return idbGetRaw(KEYS_DB, [...KEYS_STORE], 'keys', KEY_ID);
  },
  async remove(): Promise<void> {
    await idbDeleteRaw(KEYS_DB, [...KEYS_STORE], 'keys', KEY_ID);
  },
};
