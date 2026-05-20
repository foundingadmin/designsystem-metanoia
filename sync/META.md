# META — Sweden MD Scaffold Rules

This file governs the documentation scaffold for the Sweden sync engine.
Read it before editing any file in `sync/`.

---

## The Engine / Instance Rule

**If a value would be different in a "Sweden for Acme Corp" deployment → it belongs in `BRAND.md`.**
**If an instruction would be identical across all brands → it belongs in an engine doc.**

| Type | File |
|---|---|
| Visual tool file key | `BRAND.md` |
| Font family name | `BRAND.md` |
| Token names / collection names | `BRAND.md` |
| Text style SHA keys | `BRAND.md` |
| Component node IDs | `BRAND.md` |
| Semantic variable SHA keys | `BRAND.md` |
| Color / spacing / radius values | `BRAND.md` |
| How to fetch variables | `VISUAL-TO-CODE.md` |
| How to bind a variable to a fill | `CODE-TO-VISUAL.md` |
| Plugin API patterns and gotchas | `CODE-TO-VISUAL.md` |
| Sync warnings and their meaning | `SYNC-MASTER.md` |
| Architecture overview | `SYNC-MASTER.md` |

---

## Update Routing

If you learn something new during a session, append it to the correct doc before closing.

| Lesson type | Update this doc |
|---|---|
| New Plugin API gotcha | `CODE-TO-VISUAL.md` |
| New visual tool error and fix | `CODE-TO-VISUAL.md` |
| New sync pipeline pattern | `SYNC-MASTER.md` |
| Visual → Code edge case | `VISUAL-TO-CODE.md` |
| New brand token, SHA key, or component ID | `BRAND.md` |
| Deprecated token / component removed | `BRAND.md` |
| New backlog feature idea | `FEATURE-LIST.md` |
| New sprint plan | New `RUNDOC_v[N+1].md` |

---

## Anti-Patterns

These are explicitly prohibited for future sessions:

1. **Never hardcode a brand-specific value in an engine doc.** Font names, file keys, token names, hex values, SHA keys — these belong only in `BRAND.md`. Add a pointer comment instead.

2. **Never paste step-by-step sync instructions into `CLAUDE.md` at the root.** The root is a router, not a content host. Procedures live in the directional docs.

3. **Never duplicate content across two docs.** The only permitted exception is the Build Quality Check, which appears in both `CODE-TO-VISUAL.md` (authoritative) and `SYNC-MASTER.md` (summary pointer). This exception is explicitly intentional. All other content: one owner only.

4. **Never add a new `sync/` doc without also updating both:**
   - `SYNC-MASTER.md` trigger phrase routing table
   - `CLAUDE.md` root "Sweden Sync" routing section
   ...in the same commit.

5. **Never skip the Build Quality Check after a `use_figma` session.** The full checklist is in `CODE-TO-VISUAL.md`. Every `use_figma` session ends with a screenshot pass.

---

## Sprint Lifecycle

### When a RUNDOC sprint is complete

```bash
git mv sync/RUNDOC_v[N].md sync/archive/RUNDOC_v[N].md
```

Then:
- Create `sync/RUNDOC_v[N+1].md` for the next sprint
- Update the "Active sprint" pointer in `SYNC-MASTER.md`
- Commit: `docs: archive RUNDOC_v[N] — sprint complete`

Completed sprints live in `sync/archive/`. They are read-only history.

---

## Installing Sweden in a New Brand Repo

1. Copy the full `sync/` directory into the target repo
2. Replace `sync/BRAND.md` with the new brand's values (all sections documented in that file)
3. Update `CLAUDE.md` root "Sweden Sync" routing section (brand pointer)
4. Keep all engine docs unchanged: `CODE-TO-VISUAL.md`, `VISUAL-TO-CODE.md`, `SYNC-MASTER.md`, `META.md`
5. Replace `sync/RUNDOC_v[N].md` with the new brand's build plan
6. Update `sync/token-map.js` with the new brand's CSS → visual tool variable mappings

Engine docs require zero edits across brand deployments. Only `BRAND.md`, `token-map.js`, and the sprint RUNDOC change.

---

## Compound Learning

After any session that surfaces a new lesson (API gotcha, sync edge case, component pattern):

1. Identify which doc owns that type of content (see Update Routing above)
2. Append the lesson to that doc before closing the session
3. Do not rely on chat history — once the session ends, the lesson is lost unless written down

This is how the engine improves over time without growing bloated.

---

## Build Quality Check — Duplication Exception

The Build Quality Check appears in both `CODE-TO-VISUAL.md` (authoritative, full checklist)
and `SYNC-MASTER.md` (summary with pointer). This is intentional — the checklist must be
visible in context during any `use_figma` session, and `SYNC-MASTER.md` is often the entry point.

**Rule:** If the checklist is updated, both copies must be updated in the same commit.
