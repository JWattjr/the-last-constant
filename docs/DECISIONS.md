# Technical decisions

## Runtime and scope

Empty workspace initialized with React 19, TypeScript 5.9, and Vite 7. Browser-only static app; no accounts, backend, persistence, API keys, or blockchain. TypeScript strict build and Vitest cover meaningful combat invariants. Dependencies are locked in `package-lock.json`. The initial workspace was not a Git repository; no remote, commit, or visibility setting was created.

## Combat state

`src/game/engine.ts` owns all combat truth. `Battle` contains player, enemies, cards, turn, phase, metrics, log, and PRNG seed. `battleReducer` returns a new state for valid actions and the original state for invalid actions. React's one reducer instance owns this state; selection and presentation state remain local UI concerns. No effect computes damage.

`evaluate` computes formulas; `preview` computes base cost and geometry modifiers; `previewCast` produces a contextual plan including guard, exposed bonus, shield absorption/shattering, actual health damage, and interruption. The UI and reducer both consume that same plan. This initial formula vocabulary is a closed TypeScript union rather than evaluating user-supplied strings. No `eval` or arbitrary expression parser.

## Turn boundaries

End Turn changes phase to `enemy` immediately. UI locks input and schedules one `resolveEnemies` action after 1000ms. The reducer guards phase, so duplicate resolutions and casts during enemy turns cannot apply. The effect cancels on unmount. Cast feedback lasts 850ms and does not delay rules resolution. Replay remounts the trial component with a new key and cancels outstanding timers; intro is omitted on replay.

## Determinism

The tactical pass adds `guardBroken` and `chargeDamage` to combat state. The former resets each turn while Copper lives; the latter measures actual health damage during Ivory's charging turn. Interruptions change its intent to `stunned`, which the normal enemy resolver skips. Veyra's stance is derived from turn number, so it cannot drift from her public intent. `enemyStatus`, `incomingDamage`, and `tacticalHint` derive UI information from combat state without storing duplicate values.

A local LCG and Fisher–Yates shuffle use seed 2026. Seed is stored in battle state and advances through reshuffles. Same seed and action sequence produce identical results. This favors reproducible testing and competition demonstrations; randomized replay is a future product decision.

## Visual implementation and assets

Handwritten CSS, semantic React controls, original SVG icon/geometry system; no UI library. Portrait SVGs are explicitly replaceable stand-ins requested by the brief. Vite glob discovery gates PNG requests so absent optional artwork never creates 404s. Drop named PNGs into `public/assets/` and rebuild for distribution. Geometry stays vector. Local WOFF2 files remove external font-service dependencies; licenses ship beside fonts.

## Accessibility and device support

Responsive CSS at 1450, 1100, 800, and 520px; desktop landscape is primary, phones scroll vertically. Selected controls use visible changes and aria-pressed. Inputs lock during enemy/cast transitions. Intro, rules, and results are focus-protected dialogs; rules close with Escape. Live preview and status text communicate calculations and outcomes. `prefers-reduced-motion` disables visual animations. No audio dependency.

## Guidance and resolved combat events

The optional opening coach lives in `src/game/guidance.ts`; it derives advice and a control/target to highlight from real battle state and current selection. It never dispatches actions or locks moves. The player can hide or re-enable it, and a native expandable safe-route guide is available during guided play and after defeat. “Find this control” performs user-triggered scroll/focus only. Replay retains the selected hints setting; defeat offers a guided retry.

The engine emits `CombatEvent` records into `Battle.lastEvent`, with monotonic ids, actual health loss, ward absorption/shattering, shield gains, guard duration, charge cancellation, and exposed transitions. `src/game/feedback.ts` turns those records into short messages. The UI displays brief banners, damage values, link/charge effects, and exposed emphasis without simulating or changing rules. A cleaned-up timer hides feedback; extra draws retain the same event id, preventing false effect replays. Reduced-motion CSS removes decorative movement.

The new `src/artwork.ts` registry handles optional local PNGs. Character and formula-image failures use original SVG fallbacks. The background hook remains optional and requests nothing when absent. UI skins await real artwork before layout-specific slicing and contrast approval. A temporary technical PNG fixture verified that Vite handles a nonempty registry; it was removed before the final build.

## Verification boundary

Unit tests prove arithmetic and transitions. Browser checks exercise actual rendered controls without hidden state injection. Chrome-extension wallet injection errors, if present in the user's regular Chrome profile, originate from extensions; they are not game integrations. Production is a static `dist/` build; no deployment or competition submission has been made.
