import { defaultRng, pick, shuffle, type Rng } from './random';
import type {
  Assignment,
  Category,
  Player,
  Role,
  Round,
  RoundSettings,
  UsedWords,
  WordEntry,
} from './types';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

/** See docs/spillregler.md. */
export function recommendedImposterCount(playerCount: number): number {
  if (playerCount >= 13) return 3;
  if (playerCount >= 7) return 2;
  return 1;
}

/** See docs/spillregler.md. */
export function recommendedUndercover(playerCount: number): { undercoverCount: number; mrWhite: boolean } {
  if (playerCount >= 10) return { undercoverCount: 3, mrWhite: true };
  if (playerCount >= 7) return { undercoverCount: 2, mrWhite: true };
  if (playerCount >= 5) return { undercoverCount: 1, mrWhite: true };
  return { undercoverCount: 1, mrWhite: false };
}

/** Number of players who do not get the civilian word. */
export function infiltratorCount(settings: RoundSettings): number {
  return settings.mode === 'classic'
    ? settings.imposterCount
    : settings.undercoverCount + (settings.mrWhite ? 1 : 0);
}

/** Returns an error code, or null if the setup is valid. */
export function validateSetup(playerCount: number, settings: RoundSettings): string | null {
  if (playerCount < MIN_PLAYERS) return 'tooFewPlayers';
  if (playerCount > MAX_PLAYERS) return 'tooManyPlayers';
  const special = infiltratorCount(settings);
  if (settings.mode === 'classic' && settings.imposterCount < 1) return 'needImposter';
  if (settings.mode === 'undercover' && settings.undercoverCount < 1) return 'needUndercover';
  // Civilians must be the clear majority, otherwise the game is decided before it starts.
  if (playerCount - special < special + 1) return 'tooManyInfiltrators';
  return null;
}

/**
 * Picks a word from the selected categories, skipping words already used.
 * When every word is used, that history is cleared and the pool starts over.
 */
export function pickWord(
  categories: readonly Category[],
  used: UsedWords,
  rng: Rng = defaultRng,
): { categoryId: string; entry: WordEntry; used: UsedWords } {
  const all = categories.flatMap((c) => c.words.map((entry) => ({ categoryId: c.id, entry })));
  if (all.length === 0) throw new Error('No words in the selected categories');

  const isUsed = (categoryId: string, word: string) => used[categoryId]?.includes(word) ?? false;
  let pool = all.filter((w) => !isUsed(w.categoryId, w.entry.word));
  let nextUsed: UsedWords = { ...used };
  if (pool.length === 0) {
    pool = all;
    for (const c of categories) nextUsed[c.id] = [];
  }

  const chosen = pick(rng, pool);
  nextUsed = {
    ...nextUsed,
    [chosen.categoryId]: [...(nextUsed[chosen.categoryId] ?? []), chosen.entry.word],
  };
  return { categoryId: chosen.categoryId, entry: chosen.entry, used: nextUsed };
}

/**
 * Chooses which players get the special roles. Players who had a special role
 * last round are avoided when there are enough other players.
 */
function chooseInfiltrators(
  players: readonly Player[],
  count: number,
  previousInfiltratorIds: readonly string[],
  rng: Rng,
): string[] {
  const fresh = players.filter((p) => !previousInfiltratorIds.includes(p.id));
  const candidates = fresh.length >= count ? fresh : players;
  return shuffle(rng, candidates)
    .slice(0, count)
    .map((p) => p.id);
}

export type CreateRoundInput = {
  players: readonly Player[];
  settings: RoundSettings;
  categories: readonly Category[];
  used?: UsedWords;
  previousInfiltratorIds?: readonly string[];
  rng?: Rng;
};

export function createRound({
  players,
  settings,
  categories,
  used = {},
  previousInfiltratorIds = [],
  rng = defaultRng,
}: CreateRoundInput): { round: Round; used: UsedWords } {
  const error = validateSetup(players.length, settings);
  if (error) throw new Error(error);

  const picked = pickWord(categories, used, rng);
  const { entry, categoryId } = picked;

  // In undercover mode, randomly decide which side of the pair the civilians get.
  const swap = settings.mode === 'undercover' && rng() < 0.5;
  const civilianWord = swap ? entry.pair : entry.word;
  const undercoverWord = settings.mode === 'undercover' ? (swap ? entry.word : entry.pair) : null;

  const infiltratorIds = chooseInfiltrators(players, infiltratorCount(settings), previousInfiltratorIds, rng);
  const roleFor = (playerId: string): Role => {
    const index = infiltratorIds.indexOf(playerId);
    if (index === -1) return 'civilian';
    if (settings.mode === 'classic') return 'imposter';
    return index < settings.undercoverCount ? 'undercover' : 'mrwhite';
  };

  const assignments: Assignment[] = players.map((p) => {
    const role = roleFor(p.id);
    switch (role) {
      case 'civilian':
        return { playerId: p.id, role, word: civilianWord, hint: null };
      case 'undercover':
        return { playerId: p.id, role, word: undercoverWord, hint: null };
      case 'mrwhite':
        return { playerId: p.id, role, word: null, hint: null };
      case 'imposter': {
        const hintMode = settings.mode === 'classic' ? settings.hintMode : 'none';
        const hint = hintMode === 'category' ? categoryId : hintMode === 'hint' ? entry.hint : null;
        return { playerId: p.id, role, word: null, hint };
      }
    }
  });

  // Imposters and Mr. White never start: going first without the word is too hard.
  const starters = assignments.filter((a) => a.role === 'civilian' || a.role === 'undercover');
  const startingPlayerId = pick(rng, starters).playerId;

  return {
    round: { settings, categoryId, entry, civilianWord, undercoverWord, assignments, startingPlayerId },
    used: picked.used,
  };
}

/** Ids of players with a special role, for passing to the next createRound. */
export function infiltratorIds(round: Round): string[] {
  return round.assignments.filter((a) => a.role !== 'civilian').map((a) => a.playerId);
}
