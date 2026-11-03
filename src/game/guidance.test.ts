import { describe, expect, it } from 'vitest';
import { battleReducer, createBattle } from './engine';
import { getGuidance } from './guidance';
import type { Selection } from './guidance';

const selection: Selection = { cardId: null, geometry: 'triangle', x: 2, targetId: 'examiner' };
function nextTurn(state = createBattle()) { return battleReducer(battleReducer(state, { type: 'endTurn' }), { type: 'resolveEnemies' }); }

describe('optional guided opening', () => {
  it('teaches card, geometry, variable, target, and cast without changing state', () => {
    const state = createBattle(); const before = structuredClone(state); const cardId = state.hand[0].id;
    expect(getGuidance(state, selection)).toMatchObject({ focus: 'hand', targetId: 'construct-a' });
    expect(getGuidance(state, { ...selection, cardId, geometry: 'square' })?.focus).toBe('geometry');
    expect(getGuidance(state, { ...selection, cardId, x: 3 })?.focus).toBe('variable');
    expect(getGuidance(state, { ...selection, cardId })?.focus).toBe('target');
    expect(getGuidance(state, { ...selection, cardId, targetId: 'construct-a' })?.focus).toBe('cast');
    expect(state).toEqual(before);
    // Advice has no permission or combat side effects: an alternate move remains legal.
    expect(battleReducer(state, { type: 'cast', cardId, geometry: 'triangle', x: 2, targetId: 'examiner' }).casts).toBe(1);
  });
  it('moves from Copper to Ivory only after Copper is actually defeated', () => {
    let state = createBattle();
    for (let i = 0; i < 2; i++) state = battleReducer(state, { type: 'cast', cardId: state.hand[0].id, geometry: 'triangle', x: 2, targetId: 'construct-a' });
    expect(getGuidance(state, selection)).toMatchObject({ targetId: 'construct-b', focus: 'hand' });
  });
  it('explains turn progression when no cards or Ink remain', () => {
    const state = createBattle(); state.player.ink = 0;
    expect(getGuidance(state, selection)?.focus).toBe('end-turn');
    state.player.ink = 6; state.hand = [];
    expect(getGuidance(state, selection)?.focus).toBe('end-turn');
  });
  it('explains the charging turn and follows alternate Circle/Square choices accurately', () => {
    const state = nextTurn(); const cardId = state.hand[0].id;
    expect(getGuidance(state, selection)?.title).toBe('Stop the charged strike');
    expect(getGuidance(state, { ...selection, cardId, geometry: 'circle' })?.focus).toBe('cast');
    expect(getGuidance(state, { ...selection, geometry: 'circle' })?.focus).toBe('hand');
    state.player.ink = 2;
    expect(getGuidance(state, { ...selection, cardId, x: 3, geometry: 'circle' })?.focus).toBe('variable');
  });
  it('explains the remaining heavy attack after an interruption', () => {
    let state = nextTurn(); state = battleReducer(state, { type: 'cast', cardId: state.hand[0].id, geometry: 'triangle', x: 2, targetId: 'construct-b' });
    const hint = getGuidance(state, selection);
    expect(hint?.title).toBe('You cancelled the charge'); expect(hint?.text).toContain('Veyra still attacks for 12'); expect(hint?.text).toContain('15');
  });
  it('teaches exposed timing, then hands the remaining fight to the player', () => {
    const state = createBattle(); state.turn = 3;
    expect(getGuidance(state, { ...selection, cardId: state.hand[0].id, geometry: 'square' })?.focus).toBe('geometry');
    expect(getGuidance(state, selection)?.text).toContain('Copper still blocks 4');
    state.enemies[0].hp = 0;
    expect(getGuidance(state, selection)?.text).toContain('compare x values');
    state.turn = 4; expect(getGuidance(state, selection)?.complete).toBe(true);
  });
  it('handles enemy resolution and terminal states without suggesting casts', () => {
    const state = createBattle(); state.phase = 'enemy'; expect(getGuidance(state, selection)?.focus).toBe('tactics');
    state.phase = 'defeat'; expect(getGuidance(state, selection)).toBeNull();
    state.phase = 'victory'; expect(getGuidance(state, selection)).toBeNull();
  });
});
