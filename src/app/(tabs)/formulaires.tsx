import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, Screen, Title } from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { FORM_TEMPLATES } from '../../data/formTemplates';
import { colors, spacing } from '../../lib/theme';

export default function FormulairesScreen() {
  const router = useRouter();
  const { values, runs } = useVault();

  const readiness = useMemo(
    () =>
      Object.fromEntries(
        FORM_TEMPLATES.map((template) => {
          const required = template.sections
            .flatMap((section) => section.fields)
            .filter((field) => field.required);
          const missing = required.filter(
            (field) => !(values[field.fieldId]?.value ?? '').trim(),
          );
          return [template.id, missing.length];
        }),
      ),
    [values],
  );

  return (
    <Screen>
      <Title
        text="Formulaires"
        sub="Un clic remplit chaque formulaire avec vos données chiffrées, génère le PDF et la liste des pièces à fournir."
      />

      {FORM_TEMPLATES.map((template) => {
        const missing = readiness[template.id] ?? 0;
        const lastRun = runs.find((run) => run.templateId === template.id);
        return (
          <Card key={template.id} onPress={() => router.push(`/formulaires/${template.id}`)}>
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: `${template.color}22` }]}>
                <Ionicons name={template.icon as never} size={22} color={template.color} />
              </View>
              <View style={styles.text}>
                <Text style={styles.name}>{template.title}</Text>
                <Text style={styles.sub}>{template.subtitle}</Text>
                {lastRun ? (
                  <Text style={styles.lastRun}>
                    Dernière génération : {new Date(lastRun.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                ) : null}
              </View>
              <View style={styles.side}>
                {missing === 0 ? (
                  <Badge label="Prêt" tone="ok" />
                ) : (
                  <Badge label={`${missing} info(s) manquante(s)`} tone="warn" />
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  icon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  text: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: colors.sub, fontSize: 12, lineHeight: 17 },
  lastRun: { color: colors.accent, fontSize: 11 },
  side: { alignItems: 'flex-end' },
});
