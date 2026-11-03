# Submission draft — equation duels

Prepared November 3, 2026 against `docs/REBUILD_PLAN.md` and the current duel source. This is reviewable copy; nothing has been deployed, posted or submitted. Browser smoke test H remains on hold until the user confirms the duel screen is final.

## Form copy

**Game title:** The Last Constant

**One-line pitch (100 characters):** Build spells from number cards, outthink a rival mage, and land exact-hit Resonance in a maths duel.

**Stage:** Playable local prototype. Replace this with “playable browser demo” only after testing the public deployment URL.

**What is the game?**

The Last Constant is a maths-learning card duel where your spell is an expression you build. A rune gives you a target. Choose up to five cards from your hand: number stones, operator glyphs and familiars that double, square or add two to the whole expression so far. Stones placed side by side add together. The live readout shows what your spell makes. Cast to reveal your spell and the bot mage’s spell together: the closer result deals damage, and an exact hit is a Resonance. Chaining familiars adds damage to an exact hit. Both mages begin with 20 health.

Three selectable trials progress from sums through products and brackets to solving for an unknown. After a missed target, the reveal offers an exact answer from the hand you had; equation runes also show their working. Six original familiar cards share three operation families and include distinct rarity perks. Their arithmetic changes the spell, rather than serving as a separate quiz.

**How did you use AI?**

I directed the game concept, learning goals, visual choices and playtest feedback. Claude and Codex wrote the React/TypeScript code with my direction. Claude built the equation-duel rules, bot and screen; Codex built code-drawn stone and glyph faces, procedural sound effects, tests and release documentation, and manages version control. ChatGPT made the artwork from our prompts through my Chrome session. The bot searches legal card expressions locally; the game does not call an AI model while you play. The card-face and sound modules are prepared for screen integration; describe them as active features only after Claude connects them and the final build is checked.

**Development plan:**

Next we will use the shared duel rules for human PvP alongside the bot, then add a persistent collection, deck choices and player trading. The Academy’s level ladder will grow from number sense and arithmetic into brackets, powers and the linear-equation skills of Algebra 1. Short learner playtests will guide difficulty, feedback and accessibility before expanding the ladder. PvP, persistent collection, trading and a complete Algebra 1 curriculum are planned; they are not implemented features of this prototype.

**Links:**

- Source: https://github.com/JWattjr/the-last-constant
- Public playable URL: [USER: add after deployment and verification]
- Public X clip URL: [USER: add after posting]

**User-supplied entry details:** X handle, contact email, individual/team status and any studio name. Review eligibility and the live entry terms yourself. Do not infer personal details from browser sessions.

## Draft X post

The Last Constant: build a spell from number cards and familiars. Hit the rune exactly for Resonance.

Three trials take you from sums to solving for x. Here’s real gameplay from our maths card-duel prototype, built with Claude, Codex and ChatGPT artwork.

@loadoutprotocol

[USER: attach the real gameplay clip and tested playable URL before posting.]

## 28-second gameplay clip

Capture only after Claude confirms the screen is final and task H passes. Use actual rendered game footage. These beats may be separate takes; cuts between trials must be visible. Do not manufacture card draws, numerical outcomes or a continuous sequence. The final shot must show a real Resonance hit.

| Time | Actual capture | Short caption |
| --- | --- | --- |
| 0–4 s | Select Trial I. Hold the target rune and the seven-card hand long enough to read. | “The rune sets the target.” |
| 4–10 s | Place stones into the spell slots. Show the live expression change; remove a card if it helps explain editing. | “Your cards write the spell.” |
| 10–16 s | Cut to Trial III and show an equation rune and its real reveal working. | “From sums to solving for x.” |
| 16–22 s | Cut to Trial II. Build a valid exact spell using the actual hand, preferably a familiar wrapping a sum. Hold the bracketed readout and exact result. | “Familiars transform everything before them.” |
| 22–28 s | Cast that exact spell. Show Veyra’s face-down cards reveal, the “Resonance!” result, real damage and health changing. End on this hit. | “Exact hit. Resonance.” |

Find a real exact hand before recording the final take; choose fewer cards over a confusing chain if needed. Keep the rune, expression and health readable at the exported size. If no familiar is available for an exact spell, record another normal round rather than implying a non-exact spell resonated. A double Resonance is also real gameplay but needs a caption explaining that both mages hit exactly.

The title can appear as a small overlay earlier in the clip. Do not append a title card after the final Resonance. Use game audio only after sound integration; avoid claiming untested sound or inserting fake gameplay audio cues.

## Before the user submits

- The working deadline is November 6 at **12:00 Lagos**, ahead of the stated official **16:00 Lagos** close. Recheck the [live competition rules](https://app.loadout.xyz/jam#rules) before acting.
- Confirm the final source commit and deployment agree. Test the public URL signed out, including card art, a full duel and phone layout.
- Review the AI-use paragraph after final integration. Keep current bot play separate from future human PvP and trading.
- Export 20–30 seconds of actual gameplay; the existing competition brief records a minimum of 15 seconds. Check readable numbers and a final real Resonance hit.
- The user posts the clip on X with @loadoutprotocol, checks its public URL, then completes the entry form with that link and their own details.
- This file grants no permission to deploy, post, enter the competition, create accounts or accept terms.
