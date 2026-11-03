# The Last Constant — independent playtest and design critique

**Invitation to reviewers, human or AI.** Review the game as if the team has the budget to act on one contribution from you. Try the playable prototype if you have access, test the proposed boss encounter on paper, then submit one detailed recommendation in a single response. A contribution can change a rule, remove a feature, challenge the commercial premise, or propose an experiment. A well-supported case for abandoning a mechanic is as welcome as an improvement to it.

**Review snapshot:** November 3, 2026. The playable claims below describe source commit `32a75d4`. The district design comes from the creator’s subsequent discussion. This guide is self-contained for a reviewer who can read text but cannot run software. Identify which kind of review you performed.

## 1. What the player is buying into

The Last Constant is a proposed solo collectible card adventure for learners who find secondary-school maths intimidating. The player travels through districts, meets creatures whose behaviour expresses a mathematical idea, and earns cards that change how they can use that idea. Each district ends with a guardian. Its earlier battles should give the player the knowledge needed to read the guardian’s moves and find a way through.

Imagine a player who can calculate 4 + 2 perfectly well but rarely thinks about why they might prefer 3 + 3. In this game, spending the 4 now might leave a bell ringing, an enemy attack charged, and the wrong cards in hand. Choosing another expression for six becomes a tactical discovery. The desired experience is that the player notices the opportunity, tries it, sees the consequence, and later recognises the same principle with unfamiliar numbers.

The initial audience hypothesis is roughly ages 11–15, particularly players comfortable with small numbers but hesitant about choosing a mathematical strategy. Skill and interest matter more than age alone. A learner chooses whether to play again. A parent may choose whether to buy another district. A tutor may recommend the game after seeing a learner explain a move. These are three distinct decisions to investigate.

## 2. Which game can you test today?

| Status | Experience | What a reviewer can assess |
| --- | --- | --- |
| Playable at the project root | A solo equation duel against Veyra, with three selectable trials and a hand of stones, glyphs and familiars | Arithmetic, decisions, clarity, difficulty, reveal feedback, and whether a loss makes the next move easier to understand |
| Earlier playable version | The original First Trial at `/?classic`, where formulas and geometry power attacks and shields | Earlier combat ideas, if relevant. Identify this version explicitly if you review it. |
| Paper prototype in this guide | A foundry district with two minor bosses and a final guardian | The proposed rules, their tactical and educational value, and the smallest worthwhile implementation |
| Longer-term proposals | A world of topic districts, persistent collections, optional trading and human PvP | Product direction, dependencies and risks. The current build demonstrates bot play. |

The first district under consideration teaches **number composition**. Other possible districts include fractions and equivalent parts, negative numbers and direction, algebra and balance, and geometry and transformations. The ambition extends through secondary-school mathematics. One district is the early production scope. The central open question is whether one set of rules can carry enough enjoyable encounters to earn the next district.

## 3. Play the equation duel

[Public source repository](https://github.com/JWattjr/the-last-constant). A reviewer with a separately supplied playable link can open that link directly. To reproduce the snapshot locally, use a separate checkout and Node 22.12 or newer.

```sh
git clone https://github.com/JWattjr/the-last-constant.git
cd the-last-constant
git checkout 32a75d4
npm ci
npm test
npm run dev
```

Open the local URL printed by Vite. An address beginning with 127.0.0.1 points to the machine running the server. For source inspection, start with `src/duel/DuelScreen.tsx`, `src/duel/engine.ts`, `src/duel/bot.ts` and `src/duel/engine.test.ts`. This review asks for observations and a written proposal. Use a separate checkout for experiments.

Both mages start at 20 health. A rune gives a target, and the player builds a spell of up to five cards from a seven-card hand. Adjacent stones add. A glyph introduces an operation, and a familiar acts on the entire expression so far. Two 3s followed by Twin Embers make (3 + 3) × 2 = 12. Order matters. Cast to reveal both spells. Being closer normally deals 3 damage. An exact hit, called Resonance, starts at 5 damage, with some familiars and combinations changing the outcome. A double Resonance damages both sides.

**A short review session**

1. Enter Trial I, Sums. Before opening help, describe the goal and predict what placing your first two stones will do. Record where the screen confirms or contradicts your prediction.
2. Play one duel to its conclusion. Capture one actual round: rune, relevant hand, chosen spell, bot result and damage. Identify a decision you would change on a replay and say why. If you missed the target, inspect the offered solution.
3. Try Products or Unknowns. In Products, look for a case where changing card order changes the value. In Unknowns, inspect how the reveal connects the equation to the value you built. Which concept did you have to reason through, and which work did the interface perform for you?
4. Report your access honestly. Passing automated tests verifies encoded rules. A source walkthrough can support a rules critique. Claims about the experience of playing should come from interaction, and claims about learners require learner observations. Record the version and device if you played.

## 4. Paper-test the proposed foundry district

**The Gatekeeper** has a shield divided into visible segments. The first encounter gives stones worth 5 and 3 against a shield worth 8. Each play visibly consumes the corresponding segments. A later shield changes the total and offers several ways to reach it. The design question is how quickly we can move from a safe first success to a meaningful choice.

**The Bellsmith** rings two bells to charge an attack. The player has one hand to silence them. For this paper test, a card can be spent once, unused cards remain available for the other bell on the same turn, and a bell requires its exact total. Commit a set of stones to one bell at a time. Silence both to interrupt the attack. Leaving a bell active lets the boss strike and the player recover next turn. This exercise tests one turn. Boss health, damage, draws and recovery costs still need balancing.

Try these before reading the worked example. For each hand, write down your **first commitment**, what remains, and whether you can silence both bells.

| Hand | Bell targets |
| --- | --- |
| 4, 3, 3, 2 | 6 and 4 |
| 6, 5, 4, 3, 2 | 9 and 8 |

In the first hand, both 4 + 2 and 3 + 3 reach six. Spending both 3s preserves the 4 for the other bell. In the second hand, spending 6 + 3 reaches nine but leaves 5, 4 and 2, which cannot make eight. Spending 5 + 4 preserves 6 + 2. Try solving the bells in reverse order too. If order freedom makes the encounter more interesting or exposes an easy routine, that is a finding worth reporting.

**The Foundry Guardian** combines the lessons. Its furnace has three locks. A glowing lock announces an incoming attack. Opening that lock interrupts the strike. Opening all three exposes the core. The intended decision is whether to spend a valuable card on immediate protection or accept a hit to set up a stronger turn. The prototype must give both choices a defensible use. If one always dominates, the third boss adds ceremony without adding strategy.

One proposed collectible familiar splits a 6 into two 3s. Total energy stays constant while the number of targets you can reach changes. Test whether this creates a worthwhile deck choice or becomes an automatic pick. Every required encounter should be beatable with accessible cards. Each new card should open a decision the reviewer can describe.

## 5. Why we think it could work, and what would disprove it

| Hypothesis | Why it is plausible | Evidence that would weaken it |
| --- | --- | --- |
| The combat is enjoyable in its own right. | Spending cards now changes which later moves remain possible. Boss intentions give those choices consequences. | After discovering one solution, players consistently decline a rematch, or the live preview lets them solve every turn by clicking through combinations. |
| The player learns something reusable. | Successive encounters use the same idea in different circumstances. Visible pieces and recoverable mistakes make revision possible. | Players repeat the first sequence but cannot allocate a changed hand or solve a similar problem away from the board. |
| Learners who hesitate around maths will attempt it. | Untimed turns, visible consequences and a small first decision give players room to experiment privately. | Players need an adult to direct each move, interpret a bad draw as personal failure, or find the tone too young for them. |
| Families will pay for more districts. | A complete free district lets the learner experience a victory and the buyer observe what the learner actually practised. | Learners enjoy the free encounter, but adults decline a clearly described expansion at an explicit price, or the cost of producing it exceeds realistic sales. |

Commercial precedent is adjacent evidence. Prodigy shows a fantasy maths product with parent-funded memberships. Dicey Dungeons shows that a solo adventure built around numerical resources can be sold as entertainment. Neither establishes demand for this specific combination. The proposed model is a free first district followed by one-time purchases of complete adventures. For early marketing, show the two bells and the four cards, then link directly to a playable turn. Measure starts, voluntary retries, returns and eventual purchases separately. [Prodigy’s product model](https://www.prodigygame.com/main-en/about-prodigy) · [Dicey Dungeons](https://store.steampowered.com/app/861540/Dicey_Dungeons/)

## 6. Why it could compete at Loadout

The project’s competition brief records four judging weights: gameplay potential 40%, originality 25%, execution 20%, and development plan 15%. The strongest case for an entry is a judge understanding a decision in seconds and wanting to try it personally. The existing duel already offers a demonstrable payoff when a hand becomes an exact spell and Resonance lands. A playable Bellsmith encounter would add a different payoff: two mathematically correct moves with different combat consequences.

- **Gameplay potential.** A judge can try one hand, discover a different route, and replay. The risk is a solved puzzle offering little reason to return.
- **Originality.** The mathematical relationship determines what the monster can do and how the player can stop it. A boss with larger target numbers alone would give this argument little support.
- **Execution.** Record a real turn with the target, hand, chosen move and result readable in the same clip. Demonstrate whichever build actually works by capture day. The foundry remains a proposal until implemented.
- **Development plan.** One small district lets us measure how much design, art, balancing and learner testing a second district would require. A credible next milestone is evidence that a new group of learners can play the first independently.

A reviewer should feel free to conclude that the duel is the stronger entry, that the foundry needs a different mechanic, or that neither yet earns a competitive advantage. Identify which rubric dimension your conclusion affects. [Competition page](https://app.loadout.xyz/jam#rules)

## 7. Submit one contribution

**One person or model, one independent written contribution.** Start with a short verdict on the game. Then choose the single change or experiment you believe deserves the team’s next investment. It can concern gameplay, learning, accessibility, audience, commercial design or the competition demo. Give enough detail that another designer could prototype and evaluate your idea without a follow-up conversation.

Copy this response form:

1. **Review basis.** What did you actually play, read, simulate or observe? Give the version, relevant hand or encounter, and any limits of your access.
2. **Verdict.** What already works, where does the central promise break down, and for which player?
3. **My one contribution.** Give it a name and describe the precise change. Walk through one concrete turn or player journey before and after it. Include the relevant cards, numbers or decisions.
4. **Why it should count.** Point to the observed problem or explicit hypothesis your change addresses. Explain the mechanism connecting the change to a better outcome. Compare it with the strongest reason to keep the current design. Distinguish observation from prediction.
5. **Cost and tradeoff.** What would the smallest prototype require? Which existing rule or asset can it reuse? What could it make worse, and what other work would you defer to make room?
6. **Test and decision.** Name the players, the comparison, and the behaviour that would make you adopt, revise or drop the idea. For a learning claim, include a fresh problem. For a commercial claim, include a buyer decision. Label proposed thresholds as hypotheses.
7. **Confidence.** Which single piece of missing evidence would most change your recommendation?

The team should give the most weight to a contribution that identifies a consequential player decision, demonstrates it with a reproducible example, fits the first district’s scope, and offers a fair way to prove its author wrong. Human play observations and model-generated counterexamples can each contribute something valuable. Keep their origins visible when comparing submissions.
