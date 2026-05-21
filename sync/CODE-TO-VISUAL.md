---
name: code-to-visual
description: >
  Use this skill when translating code, design tokens, or repo state into
  visual representations in a design tool. Covers Plugin API patterns, gotchas,
  build order, variable binding, and script structure for generating correct,
  variable-bound components on the first attempt. Also covers the Code → Visual
  token sync pipeline and Adding New Tokens.
  Trigger: "build in Figma", "generate components", "push to Figma",
  "sync repo → Figma", "sync code → visual", "add a new token",
  "initialize the visual file".
user-invocable: true
---

# Code → Visual — Engine Reference
## Design System — Code-to-Visual Reference

This file is **engine-only**. It contains universal patterns for building visual components
from code and syncing design tokens from the repo into the visual tool.

**Brand-specific values** (font family, token names, text style SHA keys, component node IDs,
semantic variable keys, color values) all live in `sync/BRAND.md`.
**Read `sync/BRAND.md` before any `use_figma` session.**

---

## Mandatory Build Order

Variables and styles must exist BEFORE any component that references them.
Run these phases in strict sequence — never skip ahead.

```
1. Visual Variables     — primitives first, then semantic aliases
2. Text Styles          — after variables (font binding requires variable IDs)
3. Effect Styles        — shadows from spacing.css
4. Icon Placeholder atom — before ANY component that uses icon slots
5. Atoms                — Button, Input, Tag, Badge
6. Molecules            — Card, Alert, Breadcrumb, Pagination, Tabs
7. Organisms            — Nav, Modal, Table, Hero, Empty States
```

To check what already exists before building, run:

```js
// Quick audit — paste into use_figma
const vars = figma.variables.getLocalVariables().length;
const styles = figma.getLocalTextStyles().length;
const effects = figma.getLocalEffectStyles().length;
const comps = figma.root.findAll(n => n.type === 'COMPONENT').length;
return { vars, styles, effects, comps };
```

---

## Script Skeleton (copy-paste starting point)

Every `use_figma` call should start with this structure:

```js
// ── 1. Load ALL fonts before touching any text ────────────────────
// Brand font family: see sync/BRAND.md (Font section)
await Promise.all([
  figma.loadFontAsync({ family: 'Figtree', style: 'Light' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Medium' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'SemiBold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Bold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'ExtraBold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Black' }),
]);
// Skip fonts you won't use, but include all that any text style references.
// Omitting this causes: "Cannot write to node with unloaded font" error.

// ── 2. Core helpers ───────────────────────────────────────────────
function findVar(name) {
  return figma.variables.getLocalVariables().find(v => v.name === name) || null;
}

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: 1,
  };
}

// Use this for fill color bindings — NOT node.setBoundVariable()
function bindFillColor(node, variable) {
  if (!node.fills || node.fills.length === 0) return;
  const paint = figma.variables.setBoundVariableForPaint(
    node.fills[0], 'color', variable
  );
  node.fills = [paint];
}

// Use this for stroke color bindings
function bindStrokeColor(node, variable) {
  if (!node.strokes || node.strokes.length === 0) return;
  const paint = figma.variables.setBoundVariableForPaint(
    node.strokes[0], 'color', variable
  );
  node.strokes = [paint];
}

// ── 3. Navigate to the correct page ──────────────────────────────
// Page names: see sync/BRAND.md (Visual Tool Page Names section)
let dsPage = figma.root.children.find(p => p.name.toLowerCase() === 'ds')
          || figma.root.children.find(p => p.name.toLowerCase() === 'components')
          || figma.root.children[0];
await figma.setCurrentPageAsync(dsPage);
```

---

## Figma Plugin API: Correct Values

These are the most common mistakes. Use the corrected values.

### Sizing modes
```js
// ✅ Correct — 'AUTO' means "hug contents"
frame.primaryAxisSizingMode = 'AUTO';    // hug on primary axis
frame.counterAxisSizingMode = 'AUTO';    // hug on counter axis
frame.primaryAxisSizingMode = 'FIXED';   // fixed size

// ❌ Wrong — 'HUG' is NOT a valid value
frame.primaryAxisSizingMode = 'HUG';    // throws: Invalid enum value
```

### layoutSizingHorizontal / layoutSizingVertical
```js
// ✅ Valid only on TEXT nodes, or FRAMES that ARE themselves auto-layout
textNode.layoutSizingHorizontal = 'HUG';
textNode.layoutSizingVertical   = 'HUG';

autoLayoutFrame.layoutSizingHorizontal = 'HUG'; // only if frame has layoutMode != NONE

// ✅ FIXED is always valid for any auto-layout child
iconInstance.layoutSizingHorizontal = 'FIXED';
iconInstance.layoutSizingVertical   = 'FIXED';

// ❌ Wrong — regular non-autolayout frames can't use HUG
regularFrame.layoutSizingHorizontal = 'HUG'; // throws: HUG can only be set on auto-layout frames
```

### HUG on non-frame/non-text nodes (runtime error)

`'HUG'` throws `"HUG can only be set on auto-layout frames or text children of auto-layout frames"`
when assigned to: `Ellipse`, `Rectangle`, `Line`, `Polygon`, `Vector`, or any
`ComponentInstance` that is not itself an auto-layout frame.

Fix: use `'FIXED'` for all of these node types — always.

```js
// ❌ Wrong — throws on Ellipse, Rectangle, Vector, etc.
ellipse.layoutSizingHorizontal = 'HUG'; // runtime error

// ✅ Correct
ellipse.layoutSizingHorizontal = 'FIXED';
ellipse.layoutSizingVertical   = 'FIXED';
```

### Sub-frame FILL-child collapse bug

If a sub-frame (auto-layout) contains children with `layoutSizingHorizontal = 'FILL'`
and that sub-frame is then given `layoutSizingHorizontal = 'HUG'` in its parent,
the sub-frame collapses to ~150–200px — a circular sizing dependency.
The frame wants to hug its children; the children want to fill the frame.

Fix: use `'FIXED'` (never `'HUG'`) on any sub-frame whose children include at least
one `'FILL'` node. Call `resize()` to set the target width, then apply `'FIXED'`.

```js
// ❌ Wrong — sub-frame collapses if any child uses FILL
parent.appendChild(subFrame);
subFrame.layoutSizingHorizontal = 'HUG'; // collapses to ~150px

// ✅ Correct — pin the width so FILL children have a known container
subFrame.resize(targetWidth, subFrame.height);
parent.appendChild(subFrame);
subFrame.layoutSizingHorizontal = 'FIXED'; // stays at targetWidth
```

### Binding variables to fill/stroke colors

There are two API paths. Use **Method A** (paint object) as the default — it
works on every node type. Use **Method B** only when you already have a paint
object reference from `figma.variables`.

**Method A — embed `boundVariables` directly in the paint object (recommended):**

```js
// Works on FrameNode, ComponentNode, TextNode, VectorNode — everything.
// Variable name: see sync/BRAND.md for this brand's token names
const colorVar = findVar('Brand/Navy');

node.fills = [{
  type: 'SOLID',
  color: { r: 0.035, g: 0.294, b: 0.467 },          // fallback hex as RGB 0–1
  boundVariables: { color: { type: 'VARIABLE_ALIAS', id: colorVar.id } },
}];

// Same pattern for strokes:
node.strokes = [{
  type: 'SOLID',
  color: { r: 0.749, g: 0.796, b: 0.847 },
  boundVariables: { color: { type: 'VARIABLE_ALIAS', id: colorVar.id } },
}];
```

**Method B — `figma.variables.setBoundVariableForPaint` (namespace form):**

```js
// Use ONLY if node.fills[0] already exists and you have the paint reference.
const paint = figma.variables.setBoundVariableForPaint(
  node.fills[0], 'color', colorVar
);
node.fills = [paint];
```

**What NOT to use:**

```js
// ❌ node.setBoundVariableForPaint(...) — throws "no such property" on
//    ComponentNode and some other node types. Unreliable across versions.
node.setBoundVariableForPaint('fills', 0, 'color', colorVar); // ← do not use

// ❌ setBoundVariable does not work for fill/stroke color
node.setBoundVariable('fill', colorVar);      // no effect
node.setBoundVariable('fillColor', colorVar); // no effect
```

### Binding variables to layout properties
```js
// ✅ Correct — use setBoundVariable for scalar layout props
node.setBoundVariable('cornerRadius', radiusVar);
node.setBoundVariable('paddingTop',   spacingVar);
node.setBoundVariable('paddingBottom',spacingVar);
node.setBoundVariable('paddingLeft',  spacingVar);
node.setBoundVariable('paddingRight', spacingVar);
node.setBoundVariable('itemSpacing',  spacingVar);
```

---

## Line Height: The Critical Gotcha

**The problem:** The visual tool interprets FLOAT variables bound to `lineHeight` as
**pixel values**, NOT percentage multipliers. If the variable stores `1.45`,
the line height is `1.45px` (essentially nothing → text appears as 2px tall).
If you change it to `145`, the line height is `145px` (enormous).

**The fix:** Set line height directly on text styles as an explicit PERCENT
object. Do NOT bind `lineHeight` to a variable.

```js
// ✅ Correct — explicit PERCENT unit
textStyle.lineHeight = { unit: 'PERCENT', value: 145 }; // = 1.45×

// ✅ Correct — explicit PIXELS unit (use when you know the exact px value)
textStyle.lineHeight = { unit: 'PIXELS', value: 20 };

// ❌ Wrong — variable binding makes the tool use px, not %
textStyle.setBoundVariable('lineHeight', lhVar); // lhVar=1.45 → 1.45px line height

// ❌ Wrong — ×100 trick doesn't help
// lhVar=145 → 145px line height (still broken)
```

**Line height reference values for this brand:** see `sync/BRAND.md` (Line Height Reference section).

Line height FLOAT variables in the Typography collection store the CSS
unitless multiplier (e.g. `1.45`) for sync purposes only — they are not
bound to any text style.

---

## Text Node Setup for Button Labels

Every button label text node needs these settings or the button height will
be wrong:

```js
const txt = figma.createText();
txt.fontName         = { family: 'Figtree', style: 'SemiBold' }; // brand font — see BRAND.md
txt.fontSize         = 14;                                  // or from variable
txt.lineHeight       = { unit: 'PERCENT', value: 145 };    // explicit — never variable-bound
txt.textAutoResize   = 'WIDTH_AND_HEIGHT';                  // REQUIRED — prevents 2px height bug
txt.layoutSizingHorizontal = 'HUG';                        // text in autolayout parent
txt.layoutSizingVertical   = 'HUG';
txt.characters       = 'Medium button';                     // representative placeholder text
```

Omitting `textAutoResize = 'WIDTH_AND_HEIGHT'` causes the text node to render
at 2px tall (the default fixed height), making icon-slot variants appear much
taller than no-icon variants of the same size.

---

## Button Component Anatomy

```
COMPONENT_SET  name='Button'
  layoutMode='HORIZONTAL', layoutWrap='WRAP'
  primaryAxisSizingMode='FIXED'   ← must be FIXED, not AUTO, for wrap to work
  width = (computed from variant grid)

  └── COMPONENT  name='Type=Primary, Size=MD, Icon=None, State=Default'
        layoutMode='HORIZONTAL'
        primaryAxisSizingMode='AUTO'    ← hug width
        counterAxisSizingMode='AUTO'    ← hug height
        primaryAxisAlignItems='CENTER'
        counterAxisAlignItems='CENTER'
        paddingTop/Bottom = 12          ← bound to Spacing/3
        paddingLeft/Right = 20          ← bound to Spacing/5
        itemSpacing = 8                 ← bound to Spacing/2
        cornerRadius = 8               ← bound to Radius/MD

        └── [INSTANCE: Icon/Placeholder Size=16]  only when Icon=Leading
              layoutSizingHorizontal='FIXED'
              layoutSizingVertical='FIXED'

        └── TEXT  'Medium primary'
              textAutoResize='WIDTH_AND_HEIGHT'
              layoutSizingHorizontal='HUG'
              layoutSizingVertical='HUG'
              textStyleId = (Button/MD style ID)

        └── [INSTANCE: Icon/Placeholder Size=16]  only when Icon=Trailing
              layoutSizingHorizontal='FIXED'
              layoutSizingVertical='FIXED'
```

**Variant naming format** (the tool creates properties from this):
```
Type=Primary, Size=MD, Icon=None, State=Default
```

**Variant matrix** (4 × 3 × 3 × 5 = 180):
- Type: Primary, Secondary, Ghost, Destructive
- Size: SM, MD, LG
- Icon: None, Leading, Trailing
- State: Default, Hover, Active, Focus, Disabled

**Size specs** — see `sync/BRAND.md` (Button Size Specifications section) for authoritative values.

---

## Icon/Placeholder Component

Must be created BEFORE building buttons. Designers swap this component instance
in the properties panel to replace placeholders with actual icons.

```js
function makeIconPlaceholder(size) {
  const comp = figma.createComponent();
  comp.name = `Size=${size}`;
  comp.resize(size, size);
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.primaryAxisSizingMode = 'FIXED';
  comp.counterAxisSizingMode = 'FIXED';
  comp.cornerRadius = 3;
  comp.fills   = [{ type: 'SOLID', color: hexRgb('#ECEFF2') }]; // grey-100 — see BRAND.md
  comp.strokes = [{ type: 'SOLID', color: hexRgb('#B6BEC6') }]; // grey-300 — see BRAND.md
  comp.strokeWeight = 1;
  comp.strokeAlign = 'INSIDE';
  comp.clipsContent = true;

  // Cross (+) visual — two rectangles forming a plus sign
  const cs = Math.max(Math.round(size * 0.5), 6);
  const cf = figma.createFrame();
  cf.name = 'cross'; cf.resize(cs, cs); cf.fills = []; cf.layoutMode = 'NONE';

  const hb = figma.createRectangle();
  hb.resize(cs, 2); hb.fills = [{ type: 'SOLID', color: hexRgb('#6E7A86') }]; // cross color — see BRAND.md
  hb.cornerRadius = 1; hb.x = 0; hb.y = Math.round((cs - 2) / 2);

  const vb = figma.createRectangle();
  vb.resize(2, cs); vb.fills = [{ type: 'SOLID', color: hexRgb('#6E7A86') }]; // cross color — see BRAND.md
  vb.cornerRadius = 1; vb.x = Math.round((cs - 2) / 2); vb.y = 0;

  cf.appendChild(hb); cf.appendChild(vb);
  comp.appendChild(cf);
  // cf is a non-autolayout child of an autolayout parent → use FIXED
  cf.layoutSizingHorizontal = 'FIXED';
  cf.layoutSizingVertical   = 'FIXED';

  return comp;
}

const iconVariants = [16, 20, 24].map(makeIconPlaceholder);
const iconSet = figma.combineAsVariants(iconVariants, dsPage);
iconSet.name = 'Icon Placeholder';
```

---

## combineAsVariants: Layout Fix

`figma.combineAsVariants()` stacks **all variants at position (0, 0)** — the
resulting COMPONENT_SET needs layout applied immediately after creation or
every variant will overlap at the top-left corner.

### Single-row sets (no wrapping)

For component sets where all variants fit on one row (badges, chips, small
tags, icon sizes, etc.):

```js
const set = figma.combineAsVariants(variants, page);
set.name = 'MyComponent';

set.layoutMode = 'HORIZONTAL';
set.primaryAxisSizingMode = 'AUTO';   // width hugs the row of variants
set.counterAxisSizingMode = 'AUTO';   // height hugs the tallest variant
set.itemSpacing = 8;
set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
```

### Multi-row sets (wrapping grid)

For large variant matrices (buttons with 100+ variants, full state × size × type
grids) that need to wrap onto multiple rows:

```js
const set = figma.combineAsVariants(variants, page);
set.name = 'MyComponent';

set.layoutMode = 'HORIZONTAL';
set.layoutWrap = 'WRAP';

// IMPORTANT: primaryAxisSizingMode must be FIXED for wrap to work.
// With AUTO, all variants collapse into one infinite row regardless of layoutWrap.
set.primaryAxisSizingMode = 'FIXED';
set.resize(/* desired grid width, e.g. 900 */, set.height);

set.itemSpacing = 16;           // gap between variants horizontally
set.counterAxisSpacing = 16;    // gap between rows
set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
set.counterAxisSizingMode = 'AUTO'; // height hugs the rows
```

> **Rule of thumb:** Use `FIXED` + `WRAP` only when you need a grid. Use
> `AUTO` without wrap for everything else — it's simpler and avoids the
> "must call resize() before counterAxisSizingMode" trap.

---

## Replacing Child Nodes (icon slots)

When replacing an existing child (e.g., a rectangle) with an instance,
insert the new node at the same index BEFORE removing the old one:

```js
// ✅ Correct — preserves child order
const idx = [...comp.children].indexOf(rect);
const inst = iconComponent.createInstance();
inst.layoutSizingHorizontal = 'FIXED';
inst.layoutSizingVertical   = 'FIXED';
comp.insertChild(idx, inst);  // inst now at idx, rect shifts to idx+1
rect.remove();

// Process multiple replacements in REVERSE order to keep indices stable
for (let i = toReplace.length - 1; i >= 0; i--) {
  const { node, idx } = toReplace[i];
  // ... replace ...
}
```

---

## Button Color Token Mapping

See `sync/BRAND.md` (Button Color Token Mapping section) for this brand's
fill/stroke variable assignments per button type and state.

---

## Focus Ring

The WCAG-compliant focus ring is a double-ring drop shadow effect:

```js
const focusRing = [
  // Inner white gap — visible on any background
  {
    type: 'DROP_SHADOW',
    color: { r: 1, g: 1, b: 1, a: 1 },
    offset: { x: 0, y: 0 },
    radius: 0,
    spread: 2,
    visible: true,
    blendMode: 'NORMAL',
  },
  // Outer brand ring — color from sync/BRAND.md (Focus Ring section)
  {
    type: 'DROP_SHADOW',
    color: { r: 0.196, g: 0.796, b: 0.929, a: 0.85 }, // brand focus color — see BRAND.md
    offset: { x: 0, y: 0 },
    radius: 1,
    spread: 4,
    visible: true,
    blendMode: 'NORMAL',
  },
];
comp.effects = focusRing;
```

---

## Semantic Variable Aliases

When semantic variables (Background, Foreground, Border collections) alias
primitive variables, they must be set as VARIABLE_ALIAS values, not direct
colors.

```js
// Variable names: see sync/BRAND.md (Semantic Variable Reference section)
const primVar = findVar('Navy/700');
const semanticVar = findVar('Background/Primary'); // or create it

// Set semantic var to alias the primitive
const modeId = semanticCollection.defaultModeId;
semanticVar.setValueForMode(modeId, {
  type: 'VARIABLE_ALIAS',
  id: primVar.id,
});
```

If the primitive collection is ever deleted and recreated, ALL semantic
aliases break (they point to stale IDs). Fix: delete and rebuild the
semantic collection, looking up fresh IDs via `findVar()`.

---

## Pre-flight Checklist (run before building any component)

```js
// Brand-specific variable and style names — load from sync/BRAND.md
// (Pre-flight Required Variables section)
const required = [
  /* paste required[] array from sync/BRAND.md */
];

const allVars = figma.variables.getLocalVariables();
const missing = required.filter(name => !allVars.find(v => v.name === name));

const textStyles = figma.getLocalTextStyles();
const requiredStyles = [
  /* required text style names from sync/BRAND.md */
];
const missingStyles = requiredStyles.filter(
  name => !textStyles.find(s => s.name === name || s.name.endsWith('/' + name))
);

const iconSet = figma.root.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'Icon Placeholder');

return {
  variables: { total: allVars.length, missing },
  textStyles: { total: textStyles.length, missing: missingStyles },
  iconPlaceholder: iconSet ? 'found' : 'MISSING — build before buttons',
};
```

If anything is missing, build it before proceeding. Missing primitives →
buttons will have hardcoded colors. Missing text styles → button text will
have no style binding. Missing Icon/Placeholder → icon slots will use
raw rectangles that designers can't swap.

---

## Molecule Patterns (Phase 4 lessons)

### counterAxisSizingMode AUTO — set AFTER children

**The problem:** calling `frame.resize(w, h)` before children are added locks
the height at `h` even when `counterAxisSizingMode = 'AUTO'` is set.

**The fix:** set AUTO as the LAST operation after all children are appended:

```js
// ✅ Correct — AUTO applied after children
comp.layoutMode             = 'HORIZONTAL';
comp.primaryAxisSizingMode  = 'FIXED';
comp.resize(targetWidth, 80);     // width locked; height placeholder only
// ... append all children ...
comp.counterAxisSizingMode  = 'AUTO';  // ← last line; recalculates height

// ❌ Wrong — resize() pins the height even with AUTO set before it
comp.counterAxisSizingMode  = 'AUTO';
comp.resize(targetWidth, 80);     // height now locked at 80px, content clips
```

This is symmetric with the Card pattern where `primaryAxisSizingMode = 'AUTO'`
is set before resize and works correctly — the difference is primary vs counter
axis. Counter axis AUTO must be the final write.

### Text node width before wrapping

For multi-line text (card body, alert body) inside a FILL-width parent, pre-size
the text node to the expected content width BEFORE setting characters:

```js
// ✅ Correct — text wraps at the right width from the start
const t = figma.createText();
t.resize(contentWidth, 20);      // set width = frame width - padding
t.textAutoResize = 'HEIGHT';     // width fixed, height grows
if (style) t.textStyleId = style.id;
t.characters = 'Long body copy that needs to wrap correctly.';
parent.appendChild(t);
t.layoutSizingHorizontal = 'FILL';  // FILL applied after append
t.layoutSizingVertical   = 'HUG';

// ❌ Wrong — text wraps at 1px (default), then FILL can't reflow it
const t = figma.createText();
t.textAutoResize = 'HEIGHT';         // width = 1px default
t.characters     = 'Long body...';  // wraps to hundreds of lines at 1px
parent.appendChild(t);
t.layoutSizingHorizontal = 'FILL';  // too late to fix wrapping
```

Content width formula: `cardWidth - paddingLeft - paddingRight`

### Overriding button instance text (for Pagination/Breadcrumb)

```js
async function overrideLabel(inst, newText) {
  const textNode = inst.findOne(n => n.type === 'TEXT');
  if (!textNode) return;
  await figma.loadFontAsync(textNode.fontName);  // must load even if already loaded
  textNode.characters = newText;                 // '' = effectively icon-only
}
```

Setting `characters = ''` on a Width+Height auto-resize text collapses it to
0×0, leaving only the icon visible — useful for icon-only nav buttons in
pagination without a separate icon-only component.

### Separator / icon slot color tinting in instances

Icon Placeholder instances inherit the component's fill. Override the instance
fill AFTER appending to parent:

```js
const ico = iconPlh16.createInstance();
parent.appendChild(ico);
ico.fills = varFill('Foreground/Tertiary', '#8895A1');  // variable name — see BRAND.md
// For white (on colored badge): ico.fills = [{ type:'SOLID', color:{r:1,g:1,b:1} }];
```

### Named variable roles for this brand

See `sync/BRAND.md` (Semantic Variable Reference section) for this brand's
full variable name → role mapping (Canvas bg, Subtle bg, Primary text, etc.).

---

## Organism Patterns (Phase 5 lessons)

### combineAsVariants clipsContent — always clear immediately

`figma.combineAsVariants()` creates a COMPONENT_SET with `clipsContent = true`
by default. This clips any variant content that exceeds the set's bounding
box and produces silent, invisible truncation — no error, no warning.

**Always add this immediately after `combineAsVariants()`:**

```js
const set = figma.combineAsVariants(variants, page);
set.name = 'MyComponent';
set.clipsContent = false;   // ← mandatory — prevents set from clipping variants
```

### Variant frames need HUG height AFTER all children

Organism COMPONENT frames (modals, heroes, cards-with-variable-content) must
have `layoutSizingVertical = 'HUG'` applied **after** all children are appended.
Setting a fixed height during frame creation and then adding content clips the
overflow — `clipsContent = true` is Figma's default for auto-layout frames.

```js
// ✅ Correct — HUG applied after content is complete
const variant = figma.createComponent();
variant.layoutMode = 'VERTICAL';
variant.layoutSizingHorizontal = 'FIXED';
variant.resize(480, 100);   // width locked; height is a temporary placeholder
// ... append header, body, footer children ...
variant.layoutSizingVertical = 'HUG';   // ← last line; frame grows to fit content
variant.clipsContent = false;

// ❌ Wrong — frame is fixed at 200px; buttons appended after will be clipped
const variant = figma.createComponent();
variant.resize(480, 200);   // height locked at 200px
// ... append all children (total height = 280px) ...
// footer buttons at 200–280px are silently clipped
```

**Exception:** Components with explicit height requirements (Nav bars,
Table rows, Buttons) should keep FIXED height — they are designed to a
specific pixel height independent of content.

### Inner structural frames need clipsContent cleared too

Organisms composed of stacked section frames (header/body/footer in a modal;
left/right columns in a hero split panel) each get `clipsContent = true` by
default. Clear it on every structural wrapper:

```js
function buildSection(parent) {
  const section = figma.createFrame();
  section.layoutMode    = 'VERTICAL';
  section.clipsContent  = false;  // ← required on every inner wrapper
  // ... add content ...
  parent.appendChild(section);
}
```

If you forget, the inner frame clips its own children independently of the
parent — meaning clearing only the top-level variant frame is not enough.

### Button instances have layoutSizingVertical = FIXED by default

When you call `component.createInstance()` on a Button component, the
instance inherits `layoutSizingVertical = 'FIXED'`. Inside a VERTICAL
auto-layout parent, a FIXED-height child that is taller than expected can
prevent the parent from computing its correct HUG height. Always set:

```js
const btn = buttonComp.createInstance();
parent.appendChild(btn);
btn.layoutSizingHorizontal = 'FIXED';  // keep button width locked
// layoutSizingVertical: leave as FIXED for fixed-height components (nav, row)
// For variable-height containers (organism footers): set to HUG
btn.layoutSizingVertical = 'HUG';
```

---

## Canvas Design Guidelines (use_figma page/screen builds)

These rules apply whenever building UI frames directly on a page
(heroes, sections, screens, mockups) — not just when building the DS itself.

### Rule 1 — Always bind every text node to a DS text style

Never set `fontName`, `fontSize`, or `fontWeight` manually on a text node
that belongs to a page design. Always use `textStyleId` bound to a DS style.

```js
// ✅ Correct
// Text style key: from sync/BRAND.md (STYLE_KEYS — 'Lead')
const leadStyle = await figma.importStyleByKeyAsync('4fda3fb5b62786c8ae422e4490f10171dd9bfe02');
node.textStyleId = leadStyle.id;
node.fills = vf(varFgSecondary); // color is separate — styles don't carry it

// ❌ Wrong — raw overrides disconnect the node from the DS
node.fontName = { family: 'Figtree', style: 'Regular' };
node.fontSize = 20;
```

If no style fits exactly, choose the closest match — never hardcode font
properties just to hit a specific pixel size.

### Rule 2 — Always use an existing DS component before building custom

Before constructing a badge, tag, input, or any element from scratch, check
`search_design_system` or inspect the DS page. If a component exists,
create an instance and override its text/properties.

```js
// ✅ Correct — DS component instance with overridden label
// Node ID: from sync/BRAND.md (Component Node ID Reference — 'Form/Tag Icon Color=Info')
const tagComp = figma.getNodeById('120:410');
const badge = tagComp.createInstance();
const labelNode = badge.findOne(n => n.type === 'TEXT');
if (labelNode) {
  await figma.loadFontAsync(labelNode.fontName);
  labelNode.characters = 'Now in early access';
}

// ❌ Wrong — hand-rolling a pill frame + dot + text when Form/Tag Icon exists
```

### Rule 3 — Set layoutSizingHorizontal/Vertical AFTER appendChild

These properties are only valid on children of auto-layout frames. Setting
them before the node is appended throws an error.

```js
// ✅ Correct
parent.appendChild(node);
node.layoutSizingHorizontal = 'FILL';

// ❌ Wrong — throws "node must be an auto-layout frame or a child of one"
node.layoutSizingHorizontal = 'FILL';
parent.appendChild(node);
```

---

## Canvas Build Patterns

These patterns apply when building a full page or multi-section design on canvas
(landing pages, screens, mockups) — distinct from building DS components on the DS page.

### Page detection — always by name, never by index

Page order changes whenever a designer reorders pages in the panel. Never use array index.

```js
// ✅ Correct — find by exact name provided in the task
const page = figma.root.children.find(p => p.name === '<page name from task>');
if (!page) return 'ERROR: page not found — confirm name with user';
await figma.setCurrentPageAsync(page);
// Call setCurrentPageAsync at the top of EVERY call, even when you believe the
// page is already current. A prior call may have moved the cursor, causing new
// instances or frames to land on the wrong page.

// ❌ Wrong — position changes silently when user reorders pages
const page = figma.root.children[1];
```

### Creating a new page

```js
// ✅ Correct — top-level API call
const newPage = figma.createPage();
newPage.name = 'My Page Name';

// ❌ Wrong — throws "no such property 'createPage' on DOCUMENT node"
const newPage = figma.root.createPage();
```

### Sections as Components

Create top-level canvas sections with `figma.createComponent()` rather than
`figma.createFrame()`. This makes each section immediately available in the
component panel as `Section/XYZ`, instanceable for organism reuse, and addressable
by name for targeted revisions.

```js
const sec = figma.createComponent();
sec.name = 'Section/Hero'; // consistent Section/XYZ naming convention
```

### Multi-call structure for full-page builds

Break a full-page build into 3–5 `use_figma` calls (2–3 sections each):
- Each call is an atomic failure unit — a script error only loses that call's work
- Re-import all variables and styles at the top of every call (no state persists between calls)
- Return `nextY` from every call so the next call knows where to place the next section

```js
// End of every section-build call:
return { sectionId: sec.id, y: sec.y, h: sec.height, nextY: sec.y + sec.height };
```

---

## Canvas Revision Pattern

Use for targeted edits to an already-built canvas page. The `Section/XYZ` naming
convention (set at build time with `figma.createComponent()`) is the stable selector —
prefer it over node IDs, which go stale when a file is duplicated or pages are
manually consolidated by a designer.

### Setup

```js
// Always detect page by name — never by index
const page = figma.root.children.find(p => p.name === '<page name from task>');
if (!page) return 'ERROR: page not found';
await figma.setCurrentPageAsync(page);
await Promise.all([ /* load all font weights */ ]);
// Import only the variables/styles you will actually change in this call
```

### Target a section

```js
// Primary — naming convention is the durable selector
const sec = page.children.find(n => n.name === 'Section/CTA Band');

// Fallback — node ID is a hint, not a contract (goes stale on file duplication)
const sec = figma.getNodeById('<id from prior build>') ||
            page.children.find(n => n.name === 'Section/CTA Band');
```

### Revise a text node

```js
// Search by content — most resilient selector across layout changes
const node = sec.findOne(n => n.type === 'TEXT' && n.characters.startsWith('Ready'));
await figma.loadFontAsync(node.fontName); // always load before mutating characters
node.characters = 'New copy here';
// textStyleId is preserved automatically — do NOT re-apply the style
```

### Revise a background fill

```js
// Always rebind to a semantic variable — never set a raw hex fill
// Variable key: from sync/BRAND.md → SEMANTIC_KEYS
const v = await figma.variables.importVariableByKeyAsync(SEMANTIC_KEYS['Background/Subtle']);
sec.fills = [{ type: 'SOLID', color: hexRgb('<fallback hex>'),
  boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } } }];
```

### Revise a button instance label

```js
const inst = sec.findOne(n => n.type === 'INSTANCE' &&
             n.mainComponent?.parent?.name === 'Button');
const lbl  = inst.findOne(n => n.type === 'TEXT');
await figma.loadFontAsync(lbl.fontName);
lbl.characters = 'New label';
```

### Swap a component variant

```js
// Component node IDs: from sync/BRAND.md → Component Node ID Reference
const newMain = figma.getNodeById(COMPONENT_IDS['Button Primary LG Default']);
inst.swapComponent(newMain);
```

### QA after any revision

Always screenshot the modified section before closing — never skip.
Return `{ sectionName, nodeId: sec.id, revised: true }` to confirm the node was reached.

---

## Text Style Reference

Read `sync/BRAND.md` for this brand's text style reference table
(`STYLE_KEYS` for `figma.importStyleByKeyAsync`, style names, sizes, and weights).

---

## Component Reference

Read `sync/BRAND.md` for this brand's component node ID reference
(node IDs, component set names, and variant breakdowns).

---

## Semantic Variable Reference

Read `sync/BRAND.md` for this brand's `SEMANTIC_KEYS` reference
(all Background/Foreground/Border variable import keys).

Never use raw primitive variables (e.g. `Navy/700`) for fills on page designs —
always route through semantic variables so frames respond to mode changes.

---

## Code → Visual Sync (Token Variables)

### Step 1 — Read current visual tool variables

Same fetch script as VISUAL-TO-CODE.md Step 1 — read all local variables via `use_figma`.

### Step 2 — Run the diff

```js
const { TOKEN_MAP } = require('./sync/token-map.js');
const { run } = require('./sync/sync-repo-to-figma.js');
const result = run(figmaVars, TOKEN_MAP);
```

### Step 3 — Dry run first

**Always show the diff and ask for confirmation before writing to the visual tool.**
Say: "I found X variable(s) that differ. Here's what will change: [list].
Shall I apply these updates?"

### Step 4 — Apply via MCP

Execute `result.script` using `use_figma`:
```js
// result.script is ready-to-run plugin JS
// Pass it directly as the `code` parameter
```

Report: "✓ Updated X variables."

---

## Adding New Tokens

When a new CSS var is added, three things must happen together:
1. Add it to the correct file in `tokens/` (match the category)
2. Create the corresponding variable in the visual tool's correct collection
3. Add a new entry in `sync/token-map.js` with the correct `type`

| Token category | CSS file | Visual tool collection |
|---|---|---|
| Raw color | `tokens/color-primitives.css` | Brand / Navy / Aqua / Grey / Status |
| Role color | `tokens/color-semantic.css` | Background / Foreground / Border |
| Typography | `tokens/typography.css` | Font Size / Font Weight / Line Height / Letter Spacing |
| Space / shape | `tokens/spacing.css` | Spacing / Radius / Shadow / Layout |
| Motion | `tokens/motion.css` | Motion |

Example prompt: "Add a new token `--color-coral: #FF6B6B` to the design system"

---

## Build Quality Check (MANDATORY after every `use_figma` call)

After **any** `use_figma` session that creates or modifies components, frames, or variables,
always run a visual QA pass before reporting the work as done:

### Step 1 — Collect node IDs
Query the page for IDs of every node you just created or modified:
```js
figma.currentPage.children.find(n => n.name === '...').id
```

### Step 2 — Screenshot everything
Call `get_screenshot` on **each** created node. Use `maxDimension: 2000` for component sets
(need to see all variants); `maxDimension: 800` for individual components or bars.

### Step 3 — Inspect against this checklist
- [ ] **Layout** — Component sets are not flat/collapsed (check rendered height vs expected). If a component set is only as tall as one variant, the counter-axis sizing is stuck on `FIXED` → switch to `layoutMode = 'NONE'` and arrange variants in a grid.
- [ ] **State differentiation** — Every state (Default / Hover / Active / Disabled) is visually distinct at a glance. If two states look identical, adjust fill, opacity, or text weight.
- [ ] **Color fills** — Semantic variable tokens are applied (not hardcoded hex). Spot-check: does Active use accent/primary fills, does Disabled look faded?
- [ ] **Badge / count legibility** — Any badge or count chip must be readable against its parent background. Near-same-value pairs (e.g. `Background/Subtle` badge on `Background/Canvas` parent) are invisible — use `Background/Accent Soft` or `Background/Muted` instead.
- [ ] **Text styles** — Labels use the correct text style (e.g. `Body SM`). Active/selected items use `Semi Bold` override where specified.
- [ ] **Bar compositions** — If a bar component uses instances, verify tab labels updated from "Label" to real strings and the Active instance shows the correct state.

### Step 4 — Apply fixes and re-screenshot
Fix every issue found in a single follow-up `use_figma` call. Then take one final screenshot
of each fixed node to confirm resolution before closing the task.

### Step 5 — Record component set entry to BRAND.md registry
After confirming the build is correct, append one row to the **Component Set Registry** table in `sync/BRAND.md`:

| figmaName | componentSetNodeId | cssClass | previewFile |
| (COMPONENT_SET.name in Figma) | (Step 1 node ID of the set container) | (root CSS class) | (matching preview/ path) |

- **figmaName**: the component set name exactly as it appears in Figma (e.g. `Form/Tags`, `Button`)
- **componentSetNodeId**: the node ID from Step 1 for the set container — **not** an individual variant
- **cssClass**: the root CSS class used in the repo preview file (e.g. `tag`, `btn`, `input`)
- **previewFile**: the matching `preview/components-*.html` path

Skip this step for sessions that only modify variables, text styles, or layout frames (no component sets).
