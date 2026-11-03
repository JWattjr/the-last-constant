# Handoff — competition, guidance, and combat-feedback pass

## Current state

**Latest scope decision:** The intended product is human PvP with a bot alternative, but the user deferred the two-player engine and asked to continue the existing First Trial/presentation work. Human play is not implemented. No online-versus-shared-device question is pending, and networking is not part of this pass. `PVP_DESIGN.md` records future design notes; current competition copy must describe only the actual solo slice.

The playable First Trial now has guard-breaking, an interruptible charged strike, and a three-turn examiner cycle. The user tested milestone one and found it too simple, then authorized this tactical pass. The visual interface remains a temporary gameplay shell: bespoke artwork will later determine the backgrounds, UI, frames, and presentation. No image generation, art spending, deployment, or submission occurred.

The user then approved the winning route and authorised the next pass with the Loadout competition in mind. This pass adds optional state-aware opening hints, a discoverable safe route during play and after defeat, real guard/interrupt/exposed feedback, and a coherent art-production and submission plan. The official rubric and deadline were verified in the browser: see `COMPETITION_BRIEF.md`. The current game remains local; the footage and entry text in `SUBMISSION_DRAFT.md` are preparation, not a published post or submission.

Dependencies are installed. Run `npm run dev` for the local game; `npm test` for rules tests; `npm run build` for a strict TypeScript check and static `dist/` output; `npm run preview` to serve production. No backend, accounts, database, network APIs, or keys. Vite requires Node 20.19+ or 22.12+. The optional direct TypeScript balance probe needs Node 22.18+: `node scripts/simulate-trial.mjs`, with `--trace` for individual moves.

The original implementation and verification history is preserved in `HANDOFF_MILESTONE_1.md`. Its enemy values and old winning route are historical and superseded by this file and `GAME_BIBLE.md`.

The immediate next art task is now packaged as two copy-ready prompt files in `docs/art-batch-01/`: Veyra, then the matching battlefield. No finished images are in `public/assets/` yet. `npm run check:art` performs a local filename/PNG-header/dimension/transparency-channel preflight; it accepts missing assets in placeholder mode. `--require-core` additionally gates on all four portraits and the background. It does not decode images, prove actual transparent pixels, inspect contrast, or validate usage rights; real asset review is still required.

## New rules

- Copper has 12 HP and attacks for 3. While alive, its guard subtracts 4 from every Triangle attack on Veyra. Circle breaks the link for the current turn; killing Copper removes it permanently.
- Ivory now has 18 HP. It normally attacks for 3, but prepares a 10-damage charge during Channeling turns. Deal 6 cumulative health damage to it during that turn to interrupt. Prior-turn damage and ward absorption do not count. Its visible intent becomes Interrupted and incoming damage updates immediately.
- Veyra has 42 HP and cycles Warding (gain 5 shield), Channeling (attack 12), Exposed (attack 4; Triangle gains +4 against her). The cycle repeats every three turns.
- Circle shatters all enemy wards before dealing its normal area damage. Square retains its normal shields, now useful against the heavy turn.
- Base formulas, x choices, casting costs, 6 Ink, 12-card starter deck, three-card refill, extra draw, card retention, discard/reshuffle, player shield expiry, replay, and outcomes are preserved.
- The preview includes guard/exposed modifiers, enemy ward absorption or shattering, actual health loss, and interruption prediction. Square previews health at risk after casting. Enemy plaques, the stance cycle, and a short tactical hint explain the current problem. Intro and spellbook are updated.

## Architecture changes

`src/game/engine.ts` remains the single combat authority. `preview` handles base arithmetic; new `previewCast` produces contextual impact plans used by both UI and actual casts. The engine adds `guardBroken` and `chargeDamage`, reset on turn transitions, plus a `stunned` enemy intent skipped during resolution. Veyra's stance is derived from turn number. `enemyStatus`, `incomingDamage`, and `tacticalHint` derive presentation information without duplicating combat state.

`src/App.tsx` renders the plan and tactical cues. Hand count grammar and cast feedback remain readable. Existing character placeholders and SVG sigils are preserved. `src/styles.css` only extends the temporary shell enough to fit mechanics and maintain phone usability. `scripts/simulate-trial.mjs` compares four deterministic legal policies without changing game state or dependencies.

`src/game/guidance.ts` derives nonbinding advice from battle/selection; `src/components/GuidedOpening.tsx` renders hints and the expandable verified route. “Find this control” scrolls and focuses the actual control after a user click. Header hints can be disabled or re-enabled. Replay retains the hints setting and defeat offers “Try with hints.”

The engine now records resolved `CombatEvent` data in `Battle.lastEvent`: actual health loss, wards, shield gains, guard duration, charge cancellation, and exposed transitions. `src/game/feedback.ts` derives short messages; `App` shows banners, damage numbers, a snapped guard link, a collapsing charge ring, and exposed emphasis. Events do not alter rules, and drawing does not replay old events. Feedback timers clean up and reduced-motion preferences remove decorative movement.

`src/artwork.ts` centralises optional PNG detection. Four portraits, `academy-battlefield.png`, and three `formula-*.png` panels can replace their placeholders on rebuild. The expanded prompt kit also specifies frames, desk, and button skin; those require fitting after real files exist. A tiny isolated technical PNG verified that a nonempty Vite artwork registry builds; the fixture was removed. No final generated artwork is present or visually verified.

## Verification — November 2, 2026

39 Vitest tests pass: 27 combat tests, 7 guidance tests, and 5 resolved-feedback tests. Coverage includes 81 contextual formula/geometry/variable/stance combinations, resource/deck/terminal invariants, guard timing, permanent removal on death, ward shattering, exposed modifier order, cumulative interruption, repeated charge cycles, two winning strategies, optional advice with no combat side effects, focus-target derivation, actual/clamped effect values, and event-id stability. The former repeating x=2 boss-attack route is a losing regression case. Strict TypeScript and the production build pass.

### Additional competition-pass browser checks

- “Start playing with hints” enters a fresh real encounter. The coach points to a formula, geometry/x choice, target, and Cast as appropriate. “Find this control” focused the actual Rising Star card and then Copper; keyboard Enter selected both.
- The safe-route disclosure contains the tested four-turn sequence and can be closed. Hints-off removed the entire guide; re-enabling restored it.
- The guided construct-removal route won on turn 4 with 11 spells and 72 total health damage. The same deterministic policy retains 17 player HP in the balance probe.
- Copper's death produced “Guard link severed,” a real −6 health value, a dispelled marker, and the next lesson. Ivory's interrupt produced “Charge interrupted”; with Copper already dead, incoming damage changed to 12. The next enemy turn produced the real Exposed cue and reported 12 actual health lost.
- Ending turns without action reached defeat. Its safe route opened inside the result dialog. “Try with hints” restored 36 HP, turn 1, and the initial guide.
- Guided layout captured at 1440px desktop and 375px phone; no phone horizontal overflow observed. Screenshots: `guided-opening-desktop.png`, `guided-opening-phone.png`, `guard-severed.png`, and `charge-interrupted.png` under `docs/screenshots/`.
- Existing tactical playthrough checks below remain valid. No generated art, screen recording, public deployment, X post, or entry submission is claimed.
- Production smoke: served the final `dist/` bundle on port 4173, entered guided play, cast two real spells to defeat Copper, and observed the resolved guard-break cue and next lesson. No game-origin console errors. The full intro's “Play without hints” branch also entered correctly with guidance disabled.

Actual connected Chrome playthroughs used rendered controls without state injection:

| Check | Observed result |
| --- | --- |
| Guard preview | x² at x=2, Triangle on Veyra: 2 damage, with Guard −4 explained |
| Circle on Channeling turn | Removed Veyra's 5 ward before 5 health damage; opened guard; Copper and Ivory also took 5 |
| Interrupt preview and cast | Triangle on charging Ivory predicted an interrupt; cast changed its intent to Interrupted and incoming damage from 25 to 15 |
| Exposed timing | x=2 Triangle showed 6 damage with Copper's guard, then 10 after Circle broke the link |
| Complete tactical victory | Circle, interruption, and exposed opening won on turn 4 with 10 spells, 62 total health damage, and both constructs alive |
| Defense | Square shield opening blocked all 6 initial incoming damage; interrupt plus 14 shield during Channeling predicted 1 health lost and left the player at exactly 35 HP after resolution |
| Old rush loses | Nine repeated x=2 Triangle casts on Veyra lost on turn 3, with Veyra still alive |
| Replay and help | Replay restored guard, turn 1, 36 HP, fresh cards; spellbook includes new exact rules and Escape closes it |
| Desktop and phone | Full-page layout inspected at 1440px desktop and 390px phone; no horizontal overflow in the 390px or 375px checks |
| Application console | No errors originating from the local game URL during the tactical playthroughs |

Captures: `docs/screenshots/tactics-desktop.png`, `tactics-phone.png`, and `tactics-exposed.png`. The exposed capture shows the actual 10-damage preview after breaking the link. Prior `.impeccable/review/` images and verdict describe the initial shell, not a new tactical design review.

### Deterministic balance probe results

| Policy | Outcome | Turn | Player HP |
| --- | --- | --- | --- |
| Blind examiner rush | Defeat | 3 | 0 |
| Dismantle constructs | Victory | 4 | 17 |
| Circle and interrupt | Victory | 4 | 5 |
| Shield and adapt | Victory | 7 | 31 |

The probe and browser tactical route use different legal spell ordering; both demonstrate the same tradeoff between speed and safety. These results do not establish human enjoyment or final balance.

## Remaining work

Competition priorities are now tied to the verified [official rubric](https://app.loadout.xyz/jam#rules): gameplay 40%, originality 25%, execution 20%, development plan 15%; entries close November 6 at 16:00 Lagos time. Start with the full plan in `COMPETITION_BRIEF.md` and capture/submission draft in `SUBMISSION_DRAFT.md`.

1. Playtest fresh players: assess whether guard, interrupt progress, exposed timing, and exact preview are understood without coaching. Measure difficulty and duration before adding mechanics. Expert routes remain short; the 5–10-minute novice aspiration is unverified.
2. Let bespoke art drive the final interface. Generate the four portraits from `ASSET_PROMPTS.md` through the user's browser workflow, then plan background/UI/frame artwork. The current palette, layout, and old design sidecar are references, not approved final visual authority.
3. Tune individual cards only if players still ignore x=1 and x=3. All formulas intentionally match at x=2; this pass adds decisions through enemies and geometry rather than extra arithmetic complexity.
4. Sequential enemy animations, optional audio, real-device testing, screen-reader validation, broader browser support, and final-art production smoke testing remain outstanding.
5. Hosting, competition research, a demo recording, and submission are separate future work. No repository was published and no form was submitted.

No known blocker prevents completing the encounter. Battle state intentionally resets on reload. Read `GAME_BIBLE.md` for current rules and `DECISIONS.md` for engineering decisions.
