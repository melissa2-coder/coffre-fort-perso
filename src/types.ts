export type FieldValue = {
  value: string;
  updatedAt: number;
};

export type StoredDocument = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: number;
  fileName: string;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  target: number;
  createdAt: number;
};

export type HabitEntry = {
  id: string;
  habitId: string;
  date: string;
  done: boolean;
};

export type FormRun = {
  id: string;
  templateId: string;
  createdAt: number;
  missing: string[];
  summary: string;
};

export type BiometricInfo = {
  available: boolean;
  enrolled: boolean;
  type: 'face' | 'fingerprint' | 'none';
  label: string;
};

export type VaultStatus = 'loading' | 'locked' | 'unlocked';
