import { Directory, File, Paths } from 'expo-file-system';

const DOCUMENT_DIRECTORY = 'coffre';

function documentsDirectory(): Directory {
  const directory = new Directory(Paths.document, DOCUMENT_DIRECTORY);
  if (!directory.exists) {
    directory.create();
  }
  return directory;
}

export async function saveDocumentBlob(id: string, bytes: Uint8Array): Promise<void> {
  const file = new File(documentsDirectory(), `${id}.bin`);
  await file.write(bytes);
}

export async function loadDocumentBlob(id: string): Promise<Uint8Array> {
  const file = new File(documentsDirectory(), `${id}.bin`);
  if (!file.exists) {
    throw new Error('données du document introuvables');
  }
  return file.bytes();
}

export async function removeDocumentBlob(id: string): Promise<void> {
  const file = new File(documentsDirectory(), `${id}.bin`);
  if (file.exists) {
    file.delete();
  }
}

export async function wipeAllDocumentBlobs(): Promise<void> {
  const documentsDir = new Directory(Paths.document, DOCUMENT_DIRECTORY);
  if (documentsDir.exists) {
    documentsDir.delete();
  }
  const cacheDir = new Directory(Paths.cache, DOCUMENT_DIRECTORY);
  if (cacheDir.exists) {
    cacheDir.delete();
  }
}

export async function previewDocumentBlob(
  id: string,
  bytes: Uint8Array,
  name: string,
  _mimeType: string,
): Promise<void> {
  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '.bin';
  const cacheDirectory = new Directory(Paths.cache, DOCUMENT_DIRECTORY);
  if (!cacheDirectory.exists) {
    cacheDirectory.create();
  }
  const outFile = new File(cacheDirectory, `preview-${id}${extension}`);
  await outFile.write(bytes);
  await outFile.preview();
}
