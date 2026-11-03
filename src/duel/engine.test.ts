import { describe, expect, it } from 'vitest';
import { allSpells, createDuel, evaluateSpell, isValidSpell, makeRune, resolveRound, scoreSpell, START_HP } from './engine';
import { chooseSpell } from './bot';
import type { Difficulty, DuelCard, DuelState, TrialId } from './types';

let n = 0;
const s = (value: number): DuelCard => ({ id: `s${n++}`, kind: 'stone', value });
const g = (op: '+' | '-' | '*'): DuelCard => ({ id: `g${n++}`, kind: 'glyph', op });
const f = (familiar: 'twin-embers' | 'lyra' | 'sorrel' | 'quadra' | 'tobin' | 'bramble'): DuelCard => ({ id: `f${n++}`, kind: 'familiar', familiar });
const ev = (...cards: DuelCard[]) => evaluateSpell(cards);

describe('spell grammar and arithmetic', () => {
  it('accepts stone-led spells of glyph pairs and familiars, up to five cards', () => {
    expect(isValidSpell([s(5)])).toBe(true);
    expect(isValidSpell([s(5), g('+'), s(2), f('tobin')])).toBe(true);
    expect(isValidSpell([g('+'), s(2)])).toBe(false);
    expect(isValidSpell([s(5), g('+')])).toBe(false);
    expect(isValidSpell([s(5), s(2)])).toBe(true); // stones merge: addition
    expect(isValidSpell([s(5), g('*'), f('tobin')])).toBe(false);
    expect(isValidSpell([s(1), g('+'), s(1), g('+'), s(1), f('tobin')])).toBe(false);
  });
  it('follows order of operations and shows brackets wherever a familiar wraps a sum', () => {
    expect(ev(s(2), g('+'), s(3), g('*'), s(4))).toEqual({ value: 14, expression: '2 + 3 × 4' });
    expect(ev(s(3), g('+'), s(3), f('twin-embers'))).toEqual({ value: 12, expression: '(3 + 3) × 2' });
    expect(ev(s(3), f('sorrel'))).toEqual({ value: 9, expression: '3²' });
    expect(ev(s(2), g('*'), s(2), f('quadra'))).toEqual({ value: 16, expression: '(2 × 2)²' });
    expect(ev(s(5), f('tobin'), g('*'), s(3))).toEqual({ value: 21, expression: '(5 + 2) × 3' });
    expect(ev(s(5), f('tobin'), g('+'), s(3))).toEqual({ value: 10, expression: '5 + 2 + 3' });
    expect(ev(s(9), g('-'), s(3), g('*'), s(2))).toEqual({ value: 3, expression: '9 − 3 × 2' });
    expect(ev(s(4), f('tobin'), f('twin-embers'))).toEqual({ value: 12, expression: '(4 + 2) × 2' });
    expect(ev(s(5), s(7))).toEqual({ value: 12, expression: '5 + 7' });
    expect(ev(s(5), s(1), f('twin-embers'))).toEqual({ value: 12, expression: '(5 + 1) × 2' });
    expect(ev(s(3), f('twin-embers'), s(4))).toEqual({ value: 10, expression: '3 × 2 + 4' });
  });
  it('the written expression always evaluates to the same value as the spell', () => {
    const hand = [s(3), s(4), g('+'), g('*'), f('tobin'), f('sorrel'), f('twin-embers')];
    for (const spell of allSpells(hand)) {
      const { value, expression } = evaluateSpell(spell)!;
      const js = expression.replace(/×/g, '*').replace(/−/g, '-').replace(/(\d+|\))²/g, (_, a) => `${a}**2`);
      expect(Function(`return ${js}`)()).toBe(value);
    }
  });
});

describe('runes', () => {
  it.each<TrialId>(['sums', 'products', 'unknowns'])('%s targets are always reachable exactly from the player hand', trial => {
    let state = createDuel(trial, 'medium', 7);
    for (let round = 0; round < 12 && state.phase === 'build'; round++) {
      expect(allSpells(state.player.hand).some(cards => scoreSpell(cards, state.rune.target).resonant)).toBe(true);
      state = resolveRound(state, [], chooseSpell(state.opponent.hand, state.rune.target, 'easy', state.seed));
    }
  });
  it('shows Trial III targets as equations whose solution is the target, with working', () => {
    const hand = [s(3), s(4), g('+'), f('tobin')];
    for (let seed = 1; seed < 40; seed++) {
      const { rune } = makeRune('unknowns', hand, seed);
      expect(rune.equation).toMatch(/x/); expect(rune.working!.at(-1)).toBe(`x = ${rune.target}`);
      const [lhs, rhs] = rune.equation!.split(' = '); const x = rune.target;
      const value = Function('x', `return ${lhs.replace(/(\d)x/, '$1*x').replace('x²', 'x**2')}`)(x);
      expect(value).toBe(Number(rhs));
    }
  });
});

describe('round resolution', () => {
  const duel = (hand: DuelCard[], opponentHand: DuelCard[], target: number): DuelState => ({ ...createDuel('products', 'medium'), rune: { target, prompt: `Make ${target}` }, player: { hp: START_HP, maxHp: START_HP, hand, deck: [s(1), s(2), s(3), s(4), s(5), s(6), s(7)], discard: [] }, opponent: { hp: START_HP, maxHp: START_HP, hand: opponentHand, deck: [s(1), s(2), s(3), s(4), s(5), s(6), s(7)], discard: [] } });
  it('closer wins for 3, exact resonates for 5, equal misses deal nothing', () => {
    const [a, b, c] = [s(5), s(6), s(9)];
    let next = resolveRound(duel([a], [c], 6), [a], [c]);
    expect(next.lastResult!.winner).toBe('player'); expect(next.opponent.hp).toBe(START_HP - 3);
    next = resolveRound(duel([b], [c], 6), [b], [c]);
    expect(next.lastResult!.player.resonant).toBe(true); expect(next.opponent.hp).toBe(START_HP - 5);
    const [d, e] = [s(4), s(8)];
    next = resolveRound(duel([d], [e], 6), [d], [e]);
    expect(next.lastResult!.winner).toBe('none'); expect(next.player.hp).toBe(START_HP); expect(next.opponent.hp).toBe(START_HP);
  });
  it('applies Quadra, Bramble and Lyra perks', () => {
    const [x, q] = [s(3), f('quadra')]; const miss = s(1);
    let next = resolveRound(duel([x, q], [miss], 9), [x, q], [miss]);
    expect(next.opponent.hp).toBe(START_HP - 7);
    const [y, br] = [s(1), f('bramble')]; const hit = s(9);
    next = resolveRound(duel([y, br], [hit], 9), [y, br], [hit]);
    expect(next.player.hp).toBe(START_HP - 4); // exact 9 resonates for 5, Bramble saves 1
    const [z, ly] = [s(3), f('lyra')];
    next = resolveRound(duel([z, ly, s(1)], [s(1)], 6), [z, ly], [next.opponent.hand[0]]);
    expect(next.player.hand).toHaveLength(8);
  });
  it('ignores cards the caster does not hold, and refills to seven with at least one stone', () => {
    const own = s(6); const stranger = s(6);
    const next = resolveRound(duel([own], [s(1)], 6), [stranger], []);
    expect(next.lastResult!.player.cards).toEqual([]);
    expect(next.player.hand.length).toBe(7); expect(next.player.hand.some(c => c.kind === 'stone')).toBe(true);
  });
});

describe('bot and full duels', () => {
  it('a hard bot finds an exact spell when one exists, saving familiars when stones suffice', () => {
    const hand = [s(4), s(2), g('+'), f('twin-embers')];
    expect(scoreSpell(chooseSpell(hand, 6, 'hard', 1), 6).resonant).toBe(true);
    expect(chooseSpell(hand, 6, 'hard', 1).some(c => c.kind === 'familiar')).toBe(false);
  });
  it.each<[TrialId, Difficulty]>([['sums', 'easy'], ['products', 'medium'], ['unknowns', 'hard']])('%s vs %s bot finishes deterministically within 25 rounds', (trial, difficulty) => {
    const play = () => {
      let state = createDuel(trial, difficulty, 42);
      while (state.phase === 'build' && state.round < 25) {
        const mine = chooseSpell(state.player.hand, state.rune.target, 'hard', state.seed + 1);
        state = resolveRound(state, mine, chooseSpell(state.opponent.hand, state.rune.target, difficulty, state.seed));
        expect(state.player.hand.length + state.player.deck.length + state.player.discard.length).toBeGreaterThanOrEqual(17);
      }
      return state;
    };
    const a = play(); expect(a.phase).not.toBe('build'); expect(play()).toEqual(a);
  });
});

describe('teaching after a miss', () => {
  it('shows the shortest exact answer that was in the player hand', () => {
    const [five, seven, plus, one] = [s(5), s(7), g('+'), s(1)];
    const state: DuelState = { ...createDuel('sums', 'easy'), rune: { target: 12, prompt: 'Make 12' } };
    state.player = { ...state.player, hand: [five, seven, plus] }; state.opponent = { ...state.opponent, hand: [one] };
    expect(resolveRound(state, [five], [one]).lastResult!.solution).toBe('5 + 7');
    expect(resolveRound(state, [five, plus, seven], [one]).lastResult!.solution).toBeNull();
  });
});

describe('combos', () => {
  it('each familiar beyond the first adds 1 to a Resonance, and only to a Resonance', () => {
    const base = createDuel('products', 'medium');
    const play = (hand: DuelCard[], target: number) => {
      const state: DuelState = { ...base, rune: { target, prompt: `Make ${target}` }, player: { ...base.player, hand }, opponent: { ...base.opponent, hand: [s(1)] } };
      return resolveRound(state, hand, [state.opponent.hand[0]]);
    };
    const exact = play([s(2), f('tobin'), f('twin-embers')], 8);
    expect(exact.lastResult!.player.combo).toBe(1); expect(exact.opponent.hp).toBe(START_HP - 6);
    const near = play([s(2), f('tobin'), f('twin-embers')], 9);
    expect(near.opponent.hp).toBe(START_HP - 3);
  });
});
