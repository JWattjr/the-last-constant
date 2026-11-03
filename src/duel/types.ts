import type { CharacterId } from '../game/characters.ts';

// Shared contract for the equation duel. Owned by Claude; Codex imports but does not edit (see AGENTS.md).
export type Op = '+' | '-' | '*';
export type StoneCard = { id: string; kind: 'stone'; value: number };
export type GlyphCard = { id: string; kind: 'glyph'; op: Op };
export type FamiliarCard = { id: string; kind: 'familiar'; familiar: CharacterId };
export type DuelCard = StoneCard | GlyphCard | FamiliarCard;

export type TrialId = 'sums' | 'products' | 'unknowns';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Side = 'player' | 'opponent';

// A rune asks for `target`. In Trial III it is shown as an equation whose solution is the target.
export type Rune = { target: number; prompt: string; equation?: string; working?: string[] };

export type Mage = { hp: number; maxHp: number; hand: DuelCard[]; deck: DuelCard[]; discard: DuelCard[] };

export type SpellResult = { cards: DuelCard[]; value: number; expression: string; distance: number; resonant: boolean; combo: number };

export type RoundResult = {
  round: number; rune: Rune; player: SpellResult; opponent: SpellResult;
  winner: Side | 'both' | 'none';
  damageToPlayer: number; damageToOpponent: number; notes: string[];
  solution: string | null; // one exact answer from the player's hand, shown when they missed
};

export type DuelState = {
  trial: TrialId; difficulty: Difficulty; round: number; seed: number;
  phase: 'build' | 'victory' | 'defeat';
  rune: Rune; player: Mage; opponent: Mage;
  lastResult: RoundResult | null;
};
