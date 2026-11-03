# The Last Constant

A local, playable mathematical-magic card battler. One complete encounter: **The First Trial**.

The intended product is **PvP with a bot alternative**. The user deferred the two-player engine for now; the current milestone remains the solo teaching encounter and its presentation. See `docs/PVP_DESIGN.md` for the future duel roadmap.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the Vite URL, normally http://127.0.0.1:5173. The game needs no accounts, server-side services, API keys, or network requests after loading local assets.

```sh
npm test
npm run build
npm run preview
```

The browser verification checklist and results are recorded in `docs/HANDOFF.md`.

New players can choose **Start playing with hints**, use **Find this control**, and reveal a safe route if needed. Hints remain optional. Defeat includes a guided retry. Guard breaks, charge cancellation, and exposed timing now have feedback based on actual resolved combat events.

## Play

Select a formula card, choose a geometry, set x, and cast. Triangle attacks the selected enemy, Circle attacks every living enemy and breaks defenses, Square creates shields. Each turn grants 6 Ink. Defeat Magister Veyra to win.

Copper blocks 4 damage from focused attacks on Veyra until you break the link with Circle or destroy Copper. Ivory charges a dangerous strike: deal 6 health damage during its charging turn to interrupt. Veyra cycles through Warding, Channeling, and Exposed; Triangle gets +4 against her while exposed. The preview accounts for guard, wards, exposed bonuses, and interruptions. The spellbook explains the exact rules. Replay resets the trial.

For a deterministic balance probe, run `node scripts/simulate-trial.mjs` (Node 22.18+), optionally with `--trace`. It compares blind examiner attacks, construct removal, Circle/interruption, and defensive strategies.

## Artwork and handoff

Drop the four named PNG portraits from [docs/ASSET_PROMPTS.md](docs/ASSET_PROMPTS.md) into `public/assets/`. They replace original vector placeholders on the next rebuild. No paid image APIs were used.

After adding or replacing a PNG, run `npm run optimize:art` (needs Python with Pillow). It writes a resized `.webp` beside each PNG, which the game loads instead of the multi-megabyte source.

Begin with the [two-image first art batch](docs/art-batch-01/README.md). Run `npm run check:art` to check supplied PNG filenames, structure, dimensions, and transparency-channel warnings. Missing assets remain valid placeholder mode; `npm run check:art -- --require-core` adds a presence gate for the four portraits and battlefield before a full-art review. This is a technical preflight, not visual approval.

- [Game bible](docs/GAME_BIBLE.md)
- [Art bible](docs/ART_BIBLE.md)
- [Handoff and verification](docs/HANDOFF.md)
- [Artwork prompts](docs/ASSET_PROMPTS.md)
- [Verified competition brief](docs/COMPETITION_BRIEF.md)
- [Submission copy and actual-gameplay footage plan](docs/SUBMISSION_DRAFT.md)
