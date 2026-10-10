import { describe, expect, it } from '@jest/globals';

import {
  createRng,
  createRound,
  guess,
  infiltratorIds,
  isCorrectGuess,
  pickWord,
  recommendedImposterCount,
  recommendedUndercover,
  startGame,
  tally,
  validateSetup,
  vote,
  type Category,
  type Player,
  type Round,
  type RoundSettings,
} from '..';

const players = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Spiller ${i + 1}` }));

const food: Category = {
  id: 'mat',
  tier: 'free',
  ageRating: 'all',
  icon: '🍕',
  words: [
    { word: 'Pizza', hint: 'Italia', pair: 'Pai', difficulty: 2 },
    { word: 'Kaffe', hint: 'Morgen', pair: 'Te', difficulty: 2 },
    { word: 'Taco', hint: 'Fredag', pair: 'Burrito', difficulty: 2 },
  ],
};

const classic = (imposterCount = 1, hintMode: 'none' | 'category' | 'hint' = 'none'): RoundSettings => ({
  mode: 'classic',
  imposterCount,
  hintMode,
});

const undercover = (undercoverCount = 1, mrWhite = true): RoundSettings => ({
  mode: 'undercover',
  undercoverCount,
  mrWhite,
});

const playerWith = (round: Round, role: string) => round.assignments.find((a) => a.role === role)!.playerId;

describe('recommendations', () => {
  it('scales imposters with player count', () => {
    expect(recommendedImposterCount(3)).toBe(1);
    expect(recommendedImposterCount(7)).toBe(2);
    expect(recommendedImposterCount(13)).toBe(3);
  });

  it('every recommendation is a valid setup', () => {
    for (let n = 3; n <= 20; n++) {
      expect(validateSetup(n, classic(recommendedImposterCount(n)))).toBeNull();
      expect(validateSetup(n, { mode: 'undercover', ...recommendedUndercover(n) })).toBeNull();
    }
  });
});

describe('validateSetup', () => {
  it('rejects too few or too many players', () => {
    expect(validateSetup(2, classic())).toBe('tooFewPlayers');
    expect(validateSetup(21, classic())).toBe('tooManyPlayers');
  });

  it('rejects setups where civilians are not the majority', () => {
    expect(validateSetup(3, classic(2))).toBe('tooManyInfiltrators');
    expect(validateSetup(4, undercover(1, true))).toBe('tooManyInfiltrators');
    expect(validateSetup(5, undercover(1, true))).toBeNull();
  });
});

describe('pickWord', () => {
  it('does not repeat a word until the category is used up', () => {
    const rng = createRng(1);
    let used = {};
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const result = pickWord([food], used, rng);
      seen.push(result.entry.word);
      used = result.used;
    }
    expect(new Set(seen).size).toBe(3);

    const fourth = pickWord([food], used, rng);
    expect(fourth.used.mat).toEqual([fourth.entry.word]);
  });
});

describe('createRound (classic)', () => {
  it('gives the word to everyone except the imposters', () => {
    const { round } = createRound({ players: players(8), settings: classic(2), categories: [food], rng: createRng(2) });
    const imposters = round.assignments.filter((a) => a.role === 'imposter');
    expect(imposters).toHaveLength(2);
    imposters.forEach((a) => expect(a.word).toBeNull());
    round.assignments
      .filter((a) => a.role === 'civilian')
      .forEach((a) => expect(a.word).toBe(round.entry.word));
  });

  it('never lets an imposter start', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { round } = createRound({ players: players(4), settings: classic(), categories: [food], rng: createRng(seed) });
      const starter = round.assignments.find((a) => a.playerId === round.startingPlayerId)!;
      expect(starter.role).toBe('civilian');
    }
  });

  it('gives the imposter the configured hint', () => {
    const byCategory = createRound({ players: players(4), settings: classic(1, 'category'), categories: [food], rng: createRng(3) });
    const imp = byCategory.round.assignments.find((a) => a.role === 'imposter')!;
    expect(imp.hint).toBe('mat');

    const byHint = createRound({ players: players(4), settings: classic(1, 'hint'), categories: [food], rng: createRng(3) });
    const imp2 = byHint.round.assignments.find((a) => a.role === 'imposter')!;
    expect(imp2.hint).toBe(byHint.round.entry.hint);
  });

  it('avoids picking the same imposter twice in a row', () => {
    const rng = createRng(4);
    let previous: string[] = [];
    for (let i = 0; i < 30; i++) {
      const { round } = createRound({ players: players(5), settings: classic(), categories: [food], previousInfiltratorIds: previous, rng });
      const now = infiltratorIds(round);
      expect(now.some((id) => previous.includes(id))).toBe(false);
      previous = now;
    }
  });
});

describe('createRound (undercover)', () => {
  it('assigns the pair word to undercover and nothing to Mr. White', () => {
    const { round } = createRound({ players: players(7), settings: undercover(2, true), categories: [food], rng: createRng(5) });
    const roles = round.assignments.map((a) => a.role);
    expect(roles.filter((r) => r === 'undercover')).toHaveLength(2);
    expect(roles.filter((r) => r === 'mrwhite')).toHaveLength(1);
    expect([round.civilianWord, round.undercoverWord].sort()).toEqual([round.entry.word, round.entry.pair].sort());
    round.assignments.forEach((a) => {
      if (a.role === 'civilian') expect(a.word).toBe(round.civilianWord);
      if (a.role === 'undercover') expect(a.word).toBe(round.undercoverWord);
      if (a.role === 'mrwhite') expect(a.word).toBeNull();
    });
  });

  it('never lets Mr. White start', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { round } = createRound({ players: players(5), settings: undercover(), categories: [food], rng: createRng(seed) });
      const starter = round.assignments.find((a) => a.playerId === round.startingPlayerId)!;
      expect(starter.role).not.toBe('mrwhite');
    }
  });
});

describe('classic game flow', () => {
  const setup = () => createRound({ players: players(5), settings: classic(), categories: [food], rng: createRng(6) }).round;

  it('imposters win when a civilian is voted out', () => {
    const round = setup();
    const state = vote(startGame(), round, playerWith(round, 'civilian'));
    expect(state).toMatchObject({ phase: 'over', winner: 'infiltrators' });
  });

  it('caught imposter can steal the win by guessing the word', () => {
    const round = setup();
    let state = vote(startGame(), round, playerWith(round, 'imposter'));
    expect(state.phase).toBe('guessing');
    state = guess(state, round, `  ${round.civilianWord.toUpperCase()}! `);
    expect(state).toMatchObject({ phase: 'over', winner: 'infiltrators' });
  });

  it('civilians win when the caught imposter guesses wrong', () => {
    const round = setup();
    let state = vote(startGame(), round, playerWith(round, 'imposter'));
    state = guess(state, round, 'feil ord');
    expect(state).toMatchObject({ phase: 'over', winner: 'civilians' });
  });

  it('with two imposters, both must be found', () => {
    const round = createRound({ players: players(8), settings: classic(2), categories: [food], rng: createRng(7) }).round;
    const [a, b] = round.assignments.filter((x) => x.role === 'imposter').map((x) => x.playerId);
    let state = guess(vote(startGame(), round, a), round, 'feil');
    expect(state.phase).toBe('voting');
    state = guess(vote(state, round, b), round, 'feil');
    expect(state).toMatchObject({ phase: 'over', winner: 'civilians' });
  });
});

describe('undercover game flow', () => {
  const setup = () => createRound({ players: players(5), settings: undercover(1, true), categories: [food], rng: createRng(8) }).round;

  it('civilians win when undercover and Mr. White are out', () => {
    const round = setup();
    let state = vote(startGame(), round, playerWith(round, 'undercover'));
    expect(state.phase).toBe('voting');
    state = vote(state, round, playerWith(round, 'mrwhite'));
    expect(state.phase).toBe('guessing');
    state = guess(state, round, 'feil');
    expect(state).toMatchObject({ phase: 'over', winner: 'civilians' });
  });

  it('Mr. White wins alone by guessing the civilian word', () => {
    const round = setup();
    let state = vote(startGame(), round, playerWith(round, 'mrwhite'));
    state = guess(state, round, round.civilianWord);
    expect(state).toMatchObject({ phase: 'over', winner: 'mrwhite' });
  });

  it('infiltrators win when only one civilian is left', () => {
    const round = setup();
    const civilians = round.assignments.filter((a) => a.role === 'civilian').map((a) => a.playerId);
    let state = vote(startGame(), round, civilians[0]);
    expect(state.phase).toBe('voting');
    state = vote(state, round, civilians[1]);
    expect(state).toMatchObject({ phase: 'over', winner: 'infiltrators' });
  });

  it('rejects voting for a player who is already out', () => {
    const round = setup();
    const id = playerWith(round, 'undercover');
    const state = vote(startGame(), round, id);
    expect(() => vote(state, round, id)).toThrow();
  });
});

describe('helpers', () => {
  it('compares guesses loosely but not empty', () => {
    expect(isCorrectGuess('brunost', 'Brunost')).toBe(true);
    expect(isCorrectGuess('Pølse i lompe', 'pølse  i   lompe')).toBe(true);
    expect(isCorrectGuess('', '')).toBe(false);
    expect(isCorrectGuess('Fårikål', 'Farikal')).toBe(false);
  });

  it('tally finds the most-voted player and ties', () => {
    expect(tally({ a: 'x', b: 'x', c: 'y' })).toEqual(['x']);
    expect(tally({ a: 'x', b: 'y' }).sort()).toEqual(['x', 'y']);
    expect(tally({})).toEqual([]);
  });
});
