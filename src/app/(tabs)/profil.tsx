import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, Empty, Screen, TextInputRow, Title } from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { fieldsByCategory, PROFILE_FIELDS } from '../../data/profileFields';
import { useTheme, type Palette, spacing } from '../../lib/theme';

export default function ProfilScreen() {
  const { values, setFieldValue } = useVault();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      PROFILE_FIELDS.map((field) => [field.id, values[field.id]?.value ?? '']),
    ),
  );
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => ({
    'État civil': true,
  }));

  const filledCount = useMemo(
    () =>
      PROFILE_FIELDS.filter((field) => (values[field.id]?.value ?? '').trim().length > 0).length,
    [values],
  );

  const commit = (fieldId: string) => {
    const draft = (drafts[fieldId] ?? '').trim();
    const stored = values[fieldId]?.value ?? '';
    if (draft !== stored) {
      void setFieldValue(fieldId, draft).catch(() => {
        Alert.alert('Erreur', 'Impossible d’enregistrer ce champ.');
      });
    }
  };

  const emptyVault =
    filledCount === 0 && Object.values(drafts).every((draft) => draft.length === 0);

  return (
    <Screen>
      <Title
        text="Votre profil"
        sub={`${filledCount}/${PROFILE_FIELDS.length} champs renseignés — chaque valeur est chiffrée sur l’appareil avant enregistrement.`}
      />

      {emptyVault ? (
        <Empty text="Renseignez vos informations : elles seront réutilisées automatiquement dans tous vos formulaires." />
      ) : null}

      {fieldsByCategory().map(({ category, fields }) => {
        const open = openCategories[category] ?? false;
        const filled = fields.filter(
          (field) => (values[field.id]?.value ?? '').trim().length > 0,
        ).length;
        return (
          <Card key={category} style={styles.categoryCard}>
            <PressableHeader
              category={category}
              open={open}
              filled={filled}
              total={fields.length}
              onToggle={() =>
                setOpenCategories((current) => ({ ...current, [category]: !open }))
              }
            />
            {open ? (
              <View style={styles.fieldList}>
                {fields.map((field) => (
                  <View key={field.id} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>
                      {field.label}
                      {field.secure ? '  🔒' : ''}
                    </Text>
                    <TextInputRow
                      value={drafts[field.id] ?? ''}
                      onChange={(next) =>
                        setDrafts((current) => ({ ...current, [field.id]: next }))
                      }
                      onSubmit={() => commit(field.id)}
                      placeholder={field.placeholder}
                      multiline={field.type === 'multiline'}
                      secure={field.secure}
                      keyboardType={
                        field.type === 'phone'
                          ? 'phone-pad'
                          : field.type === 'number'
                            ? 'number-pad'
                            : field.type === 'email'
                              ? 'email-address'
                              : 'default'
                      }
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

function PressableHeader({
  category,
  open,
  filled,
  total,
  onToggle,
}: {
  category: string;
  open: boolean;
  filled: number;
  total: number;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.categoryHeader} onTouchEnd={onToggle}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <Badge
        label={filled === total ? 'Complet' : `${filled}/${total}`}
        tone={filled === total ? 'ok' : 'neutral'}
      />
      <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  categoryCard: { gap: 0, paddingVertical: 0 },
  categoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  categoryTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '700' },
  chevron: { color: colors.sub, fontSize: 14 },
  fieldList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fieldRow: { gap: spacing.xs },
  fieldLabel: { color: colors.sub, fontSize: 12 },
});
