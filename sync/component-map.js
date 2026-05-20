/* ============================================================
   component-map.js — Component sync + Code Connect registry
   Bootstraps Feature 001 (Figma-First Component Sync).
   See sync/FEATURE-LIST.md Feature 001 for schema spec.

   Usage:
     const { COMPONENT_MAP, ICON_CATALOG } = require('./sync/component-map.js');

   figmaNodeId: null until a use_figma build session records it.
   Once set, update sync/BRAND.md Component Set Registry to match.
   ============================================================ */

/* ── Icon catalog ─────────────────────────────────────────── */

const ICON_CATALOG = [
  // Navigation
  { name: 'chevron-right',  category: 'Navigation' },
  { name: 'chevron-left',   category: 'Navigation' },
  { name: 'chevron-up',     category: 'Navigation' },
  { name: 'chevron-down',   category: 'Navigation' },
  { name: 'arrow-right',    category: 'Navigation' },
  { name: 'arrow-left',     category: 'Navigation' },
  { name: 'menu',           category: 'Navigation' },
  { name: 'x',              category: 'Navigation' },

  // Actions
  { name: 'search',         category: 'Actions' },
  { name: 'plus',           category: 'Actions' },
  { name: 'minus',          category: 'Actions' },
  { name: 'pencil',         category: 'Actions' },
  { name: 'trash-2',        category: 'Actions' },
  { name: 'copy',           category: 'Actions' },
  { name: 'download',       category: 'Actions' },
  { name: 'upload',         category: 'Actions' },

  // Status
  { name: 'check',          category: 'Status' },
  { name: 'circle-check',   category: 'Status' },
  { name: 'circle-alert',   category: 'Status' },
  { name: 'triangle-alert', category: 'Status' },
  { name: 'info',           category: 'Status' },
  { name: 'circle-x',       category: 'Status' },
  { name: 'clock',          category: 'Status' },
  { name: 'refresh-cw',     category: 'Status' },

  // Content
  { name: 'file',           category: 'Content' },
  { name: 'file-text',      category: 'Content' },
  { name: 'folder',         category: 'Content' },
  { name: 'image',          category: 'Content' },
  { name: 'tag',            category: 'Content' },
  { name: 'inbox',          category: 'Content' },
  { name: 'bell',           category: 'Content' },
  { name: 'mail',           category: 'Content' },

  // UI
  { name: 'house',          category: 'UI' },
  { name: 'settings',       category: 'UI' },
  { name: 'user',           category: 'UI' },
  { name: 'lock',           category: 'UI' },
  { name: 'eye',            category: 'UI' },
  { name: 'eye-off',        category: 'UI' },
  { name: 'grid-2x2',       category: 'UI' },
  { name: 'list',           category: 'UI' },

  // Data
  { name: 'package',        category: 'Data' },
  { name: 'wrench',         category: 'Data' },
  { name: 'trending-up',    category: 'Data' },
  { name: 'chart-column',   category: 'Data' },
  { name: 'monitor',        category: 'Data' },
  { name: 'table',          category: 'Data' },
  { name: 'external-link',  category: 'Data' },
  { name: 'share',          category: 'Data' },
];

/* ── Component map ────────────────────────────────────────── */

const COMPONENT_MAP = [
  {
    figmaName: 'Icon',
    previewFile: 'preview/iconography.html',
    cssClass: 'ds-icon',
    figmaNodeId: null, // TBD — set after use_figma build session, then update BRAND.md
    variantProps: {
      // Size variant maps to CSS modifier class
      Size: { '16': 'ds-icon--sm', '20': 'ds-icon--md', '24': 'ds-icon--lg' },
      // Name variant maps to data-lucide attribute, not a CSS class
    },
    // Icon-specific: catalog is the source of truth for which icons exist.
    // The Name variant in Figma is driven from this list.
    // Code Connect snippet (Feature 002): <span class="ds-icon ds-icon--md"><i data-lucide="[name]"></i></span>
    catalog: ICON_CATALOG,
    sizes: [16, 20, 24],
  },
  {
    figmaName: 'Button',
    previewFile: 'preview/components-buttons.html',
    cssClass: 'btn',
    figmaNodeId: null, // TBD — awaiting Build Quality Check Step 5 in Phase 3 session
    variantProps: {
      Type:  { Primary: 'btn--primary', Secondary: 'btn--secondary', Ghost: 'btn--ghost', Destructive: 'btn--destructive' },
      Size:  { SM: 'btn--sm', MD: '', LG: 'btn--lg' },
      State: { Default: '', Hover: '', Active: '', Focus: '', Disabled: 'is-disabled' },
    },
  },
  {
    figmaName: 'Form/Tags',
    previewFile: 'preview/components-tags.html',
    cssClass: 'tag',
    figmaNodeId: null, // TBD
    variantProps: {
      Color: { Success: 'tag--success', Warning: 'tag--warning', Error: 'tag--error', Info: 'tag--info', Neutral: 'tag--neutral' },
      Size:  { SM: 'tag--sm', MD: '' },
      Style: { Subtle: '', Bold: 'tag--bold' },
    },
  },
];

module.exports = { COMPONENT_MAP, ICON_CATALOG };
