import { FORMULAS } from './engine';
import type { CombatEvent } from './engine';

export function eventMessage(event: CombatEvent) {
  if (event.chargeCancelled !== 'none') return { title: event.chargeCancelled === 'destroyed' ? 'Charged strike dispelled' : 'Charge interrupted', detail: 'Ivory’s 10-damage attack is cancelled.', tone: 'interrupt' };
  if (event.guardBroken !== 'none') return { title: 'Guard link severed', detail: event.guardBroken === 'permanent' ? 'Copper is dispelled. Veyra’s guard is gone permanently.' : 'Veyra is open to focused damage for this turn.', tone: 'guard' };
  if (event.resonance) return { title: 'Seal resonance', detail: `Your energy matched Veyra’s seal exactly · +${event.resonance} damage.`, tone: 'exposed' };
  if (event.exposedOpened) return { title: 'Veyra is exposed', detail: `${event.playerDamage ? `You lost ${event.playerDamage} health. ` : 'No health lost. '}Triangle gains +4 against Veyra this turn.`, tone: 'exposed' };
  if (event.kind === 'enemy-turn') return { title: event.playerDamage ? `−${event.playerDamage} health` : 'No health lost', detail: event.playerDamage ? 'Read the new intentions before your next spell.' : 'Your next turn is ready.', tone: event.playerDamage ? 'damage' : 'shield' };
  if (event.shieldGained) return { title: `+${event.shieldGained} shield`, detail: 'Containment is ready for the enemy response.', tone: 'shield' };
  const damage = event.impacts.reduce((sum, impact) => sum + impact.healthDamage, 0);
  return { title: event.exposedBonus && damage > 0 ? 'Opening exploited' : `${FORMULAS[event.formula!].name} released`, detail: `${damage} health damage${event.impacts.some(i => i.shattered) ? ' · enemy wards shattered' : ''}${event.exposedBonus ? ` · Exposed +${event.exposedBonus}` : ''}.`, tone: event.exposedBonus ? 'exposed' : 'cast' };
}
