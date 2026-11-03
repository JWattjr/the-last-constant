// Node 22.18+ can run this deterministic balance probe without a build step.
import { battleReducer, createBattle, getStance, incomingDamage, previewCast } from '../src/game/engine.ts';

const trace = process.argv.includes('--trace');
function end(state) { return battleReducer(battleReducer(state, { type: 'endTurn' }), { type: 'resolveEnemies' }); }
function choices(state) {
  return state.hand.flatMap(card => ['triangle', 'circle', 'square'].flatMap(geometry => [1, 2, 3].flatMap(x =>
    (geometry === 'triangle' ? state.enemies.filter(e => e.hp > 0).map(e => e.id) : ['examiner']).map(targetId => ({
      type: 'cast', cardId: card.id, geometry, x, targetId,
      plan: previewCast(state, card.formula, geometry, x, targetId),
    }))))).filter(choice => choice.plan.cost <= state.player.ink);
}
const policies = {
  'Blind examiner rush': state => state.hand.length && state.player.ink >= 2 ? { type: 'cast', cardId: state.hand[0].id, geometry: 'triangle', x: 2, targetId: 'examiner' } : null,
  'Dismantle constructs': state => {
    const target = ['construct-a', 'construct-b', 'examiner'].find(id => state.enemies.some(e => e.id === id && e.hp > 0));
    return state.hand.length && state.player.ink >= 2 ? { type: 'cast', cardId: state.hand[0].id, geometry: 'triangle', x: 2, targetId: target } : null;
  },
  'Circle and interrupt': state => {
    if (state.turn === 1 && state.casts === 0) return { type: 'cast', cardId: state.hand[0].id, geometry: 'circle', x: 1, targetId: 'examiner' };
    if (state.turn === 2 && state.casts === 3) return { type: 'cast', cardId: state.hand[0].id, geometry: 'circle', x: 3, targetId: 'examiner' };
    const ivory = state.enemies.find(e => e.id === 'construct-b');
    const targetId = getStance(state.turn) === 'channeling' && ivory.hp > 0 && ivory.intent.kind === 'attack' ? ivory.id : 'examiner';
    return state.hand.length && state.player.ink >= 2 ? { type: 'cast', cardId: state.hand[0].id, geometry: 'triangle', x: 2, targetId } : null;
  },
  'Shield and adapt': state => {
    const options = choices(state);
    const interrupt = options.filter(c => c.plan.impacts.some(i => i.interrupts || i.enemyId === 'construct-b' && getStance(state.turn) === 'channeling' && state.enemies[2].intent.kind === 'attack' && i.healthDamage >= state.enemies[2].hp));
    if (interrupt.length) return interrupt.sort((a, b) => a.plan.cost - b.plan.cost)[0];
    const incoming = Math.max(0, incomingDamage(state) - state.player.shield);
    const shields = options.filter(c => c.geometry === 'square');
    if (incoming > 0 && shields.length) return shields.sort((a, b) => Math.min(incoming, b.plan.amount) / b.plan.cost - Math.min(incoming, a.plan.amount) / a.plan.cost)[0];
    return options.filter(c => c.geometry !== 'square').sort((a, b) => {
      const score = c => c.plan.impacts.reduce((sum, i) => sum + i.healthDamage, 0) / c.plan.cost + (c.plan.breaksGuard ? 2 : 0) + (c.geometry === 'circle' ? c.plan.impacts.reduce((sum, i) => sum + i.shattered, 0) : 0);
      return score(b) - score(a);
    })[0] ?? null;
  },
};
for (const [name, policy] of Object.entries(policies)) {
  let state = createBattle(); let steps = 0;
  while (state.phase === 'player' && state.turn <= 30 && steps++ < 200) {
    const action = policy(state);
    if (action) {
      const next = battleReducer(state, action);
      if (next === state) throw new Error(`Invalid policy action: ${name}, ${JSON.stringify(action)}`);
      state = next;
      if (trace) console.log(name, `turn ${state.turn}`, action.geometry, `x=${action.x}`, action.targetId, state.log[0]);
    } else state = end(state);
  }
  console.log(JSON.stringify({ policy: name, outcome: state.phase, turn: state.turn, hp: state.player.hp, casts: state.casts, enemies: state.enemies.map(e => `${e.name}: ${e.hp}`) }));
}
