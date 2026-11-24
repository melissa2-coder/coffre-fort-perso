import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, SectionLabel, Title } from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { buildFilledTemplate, getTemplate } from '../../data/formTemplates';
import { exportDemenagementPdf, exportFilledPdf } from '../../lib/pdf';
import { colors, spacing } from '../../lib/theme';

export default function FormulaireDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const templateId = Array.isArray(params.id) ? params.id[0] : params.id;
  const template = getTemplate(templateId ?? '');
  const { values, saveRun } = useVault();
  const [busy, setBusy] = useState<'export' | null>(null);
  const [includeLetter, setIncludeLetter] = useState(true);

  const plainValues = useMemo<Record<string, string>>(() => {
    const plain: Record<string, string> = {};
    for (const [fieldId, record] of Object.entries(values)) {
      plain[fieldId] = record.value;
    }
    return plain;
  }, [values]);

  const filled = useMemo(
    () => (template ? buildFilledTemplate(template, plainValues) : null),
    [template, plainValues],
  );

  if (!template || !filled) {
    return (
      <Screen>
        <Title text="Formulaire introuvable" />
        <Button label="Retour" onPress={() => router.back()} variant="ghost" />
      </Screen>
    );
  }

  const handleExport = async () => {
    setBusy('export');
    try {
      if (template.id === 'demenagement') {
        await exportDemenagementPdf(filled, (id) => plainValues[id] ?? '', includeLetter);
      } else {
        await exportFilledPdf(filled);
      }
      await saveRun(
        template.id,
        filled.missingFields,
        `${filled.filledCount} champs pré-remplis avec vos données locales`,
      );
    } catch {
      Alert.alert('Export', 'La génération du PDF a échoué.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={22} color={colors.text} onPress={() => router.back()} />
        <View style={styles.headerText}>
          <Title text={template.title} sub={template.subtitle} />
        </View>
      </View>

      <Card>
        <View style={styles.statusRow}>
          {filled.missingFields.length === 0 ? (
            <Badge label="Prêt à générer" tone="ok" />
          ) : (
            <Badge
              label={`${filled.missingFields.length} champ(s) requis à compléter`}
              tone="warn"
            />
          )}
          <Badge label={`${filled.filledCount} champs remplis`} tone="blue" />
        </View>
        <Text style={styles.fillText}>
          {filled.missingFields.length === 0
            ? 'Toutes les informations obligatoires viennent de votre coffre, chiffrées en local.'
            : 'Complétez les champs signalés dans l’onglet Profil, puis revenez ici.'}
        </Text>
      </Card>

      {filled.sections.map((section) => (
        <Card key={section.title} style={styles.sectionCard}>
          <SectionLabel>{section.title}</SectionLabel>
          <View style={styles.rows}>
            {section.rows.map((row) => (
              <View key={row.fieldId} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={[styles.rowValue, row.missing && styles.rowValueMissing]}>
                  {row.missing ? 'à compléter' : row.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ))}

      {template.id === 'demenagement' ? (
        <Card>
          <View style={styles.letterRow}>
            <Text style={styles.letterLabel}>Inclure la lettre de changement d’adresse</Text>
            <Switch
              value={includeLetter}
              onValueChange={setIncludeLetter}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={includeLetter ? colors.bg : colors.sub}
            />
          </View>
          <Text style={styles.organismNote}>
            Le PDF inclut aussi la revue des organismes et services à prévenir (impôts, CAF,
            CPAM, énergie, banque…).
          </Text>
        </Card>
      ) : null}

      <Card>
        <SectionLabel>Pièces et étapes à prévoir</SectionLabel>
        {template.checklist.map((item) => (
          <View key={item} style={styles.checkRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
        {template.notes.map((note) => (
          <Text key={note} style={styles.note}>
            ℹ️ {note}
          </Text>
        ))}
      </Card>

      <Button
        label={template.cta}
        onPress={() => void handleExport()}
        loading={busy === 'export'}
        disabled={busy === 'export'}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  headerText: { flex: 1 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fillText: { color: colors.sub, fontSize: 13, lineHeight: 19 },
  sectionCard: { gap: spacing.md },
  rows: { gap: spacing.md },
  row: { gap: 2 },
  rowLabel: { color: colors.sub, fontSize: 12 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowValueMissing: { color: colors.warn, fontStyle: 'italic', fontWeight: '500' },
  letterRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  letterLabel: { color: colors.text, flex: 1, fontSize: 14 },
  organismNote: { color: colors.sub, fontSize: 12, lineHeight: 17 },
  checkRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  checkText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
  note: { color: colors.sub, fontSize: 12, lineHeight: 18 },
});
