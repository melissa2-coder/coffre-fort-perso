import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useVault } from '../../state/VaultProvider';
import { Badge, Button, Card, Empty, Screen, SectionLabel, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

const CATEGORIES = [
  'Identité',
  'Justificatif de domicile',
  'Revenus',
  'Santé',
  'Assurance',
  'Impôts',
  'Autre',
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function iconForMime(mimeType: string): 'image' | 'document' | 'reader' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'document';
  return 'reader';
}

export default function DocumentsScreen() {
  const { documents, addDocument, removeDocument, revealDocument } = useVault();
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pick = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) {
      return;
    }
    setPending(result.assets[0]);
  }, []);

  const confirmCategory = useCallback(
    async (category: string) => {
      if (!pending) return;
      setBusy('import');
      try {
        await addDocument(pending, category);
      } catch {
        Alert.alert('Erreur', 'L’import a échoué.');
      } finally {
        setBusy(null);
        setPending(null);
      }
    },
    [pending, addDocument],
  );

  const preview = useCallback(
    async (id: string) => {
      setBusy(id);
      try {
        const file = await revealDocument(id);
        await file.preview();
      } catch {
        Alert.alert('Aperçu', 'Ce document ne peut pas être prévisualisé.');
      } finally {
        setBusy(null);
      }
    },
    [revealDocument],
  );

  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

  return (
    <Screen>
      <Title
        text="Coffre à documents"
        sub={`${documents.length} document(s) · ${formatSize(totalSize)} — tous chiffrés sur l’appareil.`}
      />

      <Button label="Ajouter un document" onPress={() => void pick()} />

      {pending ? (
        <Card>
          <SectionLabel>Catégoriser · {pending.name}</SectionLabel>
          <View style={styles.categories}>
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                label={category}
                variant="ghost"
                onPress={() => void confirmCategory(category)}
                loading={busy === 'import'}
                disabled={busy === 'import'}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {documents.length === 0 && !pending ? (
        <Empty text="Importez une pièce d’identité, un justificatif de domicile… Il sera chiffré localement et ne quittera jamais ce téléphone." />
      ) : null}

      {documents.map((doc) => (
        <Card key={doc.id} onPress={() => void preview(doc.id)}>
          <View style={styles.documentRow}>
            <Text style={styles.documentIcon}>{iconForMime(doc.mimeType) === 'image' ? '🖼️' : '📄'}</Text>
            <View style={styles.documentText}>
              <Text style={styles.documentName} numberOfLines={1}>
                {doc.name}
              </Text>
              <Text style={styles.documentMeta}>
                {doc.category} · {formatSize(doc.size)} ·{' '}
                {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            {busy === doc.id ? <Badge label="..." tone="neutral" /> : <Badge label="Chiffré" tone="blue" />}
          </View>
          <Button
            label="Supprimer"
            variant="danger"
            onPress={() =>
              Alert.alert('Supprimer', `Supprimer « ${doc.name} » du coffre ?`, [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Supprimer',
                  style: 'destructive',
                  onPress: () => {
                    void removeDocument(doc.id);
                  },
                },
              ])
            }
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  documentRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  documentIcon: { fontSize: 24 },
  documentText: { flex: 1, gap: 2 },
  documentName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  documentMeta: { color: colors.sub, fontSize: 12 },
});
