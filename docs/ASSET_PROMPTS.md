# Artwork queue

For the immediate next step, use the small copy-ready batch in `docs/art-batch-01/README.md`: Veyra first, then the matching battlefield. The full asset queue below remains the source for later production.

The user authorised browser generation on November 2, 2026. Artwork is being generated through their existing ChatGPT conversation and downloaded into `public/assets/`; see `ASSET_PROVENANCE.md` for actual delivery status. No direct paid image API is used; browser allowance usage is not measured. Original SVG fallbacks remain in `src/components/Art.tsx`. Vite detects PNG files; restart `npm run dev` or rebuild if a newly added asset does not appear. Keep transparent padding small and preserve the full silhouette. The UI uses `object-fit: contain` and aligns the figure to the bottom.

## Shared art direction

Original premium anime fantasy trading-card illustration; expressive stylized human faces; confident cel shading, strong silhouette, restrained painterly detail in fabrics; warm ivory, desaturated deep teal, antique brass, subtle copper; mathematical spellcraft as an academic discipline. Ornate but original linework. No existing franchise characters, recognizable symbols, logos, text, signatures, card borders, or borrowed costumes. Use a transparent background for all four character assets. All characters are adults. Keep the same illustrator, lighting, and level of finish across the set. These are game-production assets, not finished cards.

## `examiner.png` — highest priority

1024 × 1536 portrait, transparent background. Three-quarter-to-full-body portrait of Magister Veyra, an original adult female academy examiner, poised and quietly formidable. Long ivory hair loosely swept back, intelligent teal eyes, measured expression, one asymmetric braid threaded with small brass cylinders. Tailored deep forest-teal academic coat over an ivory high-collared tunic; angular cape that falls into long architectural folds; fine brass seams following original geometric constructions. No pointed witch hat. A floating brass compass held lightly in the right hand; left hand directs a small original triangular spell diagram made of abstract construction lines with no letters. Feet and lower cape visible. Face fully readable at thumbnail scale. Warm window light from upper left, cool green fill from spellwork. Center figure; hands contained within the silhouette; minimal atmospheric particles. No background, no text, no card frame. Original anime-fantasy TCG finish with cel-shaded forms and exquisite but restrained linework.

## `apprentice.png`

1024 × 1536 portrait, transparent background. Original adult apprentice mathematician, warm copper-brown cropped hair with a loose forelock, brown skin, bright amber eyes, thoughtful determined expression. A practical charcoal-teal uniform with a cream scarf pinned by an original compass-like brass clasp, rolled sleeves, ink-stained fingertips, leather satchel with rulers and a closed compass. Holding an open parchment folio in both hands at waist height, looking up at an unseen examiner. Confident expressive anime character design with strong cel shading and a clear silhouette. Three-quarter-to-full-body view, subtle right-facing stance. Warm light from upper left. Original mathematical academy, no franchise likeness or recognizable symbols. No text, no background, no frame.

## `construct-a.png`

1024 × 1536 portrait, transparent background. Copper Sentinel, an original academy practice construct roughly human height: faceted copper-brass armor plates fitted around dark teal joints; slightly broad shoulders, long mechanical forearms, small angular head with a narrow pale green eye slit. A luminous teal polyhedron suspended inside an open diamond-shaped chest cavity. Elegant instrument-maker craftsmanship, engraved abstract construction arcs, no runes or recognizable magical symbols. Stance alert but calm, hands open, front three-quarter view facing slightly toward center-right. Entire construct visible. Premium anime-fantasy TCG illustration, decisive cel shading, restrained metallic highlights, warm upper-left lighting. No text, no background, no frame.

## `construct-b.png`

1024 × 1536 portrait, transparent background. Ivory Sentinel, companion to the Copper Sentinel with the same anatomy and craft language: faceted warm ivory porcelain armor, antique brass fixings, dark teal joints, narrow pale green eye slit, luminous teal polyhedron in an open diamond-shaped chest cavity. Slightly slimmer proportions and an original circle-and-chord construction engraved on its shoulder plates. Alert neutral stance, hands open, front three-quarter view facing slightly toward center-left. Entire construct visible. Match Copper Sentinel's camera height, lighting, shading, and level of detail. Premium original anime-fantasy TCG finish. No text, recognizable symbols, background, or card frame.

## Next art pass — complete battle kit

The current CSS presentation is a temporary gameplay shell. This kit proposes one coherent art-led direction for the competition, rather than treating its palette and flat placeholders as final authority. The communication goal is that a player immediately recognises an original academy of mathematical spellcraft and can still read the decisions that make the game work.

Three composition ideas were considered: an academy examination chamber, a storm-damaged observatory, and a magical manuscript folio. Begin with the **examination chamber** because it explains the actual encounter and supports prominent characters, a spellwork surface, and readable cards. The observatory can support a future encounter; the manuscript is a potential codex screen. Do not mix all three settings into this first battle.

Generate the examiner and battlefield first in the same ChatGPT art conversation. Use the approved results as references for the rest. Warm ivory, deep teal, copper, and controlled amber spell light are a starting direction, not a requirement to preserve every current CSS colour. Character linework, architecture, and UI ornament should look like the same illustrator created them.

### Priority and integration status

| Priority | Filename | Specification | Integration |
| --- | --- | --- | --- |
| 1 | examiner.png | 1024×1536 transparent portrait; prompt above | Automatic optional portrait hook |
| 1 | academy-battlefield.png | 2560×1024 panoramic opaque background | Automatic optional arena background hook |
| 2 | apprentice.png, construct-a.png, construct-b.png | Matching transparent portraits; prompts above | Automatic optional portrait hooks |
| 2 | formula-linear.png, formula-quadratic.png, formula-additive.png | 1024×512 opaque card-art panels | Automatic optional formula-art hooks |
| 3 | formula-frame.png | 900×1200 transparent ornamental border | Asset review and frame integration required after delivery |
| 3 | cast-button.png | 960×128 transparent-ended blank button skin | Asset review and responsive slicing required after delivery |
| 3 | spellwork-desk.png | 2560×800 quiet material/foreground plate | Art-led layout integration required after delivery |

Drop exact PNG filenames into `public/assets/` and rebuild or restart Vite. Only the assets marked automatic currently replace placeholders. No missing optional files are requested over the network. Formula labels, calculations, health, buttons, and SVG spell construction remain editable UI text and geometry. UI frames and desk art must be fitted to their actual contents after they exist; do not claim unreviewed assets are integrated.

### `academy-battlefield.png`

2560×1024 panoramic original anime-fantasy academy examination chamber, no characters and no UI. A broad stone chamber designed by scholar-mages: tall original architectural arches, fine brass compass constructions embedded into pale worn stone, restrained floating motes of amber ink-light, a distant central arch suggesting a world held together by mathematical craft. Confident cel-shaped lighting with delicate painterly texture in stone and cloth; match the examiner reference's line weight and rendering. Warm daylight enters from upper left; deep teal shadows establish clear character contrast; small copper accents. Eye-level camera, calm near-symmetry with slight organic asymmetry in the masonry. Leave the centre and lower middle visually quiet for three foreground characters and floating health plaques. Keep distinctive architecture in the upper and far side regions. The centre 45% must remain coherent when the sides are cropped for phones. No text, letters, numbers, equations, recognisable franchise symbols, characters, card frames, logos, or watermark. Deliver a complete opaque background, with genuine illustrated depth rather than a screenshot of an app.

The arena crops this plate differently on desktop and phones. Check actual character contrast and UI readability after delivery; a prompt cannot guarantee those results.

### Formula art — shared instruction

Each image is a 1024×512 landscape illustration for the picture area of a formula card. Match the approved examiner/background style. Compose one clear magical phenomenon, with a strong silhouette readable at roughly 150px width. Original fantasy spellcraft, controlled light, intricate construction lines used sparingly, decisive cel shading and delicate ink finish. No card frame, text, equation, letters, number, logo, watermark, or existing franchise symbol. Formula expression and title will be drawn by the game.

**`formula-linear.png` / Twin Ember:** Two amber flames unfolding as mirrored ribbons above a brass compass, a precise doubling motif, warm copper and ivory, clean dark-teal negative space around the sparks. The two flames have the same weight and shape, separated enough to read at thumbnail size. No face or character.

**`formula-quadratic.png` / Rising Star:** A tiny brilliant star unfolding into a much larger angular constellation of golden-white light, luminous square facets and a rising arc, sage and midnight teal, one dominant burst with a smaller origin point. Geometric growth expressed through scale; no plotted graph or labels.

**`formula-additive.png` / Kindled Axiom:** One warm copper spark joined by two smaller embers over a quiet parchment folio and an elegant brass drafting instrument. The three lights gather into a stable spell, intimate and hopeful, copper/ivory against rich teal. Clearly separate the main spark and two companions; no readable writing on the folio.

### `formula-frame.png`

900×1200 portrait transparent PNG of an original premium fantasy trading-card frame. Painted ivory enamel and aged brass around the outer edge, exceptionally fine engraved compass arcs and botanical penwork used only at corners, an architectural top arch and a composed lower nameplate opening. Keep all ornament within an approximately 56px outer border. The full central interior and text regions must be genuinely transparent; no paper painting across the central cutout. Avoid an existing game's frame proportions or identifiable decoration. No words, letters, costs, numbers, icons, art picture, fake shadows across the centre, logo, or watermark. Front-facing flat asset, no perspective or mockup. Corners should stay distinct and the straight middle edges should be suitable for slicing; exact slice alignment must be inspected after generation. The frame should be beautiful without competing with the formula.

### `cast-button.png`

960×128 original fantasy game button skin, front-facing, no perspective, no text or icon. Deep teal enamel inset within restrained brushed-brass edges, lightly painted material with delicate compass-line corner engraving, crisp silhouette, calm blank central 75% for editable label and arrow. Transparent outside the button. Keep the first and last approximately 64px self-contained so they can be used as responsive end caps; the centre should be a simple continuous field. No embossed words, geometry symbol, glow cloud, drop shadow baked across the canvas, logo, or watermark. Match the card frame and academy art rather than imitating a familiar game's button.

### `spellwork-desk.png`

2560×800 wide illustrated foreground/material plate for an apprentice's drafting desk: pale parchment and warm stone with a narrow worn brass compass rail, a few ink stains and compass construction traces at the far edges, dark-teal cloth entering one corner, restrained afternoon lighting. Keep at least the middle 70% quiet and low contrast for a live procedural spell sigil and readable controls. No hands, characters, readable writing, equations, fixed circles, labels, buttons, logos, card pictures, or watermark. Match the approved battlefield's perspective and material finish. This asset will inform the art-led workbench layout after inspection, not dictate fixed positions for gameplay controls.

### Production checks for supplied art

- Inspect alpha edges against both light and dark backgrounds; remove large empty padding around portraits without cutting hands or costume.
- Compare all characters at the same on-screen height; maintain light direction, line weight, anatomy scale, and shading.
- Check the battlefield at desktop and phone crops and the cards at actual hand size.
- Keep live calculations, intentions, health, cost, focus states, and target selection readable over the actual assets.
- Record the generator, exact prompt, date, reference images, and any applicable usage rights for supplied assets. Font licences already ship locally; do not imply generated art rights were checked before the files exist.
- Keep the active sigil procedural SVG so formula placement and geometry remain part of gameplay.

## Character card art — style chosen November 3, 2026

Style (switched later on November 3): loose painterly gouache-and-ink brushwork on a mostly white background, the environment only suggested by a few strokes and drifting leaves or sparks, a limited palette per card plus gold-leaf flecks. See `docs/style-tests/painterly-sorrel-lyra.png`; the earlier cel-shaded set is archived in `docs/style-tests/cel-shaded-set/`. Each card is one vertical 2:3 illustration with no text, letters, numbers or frame, the character in the upper two-thirds and an original design. Every visible hand has exactly five fingers (one thumb, four fingers); check hands before accepting an image. Generated in ChatGPT, one card per request in a single chat so the style stays consistent.

Save as `public/assets/card-<id>.png`, then run `npm run optimize:art`. Each image shows its formula visually:

| File | Character | Visual maths cue |
| --- | --- | --- |
| card-twin-embers | Twin Embers, mirrored fire-sprite familiars (common, 2x) | Two identical sprites: doubling |
| card-lyra | Lyra Vale, Mirror Scribe (rare, 2x) | Her glyph is drawn once and mirrored |
| card-sorrel | Sorrel, Star-Seed Sprite (common, x²) | A 3 × 3 square of sprouts |
| card-quadra | Archmage Quadra, Keeper of Powers (legendary, x²) | Nested squares growing 1, 4, 9 |
| card-tobin | Tobin, Lantern Bearer (common, x + 2) | Two glowing steps ahead of him |
| card-bramble | Bramble, Runestone Tortoise (rare, x + 2) | Two runestones on its shell |
