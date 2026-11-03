import { allSpells, next, scoreSpell } from './engine.ts';
import type { Difficulty, DuelCard } from './types.ts';

// Searches every castable spell. Difficulty decides how often it takes the best one; ties prefer saving familiars, then fewer cards.
export function chooseSpell(hand: DuelCard[], target: number, difficulty: Difficulty, seed: number): DuelCard[] {
  const familiars = (cards: DuelCard[]) => cards.filter(c => c.kind === 'familiar').length;
  const ranked = allSpells(hand)
    .filter(cards => difficulty !== 'easy' || cards.length <= 3)
    .map(cards => ({ cards, distance: scoreSpell(cards, target).distance }))
    .sort((a, b) => a.distance - b.distance || familiars(a.cards) - familiars(b.cards) || a.cards.length - b.cards.length);
  if (!ranked.length) return [];
  const roll = next(seed ^ target) % 100;
  if (difficulty === 'hard' || (difficulty === 'medium' && roll < 70)) return ranked[0].cards;
  const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length * (difficulty === 'medium' ? 0.25 : 0.5))));
  return pool[next(roll + seed) % pool.length].cards;
}
