# PvP product direction

## Confirmed intent and current implementation

The user clarified on November 2, 2026 that The Last Constant is a **PvP game with an alternative bot opponent**. This supersedes treating the examiner encounter as the entire product. The original build brief explicitly deferred multiplayer for the first milestone; the existing First Trial was implemented under that scope.

Current code: one playable solo tutorial against a scripted examiner and constructs. Human-versus-human mode, a symmetric duel engine, rooms, and networking are not implemented. The guided opening, real arithmetic, target/geometry choices, and combat feedback remain useful work to carry into the duel game.

**Current decision:** The user deferred the two-player engine and asked to continue the existing First Trial and presentation work. PvP remains the intended product direction; the options below are future design notes, not an active networking task. No scope question is pending. Do not silently equate local pass-and-play with online multiplayer or claim either is already available.

## Core design contract

- Both human and bot opponents use the same legal duel actions, formula evaluation, resource rules, targeting, and victory conditions.
- The examiner's automatic ward/attack/exposed cycle is tutorial-specific content. It is not the ruleset for a human opponent's decisions.
- A human player chooses their spells, variable, geometry, and targets on their turn. The other player's selected spell and hand must not be revealed as an enemy intention.
- Keep one authoritative duel state and a validated action/reducer layer separate from React. The present formula evaluation and geometry calculations can be reused; `Battle.enemies` plus one apprentice is not already a two-player architecture.
- A bot should choose legal player actions from the information it is allowed to see, rather than using a separate scripted damage system or reading the human's private hand.
- Preserve the original mathematical-fantasy pitch. Do not add accounts, a blockchain, a trading market, or runtime LLM calls merely to call the game PvP.

## Board design to resolve before duel implementation

Circle must retain a useful area effect. A duel with only one target on each side would flatten its role. A simple proposed starting board is an apprentice plus geometric constructs on each side, preserving target priority and guard-breaking while giving both players equivalent control. Exact construct rules, starting health, first-player advantage, and exposed/charge mechanics need duel-specific balance; the solo examiner's values are not automatically fair for PvP.

Keep proposals separate from confirmed rules in the game bible until implemented and playtested. Starting the human prototype as symmetric is the clearest way to assess fairness; alternative asymmetric roles would be a separate design choice.

## Human-play implementation options

### Online private room

A host creates a room and shares an invite link. Two browser clients see their own hand and the opponent's public board. A small authoritative game service validates room membership, active player, resource costs, card ownership, targets, and match outcome, then sends player-specific views. Never send the full opponent hand to a client and merely hide it with CSS. Define disconnect/rejoin handling and prevent duplicate submissions. Accounts and a database are not prerequisites for a short-lived prototype, but transport and hosting still need to be chosen.

### Shared-device prototype

Two people alternate at one device, with a private handoff screen before revealing each active hand. This demonstrates human PvP with a smaller infrastructure scope. Label it explicitly as local two-player play, not online rooms. Bot mode should still use the same duel rules.

## Competition consequences

The [verified Loadout rubric](https://app.loadout.xyz/jam#rules) gives the largest weight to gameplay potential. The development plan should describe this as a duel game whose current solo lesson teaches the core mechanism. Under the user's current decision, finish the existing playable slice, bespoke presentation, and honest competition evidence first. The shared human/bot duel foundation remains future work.

Use footage and entry copy that match the build actually submitted. If only the tutorial is in the build, describe PvP as planned. If human play is implemented, capture actual interaction between two players/clients and a real complete match. The current submission draft does not establish a multiplayer claim.

## Required validation for a human duel

1. Both sides can complete legal turns; bot and human paths use the same rules.
2. Each player sees only their hand and public opponent information.
3. Out-of-turn actions, duplicate casts, forged cards, insufficient Ink, and invalid targets are rejected by the authority.
4. Drawing, reshuffling, shields, board effects, victory/defeat, and replay work for either side.
5. For online rooms, two independent browser contexts can join and complete a game; room isolation and disconnect behavior are checked.
6. For local play, handoff hides private information until the next player explicitly takes control.

These are future acceptance criteria, not completed tests.
