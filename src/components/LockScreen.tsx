import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen } from '../components/ui';
import { useVault } from '../state/VaultProvider';
import { colors, radius, spacing } from '../lib/theme';

export function LockScreen() {
  const { unlock, biometric, error } = useVault();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUnlock = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const outcome = await unlock();
    setBusy(false);
    if (!outcome.ok) {
      setMessage(outcome.reason);
    }
  }, [unlock]);

  return (
    <Screen scroll={false} padded>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="lock-closed" size={44} color={colors.accent} />
        </View>
        <Text style={styles.appName}>Coffre</Text>
        <Text style={styles.tagline}>
          Vos données, vos documents et vos habitudes — chiffrés sur votre téléphone. Jamais dans
          le cloud.
        </Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.featureRow}>
          <Ionicons name="finger-print" size={18} color={colors.accent} />
          <Text style={styles.featureText}>Déverrouillage par {biometric.label}</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
          <Text style={styles.featureText}>
            Chiffrement XChaCha20-Poly1305, clé gardée dans le coffre sécurisé de l&apos;OS
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="cloud-offline" size={18} color={colors.accent} />
          <Text style={styles.featureText}>
            Aucun serveur, aucun compte, aucun envoi de données
          </Text>
        </View>

        {error || message ? <Text style={styles.error}>{error ?? message}</Text> : null}

        <Button
          label={biometric.available && biometric.enrolled ? 'Déverrouiller' : 'Ouvrir mon coffre'}
          onPress={() => {
            void handleUnlock();
          }}
          loading={busy}
        />
        <Pressable onPress={() => void handleUnlock()}>
          <Text style={styles.hint}>
            {biometric.available && biometric.enrolled
              ? 'Touchez pour utiliser la biométrie de votre appareil'
              : 'La biométrie n’est pas configurée sur cet appareil'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.md,
    marginTop: '18%',
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: radius.lg + 8,
    borderWidth: 1,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  appName: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: colors.sub, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  panel: { gap: spacing.lg, marginVertical: spacing.xl },
  featureRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  featureText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  hint: { color: colors.sub, fontSize: 12, textAlign: 'center' },
});
