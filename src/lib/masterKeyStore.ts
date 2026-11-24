import * as SecureStore from 'expo-secure-store';
import type { MasterKeyStore } from './masterKeyStore.types';

const KEY_ID = 'coffre.master.key.v1';

export const masterKeyStore: MasterKeyStore = {
  async store(encoded: string): Promise<void> {
    await SecureStore.setItemAsync(KEY_ID, encoded, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async read(): Promise<string | null> {
    return SecureStore.getItemAsync(KEY_ID);
  },
  async remove(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY_ID);
  },
};
