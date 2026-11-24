export type MasterKeyStore = {
  store: (encoded: string) => Promise<void>;
  read: () => Promise<string | null>;
  remove: () => Promise<void>;
};
