import type { Formula } from './engine';

export type Rarity = 'common' | 'rare' | 'legendary';
export type CharacterId = 'twin-embers' | 'lyra' | 'sorrel' | 'quadra' | 'tobin' | 'bramble';
export type Character = { id: CharacterId; name: string; title: string; formula: Formula; rarity: Rarity; flavor: string };

// Original collectible cast. Each formula family has a common and a rarer face; art loads from public/assets/card-<id>.(webp|png).
export const CHARACTERS: Record<CharacterId, Character> = {
  'twin-embers': { id: 'twin-embers', name: 'Twin Embers', title: 'Mirrored Familiars', formula: 'linear', rarity: 'common', flavor: 'Whatever one does, the other does too.' },
  lyra: { id: 'lyra', name: 'Lyra Vale', title: 'Mirror Scribe', formula: 'linear', rarity: 'rare', flavor: 'Every line she draws, she draws twice.' },
  sorrel: { id: 'sorrel', name: 'Sorrel', title: 'Star-Seed Sprite', formula: 'quadratic', rarity: 'common', flavor: 'Plant a small number. Watch it square.' },
  quadra: { id: 'quadra', name: 'Archmage Quadra', title: 'Keeper of Powers', formula: 'quadratic', rarity: 'legendary', flavor: 'Small numbers fear her. Large ones obey.' },
  tobin: { id: 'tobin', name: 'Tobin', title: 'Lantern Bearer', formula: 'additive', rarity: 'common', flavor: 'Always two steps ahead.' },
  bramble: { id: 'bramble', name: 'Bramble', title: 'Runestone Tortoise', formula: 'additive', rarity: 'rare', flavor: 'Slow. Steady. Plus two.' },
};

export const FAMILY: Record<Formula, [CharacterId, CharacterId]> = {
  linear: ['twin-embers', 'lyra'], quadratic: ['sorrel', 'quadra'], additive: ['tobin', 'bramble'],
};
