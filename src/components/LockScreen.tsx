import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen, TextInputRow } from '../components/ui';
import { useVault } from '../state/VaultProvider';
import { useTheme, type Palette, radius, spacing } from '../lib/theme';

type Mode = 'biometric' | 'code';

export function LockScreen() {
  const { unlock, unlockWithCredential, biometric, credentialKind, error } = useVault();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const bioReady = biometric.available && biometric.enrolled;
  const hasCode = credentialKind != null;
  // Choix explicite de l'utilisateur, sinon automatique : biométrie si
  // disponible, sinon code de secours dès qu'il existe.
  const [userMode, setUserMode] = useState<Mode | null>(null);
  const mode: Mode = userMode ?? (!bioReady && hasCode ? 'code' : 'biometric');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const waiting = credentialKind === undefined;

  const handleBiometric = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const outcome = await unlock();
    setBusy(false);
    if (!outcome.ok) {
      setMessage(outcome.reason);
      if (hasCode) {
        setUserMode('code');
      }
    }
  }, [unlock, hasCode]);

  const handleCode = useCallback(async () => {
    const trimmed = secret.trim();
    if (trimmed.length === 0) {
      setMessage(credentialKind === 'pin' ? 'Entrez votre code PIN.' : 'Entrez votre mot de passe.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const outcome = await unlockWithCredential(trimmed);
    setBusy(false);
    if (!outcome.ok) {
      setMessage(outcome.reason);
      setSecret('');
    }
  }, [secret, unlockWithCredential, credentialKind]);

  const isPin = credentialKind === 'pin';
  const showBiometricButton = bioReady || credentialKind == null;

  if (waiting) {
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
        <Text style={styles.hint}>Vérification du mode de déverrouillage…</Text>
      </Screen>
    );
  }

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

      {mode === 'biometric' && showBiometricButton ? (
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
            label={bioReady ? 'Déverrouiller' : 'Ouvrir mon coffre'}
            onPress={() => {
              void handleBiometric();
            }}
            loading={busy}
          />
          {hasCode ? (
            <Pressable onPress={() => setUserMode('code')} style={styles.switchPressable}>
              <Text style={styles.switchText}>
                {isPin ? 'Utiliser le code PIN de secours' : 'Utiliser le mot de passe maître'}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>
              {bioReady
                ? 'Touchez pour utiliser la biométrie de votre appareil'
                : 'Conseil : définissez un code PIN ou un mot de passe de secours dans Réglages.'}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.panel}>
          <View style={styles.featureRow}>
            <Ionicons name="key" size={18} color={colors.accent} />
            <Text style={styles.featureText}>
              {credentialKind === undefined
                ? 'Chargement du mode de secours…'
                : isPin
                  ? 'Entrez votre code PIN (4 ou 6 chiffres)'
                  : 'Entrez votre mot de passe maître'}
            </Text>
          </View>

          {error || message ? <Text style={styles.error}>{error ?? message}</Text> : null}

          <TextInputRow
            value={secret}
            onChange={(next) => setSecret(next)}
            onSubmit={() => void handleCode()}
            placeholder={isPin ? '••••' : 'Mot de passe'}
            secure
            keyboardType={isPin ? 'number-pad' : 'default'}
          />
          <Button
            label="Déverrouiller"
            onPress={() => {
              void handleCode();
            }}
            loading={busy}
            disabled={credentialKind === undefined}
          />
          {bioReady ? (
            <Pressable onPress={() => setUserMode('biometric')} style={styles.switchPressable}>
              <Text style={styles.switchText}>Utiliser la biométrie</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
    switchPressable: { alignItems: 'center', paddingVertical: spacing.sm },
    switchText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  });
