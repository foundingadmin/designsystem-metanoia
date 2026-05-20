# Brand Config — Metanoia Design System

This file is the **instance configuration** for running Sweden in this repo.
It contains every value that is specific to the Metanoia brand.

To deploy Sweden to a new brand: replace this file. Keep all engine docs
(CODE-TO-VISUAL.md, VISUAL-TO-CODE.md, SYNC-MASTER.md) unchanged.

---

## Identity

| Key | Value |
|---|---|
| Brand name | `metanoia` (always lowercase in logo contexts) |
| Visual tool file key | `c3ayt4AFrNKOmSkGBIyFi4` |

---

## Font

Family: **Figtree** (variable font — `fonts/` directory)

```js
// Load in every use_figma session that touches text nodes
await Promise.all([
  figma.loadFontAsync({ family: 'Figtree', style: 'Light' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Medium' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'SemiBold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Bold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'ExtraBold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Black' }),
]);
```

---

## Visual Tool Collections

Primitive collections (raw hex values):
`Brand` | `Navy` | `Aqua` | `Grey` | `Status`

Semantic collections (role aliases):
`Background` | `Foreground` | `Border`

Other collections:
`Font Size` | `Font Weight` | `Line Height` | `Letter Spacing` | `Spacing` | `Radius` | `Shadow` | `Layout` | `Motion`

---

## Visual Tool Page Names

| Purpose | Page name (case-insensitive match) |
|---|---|
| Design system foundations | `ds` |
| Components | `components` |

```js
// Page navigation (matches Script Skeleton in CODE-TO-VISUAL.md)
let dsPage = figma.root.children.find(p => p.name.toLowerCase() === 'ds')
          || figma.root.children.find(p => p.name.toLowerCase() === 'components')
          || figma.root.children[0];
```

---

## Text Style Reference

Import keys for `figma.importStyleByKeyAsync(key)`.

| Style | Size | Weight | Use for |
|---|---|---|---|
| `Display` | 120px | SemiBold | Hero headlines, oversized display copy |
| `H1` | 56px | Bold | Page-level section titles |
| `H2` | 36px | Bold | Sub-section headings |
| `H3` | 28px | SemiBold | Card headings, panel titles |
| `H4` | 24px | SemiBold | Widget headings |
| `H5` | 18px | SemiBold | Small headings, sidebar labels |
| `Lead` | 20px | Regular | Hero subheadlines, intro paragraphs |
| `Body` | 16px | Regular | General body copy |
| `Body SM` | 14px | Regular | Secondary body, tooltips |
| `Caption` | 12px | Regular | Meta text, timestamps, helper text |
| `Eyebrow` | 13px | SemiBold | Section labels, overlines, scroll hints |
| `Button/LG` | 16px | SemiBold | Button labels (LG) |
| `Button/MD` | 14px | SemiBold | Button labels (MD) |
| `Button/SM` | 13px | SemiBold | Button labels (SM) |

```js
const STYLE_KEYS = {
  Display:   '953cc7c70ecd20225ec1567de6eca312ec2950a9',
  H1:        'fbf29ded61ada664d8e978eb541699c61fc8ad03',
  H2:        'a74916e8929fcba3f9e91e83a4736ec0e321bc3b',
  H3:        '7ba49e021ec8f1a355df99558f60f86c74730bd5',
  H4:        'e7a6049a72fa9c8cd3d8f83c65e2e5d1ffaa0288',
  H5:        '172797ec72f8a69492e51cd5ef2477fe2cc676b3',
  Lead:      '4fda3fb5b62786c8ae422e4490f10171dd9bfe02',
  Body:      '54fb83862a34c5ce0c05a672569d28bd5279129f',
  BodySM:    '72056ef233cf71013d5feffc7d0240827e09c478',
  Caption:   '47c93009606a68582c3da18475a8b62f60e38bb6',
  Eyebrow:   '513fc5b8e12dc93b9ee2ac225850f76f7b8a9463',
  ButtonLG:  '749be6e5903f421139d621cb0362f80414045be1',
  ButtonMD:  'ef29637a567c1f3689d9ffd8c0bf15e64de2f9c5',
  ButtonSM:  '6b67c23effcb998d52cd0df2c0669da2e630dfe7',
};
```

---

## Line Height Reference

Set directly on text styles — NOT bound to variables (see Line Height Gotcha in CODE-TO-VISUAL.md).

| Style | PERCENT value |
|---|---|
| Display | 95% |
| H1 | 105% |
| H2, H3, H4, H5 | 120% |
| Eyebrow | 120% |
| Lead, Body | 160% |
| Body SM, Caption | 145% |
| Button/SM, Button/MD, Button/LG | 145% |

---

## Component Node ID Reference

Use `figma.getNodeById(id)` to reference local components.

| Component | Node ID | Use for |
|---|---|---|
| `Button` Primary LG Default | `91:89` | Hero primary CTA |
| `Button` Ghost LG Default | `91:329` | Hero secondary / ghost CTA |
| `Button` Secondary LG Default | `91:209` | Secondary section CTA |
| `Form/Tag Icon` Color=Info | `120:410` | Accent/aqua overline badge |
| `Form/Tag Icon` Color=Neutral | `120:416` | Neutral overline label |
| `Form/Tags` Info SM Subtle | `117:386` | Small status/info tag |
| `Form/Tags` Info MD Subtle | `117:401` | Medium status/info tag |
| `Icon/Placeholder` (set) | `97:23` | Icon slots (Size=16/20/24) |

Component set names (for `figma.root.findOne`):
- `Icon Placeholder` (no slash)
- `Button`
- `Form/Tags`

---

### Component Set Registry — Code Connect

Populated incrementally during Phase 3–5 build sessions. One row added per `use_figma` session that creates a component set. At Phase 6 this becomes the source of truth for `sync/component-map.js`.

**How to add a row:** After the Build Quality Check (Step 5 in CODE-TO-VISUAL.md), append one row here. The `componentSetNodeId` is the parent COMPONENT_SET node, not an individual variant.

| figmaName | componentSetNodeId | cssClass | previewFile |
|---|---|---|---|
| `Button` | TBD | `btn` | `preview/components-buttons.html` |
| `Form/Tags` | TBD | `tag` | `preview/components-tags.html` |
| `Icon Placeholder` | `97:23` | — | `preview/iconography.html` |

---

## Semantic Variable Reference

Import keys for `figma.variables.importVariableByKeyAsync(key)`.
All fills on page designs must use semantic variables for light/dark mode support.

```js
const SEMANTIC_KEYS = {
  // Background
  'Background/Canvas':      '159cc782cb7c31b4b91f49b052c8646ad625dbcd',
  'Background/Subtle':      'dab745b116f097c6ff5fc471cae1d5e8bce4bc4c',
  'Background/Muted':       'cc4da4d3867ce625837de13a0753013e1e9cdcba',
  'Background/Accent':      '0216a234bbbf94c9ed5a0fa8eefe2112e60d2455',
  'Background/Accent Soft': '1ed61b769060661c5bba045261c38b1ff83992e3',
  // Foreground
  'Foreground/Primary':     'e64a5fa8357f5aa5ac0a1c2f21837b425d329c89',
  'Foreground/Secondary':   'fc4d33132916e2a02c8d31e333b7e75e1bf94e59',
  'Foreground/Body':        '3df3ae87ee4362e41878a8eaf8c599da10b8eadb',
  'Foreground/Tertiary':    'b5b8905c72685a71d9d3e12484f08b20d3250828',
  'Foreground/Accent':      '15ef0bf2b272f731df107919fc97ec4962931cca',
  'Foreground/Link':        'c2c175656821ec59657c3d0b22fe0aeba941120f',
  'Foreground/Link Hover':  'f33cb574a6101e566792c20b95c015f21746aa22',
  // Border
  'Border/Accent':          '26fcc1205c04d3d0d5e0ac196ce5fe068a4496aa',
};
```

---

## Button Color Token Mapping

Primary, Secondary, and Ghost buttons bind to `Button/*` semantic variables (light/dark mode aware).
Destructive buttons bind directly to `Status/Error/*` primitives (red maintains contrast in both modes).

| Button type + state | Background variable | Text variable | Border variable |
|---|---|---|---|
| Primary / Default | `Button/Primary/BG` | `Button/Primary/Text` | — |
| Primary / Hover | `Button/Primary/BG-Hover` | `Button/Primary/Text` | — |
| Primary / Active | `Button/Primary/BG-Active` | `Button/Primary/Text` | — |
| Primary / Disabled | `Button/Primary/BG-Disabled` | `Button/Primary/Text-Disabled` | — |
| Secondary / Default | `Button/Secondary/BG` | `Button/Secondary/Text` | `Button/Secondary/Border` |
| Secondary / Hover | `Button/Secondary/BG-Hover` | `Button/Secondary/Text` | `Button/Secondary/Border-Hover` |
| Secondary / Active | `Button/Secondary/BG-Active` | `Button/Secondary/Text` | `Button/Secondary/Border-Active` |
| Secondary / Disabled | `Button/Secondary/BG-Disabled` | `Button/Secondary/Text-Disabled` | `Button/Secondary/Border-Disabled` |
| Ghost / Default | transparent | `Button/Ghost/Text` | `Button/Ghost/Border` |
| Ghost / Hover | `Button/Ghost/BG-Hover` | `Button/Ghost/Text` | `Button/Ghost/Border` |
| Ghost / Active | `Button/Ghost/BG-Active` | `Button/Ghost/Text` | `Button/Ghost/Border` |
| Ghost / Disabled | transparent | `Button/Ghost/Text-Disabled` | `Button/Ghost/Border-Disabled` |
| Destructive / Default | `Status/Error/600` | `Brand/White` | — |
| Destructive / Hover | `Status/Error/700` | `Brand/White` | — |
| Destructive / Active | `Status/Error/800` | `Brand/White` | — |
| Any / Focus | default bg | default text | + focus ring effect |

### Button semantic token values (light → dark)

| Token | Light mode | Dark mode |
|---|---|---|
| `Button/Primary/BG` | `Navy/700` | `Navy/500` |
| `Button/Primary/BG-Hover` | `Navy/500` | `Aqua/700` |
| `Button/Primary/BG-Active` | `Navy/900` | `Navy/700` |
| `Button/Secondary/BG` | `Brand/White` | `Grey/800` |
| `Button/Secondary/Text` | `Navy/900` | `Brand/White` |
| `Button/Secondary/Border` | `Navy/700` | `Grey/500` |
| `Button/Ghost/Text` | `Navy/700` | `Brand/White` |
| `Button/Ghost/Border` | `Grey/300` | `Grey/600` |

> CSS equivalents: `--btn-primary-bg`, `--btn-secondary-bg`, etc. in `tokens/color-semantic.css`.
> `Status/Error/700` (`#B83C24`) was added to the primitive scale to support the Destructive hover state.

---

## Icon/Placeholder Colors

| Role | Hex | Used for |
|---|---|---|
| Fill | `#ECEFF2` | grey-100 background |
| Stroke | `#B6BEC6` | grey-300 border |
| Cross icon | `#6E7A86` | cross rectangles |

---

## Spacing and Radius Tokens

| Token | Variable name | Value |
|---|---|---|
| Padding SM vertical | `Spacing/2` | 8px |
| Padding SM horizontal | explicit (no var) | 14px |
| Padding MD vertical | `Spacing/3` | 12px |
| Padding MD horizontal | `Spacing/5` | 20px |
| Padding LG vertical | explicit (no var) | 14px |
| Padding LG horizontal | `Spacing/6` | 24px |
| Gap (all sizes) | `Spacing/2` | 8px |
| Corner radius | `Radius/MD` | 8px |

---

## Button Size Specifications

Matching `preview/components-buttons.html`:

| Size | paddingV | paddingH | gap | iconSize | Radius var | Expected height |
|---|---|---|---|---|---|---|
| SM | 8px (Spacing/2) | 14px | 8px | 16px | Radius/MD | 35px |
| MD | 12px (Spacing/3) | 20px (Spacing/5) | 8px | 16px | Radius/MD | 44px |
| LG | 14px | 24px (Spacing/6) | 8px | 20px | Radius/MD | 51px |

---

## Focus Ring

WCAG-compliant double-ring drop shadow:

| Layer | Color | Spread | Radius |
|---|---|---|---|
| Inner white gap | `#FFFFFF` at 100% | 2px | 0px |
| Outer brand ring | `#32CBED` (aqua) at 85% | 4px | 1px |

RGB for outer ring: `{ r: 0.196, g: 0.796, b: 0.929, a: 0.85 }`

---

## Pre-flight Required Variables

These must exist in the visual tool before building any component:

```js
const required = [
  // Primitives
  'Brand/Navy', 'Brand/White',
  'Navy/700', 'Navy/900', 'Navy/500', 'Navy/100',
  'Status/Error/600', 'Status/Error/700', 'Status/Error/800',
  'Grey/100', 'Grey/300',
  // Layout tokens
  'Radius/MD', 'Spacing/2', 'Spacing/3', 'Spacing/5', 'Spacing/6',
];
// Required text styles: 'Button/SM', 'Button/MD', 'Button/LG', 'Body', 'Body SM'
```

---

## Design Rules

| Rule | Value |
|---|---|
| Wordmark | always lowercase `metanoia` — never `Metanoia` or `METANOIA` in logo context |
| Icons | Lucide only, 2px stroke, 16/20/24px, `currentColor`, never filled |
| Spacing grid | 4px |
| Motion tiers | 120–200–320ms |
| Prohibited | emoji, exclamation marks, decorative gradients, textures |

---

## Copy & Voice

| Rule | Guidance |
|---|---|
| **No hyphens** | Never hyphenate compound modifiers — "enterprise grade" not "enterprise-grade", "world class" not "world-class", "asset intensive" not "asset-intensive". Exception: hyphenated proper nouns and part numbers only. |
| **No em-dashes** | Do not use em-dashes (—) as mid-clause separators in body copy. Replace with a comma, restructure the sentence, or break into two sentences. Em-dashes are acceptable only in headlines or fragment-style headings where they serve as a period substitute. |
| **Overlines** | Section overlines at the top of a section use the Eyebrow text style and are written **ALL CAPS** (e.g. "WHAT WE DO", "PLATFORM"). They are bare text nodes — no tag/pill atom components. |
| **Sentence fragments** | Fragments are encouraged for headlines and overlines. ("The Right Parts. The Right Data.") |
| **Sentence case** | Headings use sentence case, not Title Case, unless the copy contains a product name or proper noun. |
| **Tone** | Direct, declarative, industrial. Avoid: "empower", "unlock", "leverage", "seamless", "game-changing", exclamation marks. |
| **Numbers** | Numerals for all counts and stats (25+, 2M+, 200+) — never spelled out. |

---

## Design Gotchas

| Issue | Cause | Fix |
|---|---|---|
| **Shadow clipped by parent** | A parent frame has `clipsContent = true`, which clips drop shadows from child elements. | Either remove `clipsContent` on the parent, or move the shadow to the parent itself instead of the child. Never enable clip content on a container that has visually shadowed children. |
| **Dark mode reveals unbound fills** | Text or frame fills using raw hex values don't respond to mode switching — they stay the same color in dark mode. | Always test dark mode after building a page: switch the Figma variable mode on the page frame to `dark` and look for anything that doesn't invert or adapt. Fix by binding fills to `Foreground/*` (text) or `Background/*` (surfaces). |
| **Buttons use Button/* semantics, not Foreground/Background** | Button fills (bg, text, stroke) bind to the `Button/*` variable collection — NOT to `Foreground/*` or `Background/*`. The Button collection has its own Light/Dark modes that adapt contrast independently (e.g. Primary/BG flips Navy/700 → Navy/500). | Never bind button fills to `Foreground/*` or `Background/*`. Destructive buttons are the sole exception — they use `Status/Error/*` primitives directly. |
| **Dark mode frame requires both Semantic and Button collections** | Setting a frame's variable mode to Semantic=Dark only flips surface and text colors. Buttons remain in light mode because the Button collection is a separate collection with its own mode. | When activating dark mode on any frame — in design or via `setExplicitVariableModeForCollection` — always set BOTH `Semantic → Dark` and `Button → Dark` on the same frame. |
| **Repeated components, not molecule variants** | Building N nearly-identical frames/components for repeating content (e.g., three feature cards) creates N master components that must be maintained separately. | Build ONE molecule component with overrideable content properties, then place it N times as instances with content overrides. The What We Do feature cards (Identify / Optimize / Refine) are an example of where this was missed. |
