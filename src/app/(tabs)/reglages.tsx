import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Badge,
  Button,
  Card,
  Screen,
  SectionLabel,
  TextInputRow,
  Title,
} from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { validateCredential, type CredentialKind } from '../../lib/credential.rules';
import { useTheme, type Palette, spacing } from '../../lib/theme';

export default function ReglagesScreen() {
  const {
    biometric,
    lock,
    wipeEverything,
    documents,
    values,
    credentialKind,
    setCredential,
    removeCredential,
  } = useVault();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const statFields = Object.keys(values).length;

  // Formulaire du code de secours
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<CredentialKind>('pin');
  const [secret, setSecret] = useState('');
  const [confirm, setConfirm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startEditing = (preset: CredentialKind) => {
    setEditing(true);
    setKind(preset);
    setSecret('');
    setConfirm('');
    setFormError(null);
  };

  const saveCredential = async () => {
    if (secret !== confirm) {
      setFormError('Les deux saisies ne correspondent pas.');
      return;
    }
    const problem = validateCredential(kind, secret);
    if (problem) {
      setFormError(problem);
      return;
    }
    setBusy(true);
    try {
      await setCredential(kind, secret);
      setEditing(false);
      setSecret('');
      setConfirm('');
      setFormError(null);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = () => {
    Alert.alert(
      'Supprimer le code de secours',
      'Sans code de secours, seule la biométrie (ou le verrouillage de l’appareil) permettra de déverrouiller le coffre. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void removeCredential();
          },
        },
      ],
    );
  };

  const confirmWipe = () => {
    Alert.alert(
      'Effacer tout',
      'Cette action supprime définitivement la clé et toutes les données chiffrées de cet appareil. Elle est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: () => {
            void wipeEverything();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Title text="Réglages" sub="Sécurité et confidentialité de votre coffre." />

      <Card>
        <SectionLabel>Verrouillage</SectionLabel>
        <View style={styles.infoRow}>
          <Ionicons name="finger-print" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            Méthode : {biometric.label}
            {biometric.available
              ? biometric.enrolled
                ? ' (configurée)'
                : ' (non configurée sur l’appareil)'
              : ' (indisponible)'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="key" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            Clé de chiffrement : iOS Keychain / Android Keystore, jamais exportée.
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="server" size={18} color={colors.accent} />
          <Text style={styles.infoText}>Backend : aucun. Aucune donnée n’est envoyée en ligne.</Text>
        </View>
        <Button label="Verrouiller maintenant" variant="ghost" onPress={lock} />
      </Card>

      <Card>
        <SectionLabel>Code de secours</SectionLabel>
        <View style={styles.infoRow}>
          <Ionicons
            name={credentialKind ? 'shield-checkmark' : 'warning'}
            size={18}
            color={credentialKind ? colors.accent : colors.warn}
          />
          <Text style={styles.infoText}>
            {credentialKind === undefined
              ? 'Vérification en cours…'
              : credentialKind === null
                ? 'Aucun code de secours défini. Il est demandé dès que la biométrie n’est pas disponible ou échoue.'
                : credentialKind === 'pin'
                  ? 'Un code PIN de secours est actif : il est demandé dès que la biométrie n’est pas disponible ou échoue.'
                  : 'Un mot de passe maître de secours est actif : il est demandé dès que la biométrie n’est pas disponible ou échoue.'}
          </Text>
        </View>

        {credentialKind === undefined ? null : editing ? (
          <View style={styles.form}>
            <View style={styles.badgeRow}>
              <Button
                label="Code PIN (4 ou 6 chiffres)"
                variant={kind === 'pin' ? 'primary' : 'ghost'}
                onPress={() => setKind('pin')}
                disabled={busy}
                style={styles.kindButton}
              />
              <Button
                label="Mot de passe maître"
                variant={kind === 'password' ? 'primary' : 'ghost'}
                onPress={() => setKind('password')}
                disabled={busy}
                style={styles.kindButton}
              />
            </View>
            <TextInputRow
              value={secret}
              onChange={setSecret}
              placeholder={kind === 'pin' ? 'Code PIN' : 'Mot de passe maître'}
              secure
              keyboardType={kind === 'pin' ? 'number-pad' : 'default'}
            />
            <TextInputRow
              value={confirm}
              onChange={setConfirm}
              placeholder="Confirmer"
              secure
              keyboardType={kind === 'pin' ? 'number-pad' : 'default'}
            />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <View style={styles.badgeRow}>
              <Button
                label="Enregistrer"
                onPress={() => void saveCredential()}
                loading={busy}
                disabled={busy}
              />
              <Button
                label="Annuler"
                variant="ghost"
                onPress={() => setEditing(false)}
                disabled={busy}
              />
            </View>
          </View>
        ) : credentialKind === null ? (
          <Button label="Définir un code de secours" onPress={() => startEditing('pin')} />
        ) : (
          <View style={styles.badgeRow}>
            <Badge label="Actif" tone="ok" />
            <Button
              label="Modifier"
              variant="ghost"
              onPress={() => startEditing(credentialKind)}
            />
            <Button label="Supprimer" variant="danger" onPress={confirmRemove} />
          </View>
        )}
      </Card>

      <Card>
        <SectionLabel>Données</SectionLabel>
        <View style={styles.badgeRow}>
          <Badge label={`${statFields} champs chiffrés`} tone="blue" />
          <Badge label={`${documents.length} documents chiffrés`} tone="blue" />
        </View>
        <Button label="Effacer toutes les données" variant="danger" onPress={confirmWipe} />
      </Card>

      <Card>
        <SectionLabel>À propos</SectionLabel>
        <Text style={styles.about}>
          Coffre v1.1.0 — application 100 % locale. Vos préférences, documents administratifs et
          habitudes sont chiffrés avec XChaCha20-Poly1305 sur votre téléphone. Le code de secours
          n’est jamais stocké en clair : seule une empreinte salée (hachage étiré) est conservée.
        </Text>
      </Card>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    infoRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
    infoText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
    about: { color: colors.sub, fontSize: 13, lineHeight: 20 },
    form: { gap: spacing.md },
    kindButton: { flexGrow: 1 },
    formError: { color: colors.danger, fontSize: 13 },
  });
