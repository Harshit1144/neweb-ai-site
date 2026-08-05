# Technical SEO Audit — neweb.ai

**Date:** 2026-06-17
**Scope:** Live site https://neweb.ai (read-only audit via curl). Static HTML, LiteSpeed/Apache, 106 URLs in sitemap.
**Method:** All findings are evidence-based from live `curl` responses (status codes and exact header values quoted).

---

## Overall: 92 / 100

The site is in excellent technical shape: clean redirects (all single-hop), every spot-checked page is server-rendered with self-referencing canonicals and `index,follow`, all 106 sitemap URLs return 200, AI bots are explicitly allowed, and URLs are clean. The only material gap is a **missing Content-Security-Policy header**. Minor nits: sitemap `lastmod` is sparse (4 of 106) and the 404 page is the unbranded LiteSpeed default.

| Category | Score |
|---|---|
| Crawlability | 100 |
| Indexability | 100 |
| Redirects | 100 |
| Security headers | 78 |
| Mobile | 100 |
| URL structure | 100 |
| JS rendering | 100 |
| Sitemap basics | 85 |

---

## 1. Crawlability — 100/100

`https://neweb.ai/robots.txt` → `HTTP/2 200`, `content-type: text/plain`, 1754 bytes. Valid syntax.

**What passes**
- `User-agent: *` with `Allow: /` — full crawl access for general crawlers.
- Sitemap declared: `Sitemap: https://neweb.ai/sitemap.xml`.
- Private paths correctly blocked for all agents: `Disallow: /api/`, `/data/`, `/uploads-content/`, `/pages/admin`, `/pages/admin.html`.
- **AI bots explicitly allowed** with their own blocks (Allow: / + same private disallows): `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bingbot`.
- Header comment points AI bots to `https://neweb.ai/llms.txt` and `llms-full.txt`. `llms.txt` confirmed live (`200`).
- No accidental `Disallow` blocking important pages — no `/pages/` blanket block, no `/pages/blog`, `/pages/tools`, etc. blocked.

No issues.

---

## 2. Indexability — 100/100

Spot-checked 15 representative URLs. Every real page: `200`, self-referencing canonical, `index,follow`, no `noindex`.

| URL | Status | Self-canonical | Robots |
|---|---|---|---|
| `/` | 200 | yes | `index,follow,max-image-preview:large` |
| `/pages/cities/mumbai` | 200 | yes | `index,follow,max-image-preview:large,max-snippet:-1` |
| `/pages/guides/how-to-make-restaurant-website` | 200 | yes | `index,follow,...` |
| `/pages/tools/qr-code-generator` | 200 | yes | `index,follow,...` |
| `/pages/tools/slug-generator` | 200 | yes | `index,follow,...` |
| `/pages/compare/wix` | 200 | yes | `index,follow,...` |
| `/pages/solutions/restaurants` | 200 | yes | `index,follow,...` |
| `/pages/blog/hello-from-neweb` | 200 | yes | `index,follow,...` |
| `/pages/blog` | 200 | yes | `index,follow,max-image-preview:large` |
| `/pages/pricing` | 200 | yes | `index,follow,...` |
| `/pages/about` | 200 | yes | `index,follow,max-image-preview:large` |
| `/pages/cities/delhi` | 200 | yes | `index,follow,...` |
| `/pages/features` | 200 | yes | `index,follow,...` |
| `/pages/contact` | 200 | yes | `index,follow,max-image-preview:large` |

**What passes**
- All canonicals are absolute, HTTPS, apex-domain, and self-referencing (e.g. `<link rel="canonical" href="https://neweb.ai/pages/tools/slug-generator">`).
- No `noindex` found on any indexable page.
- `max-image-preview:large` set sitewide (good for image/Discover surfaces); content pages add `max-snippet:-1`.
- Hard 404s behave correctly: `/pages/guides/how-to-make-a-website` → `404` (and correctly NOT in sitemap); bogus URL → `404`; mixed-case `/pages/cities/Mumbai` → `404` (URLs are case-sensitive, preventing duplicate-case indexing).

No issues. (Note: `slug-generator` initially appeared to be missing meta in a batch grep; re-fetched in isolation it has full canonical/robots/title/JSON-LD. False alarm — fully indexable.)

---

## 3. Redirects — 100/100

All redirects are single-hop `301` to the canonical apex HTTPS URL. No chains >1 hop.

| Test | First hop | Final | Hops |
|---|---|---|---|
| `http://neweb.ai/` | `301 → https://neweb.ai/` | `200` | 1 |
| `https://www.neweb.ai/` | `301 → https://neweb.ai/` | `200` | 1 |
| `https://neweb.ai/pages/about/` (trailing slash) | `301 → https://neweb.ai/pages/about` | `200` | 1 |
| `https://neweb.ai/index.html` | `301 → https://neweb.ai/` | `200` | 1 |
| `https://neweb.ai/about-us` (legacy) | `301 → https://neweb.ai/pages/about` | `200` | 1 |

**What passes**
- www → apex consolidation, http → https, trailing-slash normalization (strips trailing slash), `/index.html` → `/`, and legacy `/about-us` → `/pages/about` all correct with permanent 301s, all in a single hop.

No issues.

---

## 4. Security headers — 78/100

Headers present and consistent across homepage, robots.txt, and deep pages (`/pages/cities/mumbai`).

**What passes (exact values)**
- `strict-transport-security: max-age=31536000; includeSubDomains` (HSTS, 1 year, subdomains).
- `x-content-type-options: nosniff`.
- `x-frame-options: SAMEORIGIN`.
- `referrer-policy: strict-origin-when-cross-origin`.
- `permissions-policy: geolocation=(), microphone=(), camera=()`.

**Issues**
- **[MEDIUM]** No `Content-Security-Policy` header on any response (homepage, mumbai city page, robots.txt all checked). **Fix:** Add a CSP. Given inline `<style>`/`<script type="application/ld+json">` blocks and Google Fonts, start in report-only mode, e.g. `Content-Security-Policy-Report-Only: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:;` then tighten and enforce.
- **[LOW]** HSTS lacks `preload` directive. **Fix:** if you intend to submit to the HSTS preload list, add `; preload` to the `strict-transport-security` value and submit at hstspreload.org. (Optional — only do this once you're confident all subdomains are HTTPS-only forever.)

---

## 5. Mobile — 100/100

**What passes**
- `<meta name="viewport" content="width=device-width,initial-scale=1">` present on every page checked (homepage, cities, guides, tools, compare, solutions, blog, pricing, about, features, contact).
- Responsive CSS confirmed in markup (e.g. `@media(max-width:860px){.grid-3,.grid-2{grid-template-columns:1fr}}`), indicating mobile breakpoints are implemented, not just a viewport tag.
- No fixed-width layout containers or `user-scalable=no` (which would harm accessibility/mobile-friendliness) observed.

No issues.

---

## 6. URL structure — 100/100

**What passes**
- All 106 sitemap URLs are clean, lowercase, hyphen-separated. A scan for `?`, `=`, uppercase, `index.html`, or `.php` in sitemap `<loc>` values returned **zero** matches.
- Logical, readable hierarchy: `/pages/cities/<city>`, `/pages/guides/<topic>`, `/pages/tools/<tool>`, `/pages/compare/<competitor>`, `/pages/solutions/<vertical>`, `/pages/blog/<slug>`.
- No tracking params, no session IDs, no file extensions on content URLs (extension forms like `/index.html` redirect away).

No issues.

---

## 7. JS rendering — 100/100

Critical content is **server-rendered**. Verified the historically-concerning blog index and tool pages ship real HTML (not an empty JS shell).

**What passes**
- **Blog index** (`/pages/blog`): real HTML, ~7,150 chars of body text, all 4 post links present in source (`/pages/blog/google-business-profile-guide-india`, `/hello-from-neweb`, `/how-to-pick-a-domain-name`, `/local-seo-checklist-india`). No client-side fetch required to discover posts.
- **Tool pages** (`/pages/tools/qr-code-generator`): ~39,000 chars of rendered text, 9 `<h1>/<h2>` headings, plus `WebApplication` + `FAQPage` + `BreadcrumbList` JSON-LD in source. `/pages/tools/slug-generator` similarly fully rendered with JSON-LD (FAQPage with 4 Q&As).
- **City pages** (`/pages/cities/mumbai`): ~17,700 chars, "Mumbai" mentioned 57 times — fully localized server-side content.
- **Blog post** (`/pages/blog/hello-from-neweb`): ~12,600 chars, 37 `<p>`/`<article>` elements.
- **Guide** (`/pages/guides/how-to-make-restaurant-website`): ~24,000 chars of rendered content.
- No empty `<div id="root">` SPA shells found; the only `<noscript>` is the Google Fonts fallback (progressive enhancement, not a content dependency).

No issues. The historical concern (blog index / tools needing JS) is resolved — all ship real HTML.

---

## 8. Sitemap basics — 85/100

`https://neweb.ai/sitemap.xml` → `200`, `content-type: application/xml`. Valid XML (`<?xml ... ?>` + `<urlset xmlns="...sitemaps.org/schemas/sitemap/0.9">`). 106 `<loc>` entries.

**What passes**
- Well-formed XML, correct namespace.
- All 106 URLs verified `200` (full crawl of every sitemap entry — zero non-200, zero redirects-in-sitemap).
- All URLs are canonical absolute HTTPS apex URLs — they match the on-page canonicals exactly (no www/trailing-slash/case mismatches).
- No 404s, no orphaned legacy paths in the sitemap (e.g. `how-to-make-a-website`, which 404s, is correctly excluded).

**Issues**
- **[LOW]** `lastmod` is present on only 4 of 106 URLs (the four blog posts, e.g. `<lastmod>2026-04-20T13:05:20.451Z</lastmod>`). The other 102 URLs (homepage, cities, guides, tools, compare, solutions, etc.) have no `lastmod`. **Fix:** Emit `<lastmod>` for every URL using the file's real last-modified date (the server already sends per-page `last-modified` headers, e.g. homepage `last-modified: Wed, 10 Jun 2026 19:02:09 GMT`, so the data exists). Accurate `lastmod` helps crawlers prioritize re-crawls of changed pages. Keep dates honest — don't bulk-stamp "today."

---

## Consolidated issue list (by severity)

| Severity | Category | URL / Scope | Issue | Fix |
|---|---|---|---|---|
| [MEDIUM] | Security | Sitewide (all responses) | No `Content-Security-Policy` header | Add CSP, start in report-only, then enforce |
| [LOW] | Security | Sitewide | HSTS has no `preload` directive | Add `; preload` + submit to preload list (optional) |
| [LOW] | Sitemap | `sitemap.xml` (102 of 106 URLs) | `<lastmod>` missing on non-blog URLs | Emit real `lastmod` per URL from file mtime |
| [INFO] | Indexability | 404 responses | 404 page is the default unbranded LiteSpeed error page | Optional: add a branded custom 404 with nav/search (doesn't affect SEO since status is correctly 404) |

No [CRITICAL] or [HIGH] issues found.
