# **Plan v2: Build Complete Metanoia Design System in Figma**

## (Incorporating Full Feedback Pass)

---

## Current Status — v2.6.0 · Updated 2026-05-20

| Phase | What | Status | Shipped |
| :---- | :---- | :---- | :---- |
| 0 | Token corrections (CSS) | ✅ Complete | v2.0.0 |
| 1 | Figma variable bootstrap (5 collections) | ✅ Complete | v2.0.0 |
| 2 | Text styles (14) + Effect styles (6) | ✅ Complete | v2.1.0 |
| 3a | Logo component set | ✅ Complete | v2.3.0 |
| 3b | Icon component library (48 × 3 sizes) | ✅ Complete | v2.4.0 |
| 3c | Buttons + Icon/Placeholder | ✅ Complete | v2.1.0 |
| 3d | Form Inputs (6 types, all states) | ✅ Complete | v2.2.0 |
| 3e | Tags & Badges | ✅ Complete | v2.2.0 |
| **4** | **Molecules: Cards, Alerts, Breadcrumb, Pagination, Tabs** | **→ Active** | — |
| 5 | Organisms: Nav, Modal, Table, Hero, Empty States | ❌ Not started | — |
| RunDoc frame | DS Status page + RunDoc frame in Figma | ❌ Not created | — |

**Open gaps (tracked, not yet resolved):**
- Button and Form/Tags `COMPONENT_SET` node IDs still TBD in `sync/component-map.js` and `sync/BRAND.md`
- Logo semantic variable import keys (`Logo/Accent`, `Logo/Mark`, `Logo/Wordmark`) marked TBD in `sync/BRAND.md`

---

## Context

The coded DS has 5 atomic token files. The Figma file (key: `c3ayt4AFrNKOmSkGBIyFi4`) has variables, styles, and atom components — all built during Phases 0–3. Phases 4–5 complete the molecule and organism layers. HTML preview files for all Phase 4–5 components exist from v1.1.0; those are the coded reference for the Figma build.

---

## Scope Overview

| Phase | What | Where |
| :---- | :---- | :---- |
| 0 | Token corrections + dark mode in CSS | tokens/\*.css, token-map.js, styles/typography-utilities.css |
| 1 | Bootstrap 5 Figma variable collections (Light + Dark modes) | sync/init-figma.js → use\_figma |
| 2 | Text styles (14) + Effect styles (6) | use\_figma |
| 3 | Atoms: Buttons, Inputs, Tags, Icon library | use\_figma per component |
| 4 | Molecules: Cards, Alerts, Breadcrumb, Pagination, Tabs | use\_figma per component |
| 5 | Organisms: Nav, Modal, Table, Hero, Empty States | use\_figma per component |
| — | RunDoc frame updated at end of each sprint | use\_figma |

---

## ✅ Phase 0 — Token Corrections (COMPLETE — v2.0.0)

All three sub-tasks landed in v2.0.0:

- **0a** — `--lh-display: 0.95` and `--ls-display: -0.035em` added to `tokens/typography.css`
- **0b** — `--ls-wide (0.04em)` renamed to `--ls-loose`; `--ls-eyebrow (0.12em)` renamed to `--ls-wide`; `.t-eyebrow` updated to use `var(--ls-wide)`
- **0c** — `tokens/color-semantic.css` restructured with `:root` (Light) and `[data-theme="dark"]` blocks; `@media (prefers-color-scheme: dark)` fallback added; `--bg-inverse*`, `--fg-on-dark*`, `--border-on-dark` removed (breaking — major version bump)

**Divergence from original plan:** `--btn-*` semantic token variables (Primary, Secondary, Ghost × all states × light/dark) were added to `color-semantic.css` and `token-map.js` beyond the original bg/fg/border scope. These were needed for the Button component build in Phase 3c.

---

## ✅ Phase 1 — Variable Bootstrap (COMPLETE — v2.0.0)

`sync/init-figma.js` created and executed. All 5 Figma variable collections exist:

- **Primitives** — raw hex COLOR variables
- **Semantic** — role alias COLOR variables, 2 modes: Light / Dark
- **Typography** — FLOAT variables for font size, weight, line height, letter spacing
- **Spacing** — FLOAT variables for space scale, radii, shadows (STRING), layout containers
- **Motion** — STRING easing curves + FLOAT duration tiers

Total variable count exceeds the original estimate of 154 due to the added button semantic tokens and icon stroke tokens (v2.6.0: `Spacing/Icon Stroke/SM·MD·LG`).

---

## ✅ Phase 2 — Text Styles + Effect Styles (COMPLETE — v2.1.0)

### Text Styles (14 styles, variable-bound)

All use Figtree. Line heights are set as explicit PERCENT values (not variable-bound — see Line Height Gotcha in `sync/CODE-TO-VISUAL.md`). Import keys live in `sync/BRAND.md → STYLE_KEYS`.

**Display & Heading styles:**

| Style | Font Size | Weight | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- | :---- |
| Display | Font Size/120 Display XL | Font Weight/600 Semibold | 95% | Letter Spacing/Display |
| H1 | Font Size/56 H1 | Font Weight/700 Bold | 105% | Letter Spacing/Tight |
| H2 | Font Size/36 H2 | Font Weight/700 Bold | 120% | Letter Spacing/Snug |
| H3 | Font Size/28 H3 | Font Weight/600 Semibold | 120% | Letter Spacing/Snug |
| H4 | Font Size/24 H4 | Font Weight/600 Semibold | 120% | Letter Spacing/Normal |
| H5 | Font Size/18 Body LG | Font Weight/600 Semibold | 120% | Letter Spacing/Normal |

**Body & UI styles:**

| Style | Font Size | Weight | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- | :---- |
| Lead | Font Size/20 | Font Weight/400 Regular | 160% | Letter Spacing/Normal |
| Body | Font Size/16 Body | Font Weight/400 Regular | 160% | Letter Spacing/Normal |
| Body SM | Font Size/14 Small | Font Weight/400 Regular | 145% | Letter Spacing/Normal |
| Caption | Font Size/12 Micro | Font Weight/400 Regular | 145% | Letter Spacing/Normal |
| Eyebrow | Font Size/13 Caption | Font Weight/600 Semibold | 120% | Letter Spacing/Wide |

**Button-specific styles:**

| Style | Font Size | Weight | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- | :---- |
| Button/LG | Font Size/16 Body | Font Weight/600 Semibold | 145% | Letter Spacing/Normal |
| Button/MD | Font Size/14 Small | Font Weight/600 Semibold | 145% | Letter Spacing/Normal |
| Button/SM | Font Size/13 Caption | Font Weight/600 Semibold | 145% | Letter Spacing/Normal |

### Effect Styles (6 shadow styles)

| Style | CSS token |
| :---- | :---- |
| Shadow/XS | `--shadow-xs` |
| Shadow/SM | `--shadow-sm` |
| Shadow/MD | `--shadow-md` |
| Shadow/LG | `--shadow-lg` |
| Shadow/XL | `--shadow-xl` |
| Shadow/Focus | `--shadow-focus` |

---

## ✅ Phase 3 — Atoms (COMPLETE)

### 3a. Logo (v2.3.0) — node ID `257:308`

9 variants: Mark × [Brandmark, Horizontal Lockup, Vertical Lockup] × [Full Color, Mono White, Mono Dark]. Logo semantic color variables added: `Logo/Accent`, `Logo/Mark`, `Logo/Wordmark` (import keys TBD in BRAND.md).

### 3b. Icon Component Library (v2.4.0) — node ID `270:467`

48 icons × 3 sizes (16/20/24) = 144 variants. Catalog in `sync/component-map.js → ICON_CATALOG`. Icon stroke weights bound to `Spacing/Icon Stroke/SM·MD·LG` variables (v2.6.0).

### 3c. Buttons + Icon/Placeholder (v2.1.0)

- **Icon/Placeholder** — node ID `97:23`; Size=[16,20,24] property; used as slot in all components
- **Button** — 4 types × 3 sizes × 3 icon modes × 5 states = 180 variants + 60 icon-only; node ID **TBD** (record after next session)
- All fills bound to `Button/*` semantic variables; corner radius bound to `Radius/MD`; padding to `Spacing/*`; icon slots use Icon/Placeholder instances

### 3d. Form Inputs (v2.2.0)

Text Input, Textarea, Select, Checkbox, Radio, Toggle — all states. Text styles: Body SM (labels), Body (input value/placeholder), Caption (helper/error). Bindings: `Border/Default`, `Border/Accent` (focus), `Background/Canvas`, focus ring effect, `Radius/MD`.

### 3e. Tags & Badges (v2.2.0) — node ID **TBD**

5 colors × 2 sizes × 2 styles (Subtle/Bold) = 20 base variants + count badges + filter chips + icon slots. Bindings: Status color variables, `Radius/Pill`. Text: Caption (SM) / Body SM (MD).

---

## → Phase 4 — Molecules (ACTIVE)

Each molecule uses nested atom instances — no recreating from scratch. HTML previews at `preview/components-*.html` are the coded reference.

### 4a. Cards

**Variants:** Elevation [Flat, Raised, Floating]

Note: Light/Dark is handled by variable modes at the design level — not separate variants.

Bindings: `Background/Canvas`, `Border/Subtle`, shadow effect styles. Text layers use Body, Body SM, H4. Footer slot uses Button atom instances.

### 4b. Alerts

**Variants:** Type [Info, Success, Warning, Error] × Style [Inline, Banner]

Structure: Icon/Placeholder atom + title (Body, semibold) + body (Body SM) + optional dismiss (Button, Ghost, Trailing Icon). Bindings: status color variables per type.

### 4c. Breadcrumb

**Variants:** State [Default, With Home Icon]

Separator: chevron only. Uses Icon/Placeholder for home icon and chevron separators. Text: Body SM.

### 4d. Pagination

**Variants:** Type [Numbered, Prev/Next, Compact]

Uses Button atom instances (Ghost type) for page number buttons and prev/next controls. Row-count selector uses Select input atom.

### 4e. Tabs — renamed

- **View Tabs** (was "Underline") — top-level live area switching, full-width underline indicator
- **Section Tabs** (was "Pill") — subsection switching within a live area, pill-shaped

**Variants for each:** State per tab item [Default, Active, Hover, Disabled] × optional Count badge. Text: Body SM (semibold for active).

---

## Phase 5 — Organisms

Each organism uses nested molecule AND atom instances.

### 5a. Navigation

**Top Nav:** Button atoms (Ghost, icon variants) for action items. Icon/Placeholder for nav logo. Text: H5 and Body SM.
**Sidebar Nav:** Icon/Placeholder atoms in each nav item. Group labels: Eyebrow style. Nav items: Body SM (Body on hover/active).

Dark mode applied at design level via variable mode switch — not a separate variant.

### 5b. Modal / Dialog

**Variants:** Type [Confirm, Destructive, Form, Success]

Structure:
- Header: H4 title + Icon/Placeholder atom + close button (Button, Icon-only, Ghost)
- Body: Body text style
- Footer: Button atoms — primary action + secondary action

### 5c. Table — Full Atomic Breakdown

**Atoms:**
- Table Cell: Content [Text, Mono, Status Tag, Action, Checkbox, Number] × Align [Left, Center, Right]
- Table Header Cell: Sort [None, Ascending, Descending] + same Content types

**Molecules:**
- Table Row: State [Default, Hover, Selected, Disabled]
- Table Header Row
- Table Footer Row (with pagination molecule)

**Organisms (3 table types):**
- **Data Table** — granular records, mono IDs, status tags, sortable columns, row checkboxes, horizontal scroll + sticky first column
- **Pricing Table** — feature comparison, checkmark cells, tier headers, accent highlight column
- **Feature Matrix** — attribute/spec comparisons

Responsive strategy: horizontal overflow scroll with sticky first column at <768px. Mobile (<480px): option to convert to accordion rows.

### 5d. Hero

**Modes:** Light and Dark (via variable modes — not separate variants)
**Variants:** Layout [Full Bleed, Split Panel]

"Split panel" = left side Light mode, right side Dark mode, achieved via nested frames with mode overrides.

### 5e. Empty States

**Variants:** Type [First Use, No Results, Error, Loading/Skeleton]

Uses Icon/Placeholder atom, Button atoms (CTA), H4 + Body + Body SM text styles. Content matches `preview/components-empty.html`.

---

## Sprint / RunDoc System

**Each sprint = one `use_figma` session.** At the start of Phase 4, create a `DS Status` page in the Figma file (not yet done). A `RunDoc` frame on that page is updated at the end of every sprint:

```
Metanoia DS — Build RunDoc
Sprint: [N] / [Total]
Last run: [date]
Status: [In Progress / Complete / Blocked]

Completed:
  ✓ Phase 0 — Token corrections (v2.0.0)
  ✓ Phase 1 — Variables (5 collections, Light/Dark modes)
  ✓ Phase 2 — Text styles (14) + Effect styles (6)
  ✓ Phase 3 — Atoms: Logo, Icons, Buttons, Inputs, Tags
  ...

In progress:
  → Phase 4a — Cards

Next:
  Phase 4b — Alerts

Notes / Blockers:
  [any issues from last run]
```

---

## Reusable Code (no duplication)

- `parseCssVars(cssText)` — `sync-repo-to-figma.js:24`
- `resolveAll(vars)` — `sync-repo-to-figma.js:34`
- `cssColorToFigma(val)` — `sync-repo-to-figma.js:52`
- `remToPx`, `pxToNum`, `emToNum`, `msToNum` — `sync/token-map.js` (exported)
- `TOKEN_MAP` — `sync/token-map.js` (alias lookup)

---

## Verification Checklist

### After Phase 0 (✅ Complete — v2.0.0):

- [x] `--ls-wide` = 0.12em in CSS; `--ls-loose` = 0.04em
- [x] `.t-eyebrow` uses `var(--ls-wide)` and renders correctly
- [x] `[data-theme="dark"]` applied to `<html>` inverts canvas/fg/border tokens correctly
- [x] No references to removed tokens (`--bg-inverse`, `--fg-on-dark`, etc.) in any file
- [x] Version = v2.0.0

### After Phase 1 (✅ Complete — v2.0.0):

- [x] 5 collections visible in Figma: Primitives, Semantic, Typography, Spacing, Motion
- [x] Semantic collection has 2 modes: Light and Dark
- [x] `Background/Canvas` Light mode = alias to `Brand/White`; Dark mode = alias to `Grey/900`
- [x] `Font Size/16 Body` = 16 (FLOAT)
- [x] `Motion/Duration Fast` = 120 (FLOAT)

### After Phase 2 (✅ Complete — v2.1.0):

- [x] 14 text styles visible in Figma (11 Display/Body/UI + 3 Button/SM/MD/LG), all with correct font + weight
- [x] 6 effect styles visible; multi-value shadows have multiple effects stacked
- [x] Line heights set as explicit PERCENT (not variable-bound)
- [x] `Body` text style → Figtree 16px/160%; `Button/MD` → Figtree 14px/semibold/145%

### After Phase 3 (✅ Complete — v2.2.0–v2.4.0):

- [x] 9 Logo variants in Figma; Logo semantic variables flip navy→white in dark mode
- [x] 144 Icon variants (48 icons × 3 sizes); icon strokes bound to stroke token variables
- [x] Button component set: all 180+ variants; fills bound to `Button/*` semantic vars
- [x] Icon/Placeholder: swappable with any Lucide icon component
- [x] Form inputs: all 6 types, all states; correct text styles and variable bindings
- [x] Tags: all 20 base variants; status color variable bindings

### After Phase 4 (target):

- [ ] Card Elevation variants: Flat/Raised/Floating; shadow effect styles applied
- [ ] Toggle Dark mode on a card frame → all semantic tokens flip correctly
- [ ] Alert variants: 4 types × 2 styles; Icon/Placeholder atoms nested
- [ ] Breadcrumb and Pagination use Button and Input atom instances (not recreated layers)
- [ ] Tabs: View Tabs and Section Tabs as separate component sets; active state distinct

### After Phase 5 (target):

- [ ] Edit `--color-navy` in CSS → run `sync-repo-to-figma.js` → Button Primary background updates via alias chain
- [ ] Hero: Light mode = white canvas; Dark mode = grey-900 canvas (same component, mode switched)
- [ ] Split-panel Hero: left frame Light mode, right frame Dark mode via mode overrides
- [ ] Organism uses molecule instances; molecules use atom instances (no recreated layers)
- [ ] Table responsive: horizontal scroll with sticky first column at <768px
