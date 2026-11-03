# Rebuild plan: equation duels

Goal: win first place in the Loadout AI Game Competition. Entries close **November 6, 2026 at 16:00 Lagos (15:00 UTC)**. The judges score gameplay 40%, originality 25%, execution 20% and the development plan 15%.

Our internal deadline: post on X and submit by **November 6, 12:00 Lagos**, which leaves four hours of buffer.

## The game in one paragraph

Two mages duel by writing spells. Each round a **rune** shows a target, such as "Make 12". Both players secretly build a spell from up to five cards (number stones, operator glyphs and familiar characters), then both reveal at once. Whoever is closer wins the round and deals damage. Hitting the target **exactly** is a **Resonance** and deals extra damage. Later runes are equations ("2x + 1 = 13: make x"), so players move from arithmetic to solving for x as they climb the Academy's trials. Our characters are familiars: operators with personality. Collecting them changes how you play.

## Why this wins

| Rubric | What this gives us |
| --- | --- |
| Gameplay 40% | A tense round of simultaneous reveal, safe play versus going for the exact hit, and a computer opponent with real difficulty levels |
| Originality 25% | Spells really are equations, the rune ladder teaches algebra, and the world is our own (inspired by the idea of drawn magic, using no Witch Hat Atelier names or designs) |
| Execution 20% | One focal point on screen, a satisfying reveal and Resonance moment, a hosted link, no bugs |
| Development plan 15% | PvP on the same engine, collection and trading, a level ladder up to Algebra 1, and a classroom angle |

## Rules, version 1 (the source of truth for code)

**Cards**
- **Number stone** (common): a value from 1 to 9.
- **Glyph** (common): `+`, `−` or `×`. It sits between two stones.
- **Familiar** (a character): applies its operation to **everything before it**, like a bracket. For example `3 + 3 [Twin Embers]` is `(3 + 3) × 2 = 12`.

| Familiar | Operation | Rarity | Perk |
| --- | --- | --- | --- |
| Twin Embers | ×2 | common | none |
| Lyra Vale | ×2 | rare | If your spell resonates, draw 1 extra card |
| Sorrel | ² | common | none |
| Archmage Quadra | ² | legendary | Your Resonance deals +2 damage |
| Tobin | +2 | common | none |
| Bramble | +2 | rare | If you lose the round, take 1 less damage |

**A valid spell** has 1 to 5 cards and starts with a stone. After that, each step is either a glyph followed by a stone, or a familiar. It cannot end on a glyph. Within a stretch between familiars, `×` binds tighter than `+` and `−`; each familiar applies to the whole value so far. The UI always shows the bracketed form.

**Deck and hand.** The deck has 20 cards: 10 stones (1 to 9, plus an extra 3), 4 glyphs (`+ + × −`) and the 6 familiars. Draw 7 to start, and refill to 7 after each round. Used cards go to the discard pile, which reshuffles into the deck when it runs out.

**Round**
1. A rune is revealed. Its target is always reachable exactly from the player's current hand, using the operations that trial allows.
2. Both players build a spell. The bot "inks" face down.
3. Reveal. Each spell's distance is |value − target|.
4. The closer spell wins and deals 3 damage. An exact hit deals 5. If both hit exactly, both deal 5. If the distances are equal and neither is exact, nobody deals damage.
5. Perks apply, used cards are discarded, and both players refill their hands.

**Health.** Both mages start at 20. The first to reach 0 loses: about 4 rounds for an expert and 5 to 7 for a learner. After a miss, the reveal shows one exact answer that was in your hand.

**Trials (the learning ladder)**

| Trial | Opponent | Rune shows | Allowed in runes | Teaches |
| --- | --- | --- | --- | --- |
| I. Sums | Veyra, easy | "Make 11" | `+`, Tobin | Addition, number sense |
| II. Products | Veyra, medium | "Make 24" | `+ ×`, all familiars | Multiplication, order of operations, brackets |
| III. Unknowns | Veyra, hard | "2x + 1 = 13" (make x) | Everything | Solving linear equations, squares (`x² = 49`) |

After a Trial III round, the reveal shows the working: `2x + 1 = 13 → 2x = 12 → x = 6`.

**Bot.** It lists every valid spell in its hand (at most a few thousand) and scores each by distance. *Easy* picks randomly from the better half and uses at most 3 cards. *Medium* picks the best spell 70% of the time. *Hard* always picks the best and keeps familiars when stones alone can hit exactly.

## Screen

Following your friend's lesson: one focal point and calm space around it.
- **Top:** the opponent's medallion and health, plus her face-down spell slots, which fill one by one as she "inks".
- **Centre:** the rune circle with the target, or the equation in Trial III.
- **Below the rune:** your 5 spell slots, with a live readout ("= 10 · 2 away").
- **Bottom:** your hand fanned out. Click a card to add it to the next slot, click a slot to return it, then Cast.
- **Reveal:** both spells flip, the values count up, distance bars appear, damage numbers show, and a Resonance burst marks an exact hit.

## Art: Risograph pop (chosen November 3; all through ChatGPT in the user's Chrome, never generated directly)

**Style spec (airy riso, chosen November 3: mostly bare paper with one ink splash behind the subject, anchored on `docs/riso/hero-twin-embers-airy.png`).** This goes in every prompt, along with the approved hero image attached as the reference. A risograph print made with only four spot inks: Fluorescent Pink `#FF48B0`, Teal `#00838A`, Yellow `#FFE800` and Federal Blue `#3D5588`, on warm off-white paper `#F6F1E7`. Flat bold shapes, thick hand-drawn Federal Blue outlines, halftone dot shading, grainy ink texture, slight misregistration between colour layers, and overprint colours where inks overlap (pink and yellow make orange; blue and yellow make green). No gradients, airbrush or photorealism.

**Process**
1. **Hero:** Twin Embers in the spec, regenerated until the user loves it.
2. **Set:** every other image is made in a new ChatGPT chat with the hero uploaded as the style reference, plus the spec and the subject.
3. **World rule:** every creature was inked into existence. It shows brush-stroke edges, small glyph marks, and the maths symbol that summoned it (×2, ², +2) inside a glyph circle.
4. **Hands:** every visible hand has five fingers. Check each image before accepting it.

**The list:** 6 familiars, the apprentice and Veyra as medallion portraits, and one card back. Number stones, glyphs and the board are drawn in code using the same four inks. `docs/moodboard/` has the reference boards; board D (magic circles) guides the rune circle and glyph visuals.

## Who does what

| ID | Owner | Task | Files |
| --- | --- | --- | --- |
| 0 | Codex | git init, baseline commit, GitHub repository, commits and pushes from then on | `.git`, `.gitignore` |
| A | Claude | Rules engine, bot, unit tests | `src/duel/types.ts`, `src/duel/engine.ts`, `src/duel/bot.ts`, `src/duel/*.test.ts` |
| B | Claude | Duel screen, reveal animation, trial select | `src/duel/DuelScreen.tsx`, `src/duel/duel.css`, `src/main.tsx` |
| C | Claude and user | Moodboard, hero image, art set in ChatGPT | `public/assets/` |
| D | Codex | Code-drawn faces for stones, glyphs and the card back | `src/duel/faces.tsx`, `src/duel/faces.css` |
| E | Codex | Procedural sound effects (Web Audio) and a mute toggle | `src/duel/sfx.ts` |
| F | Codex | Static hosting config and deploy guide (no account actions) | `vercel.json` or `netlify.toml`, `docs/DEPLOY.md` |
| G | Codex | Rewrite the submission copy and the clip shot list for the duel | `docs/SUBMISSION_DRAFT.md` |
| H | Codex (after B) | Browser smoke test that plays one full duel | `tests/duel.spec.ts` |

Codex works only in its own files. Shared types live in `src/duel/types.ts`, which Claude owns; ask before changing it.

## Schedule (Lagos time)

| When | Claude | Codex | User |
| --- | --- | --- | --- |
| Nov 3 evening | A; start the moodboard | D, E, F | Pick the art direction |
| Nov 4 | B; hero image, then the art set | G; H once B lands | Approve art; find 2 or 3 playtesters |
| Nov 5 | Balance from playtests, polish, integrate | Deploy check, smoke test | Connect the hosting account; record the clip |
| Nov 6 by 12:00 | Final checks | | Post on X, submit the form |

## Fallback

The current First Trial build stays in `src/App.tsx` until the duel replaces it in `src/main.tsx`. If the duel isn't ready on November 5, we ship the First Trial.
