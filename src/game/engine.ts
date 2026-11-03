import { FAMILY } from './characters.ts';
import type { CharacterId } from './characters.ts';
export type Formula = 'linear' | 'quadratic' | 'additive';
export type Geometry = 'triangle' | 'circle' | 'square';
export type Variable = 1 | 2 | 3;
export type Card = { id: string; formula: Formula; character: CharacterId };
export type Intent = { kind: 'attack' | 'shield' | 'stunned'; value: number; name: string };
export type Stance = 'warding' | 'channeling' | 'exposed';
export type Enemy = { id: string; name: string; title: string; hp: number; maxHp: number; shield: number; intent: Intent };
export type CombatEvent = {
  id: number; kind: 'cast' | 'enemy-turn'; geometry?: Geometry; formula?: Formula;
  impacts: { enemyId: string; healthDamage: number; blocked: number; shattered: number; defeated: boolean }[];
  shieldGained: number; playerDamage: number; guardBroken: 'none' | 'temporary' | 'permanent';
  chargeCancelled: 'none' | 'interrupted' | 'destroyed'; exposedBonus: number; exposedOpened: boolean; resonance: number;
};
export type Battle = {
  phase: 'player' | 'enemy' | 'victory' | 'defeat'; turn: number; seed: number;
  player: { hp: number; maxHp: number; shield: number; ink: number };
  enemies: Enemy[]; hand: Card[]; drawPile: Card[]; discard: Card[];
  extraDrawUsed: boolean; casts: number; damageDealt: number; log: string[];
  guardBroken: boolean; chargeDamage: number;
  lastEvent: CombatEvent | null;
};
export type Action = { type: 'cast'; cardId: string; geometry: Geometry; x: Variable; targetId: string } | { type: 'draw' } | { type: 'endTurn' } | { type: 'resolveEnemies' };
export const FORMULAS: Record<Formula, { expression: string; name: string; description: string; school: string }> = {
  linear: { expression: '2x', name: 'Twin Ember', description: 'A spark, perfectly mirrored.', school: 'LINEAR' },
  quadratic: { expression: 'x²', name: 'Rising Star', description: 'Small beginnings. Boundless possibility.', school: 'QUADRATIC' },
  additive: { expression: 'x + 2', name: 'Kindled Axiom', description: 'Every great proof starts somewhere.', school: 'ADDITIVE' },
};
export function evaluate(formula: Formula, x: Variable): number {
  switch (formula) { case 'linear': return 2 * x; case 'quadratic': return x ** 2; case 'additive': return x + 2; }
}
export function substitute(formula: Formula, x: Variable): string {
  switch (formula) { case 'linear': return `2 × ${x}`; case 'quadratic': return `${x}²`; case 'additive': return `${x} + 2`; }
}
export function preview(formula: Formula, geometry: Geometry, x: Variable) {
  const energy = evaluate(formula, x);
  return { energy, cost: x + (geometry === 'circle' ? 1 : 0), amount: geometry === 'triangle' ? energy + 2 : geometry === 'circle' ? Math.ceil(energy / 2) : energy + 3 };
}
export const GUARD_REDUCTION = 4;
export const EXPOSED_BONUS = 4;
export const INTERRUPT_DAMAGE = 6;
export const RESONANCE_BONUS = 4;
// Veyra's seal: a spell whose energy equals it exactly resonates. Avoids 4, which every formula makes at x = 2.
const SEALS = [5, 9, 6, 3, 2, 1];
export function getSeal(turn: number): number { return SEALS[(turn - 1) % SEALS.length]; }
// The value of x that makes the formula equal the seal, if one of 1–3 does.
export function solveFor(formula: Formula, target: number): Variable | undefined { return ([1, 2, 3] as const).find(x => evaluate(formula, x) === target); }
export function getStance(turn: number): Stance {
  return turn % 3 === 1 ? 'warding' : turn % 3 === 2 ? 'channeling' : 'exposed';
}
export function isGuardActive(state: Battle): boolean {
  return !state.guardBroken && state.enemies.some(e => e.id === 'construct-a' && e.hp > 0);
}
export function incomingDamage(state: Battle): number {
  return state.enemies.filter(e => e.hp > 0 && e.intent.kind === 'attack').reduce((sum, e) => sum + e.intent.value, 0);
}
export function enemyStatus(state: Battle, enemy: Enemy): string {
  if (enemy.hp === 0) return 'Dispelled';
  if (enemy.id === 'construct-a') return isGuardActive(state) ? 'Guard link · Veyra blocks 4 Triangle damage' : 'Link broken · returns next turn';
  if (enemy.id === 'examiner') {
    const stance = getStance(state.turn);
    return stance === 'exposed' ? 'Exposed · Triangle deals +4 damage' : stance === 'channeling' ? 'Channeling · heavy attack this turn' : 'Warding · gains 5 shield this turn';
  }
  if (enemy.intent.kind === 'stunned') return 'Interrupted · charged attack cancelled';
  return getStance(state.turn) === 'channeling' ? `Charging · deal ${Math.max(0, INTERRUPT_DAMAGE - state.chargeDamage)} more damage to interrupt` : getStance(state.turn) === 'warding' ? 'Charged attack next turn' : 'Charge spent · practice strike';
}
export function tacticalHint(state: Battle): { title: string; text: string } {
  const ivory = state.enemies.find(e => e.id === 'construct-b');
  if (getStance(state.turn) === 'channeling' && ivory && ivory.hp > 0 && ivory.intent.kind === 'attack') return {
    title: 'Interrupt Ivory’s charged strike',
    text: `Deal ${Math.max(0, INTERRUPT_DAMAGE - state.chargeDamage)} more health damage to Ivory this turn to cancel its 10-damage attack. Veyra is also preparing 12 damage.`,
  };
  if (getStance(state.turn) === 'channeling') return {
    title: 'Contain Veyra’s grand theorem',
    text: `${ivory?.intent.kind === 'stunned' ? 'Ivory’s strike is cancelled. ' : ''}Veyra still attacks for 12. Use Square to absorb damage, or spend your Ink pushing for a finish.`,
  };
  if (getStance(state.turn) === 'exposed') return {
    title: 'Veyra is exposed this turn',
    text: `Triangle deals +4 damage to Veyra.${isGuardActive(state) ? ' Copper’s guard still blocks 4: break it with Circle or defeat Copper.' : ' Use the opening before she raises another ward.'}`,
  };
  if (isGuardActive(state)) return {
    title: 'Copper is protecting Veyra',
    text: 'Triangle attacks on Veyra lose 4 damage. Circle breaks the link for this turn and shatters enemy shields. Defeating Copper removes the link permanently.',
  };
  if (state.guardBroken && state.enemies.some(e => e.id === 'construct-a' && e.hp > 0)) return {
    title: 'The guard link is broken this turn', text: 'Veyra can take full damage now. Copper will restore the link next turn if it survives.',
  };
  return { title: 'Veyra is raising a ward', text: 'She gains 5 shield at the end of this turn. Circle shatters enemy shields before dealing damage. Her heavy attack follows next turn.' };
}
export type Impact = { enemyId: string; damage: number; blocked: number; healthDamage: number; shieldAfter: number; shattered: number; interrupts: boolean };
// Both resolution and the UI consume this plan. Contextual modifiers live here only.
export function previewCast(state: Battle, formula: Formula, geometry: Geometry, x: Variable, targetId: string) {
  const base = preview(formula, geometry, x);
  const guardReduction = geometry === 'triangle' && targetId === 'examiner' && isGuardActive(state) ? GUARD_REDUCTION : 0;
  const exposedBonus = geometry === 'triangle' && targetId === 'examiner' && getStance(state.turn) === 'exposed' ? EXPOSED_BONUS : 0;
  const amount = geometry === 'triangle' ? Math.max(0, base.amount + exposedBonus - guardReduction) : base.amount;
  const resonant = geometry !== 'square' && base.energy === getSeal(state.turn);
  const impacts: Impact[] = geometry === 'square' ? [] : state.enemies.filter(e => e.hp > 0 && (geometry === 'circle' || e.id === targetId)).map(enemy => {
    const amount = base.amount + (enemy.id === 'examiner' ? (resonant ? RESONANCE_BONUS : 0) + (geometry === 'triangle' ? exposedBonus - guardReduction : 0) : 0);
    const shield = geometry === 'circle' ? 0 : enemy.shield;
    const blocked = Math.min(shield, Math.max(0, amount));
    const healthDamage = Math.min(enemy.hp, Math.max(0, amount) - blocked);
    return {
      enemyId: enemy.id, damage: amount, blocked, healthDamage, shieldAfter: shield - blocked, shattered: geometry === 'circle' ? enemy.shield : 0,
      interrupts: enemy.id === 'construct-b' && getStance(state.turn) === 'channeling' && enemy.intent.kind === 'attack' && healthDamage < enemy.hp && state.chargeDamage + healthDamage >= INTERRUPT_DAMAGE,
    };
  });
  const resonanceBonus = resonant && impacts.some(i => i.enemyId === 'examiner') ? RESONANCE_BONUS : 0;
  return { ...base, amount: geometry === 'triangle' ? amount + resonanceBonus : amount, guardReduction, exposedBonus, resonant, resonanceBonus, seal: getSeal(state.turn), breaksGuard: geometry === 'circle' && isGuardActive(state), impacts };
}
function shuffle<T>(items: T[], seed: number): { items: T[]; seed: number } {
  const result = [...items]; let next = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) { next = (Math.imul(next, 1664525) + 1013904223) >>> 0; const j = next % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return { items: result, seed: next };
}
export function getIntent(id: string, turn: number): Intent {
  const stance = getStance(turn);
  if (id === 'examiner') return stance === 'warding' ? { kind: 'shield', value: 5, name: 'Ward theorem' } : { kind: 'attack', value: stance === 'channeling' ? 12 : 4, name: stance === 'channeling' ? 'Grand theorem' : 'Recovering' };
  if (id === 'construct-b' && stance === 'channeling') return { kind: 'attack', value: 10, name: 'Charged strike' };
  return { kind: 'attack', value: 3, name: id === 'construct-a' ? 'Guardian strike' : 'Practice strike' };
}
function drawCards(state: Battle, count: number) {
  for (let i = 0; i < count; i++) {
    if (!state.drawPile.length && state.discard.length) { const mixed = shuffle(state.discard, state.seed); state.drawPile = mixed.items; state.seed = mixed.seed; state.discard = []; }
    const card = state.drawPile.shift(); if (card) state.hand.push(card);
  }
}
export function createBattle(seed = 2026): Battle {
  // Two copies of each character; formula order is unchanged so seeded shuffles stay stable.
  const deck = Array.from({ length: 12 }, (_, i) => { const formula = (['linear', 'quadratic', 'additive'] as const)[i % 3]; return { id: `formula-${i}`, formula, character: FAMILY[formula][Math.floor(i / 3) % 2] }; });
  const mixed = shuffle(deck, seed);
  const state: Battle = {
    phase: 'player', turn: 1, seed: mixed.seed, player: { hp: 36, maxHp: 36, shield: 0, ink: 6 },
    enemies: [
      { id: 'construct-a', name: 'Copper Sentinel', title: 'PRACTICE CONSTRUCT', hp: 12, maxHp: 12, shield: 0, intent: getIntent('construct-a', 1) },
      { id: 'examiner', name: 'Magister Veyra', title: 'ACADEMY EXAMINER', hp: 42, maxHp: 42, shield: 0, intent: getIntent('examiner', 1) },
      { id: 'construct-b', name: 'Ivory Sentinel', title: 'PRACTICE CONSTRUCT', hp: 18, maxHp: 18, shield: 0, intent: getIntent('construct-b', 1) },
    ],
    hand: [], drawPile: mixed.items, discard: [], extraDrawUsed: false, casts: 0, damageDealt: 0,
    guardBroken: false, chargeDamage: 0, lastEvent: null,
    log: ['The First Trial begins. Copper guards Veyra; Ivory charges next turn.'],
  };
  drawCards(state, 3); return state;
}
function hit(target: { hp: number; shield: number }, amount: number) {
  const absorbed = Math.min(target.shield, amount); target.shield -= absorbed;
  const lost = Math.min(target.hp, amount - absorbed); target.hp -= lost; return lost;
}
function note(state: Battle, message: string) { state.log = [message, ...state.log].slice(0, 30); }
export function battleReducer(state: Battle, action: Action): Battle {
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  if (action.type === 'resolveEnemies') {
    if (state.phase !== 'enemy') return state;
    const next = structuredClone(state);
    next.lastEvent = {
      id: (state.lastEvent?.id ?? 0) + 1, kind: 'enemy-turn', impacts: [], shieldGained: 0,
      playerDamage: 0, guardBroken: 'none', chargeCancelled: 'none', exposedBonus: 0, exposedOpened: false, resonance: 0,
    };
    for (const enemy of next.enemies.filter(e => e.hp > 0)) {
      if (enemy.intent.kind === 'stunned') { note(next, `${enemy.name} is interrupted. Its charged attack fizzles.`); }
      else if (enemy.intent.kind === 'shield') { enemy.shield += enemy.intent.value; note(next, `${enemy.name} gains ${enemy.intent.value} shield.`); }
      else { const damage = hit(next.player, enemy.intent.value); note(next, `${enemy.name} attacks for ${enemy.intent.value}. ${damage ? `${damage} health lost.` : 'Your shield holds.'}`); }
      if (next.player.hp === 0) { next.phase = 'defeat'; next.lastEvent.playerDamage = state.player.hp; return next; }
    }
    next.turn++; next.player.ink = 6; next.player.shield = 0; next.extraDrawUsed = false; next.phase = 'player'; next.guardBroken = false; next.chargeDamage = 0;
    for (const enemy of next.enemies) enemy.intent = getIntent(enemy.id, next.turn);
    next.lastEvent.playerDamage = state.player.hp - next.player.hp;
    next.lastEvent.exposedOpened = getStance(next.turn) === 'exposed';
    drawCards(next, Math.max(0, 3 - next.hand.length)); note(next, `Turn ${next.turn}. Ink restored; draw up to three cards.`); return next;
  }
  if (state.phase !== 'player') return state;
  if (action.type === 'endTurn') return { ...state, phase: 'enemy' };
  if (action.type === 'draw') {
    if (state.extraDrawUsed || state.player.ink < 1 || state.hand.length >= 5 || (!state.drawPile.length && !state.discard.length)) return state;
    const next = structuredClone(state); next.player.ink--; next.extraDrawUsed = true; drawCards(next, 1); note(next, 'Spent 1 Ink to draw an additional formula.'); return next;
  }
  const card = state.hand.find(c => c.id === action.cardId);
  if (!card || ![1, 2, 3].includes(action.x) || !['triangle', 'circle', 'square'].includes(action.geometry)) return state;
  const spell = previewCast(state, card.formula, action.geometry, action.x, action.targetId);
  if (spell.cost > state.player.ink) return state;
  if (action.geometry === 'triangle' && !state.enemies.some(e => e.id === action.targetId && e.hp > 0)) return state;
  const next = structuredClone(state); next.player.ink -= spell.cost; next.hand = next.hand.filter(c => c.id !== card.id); next.discard.push(card); next.casts++;
  next.lastEvent = {
    id: (state.lastEvent?.id ?? 0) + 1, kind: 'cast', geometry: action.geometry, formula: card.formula,
    impacts: [], shieldGained: action.geometry === 'square' ? spell.amount : 0, playerDamage: 0,
    guardBroken: spell.breaksGuard ? 'temporary' : 'none', chargeCancelled: 'none', exposedBonus: spell.exposedBonus, exposedOpened: false, resonance: spell.resonanceBonus,
  };
  if (action.geometry === 'square') { next.player.shield += spell.amount; note(next, `${FORMULAS[card.formula].name}: +${spell.amount} shield (${spell.energy} + 3).`); }
  else {
    if (action.geometry === 'circle') next.guardBroken = true;
    const reports: string[] = [];
    for (const impact of spell.impacts) {
      const enemy = next.enemies.find(e => e.id === impact.enemyId)!;
      enemy.hp -= impact.healthDamage; enemy.shield = impact.shieldAfter; next.damageDealt += impact.healthDamage;
      next.lastEvent.impacts.push({ enemyId: enemy.id, healthDamage: impact.healthDamage, blocked: impact.blocked, shattered: impact.shattered, defeated: enemy.hp === 0 });
      if (enemy.id === 'construct-a' && enemy.hp === 0) next.lastEvent.guardBroken = 'permanent';
      reports.push(`${enemy.name}: ${impact.healthDamage} health damage${impact.blocked ? `, ${impact.blocked} absorbed by ward` : ''}${impact.shattered ? `, ${impact.shattered} ward shattered` : ''}${enemy.hp === 0 ? ', dispelled' : ''}`);
      if (enemy.id === 'construct-b' && getStance(next.turn) === 'channeling') {
        next.chargeDamage = Math.min(INTERRUPT_DAMAGE, next.chargeDamage + impact.healthDamage);
        if (impact.interrupts) enemy.intent = { kind: 'stunned', value: 0, name: 'Interrupted' };
        if (state.enemies.find(e => e.id === 'construct-b')!.intent.kind === 'attack') {
          if (enemy.hp === 0) next.lastEvent.chargeCancelled = 'destroyed';
          else if (impact.interrupts) next.lastEvent.chargeCancelled = 'interrupted';
        }
      }
    }
    note(next, `${FORMULAS[card.formula].name} (${spell.cost} Ink). ${reports.join('; ')}.${spell.guardReduction ? ' Copper’s guard blocks 4 focused damage.' : ''}${spell.exposedBonus ? ' Exposed: +4 focused damage.' : ''}${spell.resonanceBonus ? ` Resonance: energy ${spell.energy} matches the seal, +4 to Veyra.` : ''}`);
    if (spell.breaksGuard) note(next, 'Circle breaks Copper’s guard link until next turn. Veyra is open to focused spells.');
    if (spell.impacts.some(i => i.interrupts)) note(next, 'Ivory’s charged strike is interrupted. Its 10-damage attack is cancelled!');
  }
  if (next.enemies.find(e => e.id === 'examiner')!.hp === 0) { next.phase = 'victory'; note(next, 'The proof is complete. The First Trial is yours.'); }
  return next;
}
