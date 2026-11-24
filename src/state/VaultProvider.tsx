import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { File } from 'expo-file-system';
import {
  loadMasterKey,
  openBytes,
  openJson,
  sealBytes,
  sealJson,
  wipeMasterKey,
} from '../lib/crypto';
import {
  loadDocumentBlob,
  previewDocumentBlob,
  removeDocumentBlob,
  saveDocumentBlob,
  wipeAllDocumentBlobs,
} from '../lib/blobStore';
import { deleteRow, loadRows, putRow, wipeDatabase } from '../lib/db';
import type {
  BiometricInfo,
  FieldValue,
  FormRun,
  Habit,
  HabitEntry,
  StoredDocument,
  VaultStatus,
} from '../types';

type UnlockOutcome = { ok: true } | { ok: false; reason: string };

type VaultContextValue = {
  status: VaultStatus;
  values: Record<string, FieldValue>;
  documents: StoredDocument[];
  habits: Habit[];
  entries: HabitEntry[];
  runs: FormRun[];
  biometric: BiometricInfo;
  error: string | null;
  unlock: () => Promise<UnlockOutcome>;
  lock: () => void;
  setFieldValue: (fieldId: string, value: string) => Promise<void>;
  addDocument: (asset: DocumentPickerAsset, category: string) => Promise<StoredDocument>;
  removeDocument: (id: string) => Promise<void>;
  openDocument: (id: string) => Promise<void>;
  addHabit: (name: string, icon: string, target: number) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  toggleHabitToday: (habitId: string) => Promise<void>;
  saveRun: (templateId: string, missing: string[], summary: string) => Promise<void>;
  wipeEverything: () => Promise<void>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

function todayISO(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

async function readPickedBytes(asset: DocumentPickerAsset): Promise<Uint8Array> {
  if (asset.uri.startsWith('data:')) {
    const base64 = asset.uri.slice(asset.uri.indexOf(',') + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new File(asset.uri).bytes();
}

async function detectBiometric(): Promise<BiometricInfo> {
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const isFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const isFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    return {
      available: hardware,
      enrolled,
      type: isFace ? 'face' : isFingerprint ? 'fingerprint' : 'none',
      label: isFace
        ? 'Face ID'
        : isFingerprint
          ? 'Empreinte / Touch ID'
          : 'Verrouillage de l’appareil',
    };
  } catch {
    return { available: false, enrolled: false, type: 'none', label: 'Non disponible' };
  }
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>('locked');
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [runs, setRuns] = useState<FormRun[]>([]);
  const [biometric, setBiometric] = useState<BiometricInfo>({
    available: false,
    enrolled: false,
    type: 'none',
    label: 'Non disponible',
  });
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    detectBiometric().then(setBiometric);
  }, []);

  const loadAll = useCallback(async (key: Uint8Array) => {
    const [fieldRows, documentRows, habitRows, entryRows, runRows] = await Promise.all([
      loadRows('fields'),
      loadRows('documents'),
      loadRows('habits'),
      loadRows('habit_entries'),
      loadRows('form_runs'),
    ]);
    const decodedValues: Record<string, FieldValue> = {};
    for (const row of fieldRows) {
      const parsed = openJson<{ value: string; updatedAt: number }>(key, row.data);
      decodedValues[row.id] = parsed;
    }
    const decodedHabits = habitRows.map((row) => openJson<Habit>(key, row.data));
    const decodedEntries = entryRows.map((row) => openJson<HabitEntry>(key, row.data));
    const decodedDocuments = documentRows.map((row) => openJson<StoredDocument>(key, row.data));
    const decodedRuns = runRows.map((row) => openJson<FormRun>(key, row.data));
    setValues(decodedValues);
    setHabits(decodedHabits);
    setEntries(decodedEntries);
    setDocuments(decodedDocuments);
    setRuns(decodedRuns);
  }, []);

  const unlock = useCallback(async (): Promise<UnlockOutcome> => {
    setError(null);
    try {
      const info = await detectBiometric();
      setBiometric(info);
      if (info.available && info.enrolled) {
        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Déverrouiller votre coffre',
          fallbackLabel: '',
          cancelLabel: 'Annuler',
          disableDeviceFallback: false,
          requireConfirmation: false,
        });
        if (!auth.success) {
          return { ok: false, reason: 'Authentification annulée ou refusée.' };
        }
      }
      const key = await loadMasterKey();
      await loadAll(key);
      keyRef.current = key;
      setStatus('unlocked');
      return { ok: true };
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Impossible de déverrouiller le coffre.';
      setError(message);
      return { ok: false, reason: message };
    }
  }, [loadAll]);

  const lock = useCallback(() => {
    keyRef.current = null;
    setValues({});
    setDocuments([]);
    setHabits([]);
    setEntries([]);
    setRuns([]);
    setError(null);
    setStatus('locked');
  }, []);

  const requireKey = useCallback(async (): Promise<Uint8Array> => {
    if (keyRef.current) {
      return keyRef.current;
    }
    throw new Error('coffre verrouillé');
  }, []);

  const setFieldValue = useCallback(
    async (fieldId: string, value: string) => {
      const key = await requireKey();
      const record: FieldValue = { value, updatedAt: Date.now() };
      await putRow('fields', fieldId, sealJson(key, record));
      setValues((current) => ({ ...current, [fieldId]: record }));
    },
    [requireKey],
  );

  const addDocument = useCallback(
    async (asset: DocumentPickerAsset, category: string): Promise<StoredDocument> => {
      const key = await requireKey();
      const plain = await readPickedBytes(asset);
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      await saveDocumentBlob(id, sealBytes(key, plain));
      const document: StoredDocument = {
        id,
        name: asset.name || 'Document',
        mimeType: asset.mimeType ?? 'application/octet-stream',
        size: plain.length,
        category,
        createdAt: Date.now(),
      };
      await putRow('documents', id, sealJson(key, document));
      setDocuments((current) => [document, ...current]);
      return document;
    },
    [requireKey],
  );

  const removeDocument = useCallback(
    async (id: string) => {
      await removeDocumentBlob(id);
      await deleteRow('documents', id);
      setDocuments((current) => current.filter((item) => item.id !== id));
    },
    [],
  );

  const openDocument = useCallback(
    async (id: string) => {
      const key = await requireKey();
      const document = documents.find((item) => item.id === id);
      if (!document) {
        throw new Error('document introuvable');
      }
      const sealed = await loadDocumentBlob(id);
      const plain = openBytes(key, sealed);
      await previewDocumentBlob(id, plain, document.name, document.mimeType);
    },
    [documents, requireKey],
  );

  const addHabit = useCallback(
    async (name: string, icon: string, target: number) => {
      const key = await requireKey();
      const habit: Habit = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        icon,
        target,
        createdAt: Date.now(),
      };
      await putRow('habits', habit.id, sealJson(key, habit));
      setHabits((current) => [habit, ...current]);
    },
    [requireKey],
  );

  const removeHabit = useCallback(
    async (habitId: string) => {
      const related = entries.filter((entry) => entry.habitId === habitId);
      for (const entry of related) {
        await deleteRow('habit_entries', entry.id);
      }
      await deleteRow('habits', habitId);
      setEntries((current) => current.filter((entry) => entry.habitId !== habitId));
      setHabits((current) => current.filter((habit) => habit.id !== habitId));
    },
    [entries],
  );

  const toggleHabitToday = useCallback(
    async (habitId: string) => {
      const key = await requireKey();
      const date = todayISO();
      const existing = entries.find((entry) => entry.habitId === habitId && entry.date === date);
      if (existing) {
        await deleteRow('habit_entries', existing.id);
        setEntries((current) =>
          current.filter((entry) => !(entry.habitId === habitId && entry.date === date)),
        );
        return;
      }
      const entry: HabitEntry = {
        id: `${habitId}-${date}`,
        habitId,
        date,
        done: true,
      };
      await putRow('habit_entries', entry.id, sealJson(key, entry));
      setEntries((current) => [...current, entry]);
    },
    [entries, requireKey],
  );

  const saveRun = useCallback(
    async (templateId: string, missing: string[], summary: string) => {
      const key = await requireKey();
      const run: FormRun = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        templateId,
        createdAt: Date.now(),
        missing,
        summary,
      };
      await putRow('form_runs', run.id, sealJson(key, run));
      setRuns((current) => [run, ...current].slice(0, 20));
    },
    [requireKey],
  );

  const wipeEverything = useCallback(async () => {
    await wipeAllDocumentBlobs();
    await wipeDatabase();
    await wipeMasterKey();
    lock();
  }, [lock]);

  const contextValue = useMemo<VaultContextValue>(
    () => ({
      status,
      values,
      documents,
      habits,
      entries,
      runs,
      biometric,
      error,
      unlock,
      lock,
      setFieldValue,
      addDocument,
      removeDocument,
      openDocument,
      addHabit,
      removeHabit,
      toggleHabitToday,
      saveRun,
      wipeEverything,
    }),
    [
      status,
      values,
      documents,
      habits,
      entries,
      runs,
      biometric,
      error,
      unlock,
      lock,
      setFieldValue,
      addDocument,
      removeDocument,
      openDocument,
      addHabit,
      removeHabit,
      toggleHabitToday,
      saveRun,
      wipeEverything,
    ],
  );

  return <VaultContext.Provider value={contextValue}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault doit être utilisé dans VaultProvider');
  }
  return context;
}
