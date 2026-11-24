import { idbClear, idbGetBlob, idbPutBlob, idbDeleteRaw } from './webIdb';

const BLOB_DB = 'coffre-secure-blobs';
const BLOB_STORE = ['documents'] as const;

export async function saveDocumentBlob(id: string, bytes: Uint8Array): Promise<void> {
  await idbPutBlob(BLOB_DB, [...BLOB_STORE], 'documents', id, new Blob([bytes as BlobPart]));
}

export async function loadDocumentBlob(id: string): Promise<Uint8Array> {
  const blob = await idbGetBlob(BLOB_DB, [...BLOB_STORE], 'documents', id);
  if (!blob) {
    throw new Error('données du document introuvables');
  }
  return new Uint8Array(await blob.arrayBuffer());
}

export async function removeDocumentBlob(id: string): Promise<void> {
  await idbDeleteRaw(BLOB_DB, [...BLOB_STORE], 'documents', id);
}

export async function wipeAllDocumentBlobs(): Promise<void> {
  await idbClear(BLOB_DB, [...BLOB_STORE]);
}

export async function previewDocumentBlob(
  id: string,
  bytes: Uint8Array,
  name: string,
  mimeType: string,
): Promise<void> {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
