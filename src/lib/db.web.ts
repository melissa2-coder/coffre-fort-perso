import { idbDeleteRecord, idbGetAllRecords, idbClear, idbPutRecord, type StoredRecord } from './webIdb';

const DATA_DB = 'coffre-secure-db';

export const STORE_NAMES = ['fields', 'documents', 'habits', 'habit_entries', 'form_runs'] as const;

export type Store = (typeof STORE_NAMES)[number];

export type SealedRow = { id: string; data: string };

export async function loadRows(store: Store): Promise<SealedRow[]> {
  const records = await idbGetAllRecords(DATA_DB, [...STORE_NAMES], store);
  return records
    .sort((a, b) => b.updated_at - a.updated_at)
    .map((record: StoredRecord) => ({ id: record.id, data: record.data }));
}

export async function putRow(store: Store, id: string, sealedData: string): Promise<void> {
  await idbPutRecord(DATA_DB, [...STORE_NAMES], store, {
    id,
    data: sealedData,
    updated_at: Date.now(),
  });
}

export async function deleteRow(store: Store, id: string): Promise<void> {
  await idbDeleteRecord(DATA_DB, [...STORE_NAMES], store, id);
}

export async function wipeDatabase(): Promise<void> {
  await idbClear(DATA_DB, [...STORE_NAMES]);
}
