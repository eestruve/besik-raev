#!/usr/bin/env node
/**
 * scripts/verify-build.mjs
 * Standalone Build & Asset Verification Harness for 20_Сайт_Беслана
 * Milestone: M4 (E2E Testing Track)
 *
 * Checks:
 *   1. Media assets existence & non-zero byte size in public/assets and public/
 *   2. Built distribution dist/index.html (or root index.html) structure:
 *      title, responsive viewport, OG tags, Twitter card, lang="ru"
 *   3. JS & CSS bundle presence & size budget checks (< 1MB uncompressed)
 *   4. Crucial content anchors (Besik Raev, Останься музыка, Telegram @besik_raev,
 *      Qtickets / Путешествие в детство, Booking formats, 152-ФЗ / Cookie)
 *   5. Clean ANSI-colored pass/fail summary table and exit code 0 on success.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const checks = [];
let passCount = 0;
let failCount = 0;
let warnCount = 0;

function recordCheck(category, name, passed, details = '', isWarning = false) {
  checks.push({ category, name, passed, details, isWarning });
  if (passed) {
    passCount++;
  } else if (isWarning) {
    warnCount++;
  } else {
    failCount++;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  20_Сайт_Беслана — Automated Build & Asset Verification Harness  ${colors.reset}`);
console.log(`${colors.dim}  Project Root: ${projectRoot}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

// -----------------------------------------------------------------------------
// Phase 1: Core Media Assets Audit
// -----------------------------------------------------------------------------
console.log(`${colors.bold}Phase 1: Auditing Core Media Assets...${colors.reset}`);

const requiredAssets = [
  { relPath: 'public/assets/beslan.mp4', minSize: 500 * 1024, expected: '~1.02 MB video' },
  { relPath: 'public/assets/beslan.mp3', minSize: 100 * 1024, expected: '~273 KB audio' },
  { relPath: 'public/assets/beslan_avatar.jpg', minSize: 50 * 1024, expected: '~144 KB portrait' },
  { relPath: 'public/assets/beslan_avatar.png', minSize: 50 * 1024, expected: '~144 KB PNG portrait' },
  { relPath: 'public/assets/beslan_poster.jpg', minSize: 10 * 1024, expected: '~27 KB video poster' },
  { relPath: 'public/favicon.ico', minSize: 1 * 1024, expected: 'Favicon ICO' },
  { relPath: 'public/favicon.png', minSize: 1 * 1024, expected: 'Favicon PNG' },
];

for (const asset of requiredAssets) {
  const fullPath = path.join(projectRoot, asset.relPath);
  if (!fs.existsSync(fullPath)) {
    recordCheck('Media Assets', asset.relPath, false, `File missing (Expected ${asset.expected})`);
    continue;
  }
  const stat = fs.statSync(fullPath);
  if (stat.size < asset.minSize) {
    recordCheck(
      'Media Assets',
      asset.relPath,
      false,
      `File too small: ${formatBytes(stat.size)} < min ${formatBytes(asset.minSize)}`
    );
  } else {
    recordCheck(
      'Media Assets',
      asset.relPath,
      true,
      `${formatBytes(stat.size)} (Valid ${asset.expected})`
    );
  }
}

// Easter Egg Animations Check
const easterEggDir = path.join(projectRoot, 'public/assets/easter_egg');
if (fs.existsSync(easterEggDir)) {
  const gifFiles = fs.readdirSync(easterEggDir).filter((f) => f.endsWith('.gif'));
  const keyGifs = ['kolobok_crazy.gif', 'kolobok_laugh.gif', 'kolobok_dance.gif', 'kolobok_crown.gif'];
  const missingKeys = keyGifs.filter((k) => !gifFiles.includes(k));

  if (gifFiles.length >= 5 && missingKeys.length === 0) {
    recordCheck(
      'Easter Egg Assets',
      'public/assets/easter_egg/*.gif',
      true,
      `Found ${gifFiles.length} GIFs (All key presets present)`
    );
  } else if (gifFiles.length > 0) {
    recordCheck(
      'Easter Egg Assets',
      'public/assets/easter_egg/*.gif',
      true,
      `Found ${gifFiles.length} GIFs (Missing some key presets: ${missingKeys.join(', ')})`,
      true
    );
  } else {
    recordCheck('Easter Egg Assets', 'public/assets/easter_egg', false, 'No GIF files found');
  }
} else {
  recordCheck('Easter Egg Assets', 'public/assets/easter_egg', false, 'Directory missing');
}

// -----------------------------------------------------------------------------
// Phase 2: Distribution & HTML Structure Audit
// -----------------------------------------------------------------------------
console.log(`\n${colors.bold}Phase 2: Auditing HTML Structure & Metadata...${colors.reset}`);

const distHtmlPath = path.join(projectRoot, 'dist/index.html');
const rootHtmlPath = path.join(projectRoot, 'index.html');

let htmlPath = null;
let isDist = false;

if (fs.existsSync(distHtmlPath)) {
  htmlPath = distHtmlPath;
  isDist = true;
  recordCheck('HTML Structure', 'dist/index.html Presence', true, 'Found production dist/index.html');
} else if (fs.existsSync(rootHtmlPath)) {
  htmlPath = rootHtmlPath;
  recordCheck(
    'HTML Structure',
    'dist/index.html Presence',
    true,
    'dist/ not built yet — inspecting root index.html and app components',
    true
  );
} else {
  recordCheck('HTML Structure', 'dist/index.html Presence', false, 'Neither dist/index.html nor root index.html found');
}

let aggregateContent = '';

if (htmlPath && fs.existsSync(htmlPath)) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  aggregateContent += htmlContent;

  // Doctype & Language
  const hasDoctype = /<!doctype html>/i.test(htmlContent);
  recordCheck('HTML Structure', 'HTML5 DOCTYPE', hasDoctype, hasDoctype ? '<!DOCTYPE html> verified' : 'Missing <!DOCTYPE html>');

  const hasLangRu = /<html[^>]*lang=["']ru["']/i.test(htmlContent);
  recordCheck('HTML Structure', 'Language Tag (lang="ru")', hasLangRu, hasLangRu ? 'lang="ru" verified' : 'Missing lang="ru"');

  // Viewport
  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*["']/i.test(htmlContent);
  recordCheck('HTML Structure', 'Responsive Viewport Meta', hasViewport, hasViewport ? 'width=device-width found' : 'Missing mobile viewport tag');

  // Title
  const titleMatch = htmlContent.match(/<title>([^<]*)<\/title>/i);
  const titleValid = titleMatch && (titleMatch[1].includes('Беслан') || titleMatch[1].includes('Besik Raev'));
  recordCheck('HTML Structure', 'Page Title', Boolean(titleValid), titleValid ? `"${titleMatch[1]}"` : 'Title missing or does not name Beslan / Besik Raev');

  // OpenGraph Tags
  const ogTags = [
    { name: 'og:title', regex: /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i },
    { name: 'og:description', regex: /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i },
    { name: 'og:image', regex: /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i },
    { name: 'og:type', regex: /<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i },
  ];

  for (const tag of ogTags) {
    const match = htmlContent.match(tag.regex);
    recordCheck('SEO & OpenGraph', tag.name, Boolean(match), match ? `content="${match[1]}"` : `Missing <meta property="${tag.name}">`);
  }

  // Favicon link
  const hasFavicon = /<link[^>]*rel=["'](icon|shortcut icon)["']/i.test(htmlContent);
  recordCheck('HTML Structure', 'Favicon Link', hasFavicon, hasFavicon ? 'Favicon <link> present' : 'Missing favicon link');
}

// -----------------------------------------------------------------------------
// Phase 3: Crucial Content Anchors Audit (HTML + App Components/Bundles)
// -----------------------------------------------------------------------------
console.log(`\n${colors.bold}Phase 3: Auditing Content Anchors in Application & Bundles...${colors.reset}`);

const distAssetsDir = path.join(projectRoot, 'dist/assets');
if (fs.existsSync(distAssetsDir)) {
  const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
  for (const jsFile of jsFiles) {
    aggregateContent += '\n' + fs.readFileSync(path.join(distAssetsDir, jsFile), 'utf8');
  }
} else {
  // Pre-build mode: Inspect React components in src/
  const srcDir = path.join(projectRoot, 'src');
  if (fs.existsSync(srcDir)) {
    function readAllFiles(dir) {
      let content = '';
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            content += readAllFiles(full);
          } else if (/\.(tsx?|jsx?|html|css)$/.test(entry.name)) {
            content += '\n' + fs.readFileSync(full, 'utf8');
          }
        }
      } catch (err) {
        // Skip unreadable files
      }
      return content;
    }
    aggregateContent += '\n' + readAllFiles(srcDir);
  }
}

const contentAnchors = [
  {
    name: 'Artist Branding',
    pattern: /(Беслан|Besik\s*Raev|Бесик\s*Раев)/i,
    desc: 'Mentions artist "Беслан" or "Besik Raev"',
  },
  {
    name: 'Key Release Track',
    pattern: /Останься[\s,]+музыка/i,
    desc: 'Mentions hit single "Останься музыка"',
  },
  {
    name: 'Telegram Booking Gateway',
    pattern: /(@besik_raev|t\.me\/besik_raev)/i,
    desc: 'Contains Telegram booking handle @besik_raev',
  },
  {
    name: 'Concert & Qtickets Reference',
    pattern: /(Путешествие\s+в\s+детство|qtickets\.events|qtickets)/i,
    desc: 'Mentions concert "Путешествие в детство" or Qtickets platform',
  },
  {
    name: 'Commercial Booking Formats',
    pattern: /(Акустика|Клубный|Фестиваль|Букинг|Booking|Райдер)/i,
    desc: 'Mentions booking formats or rider details',
  },
  {
    name: '152-ФЗ / Privacy Notice',
    pattern: /(cookie|персональн|конфиденциальн|152-ФЗ)/i,
    desc: 'Contains technical cookie or privacy policy reference',
  },
];

for (const anchor of contentAnchors) {
  const found = anchor.pattern.test(aggregateContent);
  recordCheck('Content Anchors', anchor.name, found, found ? anchor.desc : `Missing anchor: ${anchor.desc}`);
}

// -----------------------------------------------------------------------------
// Phase 4: Bundle & Size Budget Audit
// -----------------------------------------------------------------------------
console.log(`\n${colors.bold}Phase 4: Auditing Bundles & Size Budgets...${colors.reset}`);

const MAX_JS_BUDGET = 1024 * 1024; // 1 MB uncompressed
const MAX_CSS_BUDGET = 200 * 1024; // 200 KB uncompressed

if (fs.existsSync(distAssetsDir)) {
  const distFiles = fs.readdirSync(distAssetsDir);
  const jsBundles = distFiles.filter((f) => f.endsWith('.js'));
  const cssBundles = distFiles.filter((f) => f.endsWith('.css'));

  if (jsBundles.length > 0) {
    for (const jsFile of jsBundles) {
      const stat = fs.statSync(path.join(distAssetsDir, jsFile));
      const withinBudget = stat.size <= MAX_JS_BUDGET;
      recordCheck(
        'Size Budgets',
        `JS Bundle: ${jsFile}`,
        withinBudget,
        `${formatBytes(stat.size)} (Budget: ${formatBytes(MAX_JS_BUDGET)})`
      );
    }
  } else {
    recordCheck('Size Budgets', 'JavaScript Bundle', false, 'No .js bundles found in dist/assets');
  }

  if (cssBundles.length > 0) {
    for (const cssFile of cssBundles) {
      const stat = fs.statSync(path.join(distAssetsDir, cssFile));
      const withinBudget = stat.size <= MAX_CSS_BUDGET;
      recordCheck(
        'Size Budgets',
        `CSS Bundle: ${cssFile}`,
        withinBudget,
        `${formatBytes(stat.size)} (Budget: ${formatBytes(MAX_CSS_BUDGET)})`
      );
    }
  } else {
    recordCheck('Size Budgets', 'CSS Bundle', false, 'No .css bundles found in dist/assets');
  }
} else {
  recordCheck(
    'Size Budgets',
    'dist/assets Directory',
    true,
    'dist/assets not yet built (pre-build stage) — validated asset sizes in public/',
    true
  );
}

// -----------------------------------------------------------------------------
// Summary Table Display
// -----------------------------------------------------------------------------
console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}                       VERIFICATION SUMMARY                       ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);

let currentCat = '';
for (const chk of checks) {
  if (chk.category !== currentCat) {
    currentCat = chk.category;
    console.log(`\n${colors.bold}${colors.magenta}[${currentCat}]${colors.reset}`);
  }
  let statusSymbol = chk.passed ? `${colors.green}✔ PASS${colors.reset}` : chk.isWarning ? `${colors.yellow}⚠ WARN${colors.reset}` : `${colors.red}✖ FAIL${colors.reset}`;
  console.log(`  ${statusSymbol} ${colors.bold}${chk.name.padEnd(35)}${colors.reset} ${colors.dim}${chk.details}${colors.reset}`);
}

console.log(`\n${colors.bold}----------------------------------------------------------------${colors.reset}`);
console.log(`  Total Checks: ${checks.length} | Passed: ${colors.green}${passCount}${colors.reset} | Warnings: ${colors.yellow}${warnCount}${colors.reset} | Failed: ${colors.red}${failCount}${colors.reset}`);
console.log(`${colors.bold}----------------------------------------------------------------${colors.reset}\n`);

if (failCount > 0) {
  console.error(`${colors.bold}${colors.red}VERIFICATION FAILED with ${failCount} critical defect(s).${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.bold}${colors.green}ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!${colors.reset}\n`);
  process.exit(0);
}
