# Visual direction

**Prototype scope:** The user clarified after the first milestone that bespoke artwork will shape the final backgrounds, UI, frames, and presentation. The system below records the temporary gameplay shell, not a locked final visual identity. Tactical labels and previews added in the second pass communicate rules; preserve their information when replacing their appearance.

The confirmed direction is a warm parchment-and-ink academy arena with teal spellwork. Treat the experience as a physical spellcraft examination: ivory paper below, a deep teal trial chamber above, antique brass geometry, and meticulously framed formula cards. The game is the entire page; no dashboard navigation or marketing layer.

## Competition art-production plan

**PvP clarification:** The core product is a human/bot duel game. The examiner remains tutorial-specific art. Prioritise a reusable apprentice identity and battlefield that can support two opposing sides; future duel UI must distinguish ownership and hide the opponent's hand. Do not carry public examiner intentions into a human opponent's private decision UI. The current asset kit is a starting production reference; duel-board composition follows the selected human-play scope.

The [official Loadout rubric](https://app.loadout.xyz/jam#rules), checked November 2, weights gameplay potential 40%, originality 25%, execution 20%, and development plan 15%. Our art should reveal the distinctive equation-and-geometry mechanism rather than obscure the arithmetic. The main visual hooks are a severed guard link, a collapsed charged spell, and Veyra's exposed opening. These are now live combat effects derived from actual results, suitable for actual gameplay footage.

`ASSET_PROMPTS.md` now specifies a complete production set: original portraits, an examination-chamber backplate, three formula illustrations, a painted card frame, a blank button skin, and a quiet desk plate. The proposed starting setting is the examination chamber because it directly supports this encounter. Final generated images still require the user's approval and actual-size QA; the old CSS tokens are not binding final art direction.

Begin with `examiner.png` and `academy-battlefield.png` in one ChatGPT browser art session. The user authorised Codex to run this browser workflow. Use those outputs as references for subsequent assets, maintaining light direction, line weight, rendering, and material finish. Preserve a clear middle field for characters and gameplay overlays; use ornament at edges. Keep equations and operational labels editable and the active sigil procedural.

Optional integration recognises all four portraits, the battlefield backplate, and `formula-linear.png`, `formula-quadratic.png`, `formula-additive.png` via the local artwork registry. Card-frame, desk, and button-skin files are specified but need a dedicated fitting pass after the actual images exist. Actual generated assets and review status are recorded in `ASSET_PROVENANCE.md`; browser allowance usage is not measured.

## Palette and typography

Parchment #f0ecdf; Ink #203f3b; Spell teal #2c6961; Chamber #183a36; Antique brass #baa471; Copper danger #9b5144. Secondary paper text #656b5c; light arena text #efead8. Cormorant Garamond 500/600 supplies literary fantasy headings and equations. DM Sans 400/500/600 supplies compact game controls. Fonts are bundled locally with SIL Open Font Licenses in `public/fonts/`.

## Characters

Veyra: adult examiner, ivory hair, teal academic tailoring, precise controlled posture, compass spellcraft. Apprentice: adult copper-haired scholar, practical teal uniform and open folio. Sentinels: brass and ivory faceted constructs animated by geometric cores. Vector stand-ins are fallbacks; generated imagery must remain original and share lighting and proportion. `ASSET_PROMPTS.md` records the production specifications.

## Layout and interaction

Landscape desktop: 88px masthead, 338px battlefield, three-column workbench (apprentice / sigil / construction controls), parchment card hand, quiet battle log. Veyra is the visual anchor above the central inscription. Enemy intentions remain visible above each figure. Selected target gets a brass plaque edge and explicit label; selected cards lift and show an Inscribed tab. Value and geometry controls use `aria-pressed` plus visible selected states. Real card frames are justified by the TCG brief.

Below 800px the apprentice status becomes a full-width strip; the sigil and controls remain side by side. Turn controls move below the hand. At phone widths, the initial three cards fit without horizontal scrolling; extra cards wrap. Full character silhouettes crop inside art areas rather than distorting. Target minimum verified phone width: 375px.

## Sigils and cards

SVG construction uses concentric rings, compass ticks, triangle/circle/square constructions, and a central formula. All linework is original and procedurally generated. Do not use recognizable franchise symbols or rasterize the active geometry. Formula cards contain school, original geometric artwork, large expression, title, flavor line, and variable-cost reminder. Linear = brass twin triangles; quadratic = sage star; additive = copper intersecting circles.

## Motion and accessibility

One 850ms cast sequence scales and rotates the sigil, flashes the figure, and shows the calculated result. An enemy-turn beat prevents double input. Reduced-motion preference removes decorative transitions and animations. Keyboard operation, visible focus, semantic buttons, live spell preview, status updates, dialog focus trapping, and Escape-close rules ship. Sound is intentionally absent.

## Asset contract

`public/assets/examiner.png`, `apprentice.png`, `construct-a.png`, `construct-b.png`; transparent PNG portrait 1024×1536 recommended. Vite discovers filenames at build time. Original SVG fallback remains for absent or failed assets. No network requests for missing optional assets. Rebuild production after adding art. No licensing claims are made for artwork the user has not yet supplied.
