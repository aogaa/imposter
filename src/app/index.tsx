import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { Body, Button, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen footer={<Button label={t('home.play')} color={Colors.imposter} onPress={() => router.push('/setup')} />}>
      <Text style={styles.title}>{t('app.name')}</Text>
      <Text style={styles.tagline}>{t('app.tagline')}</Text>
      <Text style={styles.mask}>🕵️</Text>
      <Body center>{t('home.howTo')}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.imposter, fontSize: 56, fontWeight: '900', textAlign: 'center', marginTop: Spacing.six },
  tagline: { color: Colors.textSecondary, fontSize: 20, textAlign: 'center' },
  mask: { fontSize: 96, textAlign: 'center', marginVertical: Spacing.five },
});
