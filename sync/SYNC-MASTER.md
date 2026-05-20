# Sweden Sync — Master Reference

Sweden is a neutral, bi-directional translation layer that lets designers and engineers
work on the same product without leaving their home tools. It translates changes from
the visual world into code, and from code into visual elements — silently, without
the traditional handoff throwing files over a wall.

**Active brand config:** `sync/BRAND.md`
**Before editing any sync/ doc:** read `sync/META.md`

---

## Two Directions

| Direction | Doc | What it does |
|---|---|---|
| Visual → Code | `sync/VISUAL-TO-CODE.md` | Reads visual tool variables, diffs CSS, opens a PR |
| Code → Visual | `sync/CODE-TO-VISUAL.md` | Reads CSS tokens, updates visual tool variables; covers building visual components from code |

---

## Trigger Phrase Routing

| What the user says | Read this doc |
|---|---|
| "sync visual → code", "sync Figma → repo" | `sync/VISUAL-TO-CODE.md` |
| "sync code → visual", "sync repo → Figma" | `sync/CODE-TO-VISUAL.md` |
| "show me the diff" | Ask which direction, then open the corresponding doc |
| "build in Figma", "generate components", "push to Figma" | `sync/CODE-TO-VISUAL.md` |
| "add a new token" | `sync/CODE-TO-VISUAL.md` (Adding New Tokens section) |
| "continue the DS build", "next phase", "run the build plan" | `sync/RUNDOC_v2.md` |
| "what features are planned", "sync engine backlog" | `sync/FEATURE-LIST.md` |
| "install Sweden in a new repo", "new brand setup" | `sync/META.md` (Installing section) |

---

## Warnings

| Warning | Meaning | Action |
|---|---|---|
| `CSS_MISSING` | Token in map but not in CSS | Add to CSS or remove from map |
| `FIGMA_MISSING` | Token in map but not in visual tool | Create variable or remove from map |
| `NOT_A_COLOR` | CSS value isn't a parseable color | Check for `var()` alias chain or non-color token |

---

## Build Quality Check

After **any** `use_figma` session that creates or modifies components, frames, or variables,
run a visual QA pass before reporting the work as done. Full checklist: `sync/CODE-TO-VISUAL.md`.

Summary (all six must pass):
- [ ] Component sets are not flat/collapsed — every variant is visible
- [ ] Every state (Default / Hover / Active / Disabled) is visually distinct at a glance
- [ ] Semantic variable tokens applied — no hardcoded hex fills
- [ ] Badge / count chips are legible against their parent background
- [ ] Text nodes use the correct DS text style (not raw font overrides)
- [ ] Bar compositions: tab labels show real strings; Active instance shows correct state

---

## Active Sprint

Current sprint: `sync/RUNDOC_v2.md` — Phase 0–5 component build

Completed sprints: `sync/archive/`
