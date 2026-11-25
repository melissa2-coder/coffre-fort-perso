import { useColorScheme } from 'react-native';

const darkColors = {
  bg: '#0B1220',
  bgSoft: '#0F182B',
  card: '#131E36',
  cardHover: '#1A2846',
  border: '#22304F',
  text: '#E8EDF7',
  sub: '#8A94AD',
  accent: '#3B82F6',
  accentSoft: 'rgba(59, 130, 246, 0.16)',
  onAccent: '#FFFFFF',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.14)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  warn: '#FBBF24',
  warnSoft: 'rgba(251, 191, 36, 0.14)',
  blue: '#60A5FA',
  blueSoft: 'rgba(96, 165, 250, 0.14)',
} as const;

const lightColors = {
  bg: '#F5F7FA',
  bgSoft: '#EAEFF5',
  card: '#FFFFFF',
  cardHover: '#F2F6FA',
  border: '#DCE3ED',
  text: '#12233F',
  sub: '#5B6B81',
  accent: '#2563EB',
  accentSoft: 'rgba(37, 99, 235, 0.10)',
  onAccent: '#FFFFFF',
  success: '#15803D',
  successSoft: 'rgba(21, 128, 61, 0.10)',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.10)',
  warn: '#B45309',
  warnSoft: 'rgba(180, 83, 9, 0.12)',
  blue: '#0369A1',
  blueSoft: 'rgba(3, 105, 161, 0.10)',
} as const;

export type Palette = Record<keyof typeof darkColors, string>;

export interface Theme {
  colors: Palette;
  dark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const dark = scheme !== 'light';
  return dark ? { colors: darkColors, dark: true } : { colors: lightColors, dark: false };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;
