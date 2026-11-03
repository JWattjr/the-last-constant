# The Last Constant

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
React + TypeScript + Vite, explicitly requested for an empty workspace.

## Users
Players and competition judges trying a playable fantasy trading-card prototype in a browser.

## Product Purpose
Build a **PvP mathematical card battler**, playable against another person or against a bot. The First Trial is the currently implemented solo tutorial/vertical slice, where an apprentice defeats an academy examiner. The user clarified the broader product direction after the initial competition/onboarding pass.

## Positioning
Mathematics is the language of magic; geometry is its architecture; equations are its instructions. A chosen formula, variable, and geometry determine every spell.

## Capabilities and Constraints
12-card deck; three-card starting hand; 2x, x², x + 2; x = 1, 2, 3; triangle, circle, square; Ink, shields, deterministic combat, introduction, replay. Desktop landscape first, usable on small screens. The intended product is PvP with a bot alternative, but the user explicitly deferred the two-player engine and asked to continue the current First Trial/presentation work. Do not start networking or shared-device multiplayer as part of this milestone. Accounts, blockchain, and unnecessary infrastructure remain out of scope. Local runnable milestone; no publication requested. Preserve original artwork and worldbuilding. No paid image generation or image-credit use; artwork prompts and placeholders until user supplies assets.

## Brand Commitments
Original mathematical fantasy. Premium anime card presentation and learned geometric spellcraft. Referenced works inform quality, never copied characters, frames, or symbols.

## Evidence on Hand
User build brief. Initially empty workspace, with no existing repository or artwork.

## Product Principles
Playable battle before extra features. Preview real arithmetic. Make choices legible. Keep rules separate from presentation. Document handoff and outstanding asset work.

## Confirmed Interpretation
User answered "Proceed with this interpretation": warm parchment-and-ink academy arena with teal spellwork, short guided introduction, tactical 5–10 minute battle target. Actual prototype length must be measured through playtesting; a solved aggressive route is shorter.

## Later Clarifications
The user clarified that bespoke visual art will eventually define the background, UI, frames, and overall presentation. The current interface is a temporary gameplay shell, not a commitment to final visual direction. Impeccable may support usability; it does not drive the game's visual identity.

After playtesting the first build, the user found gameplay too simple and authorized tactical depth: Copper protects the examiner, Ivory has an interruptible charged strike, Veyra cycles through warding/channeling/exposed turns, and geometry has tactical uses. Keep arithmetic accessible and all effects visible before casting.

After following a verified winning route, the user approved the gameplay and authorised optional guided onboarding, rewarding combat feedback, and a bespoke art-production plan, explicitly aligned to the Loadout competition. The official rubric and deadline are recorded with source and date in `docs/COMPETITION_BRIEF.md`. Preparing a submission draft does not authorise posting, submitting, changing visibility, or spending image credits.

The user then clarified that the core game is PvP with a bot alternative. Future work must use one duel ruleset for both human and bot players, preserve private hands, and treat examiner-specific scripts as tutorial content. Current code implements the solo encounter only; human-versus-human play is not yet implemented. After considering the options, the user deferred the two-player engine and asked to continue the existing work. See `docs/PVP_DESIGN.md` for the future architecture; it is not an active implementation request.
