import { describe, expect, it } from 'vitest';
import { battleReducer, createBattle } from './engine';
import type { Battle, Geometry, Variable } from './engine';
import { eventMessage } from './feedback';

function cast(state: Battle, geometry: Geometry, targetId = 'examiner', x: Variable = 2) { return battleReducer(state, { type: 'cast', cardId: state.hand[0].id, geometry, x, targetId }); }
function end(state = createBattle()) { return battleReducer(battleReducer(state, { type: 'endTurn' }), { type: 'resolveEnemies' }); }

describe('combat feedback is derived from resolved rules', () => {
  it('distinguishes temporary link breaks and permanent guard removal', () => {
    const circle = cast(createBattle(), 'circle');
    expect(circle.lastEvent).toMatchObject({ id: 1, guardBroken: 'temporary', geometry: 'circle' });
    expect(eventMessage(circle.lastEvent!).detail).toContain('this turn');
    let killed = cast(createBattle(), 'triangle', 'construct-a'); killed = cast(killed, 'triangle', 'construct-a');
    expect(killed.lastEvent).toMatchObject({ id: 2, guardBroken: 'permanent' });
    expect(killed.lastEvent!.impacts[0]).toMatchObject({ enemyId: 'construct-a', healthDamage: 6, defeated: true });
    expect(eventMessage(killed.lastEvent!).detail).toContain('permanently');
  });
  it('reports an interruption and separately reports killing the charging construct', () => {
    const interrupted = cast(end(), 'triangle', 'construct-b');
    expect(interrupted.lastEvent!.chargeCancelled).toBe('interrupted'); expect(eventMessage(interrupted.lastEvent!).title).toBe('Charge interrupted');
    const state = end(); state.enemies[2].hp = 5; const destroyed = cast(state, 'triangle', 'construct-b');
    expect(destroyed.lastEvent!.chargeCancelled).toBe('destroyed'); expect(destroyed.lastEvent!.impacts[0].healthDamage).toBe(5);
    expect(eventMessage(destroyed.lastEvent!).title).toContain('dispelled');
  });
  it('records ward shattering, blocked damage, and actual clamped health loss', () => {
    const state = end(); const circle = cast(state, 'circle', 'examiner', 3);
    expect(circle.lastEvent!.impacts.find(i => i.enemyId === 'examiner')).toMatchObject({ shattered: 5, healthDamage: 9, blocked: 0 }); // x² at x = 3 makes 9, matching turn 2's seal: 5 + 4 resonance
    expect(circle.lastEvent!.resonance).toBe(4);
    const focused = cast(state, 'triangle');
    expect(focused.lastEvent!.impacts[0]).toMatchObject({ blocked: 2, healthDamage: 0, shattered: 0 });
  });
  it('reports shields and enemy-turn health loss without inventing damage', () => {
    const shielded = cast(createBattle(), 'square'); expect(shielded.lastEvent!.shieldGained).toBe(7);
    const safe = end(shielded); expect(safe.lastEvent!.playerDamage).toBe(0); expect(eventMessage(safe.lastEvent!).title).toBe('No health lost');
    const exposed = end(end()); expect(exposed.lastEvent).toMatchObject({ kind: 'enemy-turn', playerDamage: 25, exposedOpened: true });
    expect(eventMessage(exposed.lastEvent!).title).toBe('Veyra is exposed');
  });
  it('records a lethal enemy response as actual health lost, and keeps feedback ids stable on drawing', () => {
    const state = end(); state.player.hp = 5; const lost = end(state);
    expect(lost.phase).toBe('defeat'); expect(lost.lastEvent!.playerDamage).toBe(5);
    const castState = cast(createBattle(), 'square'); const drawn = battleReducer(castState, { type: 'draw' });
    expect(drawn.lastEvent).toEqual(castState.lastEvent); expect(end(castState).lastEvent!.id).toBe(castState.lastEvent!.id + 1);
    expect(createBattle().lastEvent).toBeNull();
  });
});
