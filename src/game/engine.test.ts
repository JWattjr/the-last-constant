import { describe, expect, it } from 'vitest';
import { battleReducer, createBattle, enemyStatus, evaluate, getIntent, getSeal, solveFor, getStance, incomingDamage, isGuardActive, preview, previewCast, substitute, tacticalHint } from './engine';
import type { Battle, Formula, Geometry, Variable } from './engine';

function cast(state: Battle, geometry: Geometry, x: Variable = 2, targetId = 'examiner'): Battle {
  return battleReducer(state, { type: 'cast', cardId: state.hand[0].id, geometry, x, targetId });
}
function end(state: Battle): Battle { return battleReducer(battleReducer(state, { type: 'endTurn' }), { type: 'resolveEnemies' }); }
function assertDeck(state: Battle) {
  const cards = [...state.hand, ...state.drawPile, ...state.discard];
  expect(cards).toHaveLength(12); expect(new Set(cards.map(c => c.id)).size).toBe(12);
}

describe('deterministic formula evaluation', () => {
  it('formats substitution as readable mathematical operations, never concatenated digits', () => {
    expect(substitute('linear', 2)).toBe('2 × 2');
    expect(substitute('quadratic', 3)).toBe('3²');
    expect(substitute('additive', 1)).toBe('1 + 2');
  });
  it.each<{ formula: Formula; values: number[] }>([
    { formula: 'linear', values: [2, 4, 6] }, { formula: 'quadratic', values: [1, 4, 9] }, { formula: 'additive', values: [3, 4, 5] },
  ])('$formula calculates all variable values', ({ formula, values }) => {
    ([1, 2, 3] as const).forEach((x, i) => {
      expect(evaluate(formula, x)).toBe(values[i]);
      expect(preview(formula, 'triangle', x)).toEqual({ energy: values[i], cost: x, amount: values[i] + 2 });
      expect(preview(formula, 'circle', x)).toEqual({ energy: values[i], cost: x + 1, amount: Math.ceil(values[i] / 2) });
      expect(preview(formula, 'square', x)).toEqual({ energy: values[i], cost: x, amount: values[i] + 3 });
    });
  });
  it('creates a reproducible 12-card deck, four of each family, and three-card hand', () => {
    const state = createBattle(); expect(state).toEqual(createBattle()); expect(createBattle(41).hand).not.toEqual(createBattle(42).hand);
    expect(state.hand).toHaveLength(3); assertDeck(state);
    for (const f of ['linear', 'quadratic', 'additive']) expect([...state.hand, ...state.drawPile].filter(c => c.formula === f)).toHaveLength(4);
  });
});

describe('spell and turn rules', () => {
  it('casts a focused spell, spends exact Ink, consumes one card, and leaves input unchanged', () => {
    const state = createBattle(); const original = structuredClone(state); const amount = preview(state.hand[0].formula, 'triangle', 2).amount;
    const next = cast(state, 'triangle'); expect(next.enemies[1].hp).toBe(42 - (amount - 4)); expect(next.enemies[0].hp).toBe(12);
    expect(next.player.ink).toBe(4); expect(next.hand).toHaveLength(2); expect(next.discard).toHaveLength(1); expect(state).toEqual(original); assertDeck(next);
  });
  it('circle affects every living enemy and charges one extra Ink', () => {
    const state = createBattle(); state.enemies[0].hp = 0; const amount = preview(state.hand[0].formula, 'circle', 3).amount;
    const next = cast(state, 'circle', 3); expect(next.enemies.map(e => e.hp)).toEqual([0, 42 - amount, 18 - amount]); expect(next.player.ink).toBe(2);
  });
  it('containment absorbs incoming damage and leftover shield expires next turn', () => {
    const state = createBattle(); state.player.shield = 20; const next = cast(state, 'square');
    expect(next.player.shield).toBe(27); const resolved = end(next); expect(resolved.player.hp).toBe(36); expect(resolved.player.shield).toBe(0); expect(resolved.player.ink).toBe(6);
  });
  it('enemy shield absorbs damage before health and persists until used', () => {
    const state = createBattle(); state.enemies[1].shield = 8; state.guardBroken = true;
    const next = cast(state, 'triangle'); expect(next.enemies[1].shield).toBe(2); expect(next.enemies[1].hp).toBe(42);
    const turn2 = end(createBattle()); expect(turn2.enemies[1].shield).toBe(5); const turn3 = end(turn2); expect(turn3.enemies[1].shield).toBe(5);
  });
  it('extra draw costs 1 Ink, works once per turn, and resets next turn', () => {
    let state = battleReducer(createBattle(), { type: 'draw' }); expect(state.hand).toHaveLength(4); expect(state.player.ink).toBe(5);
    expect(battleReducer(state, { type: 'draw' })).toBe(state); state = end(state); expect(state.extraDrawUsed).toBe(false); expect(state.hand).toHaveLength(4);
  });
  it('rejects unaffordable spells, missing cards, dead targets, enemy-phase input, and duplicate resolution', () => {
    const state = createBattle(); state.player.ink = 0; expect(cast(state, 'triangle')).toBe(state);
    state.player.ink = 6; state.enemies[0].hp = 0; expect(cast(state, 'triangle', 2, 'construct-a')).toBe(state);
    expect(battleReducer(state, { type: 'cast', cardId: 'missing', geometry: 'square', x: 2, targetId: '' })).toBe(state);
    const enemy = battleReducer(state, { type: 'endTurn' }); expect(cast(enemy, 'square')).toBe(enemy); expect(battleReducer(enemy, { type: 'draw' })).toBe(enemy);
    expect(battleReducer(state, { type: 'resolveEnemies' })).toBe(state);
  });
  it('refills hand to three and reshuffles discard without losing cards', () => {
    let state = createBattle(); state.player.hp = 999;
    for (let turn = 0; turn < 9; turn++) { while (state.hand.length && state.player.ink > 0) state = cast(state, 'square', 1); state = end(state); assertDeck(state); expect(state.hand).toHaveLength(3); }
  });
  it('defeated constructs do not attack; ending turn reveals the correct next intentions', () => {
    const state = createBattle(); state.enemies[0].hp = 0; state.enemies[2].hp = 0;
    const next = end(state); expect(next.player.hp).toBe(36); expect(next.turn).toBe(2); expect(next.enemies[1].intent).toEqual({ kind: 'attack', value: 12, name: 'Grand theorem' });
    expect(end(next).player.hp).toBe(24);
  });
});

describe('complete encounters', () => {
  it('can win by dismantling the constructs before focusing Veyra', () => {
    let state = createBattle();
    for (let turn = 0; turn < 12 && state.phase === 'player'; turn++) {
      while (state.phase === 'player' && state.hand.length && state.player.ink >= 2) {
        const target = ['construct-a', 'construct-b', 'examiner'].find(id => state.enemies.some(e => e.id === id && e.hp > 0))!;
        state = cast(state, 'triangle', 2, target);
      }
      if (state.phase === 'player') state = end(state); assertDeck(state);
    }
    expect(state.phase).toBe('victory'); expect(state.player.hp).toBeGreaterThan(0); expect(state.enemies[1].hp).toBe(0);
    expect(battleReducer(state, { type: 'endTurn' })).toBe(state);
  });
  it('can lose, clamps health to zero, and restarting restores a fresh encounter', () => {
    let state = createBattle(); while (state.phase === 'player') state = end(state);
    expect(state.phase).toBe('defeat'); expect(state.player.hp).toBe(0); expect(battleReducer(state, { type: 'draw' })).toBe(state);
    const fresh = createBattle(); expect(fresh.phase).toBe('player'); expect(fresh.turn).toBe(1); expect(fresh.player.hp).toBe(36); expect(fresh.casts).toBe(0);
  });
});

function atTurn(turn: number): Battle {
  const state = createBattle(); state.turn = turn;
  state.enemies.forEach(e => { e.intent = getIntent(e.id, turn); }); return state;
}

describe('tactical encounter rules', () => {
  it('cycles warding, channeling, exposed and publishes exact incoming damage', () => {
    expect([1, 2, 3, 4].map(getStance)).toEqual(['warding', 'channeling', 'exposed', 'warding']);
    expect([1, 2, 3].map(turn => incomingDamage(atTurn(turn)))).toEqual([6, 25, 10]);
  });
  it('Copper reduces each focused spell on Veyra, but never damage to a construct', () => {
    const state = createBattle(); const card = state.hand[0];
    expect(previewCast(state, card.formula, 'triangle', 2, 'examiner').amount).toBe(2);
    expect(previewCast(state, card.formula, 'triangle', 2, 'construct-a').amount).toBe(6);
    expect(previewCast(state, 'quadratic', 'triangle', 1, 'examiner').amount).toBe(0);
  });
  it('Circle shatters wards before damage and opens Veyra to later spells that turn', () => {
    const state = createBattle(); state.enemies[1].shield = 20;
    const plan = previewCast(state, state.hand[0].formula, 'circle', 2, 'examiner');
    const next = cast(state, 'circle', 2);
    expect(plan.breaksGuard).toBe(true); expect(plan.impacts[1].shattered).toBe(20);
    expect(next.enemies[1].shield).toBe(0); expect(next.enemies[1].hp).toBe(40); expect(isGuardActive(next)).toBe(false);
    expect(previewCast(next, next.hand[0].formula, 'triangle', 2, 'examiner').amount).toBe(6);
    expect(isGuardActive(end(next))).toBe(true);
  });
  it('defeating Copper permanently removes the guard across turn boundaries', () => {
    let state = createBattle(); state = cast(state, 'triangle', 2, 'construct-a'); state = cast(state, 'triangle', 2, 'construct-a');
    expect(state.enemies[0].hp).toBe(0); expect(isGuardActive(state)).toBe(false);
    expect(isGuardActive(end(state))).toBe(false);
  });
  it('Triangle gains +4 on exposed Veyra; guard and ward still apply in their correct order', () => {
    const state = atTurn(3); state.enemies[1].shield = 3;
    const guarded = previewCast(state, 'linear', 'triangle', 2, 'examiner');
    expect(guarded).toMatchObject({ amount: 6, guardReduction: 4, exposedBonus: 4 }); expect(guarded.impacts[0].healthDamage).toBe(3);
    state.guardBroken = true;
    const open = previewCast(state, 'linear', 'triangle', 2, 'examiner');
    expect(open.amount).toBe(10); expect(open.impacts[0].healthDamage).toBe(7);
    expect(previewCast(state, 'linear', 'triangle', 2, 'construct-a').amount).toBe(6);
    expect(previewCast(state, 'linear', 'circle', 2, 'examiner').amount).toBe(2);
  });
  it('six actual health damage interrupts Ivory and immediately updates incoming threat', () => {
    const state = atTurn(2); const plan = previewCast(state, state.hand[0].formula, 'triangle', 2, 'construct-b');
    expect(plan.impacts[0].interrupts).toBe(true);
    const next = cast(state, 'triangle', 2, 'construct-b');
    expect(next.enemies[2].hp).toBe(12); expect(next.enemies[2].intent).toMatchObject({ kind: 'stunned', value: 0 });
    expect(incomingDamage(next)).toBe(15); expect(enemyStatus(next, next.enemies[2])).toContain('cancelled');
    expect(tacticalHint(next).text).toContain('Veyra still attacks for 12');
    expect(end(next).player.hp).toBe(21);
  });
  it('interruption accumulates across spells but damage from an earlier turn does not count', () => {
    let state = createBattle(); state = cast(state, 'triangle', 2, 'construct-b'); state = end(state);
    expect(state.chargeDamage).toBe(0); expect(state.enemies[2].intent.value).toBe(10);
    state.hand[0].formula = 'linear'; state = cast(state, 'triangle', 1, 'construct-b');
    expect(state.chargeDamage).toBe(4); expect(state.enemies[2].intent.kind).toBe('attack');
    state.hand[0].formula = 'quadratic'; state = cast(state, 'triangle', 1, 'construct-b');
    expect(state.chargeDamage).toBe(6); expect(state.enemies[2].intent.kind).toBe('stunned');
  });
  it('damage absorbed by a ward never progresses an interrupt; Circle can shatter it', () => {
    let state = atTurn(2); state.enemies[2].shield = 5;
    state = cast(state, 'triangle', 2, 'construct-b');
    expect(state.chargeDamage).toBe(1); expect(state.enemies[2].intent.kind).toBe('attack');
    state.player.ink = 6; state.hand[0].formula = 'quadratic'; state.enemies[2].shield = 5;
    state = cast(state, 'circle', 3);
    expect(state.chargeDamage).toBe(6); expect(state.enemies[2].shield).toBe(0); expect(state.enemies[2].intent.kind).toBe('stunned');
  });
  it('charge resets on later turns and an interruption never carries to the next charge', () => {
    let state = atTurn(2); state = cast(state, 'triangle', 2, 'construct-b'); state.player.hp = 100;
    state = end(state); expect(state.chargeDamage).toBe(0); expect(state.enemies[2].intent.value).toBe(3);
    state = end(end(state)); expect(state.turn).toBe(5); expect(state.enemies[2].intent).toMatchObject({ kind: 'attack', value: 10 });
  });
  it('uses the same contextual plan for preview and resolution for every family, geometry, x, and stance', () => {
    for (const turn of [1, 2, 3]) for (const formula of ['linear', 'quadratic', 'additive'] as const) for (const geometry of ['triangle', 'circle', 'square'] as const) for (const x of [1, 2, 3] as const) {
      const state = atTurn(turn); state.hand[0].formula = formula; state.enemies[1].shield = 3;
      const plan = previewCast(state, formula, geometry, x, 'examiner'); const next = cast(state, geometry, x);
      expect(next.player.ink).toBe(6 - plan.cost);
      for (const impact of plan.impacts) {
        const before = state.enemies.find(e => e.id === impact.enemyId)!; const after = next.enemies.find(e => e.id === impact.enemyId)!;
        expect(before.hp - after.hp).toBe(impact.healthDamage); expect(after.shield).toBe(impact.shieldAfter);
      }
      if (geometry === 'square') expect(next.player.shield).toBe(plan.amount);
      assertDeck(next);
    }
  });
  it('punishes the former winning strategy of blindly repeating x=2 attacks on Veyra', () => {
    let state = createBattle();
    while (state.phase === 'player') {
      while (state.phase === 'player' && state.hand.length && state.player.ink >= 2) state = cast(state, 'triangle', 2);
      if (state.phase === 'player') state = end(state);
    }
    expect(state.phase).toBe('defeat'); expect(state.enemies[1].hp).toBeGreaterThan(0);
  });
  it('allows a different winning route with Circle and interruption while both constructs survive', () => {
    let state = createBattle();
    while (state.phase === 'player' && state.turn < 10) {
      if (state.turn === 1 || state.turn === 2) state = cast(state, 'circle', state.turn === 1 ? 1 : 3);
      while (state.phase === 'player' && state.hand.length && state.player.ink >= 2) {
        const ivory = state.enemies[2];
        state = cast(state, 'triangle', 2, getStance(state.turn) === 'channeling' && ivory.hp > 0 && ivory.intent.kind === 'attack' ? ivory.id : 'examiner');
      }
      if (state.phase === 'player') state = end(state);
    }
    expect(state.phase).toBe('victory'); expect(state.enemies[0].hp).toBeGreaterThan(0); expect(state.enemies[2].hp).toBeGreaterThan(0); assertDeck(state);
  });
});

describe('seal resonance', () => {
  it('rewards solving formula = seal exactly, only against Veyra', () => {
    expect(getSeal(1)).toBe(5); expect(getSeal(3)).toBe(6); expect(solveFor('linear', 6)).toBe(3); expect(solveFor('quadratic', 6)).toBeUndefined(); expect(solveFor('additive', 3)).toBe(1);
    const state = createBattle(); state.turn = 3; state.guardBroken = true; state.hand[0] = { ...state.hand[0], formula: 'linear' };
    const exact = previewCast(state, 'linear', 'triangle', 3, 'examiner'); const near = previewCast(state, 'linear', 'triangle', 2, 'examiner');
    expect(exact.resonanceBonus).toBe(4); expect(exact.impacts[0].healthDamage).toBe(6 + 2 + 4 + 4); expect(near.resonanceBonus).toBe(0); // turn 3 is also exposed: +4
    expect(previewCast(state, 'linear', 'triangle', 3, 'construct-a').impacts[0].healthDamage).toBe(8);
    expect(cast(state, 'triangle', 3).lastEvent!.resonance).toBe(4);
    const opening = createBattle(); expect(opening.hand.some(c => solveFor(c.formula, getSeal(1)) !== undefined)).toBe(true);
  });
  it('gives every card a character from its own formula family, two copies each', () => {
    const cards = [...createBattle().hand, ...createBattle().drawPile];
    const counts = new Map<string, number>(); for (const c of cards) counts.set(c.character, (counts.get(c.character) ?? 0) + 1);
    expect([...counts.values()]).toEqual([2, 2, 2, 2, 2, 2]);
  });
});
