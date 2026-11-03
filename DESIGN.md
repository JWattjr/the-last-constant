---
name: The Last Constant
description: Warm parchment-and-ink academy spellcraft for an original mathematical fantasy card game.
colors:
  paper: "#f0ecdf"
  ink: "#203f3b"
  teal: "#2c6961"
  muted: "#656b5c"
  gold: "#baa471"
  line: "#cbc8b6"
  red: "#9b5144"
  body-ink: "#253c38"
  outer-canvas: "#e3dfd2"
  chamber: "#183a36"
  hand-surface: "#e9e6d8"
  focus: "#b87936"
typography:
  display:
    fontFamily: "Constant, Georgia, serif"
    fontSize: "39px"
    fontWeight: 500
    lineHeight: 1.04
  headline:
    fontFamily: "Constant, Georgia, serif"
    fontSize: "31px"
    fontWeight: 500
  title:
    fontFamily: "Constant, Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
  body:
    fontFamily: "Scholar, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "Scholar, 'Segoe UI', sans-serif"
    fontSize: "8px"
    fontWeight: 600
    letterSpacing: ".12em"
rounded:
  control: "3px"
  modal: "4px"
  card: "9px"
  card-mobile: "7px"
  circle: "50%"
spacing:
  compact: "5px"
  control-gap: "7px"
  icon-gap: "8px"
  detail: "10px"
  inset: "12px"
  row: "15px"
  mobile-edge: "16px"
  section-gap: "20px"
  panel: "24px"
  desktop-edge: "48px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "#f8f0db"
    rounded: "{rounded.control}"
    padding: "13px 20px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "#194b42"
  button-cast:
    backgroundColor: "{colors.teal}"
    textColor: "#faf4e1"
    rounded: "{rounded.control}"
    padding: "11px 15px"
    width: "100%"
  button-cast-hover:
    backgroundColor: "#1f5149"
  button-cast-disabled:
    backgroundColor: "#8b9989"
  button-draw:
    backgroundColor: "transparent"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  button-draw-hover:
    backgroundColor: "#d7decb"
  button-end-turn:
    backgroundColor: "#304b3f"
    textColor: "#f5f0dd"
    rounded: "{rounded.control}"
    padding: "12px 15px"
    width: "100%"
  button-end-turn-hover:
    backgroundColor: "#1c3d32"
  button-icon:
    backgroundColor: "transparent"
    rounded: "{rounded.circle}"
    padding: "10px"
  button-icon-hover:
    backgroundColor: "#dce2d2"
  geometry-option:
    backgroundColor: "#e7e6d6"
    textColor: "#536253"
    rounded: "{rounded.control}"
    padding: "9px 5px"
  geometry-option-selected:
    backgroundColor: "#315b4e"
    textColor: "#f2edda"
  variable-option:
    rounded: "{rounded.circle}"
    width: "30px"
    height: "30px"
  variable-option-selected:
    backgroundColor: "#dfd9bf"
  formula-card:
    backgroundColor: "#f5efdd"
    textColor: "#7d6543"
    rounded: "{rounded.card}"
    padding: "10px 10px 8px"
    width: "171px"
    height: "222px"
  modal:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.modal}"
    padding: "34px 48px"
    width: "540px"
---

# Design System: The Last Constant

## Overview

**Scope clarification:** This records the temporary prototype interface. The user subsequently clarified that bespoke visual art will shape the final background, UI, and frames. These tokens and the accompanying sidecar are implementation references, not final visual authority. Later tactical cues preserve this shell only to make gameplay testable.

**Creative North Star: "The Parchment-and-Ink Academy"**

Casting feels like a deliberate mathematical inscription at an academy examination. Warm paper, deep teal spellcraft, antique brass geometry, and literary serif headings establish a learned fantasy world. Compact sans-serif controls keep tactical choices and real arithmetic legible inside that world.

The premium fantasy TCG direction is expressed through layered card frames, engraved geometric linework, restrained motion, and an illustrated chamber. The current original SVG portraits are explicitly permitted placeholders; final anime-fantasy artwork remains a future supplied asset. Preserve original characters, frames, and symbols. No generated images or image credits are part of this implementation.

**Key Characteristics:**

- Warm parchment surfaces against a deep teal chamber.
- Literary headings paired with compact, practical controls.
- Brass hairlines, geometric sigils, and layered formula cards.
- Selection and arithmetic remain explicit before a spell is cast.
- Original SVG stand-ins preserve the world while final artwork is pending.

## Colors

The palette combines warm manuscript neutrals with muted botanical teal and antique brass. Frontmatter values are normative; the source custom properties retain their existing names.

### Primary

- **Spellcraft Teal** (`teal`, source `--teal`): casting, modal continuation, selected-card borders, sigil formulas, Ink, and action icons. Hover variants deepen the teal according to their actual component rules.
- **Chamber Teal** (`chamber`): the battlefield, with a radial lift toward its lower center. This is a broad atmospheric surface, not a substitute for the action color.

### Secondary

- **Antique Brass** (`gold`, source `--gold`): small chapter ornaments and geometric accents. Card frames and examiner status details use related local brass shades rather than a single global metallic fill.

### Tertiary

- **Fired Clay** (`red`, source `--red`): player health. Incoming attack details and attack icons use related local earthy tones. Do not interpret these as an implemented form-validation system.

### Neutral

- **Academy Parchment** (`paper`, source `--paper`): masthead, workbench, modal, turn banner, and sigil centers.
- **Manuscript Ink** (`ink`, source `--ink`): modal text and turn-banner content.
- **Body Ink** (`body-ink`): inherited page text.
- **Sage Annotation** (`muted`, source `--muted`): explanatory text and small labels.
- **Folio Rule** (`line`, source `--line`): structural dividers between content and controls.
- **Outer Canvas** (`outer-canvas`): page surround outside the centered shell.
- **Hand Surface** (`hand-surface`): the formula hand and battle-footer band.
- **Copper Focus** (`focus`): visible keyboard focus around buttons and links.

**The Inscription Rule.** Use teal to connect the formula, geometry, Ink cost, and casting action; preserve visible selected-state borders and labels alongside color.

## Typography

**Display Font:** locally bundled Cormorant Garamond, exposed as `Constant`, with Georgia and serif fallbacks. Loaded weights are (500, 600).

**Body Font:** locally bundled DM Sans, exposed as `Scholar`, with Segoe UI and sans-serif fallbacks. Loaded weights are (400, 500, 600). All font faces use `font-display: swap`.

**Character:** the serif supplies the manuscript voice and mathematical expressions; the sans serif supplies operational clarity. Italic serif annotations soften the tactical interface without replacing control labels. The observed hierarchy is bespoke, not a fixed ratio scale.

### Hierarchy

- **Display:** modal titles use the frontmatter display role; below the smallest breakpoint they become (34px). The display role is reserved for the existing introductory, rules, and result dialogs.
- **Headline:** the chapter title uses the frontmatter headline role; at the two smaller breakpoints it becomes (26px) and (23px).
- **Title:** apprentice and hand headings use the frontmatter title role. Enemy titles use related serif sizes (21px; examiner 24px) with compact line height (1.1).
- **Body:** the root uses the frontmatter body role. Modal prose is (12px, line-height 1.9), becoming (11px) on small phones. Battle log prose is (12px, line-height 1.8).
- **Label:** the frontmatter label role records the Ink caption. Other ceremonial labels range down to (5–9px), with tracked uppercase treatments. These are existing compact details, not a recommended size for new functional copy.
- **Mathematics:** the central sigil uses serif (34px, 500); the formula-card expression uses (32px, 600, line-height .9); the result preview uses (28px, 600, line-height 1.1). Health and Ink numerals use tabular figures where declared.
- **Mobile arithmetic:** the final small-screen override uses sans serif (11px, line-height 1.45), minimum height (38px), padding (6px 0), and `overflow-wrap: anywhere`.

**The Readable Proof Rule.** Preserve the final mobile arithmetic override; instructional calculations are functional content, even when ceremonial labels are smaller.

## Layout

The centered shell has a maximum width (1600px) and minimum height (100vh). The desktop masthead is (88px) tall with side padding (48px). The battlefield forms a dark full-width band above a warm workbench and a slightly darker hand surface. The page uses structural rules and alignment to separate tactical regions.

The workbench is a three-column grid (`1fr 1fr 1.1fr`), with padding (25px 48px 26px), gap (32px), and minimum height (303px). The apprentice panel has its own portrait-and-stats grid and a vertical divider. The sigil centers in the second column; controls align at the end of the third, with maximum width (370px). The hand wraps formula cards in a flex row, and turn controls sit beside it behind a vertical divider.

Observed responsive boundaries, including cascade order:

- At minimum width (1450px), the arena grows to (365px); workbench padding becomes (30px 80px); side padding for masthead and hand becomes (64px); cards become (183px × 232px).
- At maximum width (1100px), horizontal space contracts, the workbench becomes `.95fr .85fr 1.1fr`, and cards become (154px × 213px).
- At maximum width (800px), the masthead becomes (74px), the workbench becomes `.9fr 1.1fr`, and the apprentice strip spans both columns. The hand and turn controls stack; turn controls become a horizontal grid with a (200px) action column. The final shield override keeps shield status in normal flow.
- At maximum width (520px), workbench columns become `.8fr 1.2fr`, with padding (18px 16px 20px). Three cards share the width using `calc((100% - 16px)/3)`, minimum width (96px), maximum width (148px), and height (184px). The turn action column becomes (145px). The final variable override places the label above a row of circular controls (44px × 44px).

The common spacing vocabulary is extracted in frontmatter; local card and ornament dimensions remain component-specific. These measurements describe the current implementation, not a requirement to force new surfaces into this exact battle composition.

## Elevation & Depth

Depth combines tonal paper layers, fine borders, inset card frames, a chamber gradient, and restrained shadows. The shell casts a broad ambient shadow; cards lift during interaction; the modal has the strongest shadow over a dark translucent, blurred backdrop. Artwork and architecture stay behind actionable plaques and controls.

### Shadow Vocabulary

- **Shell ambient:** `0 12px 60px #1b332423` — separates the centered paper shell from its surround.
- **Cast action:** `0 4px 10px #214c3d20` — a slight lift under the casting button.
- **Card resting:** `0 7px 13px #4b4d3620` — gives formula cards a physical paper presence.
- **Card hover:** `0 14px 18px #3c51352b` — accompanies the hover lift.
- **Card selected:** `0 10px 20px #2e54452b` — accompanies the raised inscribed state.
- **Modal:** `0 20px 80px #061d25a8` — separates the dialog from the battlefield.

**The Paper Depth Rule.** Preserve the combination of borders, tonal surfaces, and selective lift; shadows support the paper objects and dialog rather than every text group.

## Shapes

Controls use gently eased corners; formula cards have rounder outer frames, a secondary inset border, and a pale inset outline. Circular variable buttons and the circular spellbook button contrast with rectangular actions. The apprentice portrait uses a clipped pentagonal silhouette; the turn banner uses a trapezoid clip. Brass diamond ornaments and the triangle, circle, and square form the recurring geometry.

Most structural dividers are (1px). Selected formula cards use a teal border (2px), with adjusted padding to preserve their contents. Keyboard focus uses a copper outline (3px) with offset (5px). The mobile card radius is distinct from the desktop card radius, as recorded in frontmatter.

## Components

### Action buttons

Compact, deliberate inscriptions. Primary modal, cast, draw, end-turn, and icon variants are separate frontmatter entries because their actual colors, padding, and hover treatments differ. Cast and end-turn actions stretch to their available width. The draw action is transparent with a muted green border and a divided Ink-cost suffix. The spellbook action is circular and outlined.

Buttons transition background, color, transform, and shadow over (.18s). Enabled press moves a button down (1px). Buttons and links receive the shared visible focus outline. Disabled buttons use opacity (.48), except enemy and formula-card buttons; the disabled casting action also changes its background. Preserve disabled semantics alongside the visual treatment.

### Geometry and variable choices

These are button groups, not text inputs. Geometry choices combine an inline outlined SVG and a label; the selected option uses a dark green fill, pale text, and a matching border. Hover changes the border. Variable choices are circles with serif numerals; selection adds a warm fill and darker border, while hover uses a separate warm fill. Both groups expose `aria-pressed`.

At the smallest breakpoint the final variable controls are (44px × 44px), with (21px) numerals. Geometry choices switch between horizontal and stacked icon-label arrangements across breakpoints. There is no implemented free-text input or generic chip component.

### Formula cards

Layered manuscript objects. The frontmatter describes the default desktop size; the responsive sizes are documented in Layout. The pale card has a brass border, inset outline (4px, offset -7px), inset frame, school label, original geometric SVG illustration, serif formula, title, italic description, and cost note. Linear, quadratic, and additive schools have distinct muted artwork backgrounds and ink tones.

Cards rest at slight rotations (-2deg, 1deg, or 2deg by position). Enabled hover lifts them (-9px) and straightens them. Selection lifts them (-12px), straightens them, applies a thicker teal border, and adds the `INSCRIBED` tab. The transition uses (.2s) with `cubic-bezier(.16,1,.3,1)` for the transform. Selected state uses `aria-pressed`; do not remove its written label or border.

### Enemy plaques and status

Enemy targets are portrait buttons with dark translucent rectangular plaques, thin muted borders, serif names, flat health tracks (4px), and compact intent labels. Targeted plaques become lighter green with brass borders and diamond corner marks. Hover uses a brighter plaque and border. Health-track transforms animate over (.4s ease-out). Defeated portrait art fades to opacity (.18) and grayscale, while its plaque fades to (.5); disabled enemy buttons retain full wrapper opacity.

### Sigil

The signature spell surface is an original inline SVG: concentric rings, twelve ticks, four diamond markers, a geometry-specific inner construction, and a parchment center with a serif expression. Its base size is (210px × 210px), with responsive variants. Casting animates the whole sigil over (.85s) using `cubic-bezier(.16,1,.3,1)` and briefly fades the formula; struck portraits animate over (.5s ease-out). The enemy intention pulse lasts (1s ease-out).

### Masthead and dialogs

The masthead is a wordmark link, chapter heading with line-and-diamond ornaments, prototype annotation, and spellbook button. It is not a navigation menu; no tab or active-route system is implemented.

Dialogs use a parchment panel, inner hairline frame (inset 12px), centered serif title, prose, and a full-width continuation or replay button. The backdrop is `#102c29d9` with blur (5px). Maximum dialog height uses the dynamic viewport (`calc(100dvh - 48px)`; small screens `calc(100dvh - 32px)`) and scrolls when needed. Introduction progress is three short bars; rules use icon-and-text rows; result dialogs use a sigil and three statistics. Dialog focus, focus trapping, help-close focus restoration, and background inertness are implemented in React.

Reduced-motion preference removes animations and transitions and disables the backdrop blur. Keep that behavior when extending these components.

## Do's and Don'ts

### Do:

- **Do** keep warm parchment, manuscript ink, teal spellwork, and restrained brass geometry together.
- **Do** use the bundled serif for worldbuilding and mathematics, and the bundled sans serif for tactical controls.
- **Do** preserve the final mobile arithmetic size and circular variable target dimensions.
- **Do** retain written selection states, visible focus, disabled semantics, and reduced-motion support.
- **Do** use original SVG portraits and geometric artwork as the current permitted placeholders.

### Don't:

- **Don't** generate images or consume image credits for this implementation.
- **Don't** copy another property's characters, card frames, or symbols.
- **Don't** treat the placeholder portraits as final anime-fantasy production art.
- **Don't** replace explicit arithmetic or state labels with decorative effects alone.
- **Don't** claim text fields, generic chips, route navigation, or form-validation states are implemented.
