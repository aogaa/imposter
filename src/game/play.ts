import type { Role, Round } from './types';

export type Winner = 'civilians' | 'infiltrators' | 'mrwhite';

export type GameState = {
  phase: 'voting' | 'guessing' | 'over';
  /** Players voted out, in order, with their revealed role. */
  eliminated: { playerId: string; role: Role }[];
  /** Set while phase is 'guessing'. */
  guessingPlayerId: string | null;
  winner: Winner | null;
};

export function startGame(): GameState {
  return { phase: 'voting', eliminated: [], guessingPlayerId: null, winner: null };
}

function roleOf(round: Round, playerId: string): Role {
  const assignment = round.assignments.find((a) => a.playerId === playerId);
  if (!assignment) throw new Error(`Unknown player ${playerId}`);
  return assignment.role;
}

function isAlive(state: GameState, playerId: string): boolean {
  return !state.eliminated.some((e) => e.playerId === playerId);
}

function over(state: GameState, winner: Winner): GameState {
  return { ...state, phase: 'over', guessingPlayerId: null, winner };
}

/** Decides whether the game continues after an elimination without a correct guess. */
function settle(state: GameState, round: Round): GameState {
  const alive = round.assignments.filter((a) => isAlive(state, a.playerId));
  const infiltrators = alive.filter((a) => a.role !== 'civilian').length;
  const civilians = alive.length - infiltrators;
  if (infiltrators === 0) return over(state, 'civilians');
  // In classic mode only voting out a civilian ends the game for the imposters (see vote()).
  if (round.settings.mode === 'undercover' && civilians <= 1) return over(state, 'infiltrators');
  return { ...state, phase: 'voting', guessingPlayerId: null };
}

/** The group has voted this player out. */
export function vote(state: GameState, round: Round, playerId: string): GameState {
  if (state.phase !== 'voting') throw new Error(`Cannot vote during ${state.phase}`);
  if (!isAlive(state, playerId)) throw new Error(`Player ${playerId} is already out`);

  const role = roleOf(round, playerId);
  const next: GameState = { ...state, eliminated: [...state.eliminated, { playerId, role }] };

  if (round.settings.mode === 'classic') {
    if (role === 'civilian') return over(next, 'infiltrators');
    return { ...next, phase: 'guessing', guessingPlayerId: playerId };
  }

  if (role === 'mrwhite') return { ...next, phase: 'guessing', guessingPlayerId: playerId };
  return settle(next, round);
}

/** A caught imposter or Mr. White tries to guess the civilians' word. */
export function guess(state: GameState, round: Round, text: string): GameState {
  if (state.phase !== 'guessing' || !state.guessingPlayerId) throw new Error('Nobody is guessing');
  const role = roleOf(round, state.guessingPlayerId);
  if (isCorrectGuess(text, round.civilianWord)) {
    return over(state, role === 'mrwhite' ? 'mrwhite' : 'infiltrators');
  }
  return settle(state, round);
}

export function normalizeWord(text: string): string {
  return text
    .toLocaleLowerCase('nb')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function isCorrectGuess(text: string, answer: string): boolean {
  const normalized = normalizeWord(text);
  return normalized.length > 0 && normalized === normalizeWord(answer);
}

/**
 * Counts votes (voterId -> targetId). Returns the player ids with the most
 * votes; more than one id means a tie.
 */
export function tally(votes: Record<string, string>): string[] {
  const counts = new Map<string, number>();
  for (const target of Object.values(votes)) counts.set(target, (counts.get(target) ?? 0) + 1);
  const max = Math.max(0, ...counts.values());
  return [...counts].filter(([, n]) => n === max && n > 0).map(([id]) => id);
}
