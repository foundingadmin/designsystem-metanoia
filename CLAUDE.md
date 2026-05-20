# CLAUDE.md — Metanoia Design System

## Repo structure

```
/
├── index.html                   ← Single-page design system showcase (GitHub Pages root)
├── colors_and_type.css          ← Barrel file: @imports tokens/* + styles/*
├── styles/                      ← Utility/component CSS — not sync-eligible
│   ├── typography-utilities.css ← @font-face + .t-* classes (not synced with Figma)
│   └── icon-utilities.css       ← .ds-icon component class (Lucide, 2px stroke)
├── tokens/                      ← Atomic token files — source of truth for sync
│   ├── color-primitives.css     ← Raw palette hex values (brand, navy, aqua, grey, status)
│   ├── color-semantic.css       ← Role aliases: bg / fg / border (var() references)
│   ├── typography.css           ← Font family, weight, size, line-height, letter-spacing
│   ├── spacing.css              ← Space scale, radii, shadows, layout containers
│   └── motion.css               ← Easing curves + duration tiers
├── sync/                        ← Sweden sync engine — scripts + reference docs
│   ├── token-map.js             ← CSS ↔ visual tool variable mapping (by collection)
│   ├── sync-figma-to-repo.js   ← Visual → Code diff + PR
│   ├── sync-repo-to-figma.js   ← Code → Visual diff + apply
│   ├── init-figma.js            ← One-time visual tool variable bootstrap
│   ├── SYNC-MASTER.md           ← Sweden architecture overview + routing table
│   ├── CODE-TO-VISUAL.md        ← Code → Visual engine: Plugin API patterns + build reference
│   ├── VISUAL-TO-CODE.md        ← Visual → Code engine: diff + PR workflow
│   ├── BRAND.md                 ← Instance config: all brand-specific values (replace per deployment)
│   ├── META.md                  ← Scaffold governance: rules, anti-patterns, installability
│   ├── RUNDOC_v2.md             ← Current sprint plan (Phase 0–5)
│   ├── FEATURE-LIST.md          ← Sync engine feature backlog
│   └── archive/                 ← Completed sprint RUNDOCs
├── README.md                    ← Brand guidelines, voice, visual foundations
├── SKILL.md                     ← Claude Code skill manifest
├── assets/                      ← Logos (SVG), identity guide PDF, type guide JPG
├── fonts/                       ← Figtree variable + italic TTFs
├── preview/                     ← Individual component/token preview cards (HTML)
└── uploads/                     ← Original brand files from client
```

### Token file responsibilities

| File | What it contains | Figma collections |
|---|---|---|
| `tokens/color-primitives.css` | Raw hex values only — never `var()` | Brand, Navy, Aqua, Grey, Status |
| `tokens/color-semantic.css` | Role aliases (`var()` references) | Background, Foreground, Border |
| `tokens/typography.css` | Font family, size, weight, line-height, letter-spacing | Font Size, Font Weight, Line Height, Letter Spacing |
| `tokens/spacing.css` | Space scale, radii, shadows, container widths | Spacing, Radius, Shadow, Layout |
| `tokens/motion.css` | Easing curves, duration tiers | Motion |
| `styles/typography-utilities.css` | `@font-face` + `.t-*` classes | **Not synced** |
| `styles/icon-utilities.css` | `.ds-icon` component class | **Not synced** |

## Versioning rules

This system uses **Semantic Versioning**: `MAJOR.MINOR.PATCH`

| Bump | When |
|---|---|
| **MAJOR** | Breaking token renames (require find-and-replace in consuming code), component removal, or changes that break existing usage |
| **MINOR** | New components, new token categories, new variants on existing components, significant visual updates |
| **PATCH** | Copy/typo fixes, minor visual tweaks (spacing ≤4px, color shift ≤5%), doc-only updates, new examples within an existing card |

### How to update the version

1. Open `index.html` and update the two constants near the top of the `<script>` block:
   ```js
   const VERSION      = 'x.y.z';
   const LAST_UPDATED = 'Month D, YYYY';
   ```
2. Add a new entry at the **top** of the `CHANGELOG` array (newest first):
   ```js
   {
     version: 'x.y.z',
     date: 'YYYY-MM-DD',
     type: 'major' | 'minor' | 'patch',
     changes: [
       'Short imperative description of what changed',
     ],
   },
   ```
3. Commit: `chore: bump to vX.Y.Z — <one-line summary>`

Current version: **v1.5.1**

## Adding a new preview card

1. Create `preview/components-<name>.html` (or `colors-`, `spacing-`, etc.)
2. Link `../colors_and_type.css` — never hardcode hex values or font sizes.
3. Use `<script src="https://unpkg.com/lucide@latest"></script>` + `lucide.createIcons()` if icons are needed.
4. Add an entry to the `SECTIONS` array in `index.html`:
   ```js
   {
     id: 'name',          // matches <section id="..."> and sidebar link
     group: 'Components', // 'Foundations' | 'Components' (controls sidebar grouping)
     icon: 'lucide-icon-name',
     label: 'Display Name',
     desc: 'One sentence visible on the showcase page.',
     cols: 1,             // 1 | 2 | 3 | 4 (grid columns for card layout)
     cards: [
       { src: 'preview/components-name.html', label: 'Card label' },
     ],
   },
   ```
5. Bump version (MINOR if new component, PATCH if new variant on existing).

## Design rules (quick ref)

- **Font:** Figtree variable (300–900). Always `var(--font-sans)` — never hardcode.
- **Colors:** `var(--color-navy)` `var(--color-aqua)` `var(--color-light-aqua)` + token scale.
- **Wordmark:** always lowercase `metanoia`. Never `Metanoia` or `METANOIA` inside a logo context.
- **Icons:** Lucide only, 2px stroke, 16/20/24px, `currentColor`, never filled.
- **Spacing:** 4px grid. Use `var(--space-*)` tokens.
- **No emoji, no exclamation marks, no decorative gradients, no textures.**
- **Motion:** 120–200–320ms tiers, `var(--ease-standard)`. No bounces or spring overshoots.

## GitHub Pages

The site is served from `index.html` at the repo root.  
URL: `https://foundingadmin.github.io/metanoia-designsys/`

Enable Pages in repo Settings → Pages → Source: **Deploy from branch**, branch: **main**, folder: **/ (root)**.

# Sweden Sync

Sweden is the bi-directional translation layer between the visual world and the code world.
See `sync/SYNC-MASTER.md` for the full architecture overview and direction map.

**Brand config (file key, tokens, component IDs, style keys):** `sync/BRAND.md`

## Routing

| What you say | Read this doc |
|---|---|
| "sync visual → code", "sync Figma → repo" | `sync/VISUAL-TO-CODE.md` |
| "sync code → visual", "sync repo → Figma" | `sync/CODE-TO-VISUAL.md` |
| "build in Figma", "generate components", "push to Figma" | `sync/CODE-TO-VISUAL.md` |
| "add a new token" | `sync/CODE-TO-VISUAL.md` (Adding New Tokens section) |
| "continue the DS build", "next phase", "run the build plan" | `sync/RUNDOC_v2.md` |
| "what features are planned", "sync engine backlog" | `sync/FEATURE-LIST.md` |
| "new brand setup", "install Sweden in a new repo" | `sync/META.md` |

After any `use_figma` call → Build Quality Check in `sync/CODE-TO-VISUAL.md`.
Before editing any `sync/` doc → read `sync/META.md`.
