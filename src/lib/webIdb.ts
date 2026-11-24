const connections = new Map<string, Promise<IDBDatabase>>();

function openConnection(
  name: string,
  layout: { store: string; plain: boolean }[],
): Promise<IDBDatabase> {
  const existing = connections.get(name);
  if (existing) {
    return existing;
  }
  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const entry of layout) {
        if (!db.objectStoreNames.contains(entry.store)) {
          if (entry.plain) {
            db.createObjectStore(entry.store);
          } else {
            db.createObjectStore(entry.store, { keyPath: 'id' });
          }
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  connections.set(name, opening);
  return opening;
}

function withStore<T>(
  name: string,
  stores: string[],
  plain: boolean,
  run: (objectStore: IDBObjectStore) => IDBRequest<T> | void,
  mode: IDBTransactionMode,
): Promise<T> {
  return openConnection(
    name,
    stores.map((store) => ({ store, plain })),
  ).then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(stores, mode);
        const request = run(tx.objectStore(stores[0]));
        if (request) {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } else {
          tx.oncomplete = () => resolve(undefined as T);
          tx.onerror = () => reject(tx.error);
        }
      }),
  );
}

export type StoredRecord = { id: string; data: string; updated_at: number };

export function idbGetAllRecords(
  name: string,
  stores: string[],
  store: string,
): Promise<StoredRecord[]> {
  return withStore(name, stores, false, (os) => os.getAll(), 'readonly') as Promise<StoredRecord[]>;
}

export function idbPutRecord(
  name: string,
  stores: string[],
  store: string,
  record: StoredRecord,
): Promise<void> {
  return withStore(name, stores, false, (os) => {
    os.put(record);
  }, 'readwrite');
}

export function idbDeleteRecord(
  name: string,
  stores: string[],
  store: string,
  key: string,
): Promise<void> {
  return withStore(name, stores, false, (os) => {
    os.delete(key);
  }, 'readwrite');
}

export function idbClear(name: string, stores: string[]): Promise<void> {
  return withStore(name, stores, false, (os) => {
    os.clear();
  }, 'readwrite');
}

export function idbGetRaw(
  name: string,
  stores: string[],
  store: string,
  key: string,
): Promise<string | null> {
  return withStore(name, stores, true, (os) => os.get(key) as IDBRequest<string | undefined>, 'readonly').then(
    (value) => value ?? null,
  );
}

export function idbPutRaw(
  name: string,
  stores: string[],
  store: string,
  key: string,
  value: string,
): Promise<void> {
  return withStore(name, stores, true, (os) => {
    os.put(value, key);
  }, 'readwrite');
}

export function idbDeleteRaw(name: string, stores: string[], store: string, key: string): Promise<void> {
  return withStore(name, stores, true, (os) => {
    os.delete(key);
  }, 'readwrite');
}

export function idbGetBlob(
  name: string,
  stores: string[],
  store: string,
  key: string,
): Promise<Blob | null> {
  return withStore(name, stores, true, (os) => os.get(key) as IDBRequest<Blob | undefined>, 'readonly').then(
    (value) => value ?? null,
  );
}

export function idbPutBlob(
  name: string,
  stores: string[],
  store: string,
  key: string,
  value: Blob,
): Promise<void> {
  return withStore(name, stores, true, (os) => {
    os.put(value, key);
  }, 'readwrite');
}

export function isWebDatabaseAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}
