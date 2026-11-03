# Instructions for Codex

You're helping build **The Last Constant**, a maths-learning collectible card game, for the Loadout AI Game Competition (entries close November 6, 2026 at 16:00 Lagos). Read `docs/REBUILD_PLAN.md` first: it holds the rules, the screen layout, the schedule and who owns which files.

## Hard rules

1. **Never generate images yourself.** Every image must be made by prompting ChatGPT in the user's Chrome. If a task needs an image, write the prompt into `docs/ASSET_PROMPTS.md` and tell the user. Don't call any image-generation tool or API.
2. **Touch only the files your task lists.** Claude owns `src/duel/types.ts`, `src/duel/engine.ts`, `src/duel/bot.ts`, `src/duel/DuelScreen.tsx`, `src/duel/duel.css`, `src/main.tsx` and everything under `src/game/`. Import from them freely, but don't edit them. If you need a change there, describe it in your final message.
3. **Keep it original.** No names, characters, symbols or designs from Witch Hat Atelier or any other existing franchise.
4. **No new runtime dependencies** without asking the user. Dev dependencies for tests are fine.
5. **Before you finish,** `npm test` and `npm run build` must both pass. Report the actual output.
6. **Limited outward actions.** You own git and GitHub for this project (task 0), so committing and pushing to the project's own repository is allowed. Don't create other accounts, deploy, or post anywhere. For those, prepare everything and give the user the exact steps.

## Stack

React 19, TypeScript (strict), Vite 7 and Vitest. Plain CSS, no UI library. **Visual direction is Risograph pop** (see the Art section of `docs/REBUILD_PLAN.md` and `docs/moodboard/C-risograph-pop.jpg`): only four flat spot inks, Fluorescent Pink `#FF48B0`, Teal `#00838A`, Yellow `#FFE800` and Federal Blue `#3D5588`, on paper `#F6F1E7`. Use overprint colours where inks overlap (for example pink over yellow for orange, using `mix-blend-mode: multiply`), halftone dots and grain (SVG patterns or filters), and slight misregistration (an offset duplicate layer). No gradients or soft shadows.

## Your tasks

### 0: Git and GitHub (do this first, before any other task)

The user asked you to own version control, because Claude and you both edit this folder.
1. `git init` in the project root, check `.gitignore` (it must exclude `node_modules/`, `.npm-cache/`, `dist/` and `*.tsbuildinfo`), and make one baseline commit of the current state: "Baseline: First Trial build, duel engine, rebuild plan".
2. Ask the user whether the GitHub repository should be public or private (recommend private until the submission, then decide), and what to call it (suggest `the-last-constant`). Create it with the `gh` CLI under the user's account and push `main`.
3. From then on, commit after each of your tasks with a clear message. When the user or Claude asks for a checkpoint, commit everything that's changed, including Claude's files, with a message saying what changed. Push after each commit.
4. Never rewrite history (no force-push, rebase or amend on pushed commits), and never commit secrets or files over 50 MB.

### D: Code-drawn card faces (`src/duel/faces.tsx`, `src/duel/faces.css`)

Export `StoneFace({ value }: { value: number })`, `GlyphFace({ op }: { op: '+' | '-' | '*' })` and `CardBack()`. Each renders the inner face of a 2:3 card, filling its parent at 100% width and height, using SVG and CSS only.
- **Stone:** a chunky, slightly lumpy pebble shape in one riso ink with a halftone shadow, the numeral large and bold in Federal Blue with a misregistered pink offset, and that many small dots arranged around it (like dice pips) so younger players can count. Each value from 1 to 9 gets its own pebble shape and ink.
- **Glyph:** the operator as a bold stamped riso symbol inside a geometric circle (in the spirit of `docs/moodboard/D-glyphs-and-magic-circles.jpg`, but simple and original). Show `−` and `×` as the real symbols, never `-` or `*`.
- **Card back:** a two-ink riso pattern: a repeating geometric glyph (triangle, circle and square strokes) in Teal over a Pink halftone field, framed by a thick Federal Blue border.
- Add `aria-label`s ("Number stone 7", "Glyph: times"), and respect `prefers-reduced-motion`.
- Add a test `src/duel/faces.test.tsx` checking that the labels render (add `@testing-library/react` and `jsdom` as dev dependencies if needed).

### E: Sound effects (`src/duel/sfx.ts`)

Procedural Web Audio only, no audio files. Export `play(name)` for `'place' | 'remove' | 'cast' | 'flip' | 'win' | 'lose' | 'resonance' | 'damage'`, plus `setMuted(boolean)` and `isMuted()`. Remember the mute setting in `localStorage` inside try/catch. Create the AudioContext lazily on first use. Sounds should be short (under 600 ms), soft and musical: paper and chime sounds, not arcade beeps. `resonance` should be a bright rising chord.

### F: Hosting setup (`vercel.json` or `netlify.toml`, `docs/DEPLOY.md`)

Static Vite build (`npm run build` produces `dist/`). Pick Vercel or Netlify, add the config, and write `docs/DEPLOY.md` with exact click-by-click steps for the user to connect an account and deploy, plus a fallback using GitHub Pages. Check that `npm run build` and `npm run preview` work. Don't log in anywhere or deploy.

### G: Submission copy (`docs/SUBMISSION_DRAFT.md`)

Rewrite it for the equation-duel game described in `docs/REBUILD_PLAN.md`. Include a one-line pitch under 120 characters, an "How did you use AI?" answer that is honest (Claude and Codex wrote the code, and ChatGPT made the art from our prompts), a development-plan paragraph (PvP, collection and trading, the level ladder to Algebra 1), and a 20 to 30 second clip shot list that ends on a Resonance hit. Describe only what the build actually does.

### H: Browser smoke test (`tests/duel.spec.ts`), only after `src/duel/DuelScreen.tsx` exists

Use Playwright as a dev dependency with an `npm run test:e2e` script. Start the dev server, pick Trial I, then play rounds by clicking a stone and Cast until the duel ends. Assert that a victory or defeat dialog appears and that the console shows no errors.
