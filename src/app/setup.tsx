import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, Button, Card, Chip, Heading, Row, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { getCategories } from '@/content';
import { recommendedImposterCount, recommendedUndercover, validateSetup, type HintMode, type Mode } from '@/game';
import type { Language } from '@/i18n';
import { roundSettings, TIMER_OPTIONS, useGame } from '@/store/game';

const MODE_COLORS: Record<Mode, string> = { classic: Colors.civilian, undercover: Colors.undercover };
const HINT_MODES: HintMode[] = ['none', 'category', 'hint'];

export default function SetupScreen() {
  const { t, i18n } = useTranslation();
  const store = useGame();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categories = getCategories(i18n.language as Language).filter((c) => c.tier === 'free');
  const n = store.players.length;
  const settings = roundSettings(store);
  const setupError =
    validateSetup(n, settings) ?? (store.categoryIds.some((id) => categories.some((c) => c.id === id)) ? null : 'noCategories');

  // Takes the submitted text directly: on fast typing, `name` from this render can be stale.
  const add = (text = name) => {
    store.addPlayer(text);
    setName('');
  };

  const start = () => {
    try {
      store.startRound();
      setError(null);
      router.push('/play');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const shownError = error ?? (n > 0 ? setupError : null);

  return (
    <Screen
      footer={
        <>
          {shownError ? <Text style={styles.error}>{t(`setup.errors.${shownError}`)}</Text> : null}
          <Button label={t('setup.start')} color={Colors.imposter} onPress={start} disabled={!!setupError} />
        </>
      }>
      <Text style={styles.title}>{t('setup.title')}</Text>

      <Heading>{t('setup.players', { count: n })}</Heading>
      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={(e) => add(e.nativeEvent.text)}
          placeholder={t('setup.playerPlaceholder')}
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          returnKeyType="done"
          submitBehavior="submit"
          maxLength={20}
        />
        <Button label={t('setup.add')} onPress={() => add()} disabled={!name.trim() || n >= 20} />
      </View>
      <Row>
        {store.players.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={t('setup.remove', { name: p.name })}
            onPress={() => store.removePlayer(p.id)}
            style={styles.player}>
            <Text style={styles.playerText}>{p.name}</Text>
            <Text style={styles.playerRemove}>✕</Text>
          </Pressable>
        ))}
      </Row>

      <Heading>{t('modes.title')}</Heading>
      {(['classic', 'undercover'] as Mode[]).map((mode) => (
        <Pressable key={mode} accessibilityRole="button" accessibilityState={{ selected: store.mode === mode }} onPress={() => store.setMode(mode)}>
          <Card color={store.mode === mode ? MODE_COLORS[mode] : undefined}>
            <Text style={[styles.modeTitle, { color: MODE_COLORS[mode] }]}>{t(`modes.${mode}.name`)}</Text>
            <Body>{t(`modes.${mode}.description`)}</Body>
          </Card>
        </Pressable>
      ))}

      <Heading>{t('categories.title')}</Heading>
      <Row>
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={`${c.icon} ${t(`categories.${c.id}`)}`}
            selected={store.categoryIds.includes(c.id)}
            onPress={() => store.toggleCategory(c.id)}
          />
        ))}
      </Row>

      <Heading>{t('setup.settings')}</Heading>
      {store.mode === 'classic' ? (
        <>
          <Body>{t('setup.imposters')}</Body>
          <Row>
            <Chip
              label={t('setup.auto', { count: recommendedImposterCount(Math.max(n, 3)) })}
              selected={store.imposterCount === null}
              onPress={() => store.setImposterCount(null)}
            />
            {[1, 2, 3].map((k) => (
              <Chip key={k} label={String(k)} selected={store.imposterCount === k} onPress={() => store.setImposterCount(k)} />
            ))}
          </Row>
          <Body>{t('setup.hint')}</Body>
          <Row>
            {HINT_MODES.map((h) => (
              <Chip key={h} label={t(`setup.hintModes.${h}`)} selected={store.hintMode === h} onPress={() => store.setHintMode(h)} />
            ))}
          </Row>
        </>
      ) : (
        <>
          <Body>{t('setup.undercovers')}</Body>
          <Row>
            <Chip
              color={Colors.undercover}
              label={t('setup.auto', { count: recommendedUndercover(Math.max(n, 3)).undercoverCount })}
              selected={store.undercoverCount === null}
              onPress={() => store.setUndercoverCount(null)}
            />
            {[1, 2, 3].map((k) => (
              <Chip
                key={k}
                color={Colors.undercover}
                label={String(k)}
                selected={store.undercoverCount === k}
                onPress={() => store.setUndercoverCount(k)}
              />
            ))}
          </Row>
          <Body>{t('setup.mrWhite')}</Body>
          <Row>
            <Chip
              color={Colors.undercover}
              label={t('setup.autoOnOff', {
                value: recommendedUndercover(Math.max(n, 3)).mrWhite ? t('setup.on') : t('setup.off'),
              })}
              selected={store.mrWhite === null}
              onPress={() => store.setMrWhite(null)}
            />
            <Chip color={Colors.undercover} label={t('setup.on')} selected={store.mrWhite === true} onPress={() => store.setMrWhite(true)} />
            <Chip color={Colors.undercover} label={t('setup.off')} selected={store.mrWhite === false} onPress={() => store.setMrWhite(false)} />
          </Row>
        </>
      )}

      <Body>{t('setup.timer')}</Body>
      <Row>
        {TIMER_OPTIONS.map((s) => (
          <Chip
            key={s}
            label={s === 0 ? t('setup.timerOff') : t('setup.minutes', { count: s / 60 })}
            selected={store.timerSeconds === s}
            onPress={() => store.setTimer(s)}
          />
        ))}
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 32, fontWeight: '900' },
  inputRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 18,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  playerText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  playerRemove: { color: Colors.textSecondary, fontSize: 14 },
  modeTitle: { fontSize: 22, fontWeight: '800' },
  error: { color: Colors.imposter, fontSize: 15, textAlign: 'center' },
});
