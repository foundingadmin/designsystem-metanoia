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
`Background` | `Foreground` | `Border` | `Logo`

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
| `Icon` (set) | `270:467` | All icon slots — `Name=<kebab-name>, Size=<16\|20\|24>` |

Component set names (for `figma.root.findOne` or `figma.getNodeById`):
- `Icon` (node `270:467`) — 48 Lucide icons × 3 sizes; use `getIcon(name, size)` helper
- `Button`
- `Form/Tags`

> **Icon Placeholder deleted (Phase 5).** The grey cross-box placeholder
> component (`97:23`) was removed. All components now use the real `Icon`
> component set (`270:467`) directly. Never recreate Icon Placeholder.

---

### Component Set Registry — Code Connect

Populated incrementally during Phase 3–5 build sessions. One row added per `use_figma` session that creates a component set. At Phase 6 this becomes the source of truth for `sync/component-map.js`.

**How to add a row:** After the Build Quality Check (Step 5 in CODE-TO-VISUAL.md), append one row here. The `componentSetNodeId` is the parent COMPONENT_SET node, not an individual variant.

> **Note:** This registry is being formalized into `sync/component-map.js` (Feature 001 — in progress). BRAND.md remains the human-readable reference; `component-map.js` is the machine-readable source of truth used by sync scripts and Code Connect (Feature 002).

| figmaName | componentSetNodeId | cssClass | previewFile |
|---|---|---|---|
| `Logo/Metanoia` | `257:308` | `logo-mark` / `logo-accent` / `logo-wordmark` | `preview/logo-brandmark.html`, `preview/logo-lockups.html`, `preview/logo-wordmark.html` |
| `Button` | `91:489` | `btn` | `preview/components-buttons.html` |
| `Icon` | `270:467` | `ds-icon` | `preview/iconography.html` |
| `Form/Text Input` | `106:387` | — | `preview/components-inputs.html` |
| `Form/Textarea` | `106:413` | — | `preview/components-inputs.html` |
| `Form/Select` | `107:407` | — | `preview/components-inputs.html` |
| `Form/Checkbox` | `107:422` | — | `preview/components-inputs.html` |
| `Form/Radio` | `107:433` | — | `preview/components-inputs.html` |
| `Form/Toggle` | `107:446` | — | `preview/components-inputs.html` |
| `Form/Tags` | `117:437` | `tag` | `preview/components-tags.html` |
| `Form/Badge` | `120:391` | — | `preview/components-tags.html` |
| `Form/Tag Icon` | `120:422` | — | `preview/components-tags.html` |
| `Form/Chip` | `120:430` | — | `preview/components-tags.html` |
| `Card` | `127:458` | — | `preview/components-card.html` |
| `Alert` | `135:542` | — | `preview/components-alerts.html` |
| `Breadcrumb` | `137:537` | — | `preview/components-breadcrumb.html` |
| `Pagination` | `140:570` | — | `preview/components-pagination.html` |
| `Tabs/View Tab Item` | `176:587` | — | `preview/components-tabs.html` |
| `Tabs/Section Tab Item` | `176:612` | — | `preview/components-tabs.html` |
| `Empty State` | `302:429` | — | `preview/components-empty.html` |
| `Nav/Top Item` | `304:278` | — | `preview/components-nav.html` |
| `Nav/Sidebar Item` | `304:321` | — | `preview/components-nav.html` |
| `Nav/Sidebar Label` | `304:322` | — | `preview/components-nav.html` |
| `Nav/Top Bar` | `306:276` | — | `preview/components-nav.html` |
| `Nav/Sidebar` | `306:328` | — | `preview/components-nav.html` |
| `Modal` | `307:453` | — | `preview/components-modal.html` |
| `Hero` | `309:409` | — | `preview/components-hero.html` |
| `Table/Header Cell` | `310:396` | — | — |
| `Table/Cell` | `310:407` | — | — |
| `Table/Row` | `310:447` | — | — |
| `Table/Header Row` | `310:448` | — | — |
| `Data Table` | `310:459` | — | — |
| `DS Status / RunDoc` | `337:571` | — | — |

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
  // Logo (added v2.3.0 — keys resolved 2026-05-21)
  'Logo/Accent':   '725f0f78af9700b74aab0e878bca743ab54a2e53',
  'Logo/Mark':     '5699842a87a48aaff78d6880c346b962a6baf370',
  'Logo/Wordmark': '9b9e0fe20770147a6bf5baa22341ad9cabc0c926',
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

## Variable Collection IDs (Metanoia file `c3ayt4AFrNKOmSkGBIyFi4`)

Confirmed at runtime — use for `setExplicitVariableModeForCollection` calls.

| Collection | ID | Modes |
|---|---|---|
| Primitives | `VariableCollectionId:56:12` | Value: `56:0` |
| Typography | `VariableCollectionId:58:12` | Value: `58:0` |
| Spacing | `VariableCollectionId:58:46` | Value: `58:1` |
| Motion | `VariableCollectionId:58:77` | Value: `58:2` |
| Semantic | `VariableCollectionId:84:12` | Light: `84:0`, Dark: `84:1` |
| Button | `VariableCollectionId:239:227` | Light: `239:0`, Dark: `239:1` |

Key numeric variable IDs (Spacing/Radius — from Spacing collection):

| Token | Variable ID | Value |
|---|---|---|
| Spacing/0 | `VariableID:58:47` | 0px |
| Spacing/1 | `VariableID:58:48` | 4px |
| Spacing/2 | `VariableID:58:49` | 8px |
| Spacing/3 | `VariableID:58:50` | 12px |
| Spacing/4 | `VariableID:58:51` | 16px |
| Spacing/5 | `VariableID:58:52` | 20px |
| Spacing/6 | `VariableID:58:53` | 24px |
| Spacing/8 | `VariableID:58:54` | 32px |
| Spacing/10 | `VariableID:58:55` | 40px |
| Spacing/12 | `VariableID:58:56` | 48px |
| Spacing/16 | `VariableID:58:57` | 64px |
| Spacing/20 | `VariableID:58:58` | 80px |
| Spacing/24 | `VariableID:58:59` | 96px |
| Spacing/32 | `VariableID:58:60` | 128px |
| Radius/XS | `VariableID:58:61` | 2px |
| Radius/SM | `VariableID:58:62` | 4px |
| Radius/MD | `VariableID:58:63` | 8px |
| Radius/LG | `VariableID:58:64` | 12px |
| Radius/XL | `VariableID:58:65` | 16px |

Key semantic color variable IDs (Semantic collection, resolved at runtime):

| Semantic token | Variable ID | Light | Dark |
|---|---|---|---|
| Background/Canvas | `VariableID:84:13` | white | near-black |
| Background/Subtle | `VariableID:84:14` | light grey | dark grey |
| Foreground/Primary | `VariableID:84:18` | `rgb(6,47,74)` navy | white |
| Foreground/Secondary | `VariableID:84:20` | `rgb(86,99,111)` | light grey |
| Foreground/Subtle | `VariableID:84:21` | `rgb(140,151,161)` | dim grey |
| Border/Default | `VariableID:84:25` | light border | dark border |
| Border/Strong | `VariableID:84:26` | medium border | medium border |

Key primitive color variable IDs (Primitives collection):

| Primitive | Variable ID | Value |
|---|---|---|
| Navy (primary dark) | `VariableID:56:13` | `rgb(9,75,119)` |
| Light Aqua (active bg) | `VariableID:56:27` | `rgb(236,250,253)` |
| Background/Canvas white | `VariableID:56:16` | `rgb(255,255,255)` |
| Aqua/300 | resolved via `findVar('Aqua/300')` | `rgb(50,203,237)` |

---

## Design Gotchas

| Issue | Cause | Fix |
|---|---|---|
| **Shadow clipped by parent** | A parent frame has `clipsContent = true`, which clips drop shadows from child elements. | Either remove `clipsContent` on the parent, or move the shadow to the parent itself instead of the child. Never enable clip content on a container that has visually shadowed children. |
| **Dark mode reveals unbound fills** | Text or frame fills using raw hex values don't respond to mode switching — they stay the same color in dark mode. | Always test dark mode after building a page: switch the Figma variable mode on the page frame to `dark` and look for anything that doesn't invert or adapt. Fix by binding fills to `Foreground/*` (text) or `Background/*` (surfaces). |
| **Buttons use Button/* semantics, not Foreground/Background** | Button fills (bg, text, stroke) bind to the `Button/*` variable collection — NOT to `Foreground/*` or `Background/*`. The Button collection has its own Light/Dark modes that adapt contrast independently (e.g. Primary/BG flips Navy/700 → Navy/500). | Never bind button fills to `Foreground/*` or `Background/*`. Destructive buttons are the sole exception — they use `Status/Error/*` primitives directly. |
| **Dark mode frame requires both Semantic and Button collections** | Setting a frame's variable mode to Semantic=Dark only flips surface and text colors. Buttons remain in light mode because the Button collection is a separate collection with its own mode. | When activating dark mode on any frame — in design or via `setExplicitVariableModeForCollection` — always set BOTH `Semantic → Dark` and `Button → Dark` on the same frame. |
| **Repeated components, not molecule variants** | Building N nearly-identical frames/components for repeating content (e.g., three feature cards) creates N master components that must be maintained separately. | Build ONE molecule component with overrideable content properties, then place it N times as instances with content overrides. The What We Do feature cards (Identify / Optimize / Refine) are an example of where this was missed. |
| **Never use Icon Placeholder — use the Icon component directly** | Using the grey cross-box placeholder (`Icon Placeholder`, formerly `97:23`) was a legacy fallback. It creates technical debt: every placeholder must be manually swapped by designers, and they're invisible in component previews. The placeholder component was deleted in Phase 5. | Always use the real `Icon` component set (`270:467`, `Name=<name>, Size=<16\|20\|24>`) for every icon slot in every new component. Use `getIcon(name, size)?.createInstance()`. For nested instance overrides, use `instance.swapComponent(newVariant)` — do NOT use `insertChild` inside an INSTANCE node. |
| **`combineAsVariants()` clips content by default** | `figma.combineAsVariants()` sets `clipsContent = true` on the resulting COMPONENT_SET. Any variant content extending beyond the set bounds is silently clipped — no error, no warning. | Always add `set.clipsContent = false` immediately after `combineAsVariants()`. This was the root cause of clipped footers in Hero and Modal organisms (Phase 5). |
| **Variant frames clip when height is set before content** | Organism COMPONENT frames (modals, heroes, dialogs) with `layoutSizingVertical = 'FIXED'` clip any content appended after the height was locked. Since `clipsContent = true` is Figma's default for auto-layout frames, the overflow is invisible. | Set `layoutSizingVertical = 'HUG'` on COMPONENT variant frames as the LAST operation after all children are appended. Exception: components with explicit height requirements (Nav bars, Table rows, Buttons) keep FIXED. |
| **Inner structural frames also clip independently** | Each inner wrapper frame (header/body/footer sections, column frames in a split-panel hero) has its own `clipsContent = true`. Clearing only the top-level variant frame is insufficient — inner frames clip their own children independently. | Set `clipsContent = false` on every structural wrapper frame inside an organism, not just the outermost variant. Use a recursive helper when building organisms with multiple levels of nesting. |
| **Icon instance fills — white Background/Canvas from placeholder swap** | During icon replacement (Icon Placeholder → real Icon), if the swap helper copies `.fills` from the old placeholder to the new instance, a white `Background/Canvas` fill (VariableID:56:16) lands on the Icon instance root. This is invisible in light mode but breaks dark contexts. | After any icon swap or bulk replacement, always set `inst.fills = []` on every newly created Icon instance. Run a bulk clear pass: `page.findAll(n => n.type==='INSTANCE' && n.mainComponent?.parent?.id==='270:467').forEach(i => { i.fills=[]; })`. Confirmed: 51 instances cleared in Phase 5 revision. |
| **Background/Canvas is NOT white in dark mode** | `Background/Canvas` (VariableID:84:13) resolves to white in light mode but near-black in dark mode. Binding dark-section H1/lead text to this variable makes text invisible in dark mode. | For white text on dark backgrounds: bind to `Foreground/Primary` (VariableID:84:18) which resolves to white in dark mode. `Background/Canvas` is only correct for surface fills, not foreground text. |
| **FILL sizing may fail on children of COMPONENT nodes** | `layoutSizingHorizontal = 'FILL'` on a node inside a COMPONENT (as opposed to a FRAME) may throw "node must be an auto-layout frame or a child of one" even when the parent COMPONENT has `layoutMode` set. | Use `resize(exactPx, exactPx)` with `layoutSizingHorizontal = 'FIXED'` instead of FILL for direct children of COMPONENT nodes. FILL works normally for FRAME→FRAME parent-child relationships. |
| **Organism organisms must use DS atomics — not raw frames** | Phase 5 organisms were initially built with raw frame+text constructions for inputs, badges, and logo areas. This breaks the atomic component hierarchy and means changes to the atom don't propagate to organisms. | Before building any input field, badge, search bar, logo, or button in an organism, check the Component Set Registry. If an atomic exists (Form/Text Input, Form/Badge, Logo/Metanoia, etc.), create an instance of it. Never hand-build UI elements that have existing atomic components. |
