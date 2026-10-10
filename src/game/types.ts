export type Mode = 'classic' | 'undercover';

export type Role = 'civilian' | 'imposter' | 'undercover' | 'mrwhite';

export type HintMode = 'none' | 'category' | 'hint';

export type Tier = 'free' | 'premium';

export type AgeRating = 'all' | '18+';

export type WordEntry = {
  word: string;
  /** Shown to the imposter when hintMode is 'hint'. */
  hint: string;
  /** Similar word given to the undercover player. */
  pair: string;
  /** 1 = easy to tell apart from the pair, 3 = very similar. */
  difficulty: 1 | 2 | 3;
};

export type Category = {
  id: string;
  tier: Tier;
  ageRating: AgeRating;
  icon: string;
  words: WordEntry[];
};

export type Player = {
  id: string;
  name: string;
};

export type ClassicSettings = {
  mode: 'classic';
  imposterCount: number;
  hintMode: HintMode;
};

export type UndercoverSettings = {
  mode: 'undercover';
  undercoverCount: number;
  mrWhite: boolean;
};

export type RoundSettings = ClassicSettings | UndercoverSettings;

export type Assignment = {
  playerId: string;
  role: Role;
  /** The word this player sees. null for imposter and Mr. White. */
  word: string | null;
  /** Extra info for the imposter: category id or hint word, depending on hintMode. */
  hint: string | null;
};

export type Round = {
  settings: RoundSettings;
  categoryId: string;
  entry: WordEntry;
  /** The word the civilians share. */
  civilianWord: string;
  /** The undercover word (undercover mode only). */
  undercoverWord: string | null;
  assignments: Assignment[];
  startingPlayerId: string;
};

/** Words already used, per category id. Persisted between rounds. */
export type UsedWords = Record<string, string[]>;
