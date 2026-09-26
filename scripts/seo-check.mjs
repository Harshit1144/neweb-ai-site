#!/usr/bin/env node
// Sitewide SEO checker for neweb.ai (no dependencies).
//
//   node scripts/seo-check.mjs            # human-readable report
//   node scripts/seo-check.mjs --json     # machine-readable JSON on stdout
//   node scripts/seo-check.mjs --inbound  # also print the inbound-link table
//
// Scans index.html + pages/**/*.html and reports:
//   titles (missing / duplicate / >60), descriptions (missing / <70 / >160),
//   H1 count, canonical (missing / mismatched), og:image, <html lang>,
//   internal hrefs ending in .html, internal hrefs to non-existent files,
//   images missing alt, JSON-LD parse errors (2 known false positives allowed),
//   sitemap.xml vs. files (both directions), thin pages (<300 visible words),
//   noindex leaking onto indexable pages, and orphans / low-inbound pages.
// Always exits 0 so it can run inside other tooling; read the summary.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN = 'https://neweb.ai';
const ARGS = new Set(process.argv.slice(2));

// Pages that are intentionally not indexable; they are excluded from
// sitemap / orphan / thin checks (but still scanned for basic hygiene).
const NOINDEX_OK = new Set(['/pages/admin', '/pages/blog-post']);
// Tool pages that embed example JSON-LD inside JSON-LD (false positives).
const JSONLD_FALSE_POSITIVES = new Set([
  'pages/tools/faq-schema-generator.html',
  'pages/tools/localbusiness-schema-generator.html',
]);
const THIN_WORDS = 300;

// ---------- helpers ----------
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const rel = p => path.relative(ROOT, p).split(path.sep).join('/');
function fileToUrl(relPath) {
  if (relPath === 'index.html') return '/';
  return '/' + relPath.replace(/\.html$/, '');
}
function decode(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'").replace(/&middot;/g, '·').replace(/&copy;/g, '©')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  if (!m) return null;
  return decode(m[2] ?? m[3] ?? m[4] ?? '');
}
function metaContent(html, key, val) {
  const re = new RegExp(`<meta[^>]*\\s${key}\\s*=\\s*["']${val}["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? attr(m[0], 'content') : null;
}
function visibleText(html) {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  h = h.replace(/<[^>]+>/g, ' ');
  return decode(h).replace(/\s+/g, ' ').trim();
}
function normalizeHref(href, fromUrl) {
  if (!href) return null;
  let h = href.trim();
  if (/^(mailto:|tel:|javascript:|data:|#|sms:|whatsapp:)/i.test(h)) return null;
  if (/^https?:\/\//i.test(h)) {
    if (!h.startsWith(DOMAIN) && !h.startsWith('http://neweb.ai') && !h.startsWith('https://www.neweb.ai')) return null; // external
    h = h.replace(/^https?:\/\/(www\.)?neweb\.ai/i, '') || '/';
  } else if (h.startsWith('//')) {
    return null;
  }
  h = h.split('#')[0].split('?')[0];
  if (!h) return null;
  if (!h.startsWith('/')) {
    // relative → resolve against the linking page's directory
    const base = fromUrl.endsWith('/') ? fromUrl : fromUrl.replace(/\/[^/]*$/, '/');
    h = path.posix.normalize(base + h);
  }
  return h;
}
// Does an internal URL resolve to a real file on disk?
function resolvesToFile(url) {
  if (url === '/' || url === '/index') return true;
  const clean = url.replace(/\/+$/, '');
  const candidates = [
    path.join(ROOT, clean),
    path.join(ROOT, clean + '.html'),
    path.join(ROOT, clean, 'index.html'),
  ];
  return candidates.some(c => { try { return fs.statSync(c).isFile(); } catch { return false; } });
}

// ---------- scan ----------
const files = ['index.html', ...walk(path.join(ROOT, 'pages')).map(rel)].filter(f => fs.existsSync(path.join(ROOT, f)));
const pages = new Map(); // url → info

for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const url = fileToUrl(f);
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [html])[0];
  const titleM = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? decode(titleM[1]).replace(/\s+/g, ' ').trim() : null;
  const description = metaContent(head, 'name', 'description');
  const canonicalM = head.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i);
  const canonical = canonicalM ? attr(canonicalM[0], 'href') : null;
  const ogImage = metaContent(head, 'property', 'og:image');
  const robots = metaContent(head, 'name', 'robots');
  const langM = html.match(/<html[^>]*\slang\s*=\s*["']([^"']+)["']/i);
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  const bodyNoChrome = body.replace(/<nav[\s\S]*?<\/nav>/gi, '').replace(/<footer[\s\S]*?<\/footer>/gi, '');

  const links = [];
  for (const m of body.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], 'href');
    if (href) links.push({ raw: href, url: normalizeHref(href, url) });
  }
  const bodyLinks = new Set();
  for (const m of bodyNoChrome.matchAll(/<a\b[^>]*>/gi)) {
    const u = normalizeHref(attr(m[0], 'href'), url);
    if (u) bodyLinks.add(u);
  }
  const imgsNoAlt = [];
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt\s*=/i.test(m[0])) imgsNoAlt.push((attr(m[0], 'src') || '(no src)').slice(0, 80));
  }
  const jsonldErrors = [];
  for (const m of html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); } catch (e) { jsonldErrors.push(e.message.slice(0, 80)); }
  }
  const words = visibleText(html).split(' ').filter(Boolean).length;

  pages.set(url, {
    file: f, url, title, description, canonical, ogImage, robots,
    lang: langM ? langM[1] : null, h1s, links, bodyLinks, imgsNoAlt, jsonldErrors, words,
    noindex: !!(robots && /noindex/i.test(robots)),
  });
}

// ---------- sitemap ----------
let sitemapUrls = [];
try {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  sitemapUrls = [...sm.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1].trim());
} catch { /* no sitemap */ }
const sitemapPaths = new Set(sitemapUrls.map(u => u.replace(/^https?:\/\/(www\.)?neweb\.ai/, '') || '/'));

// ---------- inbound links ----------
const inboundAll = new Map();  // url → Set(source urls), including nav/footer
const inboundBody = new Map(); // url → Set(source urls), excluding nav/footer
for (const u of pages.keys()) { inboundAll.set(u, new Set()); inboundBody.set(u, new Set()); }
for (const p of pages.values()) {
  for (const l of p.links) {
    if (!l.url || l.url === p.url) continue;
    const target = l.url.replace(/\/+$/, '') || '/';
    if (inboundAll.has(target)) inboundAll.get(target).add(p.url);
  }
  for (const u of p.bodyLinks) {
    const target = u.replace(/\/+$/, '') || '/';
    if (target !== p.url && inboundBody.has(target)) inboundBody.get(target).add(p.url);
  }
}

// ---------- issues ----------
const issues = {
  titleMissing: [], titleDuplicate: [], titleLong: [],
  descMissing: [], descShort: [], descLong: [],
  h1None: [], h1Multiple: [],
  canonicalMissing: [], canonicalMismatch: [],
  ogImageMissing: [], langMissing: [],
  hrefDotHtml: [], hrefBroken: [],
  imgNoAlt: [], jsonldInvalid: [],
  notInSitemap: [], sitemapNoFile: [], sitemapBadUrl: [],
  thin: [], noindexLeak: [],
  orphan: [], lowInbound: [],
};
const titleIndex = new Map();
for (const p of pages.values()) {
  const indexable = !p.noindex && !NOINDEX_OK.has(p.url);
  if (!p.title) issues.titleMissing.push(p.url);
  else {
    if (p.title.length > 60) issues.titleLong.push(`${p.url} (${p.title.length}) "${p.title}"`);
    if (!titleIndex.has(p.title)) titleIndex.set(p.title, []);
    titleIndex.get(p.title).push(p.url);
  }
  if (!p.description) issues.descMissing.push(p.url);
  else if (p.description.length < 70) issues.descShort.push(`${p.url} (${p.description.length})`);
  else if (p.description.length > 160) issues.descLong.push(`${p.url} (${p.description.length})`);
  if (p.h1s === 0) issues.h1None.push(p.url);
  if (p.h1s > 1) issues.h1Multiple.push(`${p.url} (${p.h1s})`);
  if (!p.canonical) issues.canonicalMissing.push(p.url);
  else {
    const expected = DOMAIN + (p.url === '/' ? '/' : p.url);
    if (p.canonical.replace(/\/+$/, '') !== expected.replace(/\/+$/, '')) {
      // Allowed: a noindex/CSR shell pointing elsewhere is a mismatch too, but report it.
      issues.canonicalMismatch.push(`${p.url} → ${p.canonical}`);
    }
  }
  if (!p.ogImage) issues.ogImageMissing.push(p.url);
  if (!p.lang) issues.langMissing.push(p.url);
  const dotHtml = [...new Set(p.links.filter(l => l.url && /\.html$/i.test(l.url)).map(l => l.raw))];
  if (dotHtml.length) issues.hrefDotHtml.push(`${p.url}: ${dotHtml.join(', ')}`);
  const broken = [...new Set(p.links.filter(l => l.url && !resolvesToFile(l.url)).map(l => l.url))];
  if (broken.length) issues.hrefBroken.push(`${p.url}: ${broken.join(', ')}`);
  if (p.imgsNoAlt.length) issues.imgNoAlt.push(`${p.url}: ${p.imgsNoAlt.length} img(s) [${p.imgsNoAlt.slice(0, 3).join(', ')}]`);
  if (p.jsonldErrors.length && !JSONLD_FALSE_POSITIVES.has(p.file)) issues.jsonldInvalid.push(`${p.url}: ${p.jsonldErrors[0]}`);
  if (indexable && !sitemapPaths.has(p.url)) issues.notInSitemap.push(p.url);
  if (p.noindex && sitemapPaths.has(p.url)) issues.noindexLeak.push(`${p.url} (noindex but in sitemap)`);
  if (p.noindex && !NOINDEX_OK.has(p.url)) issues.noindexLeak.push(`${p.url} (robots=${p.robots})`);
  if (indexable && p.words < THIN_WORDS) issues.thin.push(`${p.url} (${p.words} words)`);
  if (indexable && p.url !== '/') {
    const all = inboundAll.get(p.url).size, bodyN = inboundBody.get(p.url).size;
    if (all === 0) issues.orphan.push(p.url);
    else if (all <= 1) issues.lowInbound.push(`${p.url} (inbound: ${all}, body-only: ${bodyN})`);
  }
}
for (const [t, urls] of titleIndex) if (urls.length > 1) issues.titleDuplicate.push(`"${t}" ← ${urls.join(', ')}`);
for (const u of sitemapUrls) {
  if (!u.startsWith(DOMAIN + '/') && u !== DOMAIN) issues.sitemapBadUrl.push(u + ' (not https://neweb.ai)');
  else if (/\.html$/i.test(u)) issues.sitemapBadUrl.push(u + ' (.html)');
  const p = u.replace(/^https?:\/\/(www\.)?neweb\.ai/, '') || '/';
  if (!resolvesToFile(p)) issues.sitemapNoFile.push(u);
}

// ---------- output ----------
const summaryRows = [
  ['Pages scanned', pages.size],
  ['Sitemap URLs', sitemapUrls.length],
  ['Title missing', issues.titleMissing.length],
  ['Title duplicate', issues.titleDuplicate.length],
  ['Title > 60 chars', issues.titleLong.length],
  ['Description missing', issues.descMissing.length],
  ['Description < 70', issues.descShort.length],
  ['Description > 160', issues.descLong.length],
  ['No H1', issues.h1None.length],
  ['Multiple H1', issues.h1Multiple.length],
  ['Canonical missing', issues.canonicalMissing.length],
  ['Canonical mismatch', issues.canonicalMismatch.length],
  ['og:image missing', issues.ogImageMissing.length],
  ['<html lang> missing', issues.langMissing.length],
  ['Internal hrefs ending .html', issues.hrefDotHtml.length],
  ['Internal hrefs to missing files', issues.hrefBroken.length],
  ['Images missing alt', issues.imgNoAlt.length],
  ['JSON-LD parse errors (excl. 2 known)', issues.jsonldInvalid.length],
  ['Indexable pages not in sitemap', issues.notInSitemap.length],
  ['Sitemap URLs with no file', issues.sitemapNoFile.length],
  ['Sitemap URLs malformed (www/http/.html)', issues.sitemapBadUrl.length],
  [`Thin pages (< ${THIN_WORDS} words)`, issues.thin.length],
  ['noindex leaks', issues.noindexLeak.length],
  ['Orphan pages (0 inbound)', issues.orphan.length],
  ['Low inbound (1 inbound link)', issues.lowInbound.length],
];

if (ARGS.has('--json')) {
  const inbound = {};
  for (const u of pages.keys()) inbound[u] = { all: inboundAll.get(u).size, body: inboundBody.get(u).size };
  console.log(JSON.stringify({ summary: Object.fromEntries(summaryRows), issues, inbound }, null, 2));
  process.exit(0);
}

console.log('neweb.ai SEO check — ' + new Date().toISOString().slice(0, 10));
console.log('='.repeat(56));
const w = Math.max(...summaryRows.map(r => r[0].length));
for (const [k, v] of summaryRows) console.log(k.padEnd(w + 2) + String(v).padStart(5) + (v && k !== 'Pages scanned' && k !== 'Sitemap URLs' ? '  <--' : ''));
console.log('='.repeat(56));

const labels = {
  titleMissing: 'Missing <title>', titleDuplicate: 'Duplicate titles', titleLong: 'Titles longer than 60 chars',
  descMissing: 'Missing meta description', descShort: 'Meta description under 70 chars', descLong: 'Meta description over 160 chars',
  h1None: 'No H1', h1Multiple: 'Multiple H1', canonicalMissing: 'Missing canonical', canonicalMismatch: 'Canonical does not match URL',
  ogImageMissing: 'Missing og:image', langMissing: 'Missing <html lang>', hrefDotHtml: 'Internal hrefs ending in .html',
  hrefBroken: 'Internal hrefs to non-existent files', imgNoAlt: 'Images missing alt', jsonldInvalid: 'JSON-LD parse errors',
  notInSitemap: 'Indexable pages missing from sitemap.xml', sitemapNoFile: 'Sitemap URLs with no matching file',
  sitemapBadUrl: 'Sitemap URLs malformed', thin: 'Thin pages', noindexLeak: 'noindex leaks', orphan: 'Orphan pages (no inbound internal link)',
  lowInbound: 'Pages with exactly one inbound internal link',
};
for (const [k, list] of Object.entries(issues)) {
  if (!list.length) continue;
  console.log(`\n## ${labels[k]} (${list.length})`);
  for (const item of list) console.log('  - ' + item);
}

if (ARGS.has('--inbound')) {
  console.log('\n## Inbound link counts (all / body-only, excluding nav+footer), lowest first');
  const rows = [...pages.keys()].filter(u => u !== '/').map(u => [u, inboundAll.get(u).size, inboundBody.get(u).size]);
  rows.sort((a, b) => a[1] - b[1] || a[2] - b[2]);
  for (const [u, a, b] of rows) console.log(`  ${String(a).padStart(4)} ${String(b).padStart(4)}  ${u}`);
}
process.exit(0);
