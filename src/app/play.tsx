import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { Assignment, Role, Round } from '@/game';
import { useGame } from '@/store/game';

const ROLE_COLORS: Record<Role, string> = {
  civilian: Colors.civilian,
  imposter: Colors.imposter,
  undercover: Colors.undercover,
  mrwhite: Colors.mrWhite,
};

function useNames() {
  const players = useGame((s) => s.players);
  return (id: string) => players.find((p) => p.id === id)?.name ?? '?';
}

export default function PlayScreen() {
  const round = useGame((s) => s.round);
  const step = useGame((s) => s.step);

  if (!round) return <Redirect href="/setup" />;

  switch (step) {
    case 'reveal':
      return <RevealStep round={round} />;
    case 'discuss':
      return <DiscussStep round={round} />;
    case 'vote':
      return <VoteStep round={round} />;
    case 'eliminated':
      return <EliminatedStep />;
    case 'guess':
      return <GuessStep round={round} />;
    case 'result':
      return <ResultStep round={round} />;
  }
}

function RevealStep({ round }: { round: Round }) {
  const { t } = useTranslation();
  const nameOf = useNames();
  const revealIndex = useGame((s) => s.revealIndex);
  const nextReveal = useGame((s) => s.nextReveal);
  const [showing, setShowing] = useState(false);
  const [seen, setSeen] = useState(false);

  const assignment = round.assignments[revealIndex];
  const isLast = revealIndex === round.assignments.length - 1;

  const next = () => {
    setShowing(false);
    setSeen(false);
    nextReveal();
  };

  return (
    <Screen footer={<Button label={t(isLast ? 'reveal.lastNext' : 'reveal.next')} onPress={next} disabled={!seen} />}>
      <Body center>{t('reveal.progress', { current: revealIndex + 1, total: round.assignments.length })}</Body>
      <Text style={styles.passTo}>{t('reveal.passTo')}</Text>
      <Text style={styles.bigName}>{nameOf(assignment.playerId)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('reveal.hold')}
        onPressIn={() => {
          setShowing(true);
          setSeen(true);
        }}
        onPressOut={() => setShowing(false)}
        style={[styles.revealCard, showing && { borderColor: ROLE_COLORS[assignment.role] }]}>
        {showing ? <RoleCard assignment={assignment} round={round} /> : <HiddenCard />}
      </Pressable>
    </Screen>
  );
}

function HiddenCard() {
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <Text style={styles.fingerprint}>👆</Text>
      <Text style={styles.holdText}>{t('reveal.hold')}</Text>
      <Body center>{t('reveal.holdHint')}</Body>
    </View>
  );
}

function RoleCard({ assignment, round }: { assignment: Assignment; round: Round }) {
  const { t } = useTranslation();
  const { role, word, hint } = assignment;
  const color = ROLE_COLORS[role];

  // Undercover players must not know they are undercover, so they see the same card as civilians.
  if (role === 'civilian' || role === 'undercover') {
    return (
      <View style={styles.center}>
        <Body center>{t('reveal.yourWord')}</Body>
        <Text style={[styles.word, { color: Colors.civilian }]}>{word}</Text>
        <Body center>{t('reveal.civilianInfo')}</Body>
      </View>
    );
  }

  const hintMode = round.settings.mode === 'classic' ? round.settings.hintMode : 'none';
  return (
    <View style={styles.center}>
      <Body center>{t('reveal.youAre')}</Body>
      <Text style={[styles.word, { color }]}>{t(`roles.${role}`)}</Text>
      <Body center>{t('reveal.noWord')}</Body>
      {hint ? (
        <Text style={styles.hint}>
          {hintMode === 'category'
            ? t('reveal.hintCategory', { value: t(`categories.${hint}`) })
            : t('reveal.hintWord', { value: hint })}
        </Text>
      ) : null}
      <Body center>{t(role === 'mrwhite' ? 'reveal.mrWhiteInfo' : 'reveal.imposterInfo')}</Body>
    </View>
  );
}

function DiscussStep({ round }: { round: Round }) {
  const { t } = useTranslation();
  const nameOf = useNames();
  const timerSeconds = useGame((s) => s.timerSeconds);
  const eliminated = useGame((s) => s.game?.eliminated ?? []);
  const goToVote = useGame((s) => s.goToVote);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const id = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const firstRound = eliminated.length === 0;
  const format = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Screen footer={<Button label={t('discuss.toVote')} color={Colors.imposter} onPress={goToVote} />}>
      <Text style={styles.title}>{t('discuss.title')}</Text>
      {firstRound ? (
        <Card color={Colors.civilian}>
          <Text style={styles.starts}>{t('discuss.starts', { name: nameOf(round.startingPlayerId) })}</Text>
        </Card>
      ) : (
        <Body>{t('discuss.out', { names: eliminated.map((e) => nameOf(e.playerId)).join(', ') })}</Body>
      )}
      <Body>{t('discuss.instructions')}</Body>
      {timerSeconds > 0 ? (
        <View style={styles.center}>
          {remaining === null ? (
            <Button label={t('discuss.startTimer')} variant="outline" onPress={() => setRemaining(timerSeconds)} />
          ) : (
            <Text style={[styles.timer, remaining === 0 && { color: Colors.imposter }]}>
              {remaining === 0 ? t('discuss.timeUp') : format(remaining)}
            </Text>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function VoteStep({ round }: { round: Round }) {
  const { t } = useTranslation();
  const nameOf = useNames();
  const eliminated = useGame((s) => s.game?.eliminated ?? []);
  const voteOut = useGame((s) => s.voteOut);
  const backToDiscuss = useGame((s) => s.backToDiscuss);
  const [selected, setSelected] = useState<string | null>(null);

  const alive = round.assignments.filter((a) => !eliminated.some((e) => e.playerId === a.playerId));

  return (
    <Screen
      footer={
        <>
          <Button
            label={selected ? t('vote.confirm', { name: nameOf(selected) }) : t('vote.title')}
            color={Colors.imposter}
            disabled={!selected}
            onPress={() => selected && voteOut(selected)}
          />
          <Button label={t('vote.back')} variant="outline" color={Colors.textSecondary} onPress={backToDiscuss} />
        </>
      }>
      <Text style={styles.title}>{t('vote.title')}</Text>
      <Body>{t('vote.instructions')}</Body>
      <View style={styles.grid}>
        {alive.map((a) => {
          const isSelected = selected === a.playerId;
          return (
            <Pressable
              key={a.playerId}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelected(a.playerId)}
              style={[styles.voteTile, isSelected && { borderColor: Colors.imposter, backgroundColor: '#2A1630' }]}>
              <Text style={styles.voteName}>{nameOf(a.playerId)}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function EliminatedStep() {
  const { t } = useTranslation();
  const nameOf = useNames();
  const game = useGame((s) => s.game);
  const continueAfterElimination = useGame((s) => s.continueAfterElimination);
  const last = game?.eliminated.at(-1);
  if (!last) return null;

  return (
    <Screen
      footer={
        <Button
          label={t(game?.phase === 'over' ? 'eliminated.seeResult' : 'eliminated.continue')}
          onPress={continueAfterElimination}
        />
      }>
      <View style={[styles.center, styles.fill]}>
        <Text style={styles.passTo}>{t('eliminated.title', { name: nameOf(last.playerId) })}</Text>
        <Text style={[styles.word, { color: ROLE_COLORS[last.role] }]}>{t(`roles.${last.role}`)}</Text>
      </View>
    </Screen>
  );
}

function GuessStep({ round }: { round: Round }) {
  const { t } = useTranslation();
  const nameOf = useNames();
  const game = useGame((s) => s.game);
  const judgeGuess = useGame((s) => s.judgeGuess);
  const [revealed, setRevealed] = useState(false);
  const playerId = game?.guessingPlayerId;
  if (!playerId) return null;
  const role = round.assignments.find((a) => a.playerId === playerId)!.role;

  return (
    <Screen
      footer={
        revealed ? (
          <View style={styles.buttonRow}>
            <Button label={t('guess.correct')} color={ROLE_COLORS[role]} onPress={() => judgeGuess(true)} style={styles.flex} />
            <Button label={t('guess.wrong')} color={Colors.civilian} onPress={() => judgeGuess(false)} style={styles.flex} />
          </View>
        ) : (
          <Button label={t('guess.reveal')} onPress={() => setRevealed(true)} />
        )
      }>
      <View style={[styles.center, styles.fill]}>
        <Text style={[styles.word, { color: ROLE_COLORS[role] }]}>{t(`roles.${role}`)}</Text>
        <Text style={styles.passTo}>{t('guess.title', { name: nameOf(playerId) })}</Text>
        <Body center>{t('guess.instructions', { name: nameOf(playerId) })}</Body>
        {revealed ? (
          <Card color={Colors.civilian} style={styles.center}>
            <Body center>{t('guess.word')}</Body>
            <Text style={[styles.word, { color: Colors.civilian }]}>{round.civilianWord}</Text>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

function ResultStep({ round }: { round: Round }) {
  const { t } = useTranslation();
  const nameOf = useNames();
  const winner = useGame((s) => s.game?.winner);
  const startRound = useGame((s) => s.startRound);
  const endRound = useGame((s) => s.endRound);

  const winnerKey =
    winner === 'infiltrators' && round.settings.mode === 'undercover' ? 'infiltratorsUndercover' : (winner ?? 'civilians');
  const winnerColor = winner === 'civilians' ? Colors.civilian : winner === 'mrwhite' ? Colors.mrWhite : round.settings.mode === 'undercover' ? Colors.undercover : Colors.imposter;

  return (
    <Screen
      footer={
        <>
          <Button label={t('result.playAgain')} color={Colors.imposter} onPress={startRound} />
          <Button
            label={t('result.home')}
            variant="outline"
            color={Colors.textSecondary}
            onPress={() => {
              endRound();
              router.dismissAll();
            }}
          />
        </>
      }>
      <Text style={[styles.winner, { color: winnerColor }]}>{t(`result.winners.${winnerKey}`)}</Text>
      <Body center>{t('result.word', { word: round.civilianWord })}</Body>
      {round.undercoverWord ? <Body center>{t('result.undercoverWord', { word: round.undercoverWord })}</Body> : null}
      <View style={styles.list}>
        {round.assignments.map((a) => (
          <View key={a.playerId} style={styles.resultRow}>
            <Text style={styles.resultName}>{nameOf(a.playerId)}</Text>
            <Text style={[styles.resultRole, { color: ROLE_COLORS[a.role] }]}>{t(`roles.${a.role}`)}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  fill: { flex: 1 },
  flex: { flex: 1 },
  title: { color: Colors.text, fontSize: 32, fontWeight: '900' },
  passTo: { color: Colors.textSecondary, fontSize: 20, textAlign: 'center' },
  bigName: { color: Colors.text, fontSize: 44, fontWeight: '900', textAlign: 'center' },
  revealCard: {
    flex: 1,
    minHeight: 320,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.surface,
    padding: Spacing.four,
    justifyContent: 'center',
    userSelect: 'none',
  },
  fingerprint: { fontSize: 64 },
  holdText: { color: Colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  word: { fontSize: 44, fontWeight: '900', textAlign: 'center' },
  hint: { color: Colors.undercover, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  starts: { color: Colors.civilian, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  timer: { color: Colors.text, fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  voteTile: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.surface,
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  voteName: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: Spacing.two },
  winner: { fontSize: 40, fontWeight: '900', textAlign: 'center', marginTop: Spacing.four },
  list: { gap: Spacing.two, marginTop: Spacing.three },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.three,
  },
  resultName: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  resultRole: { fontSize: 17, fontWeight: '800' },
});
