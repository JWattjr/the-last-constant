# Handoff — The Last Constant

## Runnable state

Milestone-one browser game implemented in the initially empty workspace. Install with `npm install`; run `npm run dev`; open the printed Vite URL, normally `http://127.0.0.1:5173/`. `npm run build` creates a static `dist/`; `npm run preview` serves that build. Node 20.19+ or 22.12+ is required by Vite 7. Dependencies are already installed on this machine and exact versions are locked. No API keys, backend, database, accounts, deployment, blockchain, or competition submission.

## Implemented

- Three-step introduction with skip and an in-battle rules spellbook.
- The First Trial: 36-HP apprentice, 42-HP examiner, two 12-HP constructs.
- 12-card seeded deck, four of each formula; three-card initial hand; retention, refill, extra draw, discard, reshuffle, pile counts.
- Deterministic formula arithmetic: 2x, x², x + 2; x = 1/2/3. Shared preview and resolution calculation.
- Triangle focused attack, Circle area damage, Square shield; target selection, transparent modifiers and Ink cost.
- 6 Ink per turn; public attack/ward intentions; ordered enemy AI; player shield expiry and persistent enemy wards.
- Procedural SVG geometric inscription; original SVG portrait stand-ins, formula art and icons; 850ms cast feedback; damage flashes; health transitions; enemy-turn input lock.
- Victory and defeat dialogs with turn/spell/damage metrics; clean replay that skips the intro.
- Battle log; live status; disabled/input feedback; keyboard controls; dialog focus trap; reduced-motion styles.
- Desktop landscape layout; phone layout verified down to 375px viewport. Fonts bundled locally with licenses.
- Optional PNG portrait substitution by exact filename, with no failed requests for absent optional art.

## Verification

Checked on November 2, 2026. All 15 Vitest tests passed; strict TypeScript compilation and Vite production build passed. See `src/game/engine.test.ts` for executable tests. Unit coverage includes all 27 formula/variable/geometry combinations, explicit readable substitution (2 × 2 rather than concatenated digits), exact costs and results, initial deck composition and reproducibility, immutable state transitions, focused damage, area damage excluding dead enemies, shield absorption and expiry, enemy wards, optional draw once per turn, invalid action rejection, card conservation across nine turns/reshuffles, dead-construct AI, complete legal victory, complete defeat, terminal input locks, and fresh restart state.

### Actual browser checks

Used connected local Chrome through the available browser tools against the Vite server. The in-app browser could not reach Windows loopback, so testing continued in Chrome. No page or engine state was injected.

| Check | Observed result |
| --- | --- |
| Introduction | All three steps advance and Enter the First Trial opens battle |
| Initial state | 36 HP, 6 Ink, 3 cards, 9 in deck, turn 1, all intentions visible |
| Formula selection and keyboard | Rising Star can be selected with Enter; aria-pressed becomes true |
| x², x=3, Circle | Preview shows 5 damage to each living enemy, cost 4 Ink |
| x², x=3, Square | Preview shows 12 shield, cost 3 Ink |
| Extra draw | Hand 3→4, Ink 6→5, draw locks until next turn |
| Square cast | 12 shield gained, Ink 5→2, selected card enters discard |
| Additive Circle, x=1 | 2 damage to all three; HP becomes 10 / 40 / 10 |
| Enemy turn | 12 shield absorbs all turn-one damage; apprentice remains at 36 HP; turn 2 restores 6 Ink, draws to 3, shield expires |
| Full victory | Above opening followed by legal Triangle x=2 casts wins on turn 4; result shows 10 spells, 46 health damage dealt |
| Full defeat | Fresh trial, three End Turns with no casts reaches defeat on turn 3 at 0 HP |
| Replay | Restores 36 HP, 6 Ink, 3 cards, turn 1; result/selection/metrics reset |
| Spellbook | Opens rules; Escape closes; focus returns to its button |
| Responsive capture | Full-page renders at desktop 1718px and 1440px; phone 390px and 375px; no horizontal overflow observed |
| Application console | No errors originating from the game URL. Existing wallet-extension injection errors appear in the normal Chrome profile; the game has no wallet code |
| Production build smoke | Served `dist/` with `npm run preview` on4173. Intro/skip, x² Triangle cast, enemy turn, and refill worked: examiner36HP, apprentice24HP, 3cards, 6Ink, turn2. No game-origin console errors |

Screenshots are under `.impeccable/review/`: `desktop.png`, `desktop-1440.png`, `mobile.png`, `mobile-375.png`, `user-1718.png`. A turn-banner overlap with examiner health was found and corrected; final captures show the full health label. The design detector found width-animation overhead on health bars; this was replaced with transform-based scaling. Selected formula and struck target are preserved through cast feedback after a card is consumed or an enemy dies.

## Architecture

`src/game/engine.ts`: combat types, data, seeded shuffle, initial encounter, formula evaluation, preview, intents, reducer. Only this module owns combat rules.

`src/App.tsx`: battle reducer ownership, geometry/variable/card/target selection, intro/rules/results, UI sections, one enemy-resolution effect and cleaned-up presentation timer. App remounts Trial on replay.

`src/components/Art.tsx`: SVG icons, procedural Sigil, formula art, replaceable portraits. `src/styles.css`: design tokens, responsive layouts, animation and reduced-motion rules. `src/main.tsx`: StrictMode entry.

Read `DECISIONS.md` for tradeoffs and `GAME_BIBLE.md` for exact balance rules.

## Known limitations and next priorities

1. **Replace placeholder portraits.** Generate the four original assets in `ASSET_PROMPTS.md` through the user's browser workflow. No image API was invoked or credits spent. Final anime illustration quality is not delivered by vector stand-ins. Drop files into `public/assets/` and rebuild.
2. **Balance and playtest.** A solved focus-only x=2 route wins in roughly four turns. This is shorter than the initial 5–10-minute aspiration and makes area/defense optional. Gather fresh-player feedback before altering enemy HP, construct pressure, shield incentives, or formula costs. Preserve the shared preview/resolution source.
3. **Improve phone legibility.** Essential controls work, but flavor text, formula school labels, intent names, and arithmetic annotations are intentionally compact. Intent names hide on phones while attack/shield icons and amounts remain. Expand typography through a dedicated mobile pass if phones become a primary competition target.
4. **Polish sequential enemy feedback and optional sound.** Current AI resolves in one deterministic reducer action after a one-second beat; individual attack sequencing, richer impact effects, and audio are not implemented.
5. **Distribution and competition work.** Run a fresh production smoke pass with final assets, decide hosting, record a concise gameplay demo, and verify actual competition requirements. No competition rules, eligibility, deadline, license requirements, or submission process were independently researched in this build. No form has been submitted and no repository visibility changed.

No known blocker prevents completing the encounter. Cross-browser testing beyond desktop Chrome and viewport emulation remains outstanding. No real-device, screen-reader, or automated accessibility conformance audit is claimed. Battle state intentionally resets on reload; there is no save feature.

## Review status

The fresh finish reviewer returned **ship** for all four scored fixes: phone arithmetic legibility, shield placement, variable touch targets, and explicit multiplication display. All were marked resolved. Final phone arithmetic is11px; variable buttons are44×44px. See `DESIGN.md`, `.impeccable/design.json`, and `.impeccable/review/REVIEW.md` for documentation and the scoped verdict.
