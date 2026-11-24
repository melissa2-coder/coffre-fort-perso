import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { VaultProvider, useVault } from '../state/VaultProvider';
import { LockScreen } from '../components/LockScreen';
import { Loading } from '../components/ui';
import { colors } from '../lib/theme';

function Gate() {
  const { status } = useVault();
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
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <VaultProvider>
        <Gate />
      </VaultProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};
