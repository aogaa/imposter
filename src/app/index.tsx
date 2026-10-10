import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategories } from '@/content';
import { Colors, Spacing } from '@/constants/theme';
import type { Mode } from '@/game';
import type { Language } from '@/i18n';

const MODES: { mode: Mode; color: string }[] = [
  { mode: 'classic', color: Colors.civilian },
  { mode: 'undercover', color: Colors.undercover },
];

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const categories = getCategories(i18n.language as Language);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>

        {MODES.map(({ mode, color }) => (
          <View key={mode} style={[styles.card, { borderColor: color }]}>
            <Text style={[styles.cardTitle, { color }]}>{t(`modes.${mode}.name`)}</Text>
            <Text style={styles.cardText}>{t(`modes.${mode}.description`)}</Text>
            <Text style={styles.soon}>{t('common.comingSoon')}</Text>
          </View>
        ))}

        <Text style={styles.heading}>{t('categories.title')}</Text>
        {categories.map((c) => (
          <View key={c.id} style={styles.row}>
            <Text style={styles.icon}>{c.icon}</Text>
            <Text style={styles.rowTitle}>{t(`categories.${c.id}`)}</Text>
            <Text style={styles.rowMeta}>{t('categories.wordCount', { count: c.words.length })}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.four, gap: Spacing.three, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { color: Colors.imposter, fontSize: 48, fontWeight: '900', textAlign: 'center', marginTop: Spacing.four },
  tagline: { color: Colors.textSecondary, fontSize: 18, textAlign: 'center', marginBottom: Spacing.three },
  card: { backgroundColor: Colors.surface, borderWidth: 2, borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  cardTitle: { fontSize: 24, fontWeight: '800' },
  cardText: { color: Colors.text, fontSize: 16 },
  soon: { color: Colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  heading: { color: Colors.text, fontSize: 20, fontWeight: '800', marginTop: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, backgroundColor: Colors.surface, borderRadius: 14, padding: Spacing.three },
  icon: { fontSize: 24 },
  rowTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  rowMeta: { color: Colors.textSecondary, fontSize: 14 },
});
