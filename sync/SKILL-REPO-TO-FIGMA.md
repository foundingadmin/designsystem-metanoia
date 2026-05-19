---
name: figma-component-build
description: >
  Use this skill when building or rebuilding Figma components from this
  design system repo. Covers the exact Figma Plugin API patterns, known gotchas,
  build order, variable binding patterns, and script structure required to
  generate a correct, variable-bound component set on the first attempt.
  Trigger: whenever asked to "build in Figma", "generate components", "push to Figma",
  or "initialize the Figma file" from repo source.
user-invocable: true
---

# Figma Component Build Skill
## Design System — Code-to-Figma Reference

This skill captures every lesson learned from building a Button component set
in Figma from repo CSS tokens. Follow these rules exactly to avoid the errors
that were hit in practice.

---

## Mandatory Build Order

Variables and styles must exist BEFORE any component that references them.
Run these phases in strict sequence — never skip ahead.

```
1. Figma Variables       — primitives first, then semantic aliases
2. Text Styles           — after variables (font binding requires variable IDs)
3. Effect Styles         — shadows from spacing.css
4. Icon/Placeholder atom — before ANY component that uses icon slots
5. Atoms                 — Button, Input, Tag, Badge
6. Molecules             — Card, Alert, Breadcrumb, Pagination, Tabs
7. Organisms             — Nav, Modal, Table, Hero, Empty States
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

### Binding variables to fill/stroke colors

There are two API paths. Use **Method A** (paint object) as the default — it
works on every node type. Use **Method B** only when you already have a paint
object reference from `figma.variables`.

**Method A — embed `boundVariables` directly in the paint object (recommended):**

```js
// Works on FrameNode, ComponentNode, TextNode, VectorNode — everything.
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
//    ComponentNode and some other node types. Unreliable across Figma versions.
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

**The problem:** Figma interprets FLOAT variables bound to `lineHeight` as
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

// ❌ Wrong — variable binding makes Figma use px, not %
textStyle.setBoundVariable('lineHeight', lhVar); // lhVar=1.45 → 1.45px line height

// ❌ Wrong — ×100 trick doesn't help
// lhVar=145 → 145px line height (still broken)
```

**Reference line height values for Metanoia text styles:**

| Style | PERCENT value |
|---|---|
| Display | 95% |
| H1 | 105% |
| H2, H3, H4, H5 | 120% |
| Eyebrow | 120% |
| Lead, Body | 160% |
| Body SM, Caption | 145% |
| Button/SM, Button/MD, Button/LG | 145% |

Line height FLOAT variables in the Typography collection store the CSS
unitless multiplier (e.g. `1.45`) for sync purposes only — they are not
bound to any text style.

---

## Text Node Setup for Button Labels

Every button label text node needs these settings or the button height will
be wrong:

```js
const txt = figma.createText();
txt.fontName         = { family: 'Figtree', style: 'SemiBold' };
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

**Variant naming format** (Figma creates properties from this):
```
Type=Primary, Size=MD, Icon=None, State=Default
```

**Variant matrix** (4 × 3 × 3 × 5 = 180):
- Type: Primary, Secondary, Ghost, Destructive
- Size: SM, MD, LG
- Icon: None, Leading, Trailing
- State: Default, Hover, Active, Focus, Disabled

**Size specs matching HTML CSS (`preview/components-buttons.html`):**

| Size | paddingV | paddingH | gap | iconSize | Radius var |
|---|---|---|---|---|---|
| SM | 8px (Spacing/2) | 14px (explicit) | 8px | 16px | Radius/MD |
| MD | 12px (Spacing/3) | 20px (Spacing/5) | 8px | 16px | Radius/MD |
| LG | 14px (explicit) | 24px (Spacing/6) | 8px | 20px | Radius/MD |

**Expected rendered heights** (after line height fix):
- SM: 35px (8 + 19 + 8)
- MD: 44px (12 + 20 + 12)
- LG: 51px (14 + 23 + 14)

---

## Icon/Placeholder Component

Must be created BEFORE building buttons. Designers swap this component instance
in the properties panel to replace placeholders with actual Lucide icons.

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
  comp.fills   = [{ type: 'SOLID', color: hexRgb('#ECEFF2') }]; // grey-100
  comp.strokes = [{ type: 'SOLID', color: hexRgb('#B6BEC6') }]; // grey-300
  comp.strokeWeight = 1;
  comp.strokeAlign = 'INSIDE';
  comp.clipsContent = true;

  // Cross (+) visual — two rectangles forming a plus sign
  const cs = Math.max(Math.round(size * 0.5), 6);
  const cf = figma.createFrame();
  cf.name = 'cross'; cf.resize(cs, cs); cf.fills = []; cf.layoutMode = 'NONE';

  const hb = figma.createRectangle();
  hb.resize(cs, 2); hb.fills = [{ type: 'SOLID', color: hexRgb('#6E7A86') }];
  hb.cornerRadius = 1; hb.x = 0; hb.y = Math.round((cs - 2) / 2);

  const vb = figma.createRectangle();
  vb.resize(2, cs); vb.fills = [{ type: 'SOLID', color: hexRgb('#6E7A86') }];
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
iconSet.name = 'Icon/Placeholder';
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

## Color Token Reference for Buttons

| Button type + state | Background variable | Text variable | Border variable |
|---|---|---|---|
| Primary / Default | Navy/700 | Brand/White | — |
| Primary / Hover | Navy/500 | Brand/White | — |
| Primary / Active | Navy/900 | Brand/White | — |
| Secondary / Default | Brand/White | Navy/900 | Navy/700 |
| Secondary / Hover | Navy/100 | Navy/900 | Navy/900 |
| Ghost / Default | transparent | Navy/700 | Grey/300 |
| Ghost / Hover | Grey/100 | Navy/700 | Grey/300 |
| Destructive / Default | Status/Error/600 | Brand/White | — |
| Destructive / Hover | Status/Error/700 | Brand/White | — |
| Destructive / Active | Status/Error/800 | Brand/White | — |
| Any / Focus | default bg | default text | + focus ring effect |
| Any / Disabled | default bg at 40% opacity | default text at 40% opacity | — |

Status/Error/700 (`#B83C24`) was MISSING from the original token scale and
had to be added. Always check that hover/active states have a corresponding
primitive variable before referencing them in a component.

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
  // Outer colored ring — aqua brand color
  {
    type: 'DROP_SHADOW',
    color: { r: 0.196, g: 0.796, b: 0.929, a: 0.85 }, // aqua #32CBED at 85%
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
colors. Semantic variables need to exist in the correct collection with the
alias pointing to the current primitive variable ID.

```js
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
// Verify everything needed is in place
const allVars = figma.variables.getLocalVariables();
const required = [
  'Brand/Navy', 'Brand/White', 'Navy/700', 'Navy/900', 'Navy/500', 'Navy/100',
  'Status/Error/600', 'Status/Error/700', 'Status/Error/800',
  'Grey/100', 'Grey/300',
  'Radius/MD', 'Spacing/2', 'Spacing/3', 'Spacing/5', 'Spacing/6',
];
const missing = required.filter(name => !allVars.find(v => v.name === name));

const textStyles = figma.getLocalTextStyles();
const requiredStyles = ['Button/SM', 'Button/MD', 'Button/LG', 'Body', 'Body SM'];
const missingStyles = requiredStyles.filter(
  name => !textStyles.find(s => s.name === name || s.name.endsWith('/' + name))
);

const iconSet = figma.root.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'Icon/Placeholder');

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
ico.fills = varFill('Foreground/Tertiary', '#8895A1');  // grey tint
// For white (on colored badge): ico.fills = [{ type:'SOLID', color:{r:1,g:1,b:1} }];
```

### Named Figma vars for this DS

| Token role | Variable name |
|---|---|
| Canvas bg | `Background/Canvas` |
| Subtle bg | `Background/Subtle` |
| Subtle border | `Border/Subtle` |
| Primary text | `Foreground/Primary` |
| Body text | `Foreground/Body` |
| Secondary text | `Foreground/Secondary` |
| Tertiary / muted | `Foreground/Tertiary` |
| Icon set name | `Icon Placeholder` (no slash) |
| Button set name | `Button` |
| Tag set name | `Form/Tags` |

---

## Canvas Design Guidelines (use_figma page/screen builds)

These rules apply whenever building UI frames directly on a Figma page
(heroes, sections, screens, mockups) — not just when building the DS itself.

### Rule 1 — Always bind every text node to a DS text style

Never set `fontName`, `fontSize`, or `fontWeight` manually on a text node
that belongs to a page design. Always use `textStyleId` bound to a DS style.

```js
// ✅ Correct
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
`search_design_system` or inspect the `ds` page. If a component exists,
create an instance and override its text/properties.

```js
// ✅ Correct — DS component instance with overridden label
const tagComp = figma.getNodeById('120:410'); // Form/Tag Icon Color=Info
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

## Metanoia DS Text Style Reference

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

## Metanoia DS Component Reference (canvas use)

Prefer these over manually constructed equivalents. Use `figma.getNodeById(id)`
to reference local components; override text via `instance.findOne(n => n.type === 'TEXT')`.

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

**Button variants** — `Type` × `Size` × `Icon` × `State` = 180 total:
- Type: Primary, Secondary, Ghost, Destructive
- Size: SM, MD, LG — Icon: None, Leading, Trailing — State: Default → Disabled

**Form/Tag Icon** — Color: Success, Warning, Error, Info, Neutral

**Form/Tags** — Color × Size (SM/MD) × Style (Subtle/Bold) = 20 variants

---

## Semantic Variable Reference (canvas color bindings)

All fills and strokes on page designs must use semantic variables so that
light/dark mode switching works. Import via `figma.variables.importVariableByKeyAsync(key)`.

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

Never use raw primitive variables (e.g. `Navy/700`) for fills on page designs —
always route through semantic variables so frames respond to mode changes.
