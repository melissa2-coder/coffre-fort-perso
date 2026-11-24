import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, SectionLabel, Title } from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { colors, spacing } from '../../lib/theme';

export default function ReglagesScreen() {
  const { biometric, lock, wipeEverything, documents, values } = useVault();

  const statFields = Object.keys(values).length;

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
          Coffre v1.0.0 — application 100 % locale. Vos préférences, documents administratifs et
          habitudes sont chiffrés avec XChaCha20-Poly1305 sur votre téléphone. Les fiches PDF
          générées ne contiennent vos données que si vous décidez de les partager depuis
          l’appareil.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  infoText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  about: { color: colors.sub, fontSize: 13, lineHeight: 20 },
});
