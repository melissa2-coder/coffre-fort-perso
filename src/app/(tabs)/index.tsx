import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, Screen, SectionLabel, Title } from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { FORM_TEMPLATES } from '../../data/formTemplates';
import { PROFILE_FIELDS } from '../../data/profileFields';
import { useTheme, type Palette, spacing } from '../../lib/theme';

export default function AccueilScreen() {
  const router = useRouter();
  const { values, documents, habits, entries, biometric, runs } = useVault();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const filledFields = useMemo(
    () =>
      PROFILE_FIELDS.filter((field) => (values[field.id]?.value ?? '').trim().length > 0).length,
    [values],
  );

  const today = useMemo(() => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);
  const habitsDoneToday = entries.filter((entry) => entry.date === today && entry.done).length;

  const recentRun = runs[0];

  return (
    <Screen>
      <Title
        text="Votre coffre"
        sub="Renseignez une fois, réutilisez partout — sans jamais quitter votre téléphone."
      />

      <Card style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
          <Text style={styles.securityTitle}>Sécurité active</Text>
          <Badge label="100 % local" tone="ok" />
        </View>
        <Text style={styles.securityText}>
          Chiffrement XChaCha20-Poly1305 · clé dans {biometric.label} · aucune connexion réseau
          pour vos données.
        </Text>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{filledFields}</Text>
          <Text style={styles.statLabel}>champs remplis</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{documents.length}</Text>
          <Text style={styles.statLabel}>documents chiffrés</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {habits.length > 0 ? `${habitsDoneToday}/${habits.length}` : '0'}
          </Text>
          <Text style={styles.statLabel}>habitudes du jour</Text>
        </Card>
      </View>

      <SectionLabel>Remplir en un clic</SectionLabel>
      {FORM_TEMPLATES.map((template) => {
        const required = template.sections
          .flatMap((section) => section.fields)
          .filter((field) => field.required);
        const missing = required.filter(
          (field) => !(values[field.fieldId]?.value ?? '').trim(),
        ).length;
        return (
          <Card key={template.id} onPress={() => router.push(`/formulaires/${template.id}`)}>
            <View style={styles.templateRow}>
              <View style={[styles.templateIcon, { backgroundColor: `${template.color}22` }]}>
                <Ionicons name={template.icon as never} size={20} color={template.color} />
              </View>
              <View style={styles.templateText}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateSub}>{template.subtitle}</Text>
              </View>
              {missing === 0 ? (
                <Badge label="Prêt" tone="ok" />
              ) : (
                <Badge label={`${missing} info(s)`} tone="warn" />
              )}
              <Ionicons name="chevron-forward" size={16} color={colors.sub} />
            </View>
          </Card>
        );
      })}

      {recentRun ? (
        <>
          <SectionLabel>Dernière activité</SectionLabel>
          <Card>
            <Text style={styles.runText}>
              {FORM_TEMPLATES.find((t) => t.id === recentRun.templateId)?.title ??
                recentRun.templateId}{' '}
              — généré le {new Date(recentRun.createdAt).toLocaleDateString('fr-FR')}
            </Text>
            {recentRun.missing.length > 0 ? (
              <Badge label={`${recentRun.missing.length} champ(s) manquants`} tone="warn" />
            ) : (
              <Badge label="Complet" tone="ok" />
            )}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  securityCard: { backgroundColor: colors.card },
  securityHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  securityTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '700' },
  securityText: { color: colors.sub, fontSize: 13, lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { alignItems: 'center', flex: 1, gap: 2, paddingVertical: spacing.lg },
  statValue: { color: colors.accent, fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.sub, fontSize: 11, textAlign: 'center' },
  templateRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  templateIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  templateText: { flex: 1, gap: 2 },
  templateTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  templateSub: { color: colors.sub, fontSize: 12, lineHeight: 17 },
  runText: { color: colors.text, fontSize: 14 },
});
