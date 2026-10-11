import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCategories } from '@/content';
import {
  createRound,
  infiltratorIds,
  recommendedImposterCount,
  recommendedUndercover,
  resolveGuess,
  startGame,
  vote,
  type GameState,
  type HintMode,
  type Mode,
  type Player,
  type Round,
  type RoundSettings,
  type UsedWords,
} from '@/game';
import i18n, { type Language } from '@/i18n';

export const TIMER_OPTIONS = [0, 60, 120, 180, 300] as const;

/** Where the play screen is in a round. */
export type Step = 'reveal' | 'discuss' | 'vote' | 'eliminated' | 'guess' | 'result';

type Setup = {
  players: Player[];
  mode: Mode;
  categoryIds: string[];
  /** null = use the recommended count for the number of players. */
  imposterCount: number | null;
  hintMode: HintMode;
  undercoverCount: number | null;
  mrWhite: boolean | null;
  timerSeconds: number;
};

type History = {
  used: UsedWords;
  previousInfiltratorIds: string[];
};

type Play = {
  round: Round | null;
  game: GameState | null;
  step: Step;
  /** Index into round.assignments of the player currently looking at their role. */
  revealIndex: number;
};

type Actions = {
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  setMode: (mode: Mode) => void;
  toggleCategory: (id: string) => void;
  setImposterCount: (count: number | null) => void;
  setHintMode: (hintMode: HintMode) => void;
  setUndercoverCount: (count: number | null) => void;
  setMrWhite: (mrWhite: boolean | null) => void;
  setTimer: (seconds: number) => void;
  /** Starts a new round with the current setup. Throws with an error code if the setup is invalid. */
  startRound: () => void;
  nextReveal: () => void;
  goToVote: () => void;
  backToDiscuss: () => void;
  voteOut: (playerId: string) => void;
  /** Continue after an elimination reveal. */
  continueAfterElimination: () => void;
  judgeGuess: (correct: boolean) => void;
  endRound: () => void;
};

export type GameStore = Setup & History & Play & Actions;

let nextId = Date.now();

export function roundSettings(setup: Setup): RoundSettings {
  const n = setup.players.length;
  if (setup.mode === 'classic') {
    return {
      mode: 'classic',
      imposterCount: setup.imposterCount ?? recommendedImposterCount(n),
      hintMode: setup.hintMode,
    };
  }
  const recommended = recommendedUndercover(n);
  return {
    mode: 'undercover',
    undercoverCount: setup.undercoverCount ?? recommended.undercoverCount,
    mrWhite: setup.mrWhite ?? recommended.mrWhite,
  };
}

const idle: Play = { round: null, game: null, step: 'reveal', revealIndex: 0 };

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      players: [],
      mode: 'classic',
      categoryIds: getCategories('no').map((c) => c.id),
      imposterCount: null,
      hintMode: 'category',
      undercoverCount: null,
      mrWhite: null,
      timerSeconds: 120,
      used: {},
      previousInfiltratorIds: [],
      ...idle,

      addPlayer: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({ players: [...s.players, { id: `p${nextId++}`, name: trimmed }] }));
      },
      removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
      setMode: (mode) => set({ mode }),
      toggleCategory: (id) =>
        set((s) => ({
          categoryIds: s.categoryIds.includes(id) ? s.categoryIds.filter((c) => c !== id) : [...s.categoryIds, id],
        })),
      setImposterCount: (imposterCount) => set({ imposterCount }),
      setHintMode: (hintMode) => set({ hintMode }),
      setUndercoverCount: (undercoverCount) => set({ undercoverCount }),
      setMrWhite: (mrWhite) => set({ mrWhite }),
      setTimer: (timerSeconds) => set({ timerSeconds }),

      startRound: () => {
        const s = get();
        const all = getCategories(i18n.language as Language);
        const selected = all.filter((c) => s.categoryIds.includes(c.id) && c.tier === 'free');
        if (selected.length === 0) throw new Error('noCategories');
        const { round, used } = createRound({
          players: s.players,
          settings: roundSettings(s),
          categories: selected,
          used: s.used,
          previousInfiltratorIds: s.previousInfiltratorIds,
        });
        set({
          round,
          used,
          previousInfiltratorIds: infiltratorIds(round),
          game: startGame(),
          step: 'reveal',
          revealIndex: 0,
        });
      },
      nextReveal: () => {
        const { round, revealIndex } = get();
        if (!round) return;
        if (revealIndex + 1 < round.assignments.length) set({ revealIndex: revealIndex + 1 });
        else set({ step: 'discuss' });
      },
      goToVote: () => set({ step: 'vote' }),
      backToDiscuss: () => set({ step: 'discuss' }),
      voteOut: (playerId) => {
        const { round, game } = get();
        if (!round || !game) return;
        const next = vote(game, round, playerId);
        set({ game: next, step: next.phase === 'guessing' ? 'guess' : 'eliminated' });
      },
      continueAfterElimination: () => {
        const { game } = get();
        set({ step: game?.phase === 'over' ? 'result' : 'discuss' });
      },
      judgeGuess: (correct) => {
        const { round, game } = get();
        if (!round || !game) return;
        const next = resolveGuess(game, round, correct);
        set({ game: next, step: next.phase === 'over' ? 'result' : 'discuss' });
      },
      endRound: () => set(idle),
    }),
    {
      name: 'imposter-game',
      storage: createJSONStorage(() => AsyncStorage),
      // Only setup and history survive an app restart; a round in progress does not.
      partialize: (s) => ({
        players: s.players,
        mode: s.mode,
        categoryIds: s.categoryIds,
        imposterCount: s.imposterCount,
        hintMode: s.hintMode,
        undercoverCount: s.undercoverCount,
        mrWhite: s.mrWhite,
        timerSeconds: s.timerSeconds,
        used: s.used,
        previousInfiltratorIds: s.previousInfiltratorIds,
      }),
    },
  ),
);
