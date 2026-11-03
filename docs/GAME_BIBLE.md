# The Last Constant

A fantasy card battler where equations become spells and geometry determines how they behave.

## World

The world's great equations are unraveling. The Academy of the Constant trains mathematicians to repair them through spellcraft. The player is an adult apprentice earning a first academy seal. Magister Veyra examines the apprentice with two practice constructs. Her formal restraint hides concern for the world's instability.

Mathematics is the language of magic. Geometry is its architecture. Equations are its instructions.

## The First Trial — tactical rules

**Product scope:** The intended game is human PvP with a bot alternative. The First Trial below is the currently implemented solo tutorial. Human duel rules and transport are not implemented yet; see `PVP_DESIGN.md`. Do not present the examiner's scripted cycle or public intentions as an opponent human's rules or private decisions.

Win by reducing Veyra's 42 HP to zero. The apprentice has 36 HP; Copper has 12 HP; Ivory has 18 HP. Destroying constructs is optional, but their abilities make target selection important. A spell that defeats Veyra ends combat immediately.

### Cards, Ink, and arithmetic

12 unique cards, four of each formula family: Twin Ember (2x), Rising Star (x²), Kindled Axiom (x + 2). Choose x = 1, 2, or 3. Formula output is calculated. x=1 favors additive efficiency; x=3 favors quadratic bursts. All families still produce 4 at x=2; tactical context supplies the depth.

Start with three cards and 6 Ink. Each new turn restores 6 Ink and draws up to three cards, retaining unplayed cards. Once per turn, spend 1 Ink to draw an extra card; hand limit five. Played cards enter discard, which reshuffles when the draw pile empties. Seed 2026 makes the encounter reproducible. No fatigue or save system.

| Geometry | Base effect | Cost | Tactical use |
| --- | --- | --- | --- |
| Triangle | energy + 2 damage to one living enemy | x | Focus a target; gains +4 against exposed Veyra |
| Circle | ceil(energy / 2) damage to each living enemy | x + 1 | Shatters all enemy shields before damage; disables Copper's guard for this turn |
| Square | energy + 3 player shield | x | Survive the examiner's heavy attack and other incoming damage |

### Copper's guard link

While Copper lives and its link has not been broken this turn, each Triangle attack on Veyra loses 4 damage, to a minimum of zero. It does not block damage to constructs or Circle spells. Circle breaks the link until the next turn; Copper restores it automatically if alive. Defeating Copper removes it permanently. Copper attacks for 3 each turn.

### Ivory's interruptible charge

Ivory attacks for 3 on ordinary turns. During Veyra's Channeling turn it prepares a 10-damage charged strike. Deal 6 cumulative **health damage** to Ivory during that player turn to interrupt: its intent becomes Interrupted and it does not attack. Damage from prior turns and damage absorbed by shields do not count. Circle and Triangle can both contribute. Killing Ivory also prevents its attack. Progress resets next turn; a surviving Ivory can charge again in the next cycle.

### Veyra's cycle

| Turn in cycle | Stance | Enemy action | Player opportunity |
| --- | --- | --- | --- |
| 1, 4, 7… | Warding | Gains 5 shield | Prepare, attack constructs, or break the guard; heavy damage follows |
| 2, 5, 8… | Channeling | Attacks for 12; Ivory charges for 10 | Interrupt Ivory, shield against Veyra, or risk a finishing attack |
| 3, 6, 9… | Exposed | Attacks for 4 | Triangle gains +4 against Veyra; break any surviving Copper link to exploit the full bonus |

With both constructs alive, incoming damage is 6 / 25 / 10 across the cycle. Interrupting Ivory reduces Channeling pressure to 15. A guarded x=2 Triangle deals 2 to Veyra normally; during Exposed it deals 6 because +4 and −4 cancel. Breaking the link makes that exposed spell deal 10.

### Veyra's seal (solving for x)

Each turn Veyra shows a seal number, cycling 5, 9, 6, 3, 2, 1. A Triangle or Circle spell whose energy equals the seal exactly resonates: +4 damage to Veyra (after guard/exposed, before wards). The spell panel writes the equation, such as `2x = 6`, and says when no x from 1–3 solves it, so the player solves for x instead of only substituting. Seals avoid 4, which every formula makes at x = 2.

### Character cards

The 12-card deck is six original characters, two copies each. Each family has a common face and a rarer one: Twin Embers (common) and Lyra Vale (rare) cast 2x; Sorrel (common) and Archmage Quadra (legendary) cast x²; Tobin (common) and Bramble (rare) cast x + 2. Characters share their family's formula for now; per-character twists are a later set. Art loads from `public/assets/card-<id>.(webp|png)`, in a painterly gouache-on-white style chosen on November 3 (`docs/style-tests/`). The Cards button opens the collection.

### Resolution order and preview

End Turn locks player input. After a one-second presentation beat, living enemies act left to right: Copper, Veyra, Ivory. Interrupted enemies skip their action. Player shields absorb damage before health, stack within a turn, and expire at the next player turn. Enemy shields persist until consumed or shattered.

Triangle damage order: base amount, exposed bonus if applicable, guard reduction, enemy shield absorption, health loss clamped at zero. Circle shatters shields before its damage; it opens the guard for later spells in the same turn. The engine's `previewCast` plan drives resolution and UI: modifiers, ward absorption, real health damage, and whether surviving Ivory will be interrupted. Lethal damage is shown as health loss, without extra overkill.

## Balance observations

Deterministic probes on the starter seed: blind repeated x=2 Triangle attacks on Veyra lose on turn 3 with her at 17 HP. Prioritizing construct removal wins on turn 4 at 17 player HP. A Circle/interruption route wins on turn 4 at 5 player HP while both constructs survive. A shield-heavy adaptive route wins on turn 7 at 31 HP. These are scripted legal routes, not evidence of human enjoyment or finalized difficulty.

The 5–10-minute novice target needs fresh-player playtesting. Expert routes remain short. Avoid making one prescribed sequence mandatory; reward reading intentions and trading speed against health. No new content or complicated formula parsing is needed for this pass.

## Presentation and terminology

The current interface is a temporary gameplay shell. Bespoke artwork will determine the final background and UI; preserve tactical information when replacing its appearance.

Ink: casting resource. Energy: formula result. Inscription: formula inside geometry. Guard link: Copper's focused-damage protection. Ward: enemy shield. Interrupt: cancel Ivory's current charged attack. Exposed: Veyra's vulnerable turn. A proof: a completed spell or successful trial.
