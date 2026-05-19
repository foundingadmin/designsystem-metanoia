#!/usr/bin/env node
/**
 * sync-figma-to-repo.js
 * Metanoia Design System — Figma → CSS sync
 *
 * Reads live variable values from the Figma file via MCP, diffs them
 * against the atomic token files in tokens/, writes changes, and
 * returns git/PR instructions for Claude Code to execute.
 *
 * Usage: trigger by saying "sync Figma → repo" or "run figma-to-repo sync"
 *
 * Token source files (read and patched individually):
 *   tokens/color-primitives.css
 *   tokens/color-semantic.css
 *   tokens/typography.css
 *   tokens/spacing.css
 *   tokens/motion.css
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const TOKEN_DIR    = path.resolve(__dirname, '../tokens');
const FIGMA_FILE   = 'c3ayt4AFrNKOmSkGBIyFi4';
const BRANCH_PREFIX = 'sync/figma-to-css';

const TOKEN_FILES = [
  'color-primitives.css',
  'color-semantic.css',
  'typography.css',
  'spacing.css',
  'motion.css',
].map(f => path.join(TOKEN_DIR, f));

// ── File I/O ──────────────────────────────────────────────────────────────────

function readTokenFiles() {
  return TOKEN_FILES.map(file => ({
    file,
    content: fs.readFileSync(file, 'utf8'),
  }));
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function figmaColorToCss(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a ?? 1;
  if (Math.abs(a - 1) < 0.005) {
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`.toUpperCase();
  }
  return `rgba(${r},${g},${b},${parseFloat(a.toFixed(2))})`;
}

/** Parse all CSS custom properties from a block of CSS text. */
function parseCssVars(cssText) {
  const vars = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    vars[`--${m[1]}`] = m[2].trim();
  }
  return vars;
}

function resolveCssAlias(value, allVars) {
  const ref = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (ref) return allVars[ref[1]] ?? value;
  return value;
}

function normaliseHex(hex) {
  return hex.toUpperCase().replace(/^#/, '').padStart(6, '0');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Main diff function ────────────────────────────────────────────────────────

/**
 * figmaVars: [{ name, resolvedType: 'COLOR'|'FLOAT'|'STRING', value }]
 * tokenFiles: [{ file, content }]  — from readTokenFiles()
 *
 * Returns { changes, warnings, updatedFiles }
 * updatedFiles: same shape as tokenFiles but with patched content
 */
function diffAndPatch(figmaVars, tokenMap, tokenFiles) {
  // Merge all CSS into one map for alias resolution
  const allCssText = tokenFiles.map(f => f.content).join('\n');
  const allVars    = parseCssVars(allCssText);

  // Build per-file var maps for patching
  const fileVars = tokenFiles.map(f => ({ ...f, vars: parseCssVars(f.content) }));

  const figmaByName = {};
  for (const v of figmaVars) figmaByName[v.name] = v;

  const changes  = [];
  const warnings = [];

  // Work on mutable copies of each file's content
  const updatedContents = tokenFiles.map(f => f.content);

  for (const mapping of tokenMap) {
    const figmaVar = figmaByName[mapping.figma];
    if (!figmaVar) {
      warnings.push({ css: mapping.css, figma: mapping.figma, status: 'FIGMA_MISSING' });
      continue;
    }

    const cssRaw = allVars[mapping.css];
    if (cssRaw === undefined) {
      warnings.push({ css: mapping.css, figma: mapping.figma, status: 'CSS_MISSING' });
      continue;
    }

    // Find which file owns this token
    const fileIdx = fileVars.findIndex(f => f.vars[mapping.css] !== undefined);

    const type = mapping.type ?? (figmaVar.resolvedType === 'FLOAT' ? 'FLOAT' : 'COLOR');

    if (type === 'COLOR') {
      const figmaHex    = figmaColorToCss(figmaVar.value);
      const cssResolved = resolveCssAlias(cssRaw, allVars);
      const figmaIsRgba = figmaHex.startsWith('rgba');
      const cssIsRgba   = cssResolved.startsWith('rgba');

      let isDifferent = false;
      if (!figmaIsRgba && !cssIsRgba) {
        isDifferent = normaliseHex(figmaHex) !== normaliseHex(cssResolved.replace(/^#/, '').split(';')[0]);
      } else {
        isDifferent = figmaHex.replace(/\s/g,'') !== cssResolved.replace(/\s/g,'');
      }

      if (isDifferent) {
        changes.push({ css: mapping.css, figma: mapping.figma, status: 'CHANGED', from: cssResolved, to: figmaHex });
        if (fileIdx >= 0) {
          const re = new RegExp(`(${escapeRegex(mapping.css)}\\s*:\\s*)([^;]+)(;)`, 'g');
          updatedContents[fileIdx] = updatedContents[fileIdx].replace(re, (_, prop, _val, semi) => `${prop}${figmaHex}${semi}`);
        }
      }

    } else if (type === 'FLOAT') {
      const transform = mapping.transform ?? (v => parseFloat(v));
      const cssNum    = transform(resolveCssAlias(cssRaw, allVars));
      const figmaNum  = figmaVar.value;

      if (Math.abs(cssNum - figmaNum) > 0.01) {
        const isRem = cssRaw.includes('rem');
        const isPx  = cssRaw.includes('px');
        const isMs  = cssRaw.includes('ms');
        let newVal;
        if (isRem)      newVal = `${(figmaNum / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
        else if (isPx)  newVal = `${figmaNum}px`;
        else if (isMs)  newVal = `${figmaNum}ms`;
        else            newVal = String(figmaNum);

        changes.push({ css: mapping.css, figma: mapping.figma, status: 'CHANGED', from: cssRaw, to: newVal });
        if (fileIdx >= 0) {
          const re = new RegExp(`(${escapeRegex(mapping.css)}\\s*:\\s*)([^;]+)(;)`, 'g');
          updatedContents[fileIdx] = updatedContents[fileIdx].replace(re, (_, prop, _val, semi) => `${prop}${newVal}${semi}`);
        }
      }

    } else if (type === 'STRING') {
      const cssStr   = resolveCssAlias(cssRaw, allVars).trim();
      const figmaStr = String(figmaVar.value).trim();

      if (figmaStr !== cssStr) {
        changes.push({ css: mapping.css, figma: mapping.figma, status: 'CHANGED', from: cssStr, to: figmaStr });
        if (fileIdx >= 0) {
          const re = new RegExp(`(${escapeRegex(mapping.css)}\\s*:\\s*)([^;]+)(;)`, 'g');
          updatedContents[fileIdx] = updatedContents[fileIdx].replace(re, (_, prop, _val, semi) => `${prop}${figmaStr}${semi}`);
        }
      }
    }
  }

  const updatedFiles = tokenFiles.map((f, i) => ({ file: f.file, content: updatedContents[i] }));
  return { changes, warnings, updatedFiles };
}

// ── Version bump ──────────────────────────────────────────────────────────────

function bumpType(changes) {
  const hasRename = changes.some(c => c.status === 'CSS_MISSING' || c.status === 'FIGMA_MISSING');
  return hasRename ? 'MAJOR' : 'PATCH';
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function run(figmaVars, tokenMap) {
  const tokenFiles = readTokenFiles();
  const { changes, warnings, updatedFiles } = diffAndPatch(figmaVars, tokenMap, tokenFiles);

  const realChanges = changes.filter(c => c.status === 'CHANGED');

  console.log('\n── Metanoia DS: Figma → CSS Sync ──────────────────────────────');

  if (realChanges.length === 0) {
    console.log('✓ No token differences found. CSS is in sync with Figma.');
    if (warnings.length) {
      console.log('\nWarnings (mapping gaps):');
      warnings.forEach(w => console.log(`  ${w.status}: ${w.css} ↔ ${w.figma}`));
    }
    return;
  }

  console.log(`\n${realChanges.length} token(s) changed:\n`);
  realChanges.forEach(c => {
    console.log(`  ${c.css}`);
    console.log(`    Figma: ${c.figma}`);
    console.log(`    ${c.from}  →  ${c.to}\n`);
  });

  if (warnings.length) {
    console.log(`\n${warnings.length} mapping warning(s):`);
    warnings.forEach(w => console.log(`  ${w.status}: ${w.css} ↔ ${w.figma}`));
  }

  // Write only the files that changed
  let filesWritten = 0;
  for (let i = 0; i < tokenFiles.length; i++) {
    if (updatedFiles[i].content !== tokenFiles[i].content) {
      fs.writeFileSync(updatedFiles[i].file, updatedFiles[i].content, 'utf8');
      console.log(`✓ Updated: ${path.relative(path.resolve(__dirname, '..'), updatedFiles[i].file)}`);
      filesWritten++;
    }
  }
  console.log(`\n✓ ${filesWritten} file(s) updated in tokens/.`);

  const date   = new Date().toISOString().slice(0, 10);
  const branch = `${BRANCH_PREFIX}-${date}`;
  const bump   = bumpType(realChanges);
  const summary = realChanges.length === 1
    ? `update ${realChanges[0].css}`
    : `update ${realChanges.length} tokens`;

  const prBody = [
    '## Figma → CSS Token Sync',
    '',
    `Automated sync from Figma design system (file \`${FIGMA_FILE}\`).`,
    '',
    '### Changed tokens',
    ...realChanges.map(c => `- \`${c.css}\`: \`${c.from}\` → \`${c.to}\``),
    '',
    warnings.length
      ? `### Mapping warnings\n${warnings.map(w => `- ${w.status}: \`${w.css}\` ↔ \`${w.figma}\``).join('\n')}`
      : '',
    '',
    '---',
    '_Generated by Claude Code · Metanoia DS sync script_',
  ].join('\n');

  const commitMsg = `${bump === 'MAJOR' ? 'feat' : 'fix'}: figma→css sync — ${summary}`;

  const cmds = [
    `git checkout -b ${branch}`,
    `git add tokens/`,
    `git commit -m "${commitMsg}"`,
    `git push -u origin ${branch}`,
    `gh pr create --title "DS Sync: ${summary}" --body '${prBody.replace(/'/g, "\\'")}' --base main --head ${branch}`,
  ];

  console.log('\n── Git commands to run ─────────────────────────────────────────');
  cmds.forEach(cmd => console.log(`  $ ${cmd}`));

  return { branch, commitMsg, prBody, changes: realChanges, warnings, bump };
}

module.exports = { run, diffAndPatch, figmaColorToCss, parseCssVars, readTokenFiles, bumpType };
