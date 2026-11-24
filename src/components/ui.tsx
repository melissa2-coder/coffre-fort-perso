import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../lib/theme';

export function Screen({
  children,
  scroll = true,
  padded = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  const style = [styles.screen, padded && styles.screenPadded];
  if (scroll) {
    return (
      <SafeAreaView style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <SafeAreaView style={[styles.flex, style]}>{children}</SafeAreaView>;
}

export function Title({ text, sub }: { text: string; sub?: string }) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{text}</Text>
      {sub ? <Text style={styles.subtitle}>{sub}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'blue';
}) {
  const toneMap: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: colors.cardHover, fg: colors.sub },
    ok: { bg: colors.accentSoft, fg: colors.accent },
    warn: { bg: colors.warnSoft, fg: colors.warn },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    blue: { bg: colors.blueSoft, fg: colors.blue },
  };
  const palette = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.badgeText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette =
    variant === 'primary'
      ? styles.buttonPrimary
      : variant === 'danger'
        ? styles.buttonDanger
        : styles.buttonGhost;
  const textPalette =
    variant === 'primary'
      ? styles.buttonPrimaryText
      : variant === 'danger'
        ? styles.buttonDangerText
        : styles.buttonGhostText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        palette,
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.text} />
      ) : (
        <Text style={textPalette}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function LabeledValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.labeledValue}>
      <Text style={styles.labeledValueLabel}>{label}</Text>
      <Text style={styles.labeledValueValue}>{value.length > 0 ? value : '—'}</Text>
    </View>
  );
}

export function TextInputRow({
  value,
  onChange,
  onSubmit,
  placeholder,
  multiline = false,
  secure = false,
  keyboardType = 'default',
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secure?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      onEndEditing={onSubmit ? () => onSubmit(value) : undefined}
      placeholder={placeholder}
      placeholderTextColor={colors.sub}
      multiline={multiline}
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
      style={[styles.textInput, multiline && styles.textInputMultiline]}
    />
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <Card style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </Card>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flexGrow: 1, gap: spacing.lg, paddingBottom: spacing.xl },
  screenPadded: { paddingHorizontal: spacing.lg },
  scrollContent: { paddingVertical: spacing.lg },
  titleBlock: { gap: spacing.xs },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.sub, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardPressed: { opacity: 0.75 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonDanger: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  buttonGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonDisabled: { opacity: 0.5 },
  buttonPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: '700' },
  buttonDangerText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  buttonGhostText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sectionLabel: {
    color: colors.sub,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labeledValue: { gap: 2 },
  labeledValueLabel: { color: colors.sub, fontSize: 12 },
  labeledValueValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  textInput: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  textInputMultiline: { minHeight: 72, paddingTop: spacing.md, textAlignVertical: 'top' },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { color: colors.sub, fontSize: 14, textAlign: 'center' },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
