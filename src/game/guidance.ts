import type { Battle, Geometry, Variable } from './engine';
import { getStance, incomingDamage, isGuardActive } from './engine';

export type GuideFocus = 'hand' | 'geometry' | 'variable' | 'target' | 'cast' | 'end-turn' | 'tactics';
export type GuideHint = { title: string; text: string; focus: GuideFocus; targetId?: string; complete?: boolean };
export type Selection = { cardId: string | null; geometry: Geometry; x: Variable; targetId: string };

function focusedLesson(state: Battle, selection: Selection, targetId: string, title: string, reason: string): GuideHint {
  const common = { title, targetId };
  if (!state.hand.some(c => c.id === selection.cardId)) return { ...common, text: `${reason} First, select any formula card from your hand.`, focus: 'hand' };
  if (selection.geometry !== 'triangle') return { ...common, text: `${reason} Choose Triangle to focus this spell on one enemy. You can still choose another approach.`, focus: 'geometry' };
  if (selection.x !== 2) return { ...common, text: 'Set x to 2 for this example. Every starter formula produces 4 energy: Triangle adds 2, giving 6 damage for 2 Ink.', focus: 'variable' };
  if (selection.targetId !== targetId) return { ...common, text: `Select ${targetId === 'construct-a' ? 'Copper' : 'Ivory'} in the battlefield. Check the target name and damage preview before casting.`, focus: 'target' };
  return { ...common, text: `The spell is ready: 6 damage for 2 Ink. ${reason} Press Cast spell when you are ready.`, focus: 'cast' };
}

// Advice follows real combat state. It never locks controls or changes combat rules.
export function getGuidance(state: Battle, selection: Selection): GuideHint | null {
  if (state.phase === 'victory' || state.phase === 'defeat') return null;
  if (state.phase === 'enemy') return { title: 'Watch the enemy response', text: 'Enemy intentions resolve now. Your shields absorb damage before health. Next turn restores 6 Ink and draws up to three cards.', focus: 'tactics' };
  if (state.turn >= 4) return { title: 'You have learned the opening', text: 'Keep reading intentions: remove protection, interrupt dangerous attacks, and use exposed turns. You can hide these hints or reveal the safe route below.', focus: 'tactics', complete: true };
  if (state.player.ink === 0 || state.hand.length === 0) return { title: 'Ready for the next turn?', text: 'End turn to restore 6 Ink and draw up to three cards. The Incoming damage value already accounts for enemies you defeated or interrupted.', focus: 'end-turn' };
  const copper = state.enemies.find(e => e.id === 'construct-a')!;
  const ivory = state.enemies.find(e => e.id === 'construct-b')!;
  const hasCard = state.hand.some(c => c.id === selection.cardId);
  if (state.turn === 1 && copper.hp > 0 && state.player.ink >= 2) return focusedLesson(state, selection, copper.id,
    state.casts === 0 ? 'Start by understanding Copper’s guard' : 'Follow through on the guard',
    isGuardActive(state) ? 'Copper reduces Triangle damage aimed at Veyra. Attacking Copper directly avoids that protection.' : 'Circle has opened Veyra this turn. Defeating Copper also removes its guard permanently.');
  if (state.turn === 1 && copper.hp === 0 && ivory.hp > 0 && state.player.ink >= 2) return focusedLesson(state, selection, ivory.id,
    'The guard is gone. Prepare for Ivory.', 'Veyra can take full focused damage now. Weakening Ivory with your remaining Ink makes its next turn easier to manage.');
  if (getStance(state.turn) === 'channeling') {
    if (ivory.hp > 0 && ivory.intent.kind === 'attack') {
      // Partial progress and deliberate alternate choices get accurate, non-prescriptive advice.
      if (state.chargeDamage > 0 || selection.geometry !== 'triangle' || state.player.ink < 2) return {
        title: 'Ivory is preparing 10 damage',
        text: `Deal ${Math.max(0, 6 - state.chargeDamage)} more health damage to Ivory this turn to interrupt. Circle can contribute; Square protects you but does not cancel the charge. Check the live preview.`,
        focus: !hasCard ? 'hand' : selection.x + (selection.geometry === 'circle' ? 1 : 0) > state.player.ink ? 'variable' : selection.geometry === 'triangle' ? 'target' : 'cast', targetId: ivory.id,
      };
      return focusedLesson(state, selection, ivory.id, 'Stop the charged strike', 'Deal 6 health damage to Ivory during this turn to cancel its 10-damage attack. Damage from turn one does not count toward this interrupt.');
    }
    return { title: ivory.hp === 0 ? 'Ivory is dispelled' : 'You cancelled the charge', text: `Veyra still attacks for 12. Total incoming damage is ${incomingDamage(state)}. You can finish Ivory, use Square for shields, or push damage; watch the health-at-risk preview.`, focus: 'hand' };
  }
  if (getStance(state.turn) === 'exposed') return {
    title: 'This is your opening',
    text: isGuardActive(state) ? 'Triangle gains +4 against exposed Veyra, but Copper still blocks 4. Circle breaks the link for this turn, or defeating Copper removes it permanently.' : 'Triangle gains +4 damage against Veyra this turn. Select her and compare x values in the preview. You are ready to choose the rest of your route.',
    focus: !hasCard ? 'hand' : selection.geometry !== 'triangle' ? 'geometry' : 'target', targetId: 'examiner',
  };
  return { title: 'Make your remaining Ink count', text: 'A third x=2 spell needs 2 Ink. Drawing an extra card costs 1 Ink, so check what you can afford before drawing. You can also end your turn now.', focus: 'end-turn' };
}
