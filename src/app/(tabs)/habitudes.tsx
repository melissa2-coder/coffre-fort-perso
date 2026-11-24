import React, { useMemo, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Empty, Screen, TextInputRow, Title } from '../../components/ui';
import { useVault } from '../../state/VaultProvider';
import { colors, spacing } from '../../lib/theme';

const ICON_CHOICES = ['🏃', '💧', '📚', '🧘', '🛏️', '💊', '🌱', '🎸', '✉️', '🧹'];
const TARGET_CHOICES = [1, 3, 5, 7];

function dateOffsetISO(daysAgo: number): string {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function computeStreak(
  habitId: string,
  entries: { habitId: string; date: string; done: boolean }[],
): number {
  const dates = new Set(
    entries.filter((entry) => entry.habitId === habitId && entry.done).map((entry) => entry.date),
  );
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    if (dates.has(dateOffsetISO(offset))) {
      streak += 1;
    } else if (offset > 0) {
      break;
    }
  }
  return streak;
}

export default function HabitudesScreen() {
  const { habits, entries, toggleHabitToday, addHabit, removeHabit } = useVault();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [target, setTarget] = useState(7);

  const today = useMemo(() => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);

  const weekly = useMemo(
    () => Array.from({ length: 7 }, (_, index) => dateOffsetISO(6 - index)),
    [],
  );

  const create = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    try {
      await addHabit(trimmed, icon, target);
      setModalOpen(false);
      setName('');
      setIcon(ICON_CHOICES[0]);
      setTarget(7);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer cette habitude.');
    }
  };

  return (
    <Screen>
      <Title text="Habitudes" sub="Vos routines, suivies chaque jour — chiffrées comme le reste." />

      <Button label="Créer une habitude" variant="ghost" onPress={() => setModalOpen(true)} />

      {habits.length === 0 ? (
        <Empty text="Suivez vos routines quotidiennes : activité, hydratation, lecture… Vos habitudes restent privées." />
      ) : null}

      {habits.map((habit) => {
        const doneToday = entries.some(
          (entry) => entry.habitId === habit.id && entry.date === today && entry.done,
        );
        const streak = computeStreak(habit.id, entries);
        return (
          <Card key={habit.id}>
            <View style={styles.habitRow}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <View style={styles.habitText}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitMeta}>
                  Objectif : {habit.target} j/semaine · Série : {streak} j
                </Text>
              </View>
              {doneToday ? (
                <Badge label="Fait aujourd’hui" tone="ok" />
              ) : (
                <Badge label="À faire" tone="warn" />
              )}
            </View>
            <View style={styles.weekRow}>
              {weekly.map((date) => {
                const done = entries.some(
                  (entry) => entry.habitId === habit.id && entry.date === date && entry.done,
                );
                return (
                  <View key={date} style={[styles.weekDot, done && styles.weekDotDone]}>
                    <Text style={[styles.weekDotText, done && styles.weekDotTextDone]}>
                      {date.slice(8)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.actions}>
              <Button
                label={doneToday ? 'Annuler aujourd’hui' : 'Fait aujourd’hui'}
                variant={doneToday ? 'ghost' : 'primary'}
                onPress={() => void toggleHabitToday(habit.id)}
              />
              <Button
                label="Supprimer"
                variant="danger"
                onPress={() =>
                  Alert.alert('Supprimer', `Supprimer « ${habit.name} » ?`, [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => {
                        void removeHabit(habit.id);
                      },
                    },
                  ])
                }
              />
            </View>
          </Card>
        );
      })}

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Nouvelle habitude</Text>
            <TextInputRow value={name} onChange={setName} placeholder="Boire 1,5 L d’eau" />
            <Text style={styles.modalLabel}>Icône</Text>
            <View style={styles.iconRow}>
              {ICON_CHOICES.map((choice) => (
                <Text
                  key={choice}
                  style={[styles.iconChoice, icon === choice && styles.iconChoiceSelected]}
                  onPress={() => setIcon(choice)}
                >
                  {choice}
                </Text>
              ))}
            </View>
            <Text style={styles.modalLabel}>Objectif hebdomadaire</Text>
            <View style={styles.iconRow}>
              {TARGET_CHOICES.map((choice) => (
                <Text
                  key={choice}
                  style={[styles.iconChoice, target === choice && styles.iconChoiceSelected]}
                  onPress={() => setTarget(choice)}
                >
                  {choice === 1 ? '1 j' : `${choice} j`}
                </Text>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button label="Annuler" variant="ghost" onPress={() => setModalOpen(false)} />
              <Button
                label="Créer"
                onPress={() => void create()}
                disabled={name.trim().length === 0}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  habitRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  habitIcon: { fontSize: 26 },
  habitText: { flex: 1, gap: 2 },
  habitName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  habitMeta: { color: colors.sub, fontSize: 12 },
  weekRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  weekDot: {
    alignItems: 'center',
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  weekDotDone: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  weekDotText: { color: colors.sub, fontSize: 12, fontWeight: '600' },
  weekDotTextDone: { color: colors.accent },
  actions: { flexDirection: 'row', gap: spacing.sm },
  modalBackdrop: {
    backgroundColor: 'rgba(5, 8, 16, 0.7)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalLabel: { color: colors.sub, fontSize: 12 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconChoice: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconChoiceSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  modalActions: { flexDirection: 'row', gap: spacing.md },
});
