import { CHARACTERS } from '../game/characters.ts';
import type { Formula } from '../game/engine.ts';
import type { Difficulty, DuelCard, DuelState, FamiliarCard, Mage, Op, Rune, RoundResult, Side, SpellResult, TrialId } from './types.ts';

export const HAND_SIZE = 7;
export const MAX_SPELL = 5;
export const START_HP = 20;
export const WIN_DAMAGE = 3;
export const RESONANCE_DAMAGE = 5;

const APPLY: Record<Formula, (v: number) => number> = { linear: v => v * 2, quadratic: v => v * v, additive: v => v + 2 };
export const FAMILIAR_LABEL: Record<Formula, string> = { linear: '× 2', quadratic: '²', additive: '+ 2' };
export const OP_SYMBOL: Record<Op, string> = { '+': '+', '-': '−', '*': '×' };
export const FAMILIAR_PERK: Partial<Record<keyof typeof CHARACTERS, string>> = {
  lyra: 'Resonate: draw 1 extra card', quadra: 'Your Resonance deals +2', bramble: 'Lose the round: take 1 less damage',
};

export function familiarFormula(card: FamiliarCard): Formula { return CHARACTERS[card.familiar].formula; }

// 1–5 cards starting with a stone. A stone placed next to a stone merges with it (addition); a glyph needs a stone after it.
// Empty = pass.
export function isValidSpell(cards: DuelCard[]): boolean {
  if (cards.length === 0) return true;
  if (cards.length > MAX_SPELL || cards[0].kind !== 'stone') return false;
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].kind !== 'glyph') continue;
    if (cards[i + 1]?.kind !== 'stone') return false;
    i++;
  }
  return true;
}

// Between familiars, × binds tighter than + and −. A familiar applies to everything before it, like a bracket.
export function evaluateSpell(cards: DuelCard[]): { value: number; expression: string } | null {
  if (!isValidSpell(cards)) return null;
  if (cards.length === 0) return { value: 0, expression: '—' };
  let base = (cards[0] as { value: number }).value; let baseText = String(base); let baseLoose = false;
  let terms: number[] = [base]; let text = baseText; let hasOps = false; let opsLoose = false;
  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    if (card.kind === 'stone') { terms.push(card.value); text += ` + ${card.value}`; hasOps = true; opsLoose = true; }
    else if (card.kind === 'glyph') {
      const stone = (cards[++i] as { value: number }).value;
      if (card.op === '*') {
        if (!hasOps && baseLoose) text = `(${text})`;
        terms[terms.length - 1] *= stone;
      } else { terms.push(card.op === '+' ? stone : -stone); opsLoose = true; }
      text += ` ${OP_SYMBOL[card.op]} ${stone}`; hasOps = true;
    } else if (card.kind === 'familiar') {
      const inner = terms.reduce((a, b) => a + b, 0); const formula = familiarFormula(card);
      const loose = opsLoose || (!hasOps && baseLoose);
      base = APPLY[formula](inner);
      baseText = formula === 'additive' ? `${text} + 2` : formula === 'linear' ? `${loose ? `(${text})` : text} × 2` : `${text.includes(' ') ? `(${text})` : text}²`;
      baseLoose = formula === 'additive';
      terms = [base]; text = baseText; hasOps = false; opsLoose = false;
    }
  }
  return { value: terms.reduce((a, b) => a + b, 0), expression: text };
}

// Every valid ordered spell from a hand (up to MAX_SPELL cards). A hand of 7 gives at most ~3,600 orderings.
export function allSpells(hand: DuelCard[]): DuelCard[][] {
  const out: DuelCard[][] = []; const used = new Array(hand.length).fill(false); const current: DuelCard[] = [];
  const walk = () => {
    if (current.length && isValidSpell(current)) out.push([...current]);
    if (current.length === MAX_SPELL) return;
    for (let i = 0; i < hand.length; i++) {
      if (used[i]) continue;
      const card = hand[i];
      if (current.length === 0 && card.kind !== 'stone') continue;
      used[i] = true; current.push(card); walk(); current.pop(); used[i] = false;
    }
  };
  walk(); return out;
}

// The shortest exact spell in a hand, shown after a miss so every round teaches one answer.
export function shortestExact(hand: DuelCard[], target: number): string | null {
  const exact = allSpells(hand).filter(cards => evaluateSpell(cards)!.value === target).sort((a, b) => a.length - b.length);
  return exact.length ? evaluateSpell(exact[0])!.expression : null;
}

export function next(seed: number): number { return (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0; }
function shuffle<T>(items: T[], seed: number): { items: T[]; seed: number } {
  const result = [...items]; let s = seed;
  for (let i = result.length - 1; i > 0; i--) { s = next(s); const j = s % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return { items: result, seed: s };
}

export function buildDeck(trial: TrialId, owner: Side): DuelCard[] {
  let n = 0; const id = () => `${owner}-${n++}`;
  const stones = (values: number[]) => values.map(value => ({ id: id(), kind: 'stone' as const, value }));
  const glyphs = (ops: Op[]) => ops.map(op => ({ id: id(), kind: 'glyph' as const, op }));
  const familiars = (ids: (keyof typeof CHARACTERS)[]) => ids.map(familiar => ({ id: id(), kind: 'familiar' as const, familiar }));
  // Addition is merging stones, so decks carry no + glyphs. Trial I is pure addition; later trials add × and − glyphs and every familiar.
  if (trial === 'sums') return [...stones([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9]), ...familiars(['tobin', 'bramble'])];
  return [...stones([1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 9]), ...glyphs(['*', '*', '-']), ...familiars(['twin-embers', 'lyra', 'sorrel', 'quadra', 'tobin', 'bramble'])];
}

function draw(mage: Mage, count: number, seed: number): number {
  for (let i = 0; i < count; i++) {
    if (!mage.deck.length && mage.discard.length) { const mixed = shuffle(mage.discard, seed); mage.deck = mixed.items; seed = mixed.seed; mage.discard = []; }
    const card = mage.deck.shift(); if (card) mage.hand.push(card);
  }
  // A hand must always be able to cast: guarantee at least one stone.
  if (!mage.hand.some(c => c.kind === 'stone')) {
    const pile = mage.deck.some(c => c.kind === 'stone') ? mage.deck : mage.discard;
    const index = pile.findIndex(c => c.kind === 'stone');
    if (index >= 0) { const [stone] = pile.splice(index, 1); const swapped = mage.hand.pop(); if (swapped) mage.deck.push(swapped); mage.hand.push(stone); }
  }
  return seed;
}

const TARGET_RANGE: Record<TrialId, [number, number]> = { sums: [4, 25], products: [6, 60], unknowns: [2, 12] };

// The target is always the value of some spell the player can actually cast, so an exact answer exists.
export function makeRune(trial: TrialId, hand: DuelCard[], seed: number): { rune: Rune; seed: number } {
  const [lo, hi] = TARGET_RANGE[trial];
  const values = allSpells(hand).filter(s => s.length > 1).map(s => evaluateSpell(s)!.value).filter(v => v >= lo && v <= hi);
  const pool = values.length ? [...new Set(values)].sort((a, b) => a - b) : [Math.max(...hand.filter(c => c.kind === 'stone').map(c => (c as { value: number }).value))];
  seed = next(seed); const target = pool[seed % pool.length];
  if (trial !== 'unknowns') return { rune: { target, prompt: `Make ${target}` }, seed };
  seed = next(seed); const form = seed % 3; seed = next(seed); const a = 2 + (seed % 3); seed = next(seed); const b = 1 + (seed % 9);
  const x = target;
  if (form === 0) return { rune: { target, prompt: 'Solve for x', equation: `${a}x + ${b} = ${a * x + b}`, working: [`${a}x + ${b} = ${a * x + b}`, `${a}x = ${a * x}`, `x = ${x}`] }, seed };
  if (form === 1) return { rune: { target, prompt: 'Solve for x', equation: `x + ${b} = ${x + b}`, working: [`x + ${b} = ${x + b}`, `x = ${x + b} − ${b}`, `x = ${x}`] }, seed };
  return { rune: { target, prompt: 'Solve for x', equation: `x² = ${x * x}`, working: [`x² = ${x * x}`, `x = √${x * x}`, `x = ${x}`] }, seed };
}

export function createDuel(trial: TrialId, difficulty: Difficulty, seed = 2026): DuelState {
  const mage = (side: Side, s: number) => { const mixed = shuffle(buildDeck(trial, side), s); return { mage: { hp: START_HP, maxHp: START_HP, hand: [], deck: mixed.items, discard: [] } as Mage, seed: mixed.seed }; };
  const p = mage('player', seed); const o = mage('opponent', p.seed ^ 0x9e3779b9);
  let s = draw(p.mage, HAND_SIZE, o.seed); s = draw(o.mage, HAND_SIZE, s);
  const made = makeRune(trial, p.mage.hand, s);
  return { trial, difficulty, round: 1, seed: made.seed, phase: 'build', rune: made.rune, player: p.mage, opponent: o.mage, lastResult: null };
}

// Two or more familiars chained in one spell form a combo: each extra familiar adds 1 to a Resonance.
export function scoreSpell(cards: DuelCard[], target: number): SpellResult {
  const evaluated = evaluateSpell(cards) ?? { value: 0, expression: '—' };
  const distance = Math.abs(evaluated.value - target);
  const combo = Math.max(0, cards.filter(c => c.kind === 'familiar').length - 1);
  return { cards, ...evaluated, distance, resonant: cards.length > 0 && distance === 0, combo };
}

const has = (cards: DuelCard[], familiar: string) => cards.some(c => c.kind === 'familiar' && c.familiar === familiar);

// Both spells are revealed together. Invalid or foreign cards are treated as a pass.
export function resolveRound(state: DuelState, playerCards: DuelCard[], opponentCards: DuelCard[]): DuelState {
  if (state.phase !== 'build') return state;
  const own = (mage: Mage, cards: DuelCard[]) => isValidSpell(cards) && cards.every(c => mage.hand.some(h => h.id === c.id)) && new Set(cards.map(c => c.id)).size === cards.length ? cards : [];
  const player = scoreSpell(own(state.player, playerCards), state.rune.target);
  const opponent = scoreSpell(own(state.opponent, opponentCards), state.rune.target);
  const winner: RoundResult['winner'] = player.resonant && opponent.resonant ? 'both'
    : player.distance < opponent.distance ? 'player' : opponent.distance < player.distance ? 'opponent' : 'none';
  const notes: string[] = [];
  const dealt = (spell: SpellResult, who: string) => {
    if (!spell.resonant) return WIN_DAMAGE;
    let damage = RESONANCE_DAMAGE;
    if (spell.combo) { damage += spell.combo; notes.push(`${who} combo of ${spell.combo + 1} familiars: +${spell.combo}.`); }
    if (has(spell.cards, 'quadra')) { damage += 2; notes.push(`${who === 'Your' ? 'Your' : 'Veyra’s'} Quadra amplifies the Resonance: +2.`); }
    return damage;
  };
  let damageToOpponent = winner === 'player' || winner === 'both' ? dealt(player, 'Your') : 0;
  let damageToPlayer = winner === 'opponent' || winner === 'both' ? dealt(opponent, 'Veyra’s') : 0;
  if (winner === 'opponent' && has(player.cards, 'bramble')) { damageToPlayer -= 1; notes.push('Bramble shields you: 1 less damage.'); }
  if (winner === 'player' && has(opponent.cards, 'bramble')) { damageToOpponent -= 1; notes.push('Veyra’s Bramble softens your hit.'); }

  const nextState = structuredClone(state);
  const settle = (mage: Mage, spell: SpellResult, damage: number) => {
    mage.hp = Math.max(0, mage.hp - damage);
    mage.hand = mage.hand.filter(c => !spell.cards.some(s => s.id === c.id)); mage.discard.push(...spell.cards);
  };
  settle(nextState.player, player, damageToPlayer); settle(nextState.opponent, opponent, damageToOpponent);
  let seed = draw(nextState.player, HAND_SIZE - nextState.player.hand.length + (player.resonant && has(player.cards, 'lyra') ? 1 : 0), state.seed);
  if (player.resonant && has(player.cards, 'lyra')) notes.push('Lyra draws you an extra card.');
  seed = draw(nextState.opponent, HAND_SIZE - nextState.opponent.hand.length + (opponent.resonant && has(opponent.cards, 'lyra') ? 1 : 0), seed);

  const solution = player.resonant ? null : shortestExact(state.player.hand, state.rune.target);
  nextState.lastResult = { round: state.round, rune: state.rune, player, opponent, winner, damageToPlayer, damageToOpponent, notes, solution };
  // A simultaneous knockout goes to the apprentice: this is a learning game.
  if (nextState.opponent.hp === 0) nextState.phase = 'victory';
  else if (nextState.player.hp === 0) nextState.phase = 'defeat';
  else { const made = makeRune(state.trial, nextState.player.hand, seed); nextState.rune = made.rune; seed = made.seed; nextState.round++; }
  nextState.seed = seed;
  return nextState;
}
