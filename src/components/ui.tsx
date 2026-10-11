import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, color = Colors.civilian, variant = 'solid', disabled, style }: ButtonProps) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        solid ? { backgroundColor: color } : { borderColor: color, borderWidth: 2 },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}>
      <Text style={[styles.buttonText, { color: solid ? Colors.background : color }]}>{label}</Text>
    </Pressable>
  );
}

type ChipProps = { label: string; selected: boolean; onPress: () => void; color?: string };

export function Chip({ label, selected, onPress, color = Colors.civilian }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? { backgroundColor: color, borderColor: color } : null]}>
      <Text style={[styles.chipText, selected && { color: Colors.background }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, color ? { borderColor: color, borderWidth: 2 } : null, style]}>{children}</View>;
}

export function Heading({ children }: { children: ReactNode }) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function Body({ children, center }: { children: ReactNode; center?: boolean }) {
  return <Text style={[styles.body, center && { textAlign: 'center' }]}>{children}</Text>;
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.four, gap: Spacing.three, maxWidth: 560, width: '100%', alignSelf: 'center', flexGrow: 1 },
  footer: { padding: Spacing.four, paddingTop: Spacing.two, maxWidth: 560, width: '100%', alignSelf: 'center', gap: Spacing.two },
  button: { borderRadius: 16, paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '800' },
  chip: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.surface,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chipText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  heading: { color: Colors.text, fontSize: 20, fontWeight: '800', marginTop: Spacing.two },
  body: { color: Colors.textSecondary, fontSize: 16, lineHeight: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
