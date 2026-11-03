# Loadout competition brief

Verified against the [official competition page](https://app.loadout.xyz/jam#rules) in the browser on November 2, 2026. This document separates published requirements from our own production strategy. Recheck the page before posting or entering.

## Published requirements

| Item | Official information |
| --- | --- |
| Deadline | November 6, 2026, 15:00 UTC — **16:00 in Lagos** |
| Judging | Gameplay potential 40%; originality 25%; execution 20%; development plan 15% |
| Footage | Public X post containing at least 15 seconds of real game footage, tagging @loadoutprotocol |
| AI | AI must contribute to making the game; existing projects, prototypes, and released games are eligible |
| Submission | X post URL plus game details and contact information in the entry form |
| Entrant | At least 18, authorised to enter the game and clip; one entry per person |
| Token launch | Optional; neither launch interest nor X likes changes judging scores |
| Prize pool | $2,500 / $1,500 / $1,000; published payout is USDC on Solana after verification |

The published page also describes winner response deadlines and clip-reposting permissions. The entrant must review the live rules and confirm their own eligibility before submission. No form was filled, account connected, X post published, or repository visibility changed during this work.

## Our competition strategy

**Current scope:** The intended game is human PvP with a bot alternative. The user subsequently deferred the two-player engine and asked to continue the existing First Trial and presentation work. Finish this playable slice and its art/evidence first; describe the shared human/bot duel foundation as future development. See `PVP_DESIGN.md`; no human multiplayer functionality is currently claimed.

These are production choices, not additional official rules or predictions of placement.

| Rubric | What this game should demonstrate | Evidence and next action |
| --- | --- | --- |
| Gameplay potential, 40% | A learnable tactical encounter with meaningful target, geometry, and timing choices | Optional guided opening; safe route available after a loss; multiple tested winning policies; watch fresh players before adding complexity |
| Originality, 25% | Equations instruct spells; geometry changes their architecture | Show the same formula becoming focused damage, area/guard-breaking damage, or protection; preserve visible real arithmetic and original academy world |
| Execution, 20% | Real playable footage, reliable outcomes, satisfying readable feedback | Deterministic engine, shared preview/resolution plan, tests, browser playthroughs; actual guard-snap / interrupt / exposed cues; bespoke art and a public playable link remain priorities |
| Development plan, 15% | A credible progression from this solo teaching slice to a duel game | Finish this slice's presentation and playtests; then establish a shared human/bot duel engine, human-play transport, deck choices, and duel balance |

Runtime LLM calls, accounts, wallets, tokens, and multiplayer are unnecessary for the current requirements. AI-assisted development qualifies under the published wording. Describe that contribution honestly; do not imply the combat engine calls an AI model at runtime.

## Release path to the deadline

| Target date, Lagos | Deliverable | Current status |
| --- | --- | --- |
| Nov 2 | Complete guided encounter, informative feedback, reproducible tests, art and footage briefs | Implemented; verification recorded in HANDOFF.md |
| Nov 3 | User generates approved original portraits and background; integrate and inspect the actual assets | Prompts and optional portrait/background/card-art hooks ready; final images pending |
| Nov 4 | Observe three new players, record where they get stuck, adjust explanations and balance | Planned; no playtester outreach was sent |
| Nov 5 | Publish a tested playable build on the chosen host; capture and edit actual gameplay footage; prepare final entry text | Hosting and recording pending; draft prepared |
| Nov 6, by 15:00 | Internal target for posting and entering, with one hour before the official 16:00 deadline | Requires the user's final details and explicit posting/submission instructions |

The dates are working targets, not evidence that future steps have happened. Do not postpone posting/submission until the final minutes for another polish pass.

## Judge-facing first minute

1. Reach real interaction quickly through “Start playing with hints,” while retaining the world introduction for interested players.
2. Understand that Copper is protecting Veyra and that a card, geometry, variable, and target form a spell.
3. Observe a guard link breaking and a charging enemy being interrupted.
4. See exposed timing create a larger real damage number.
5. Have a reliable recovery path after losing, and an optional route guide, so evaluation is not blocked by an unexplained defeat.

## Remaining competition risks

- Final anime illustration and an art-led interface are still pending. The current shell is not claimed as final visual quality.
- The game is local; the form accepts an optional project URL, but a reliable public build is our own important distribution goal.
- Only the creator has provided human playtest feedback so far; scripted wins do not establish enjoyment or onboarding clarity.
- No actual submission clip has been captured yet. Screenshots and effect frames are QA evidence, not a substitute for the required gameplay video.
- Do not present the prototype's roadmap as implemented content or promise future online/multiplayer systems without a separate scope decision.
