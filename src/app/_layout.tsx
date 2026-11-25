import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { VaultProvider, useVault } from '../state/VaultProvider';
import { LockScreen } from '../components/LockScreen';
import { Loading } from '../components/ui';
import { useTheme } from '../lib/theme';

function Gate() {
  const { status } = useVault();
  const { colors } = useTheme();
  if (status === 'loading') {
    return <Loading />;
  }
  if (status === 'locked') {
    return <LockScreen />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}

export default function RootLayout() {
  const { dark, colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <VaultProvider>
        <Gate />
      </VaultProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};
