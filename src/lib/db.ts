import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'coffre.db';

const STORES = ['fields', 'documents', 'habits', 'habit_entries', 'form_runs'] as const;

export type Store = (typeof STORES)[number];

let instance: SQLiteDatabase | null = null;
let opening: Promise<SQLiteDatabase> | null = null;

async function createSchema(db: SQLiteDatabase): Promise<void> {
  const create = (store: Store) =>
    `CREATE TABLE IF NOT EXISTS ${store} (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`;
  await db.execAsync(
    [
      `PRAGMA journal_mode = WAL`,
      `PRAGMA foreign_keys = ON`,
      create('fields'),
      create('documents'),
      create('habits'),
      create('habit_entries'),
      create('form_runs'),
    ].join('; ') + ';',
  );
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (instance) {
    return instance;
  }
  if (!opening) {
    opening = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await createSchema(db);
      instance = db;
      return db;
    });
  }
  return opening;
}

export type SealedRow = { id: string; data: string };

export async function loadRows(store: Store): Promise<SealedRow[]> {
  const db = await getDatabase();
  const raw = await db.getAllAsync<{ id: string; data: string }>(
    `SELECT id, data FROM ${store} ORDER BY updated_at DESC`,
  );
  return raw.map((row) => ({ id: row.id, data: row.data }));
}

export async function putRow(store: Store, id: string, sealedData: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO ${store} (id, data, updated_at) VALUES (?, ?, ?)`,
    [id, sealedData, Date.now()],
  );
}

export async function deleteRow(store: Store, id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${store} WHERE id = ?`, [id]);
}

export async function wipeDatabase(): Promise<void> {
  const db = await getDatabase();
  for (const store of STORES) {
    await db.runAsync(`DELETE FROM ${store}`);
  }
  await db.execAsync('VACUUM');
}
