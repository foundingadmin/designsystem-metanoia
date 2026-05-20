# Visual → Code

This file owns the **Visual → Code** direction of the Sweden sync engine:
reading the visual tool's current state and translating changes into code.

Read `sync/BRAND.md` for the active visual tool file key before running any sync.

---

## Triggering a Visual → Code Sync

| What you say | What runs |
|---|---|
| "sync visual → code" | Reads visual tool variables, diffs CSS, opens PR |
| "show me the diff" | Runs the diff without writing anything |

---

## Step 1 — Read visual tool variables

Use `use_figma` to read all local variables from the visual tool:

```js
const collections = figma.variables.getLocalVariableCollections();
const allVars = [];
for (const col of collections) {
  for (const id of col.variableIds) {
    const v = figma.variables.getVariableById(id);
    const modeId = Object.keys(v.valuesByMode)[0];
    const raw = v.valuesByMode[modeId];
    allVars.push({
      name: v.name,
      resolvedType: v.resolvedType,
      value: raw,
    });
  }
}
return allVars;
```

## Step 2 — Run the diff

```js
const { TOKEN_MAP } = require('./sync/token-map.js');
const { run } = require('./sync/sync-figma-to-repo.js');
const result = run(figmaVars, TOKEN_MAP); // figmaVars from Step 1
```

## Step 3 — If no changes

Report "✓ CSS is in sync." and stop.

## Step 4 — If changes found

Show the diff to the user. Then execute these shell commands in order:

```bash
git checkout -b {result.branch}
git add tokens/
git commit -m "{result.commitMsg}"
git push -u origin {result.branch}
```

Create a draft PR:

```bash
gh pr create \
  --title "DS Sync: {summary}" \
  --body "{result.prBody}" \
  --base main \
  --head {result.branch} \
  --draft
```

Report the PR URL to the user. Done — human reviews and merges.

## Version bump

After the PR is merged, remind the user to bump the version in `index.html`
per the versioning rules in CLAUDE.md (`PATCH` for value changes, `MAJOR` for renames).

---

## Important: sync does NOT update component CSS

The sync pipeline only patches raw token *values* inside `tokens/*.css`.
It does **not** touch component stylesheets in `preview/` or anywhere else.

**What this means in practice:**

If a new semantic variable layer is introduced (e.g. `--btn-*` for buttons,
or a new `--card-*` category), the sync will correctly write the variable
*definitions* into `tokens/color-semantic.css` — but any component HTML/CSS
that was written using primitives or hardcoded hex will not automatically
switch over. Those files must be manually migrated to use the new semantic
variables before dark mode (or any token aliasing) will work in the browser.

**Checklist when a new semantic variable group is added:**

- [ ] New `--*` definitions are in the correct `tokens/*.css` file with `:root` and `[data-theme="dark"]` blocks
- [ ] `sync/token-map.js` has bridge entries for every new variable
- [ ] Every `preview/*.html` file that renders affected components uses `var(--new-semantic-token)` — not primitives or raw hex
- [ ] Dark mode is verified by adding `data-theme="dark"` to the preview `<html>` tag and inspecting

---

## Future: Visual Component → Code

The visual component sync direction is planned as Feature 001 — see `sync/FEATURE-LIST.md`.

When implemented, this will read component sets from the visual tool and generate
preview HTML (and eventually framework code) for the consuming repo.

Current status: stubbed. Token variable sync (above) is the only active pipeline in this direction.
