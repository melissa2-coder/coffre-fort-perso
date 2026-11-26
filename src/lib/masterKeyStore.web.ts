import { idbDeleteRaw, idbGetRaw, idbPutRaw } from './webIdb';
import type { MasterKeyStore } from './masterKeyStore.types';

const KEYS_DB = 'coffre-secure-meta';
const KEYS_STORE = ['keys', 'credentials'] as const;
const DB_VERSION = 2;
const KEY_ID = 'coffre.master.key.v1';

export const masterKeyStore: MasterKeyStore = {
  async store(encoded: string): Promise<void> {
    await idbPutRaw(KEYS_DB, [...KEYS_STORE], 'keys', KEY_ID, encoded, DB_VERSION);
  },
  async read(): Promise<string | null> {
    return idbGetRaw(KEYS_DB, [...KEYS_STORE], 'keys', KEY_ID, DB_VERSION);
  },
  async remove(): Promise<void> {
    await idbDeleteRaw(KEYS_DB, [...KEYS_STORE], 'keys', KEY_ID, DB_VERSION);
  },
};
