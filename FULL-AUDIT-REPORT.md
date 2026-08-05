# Neweb.ai — Full Website SEO Audit

**Date:** June 17, 2026
**Site:** https://neweb.ai
**Business type:** B2B SaaS — online presence manager / website builder for Indian small businesses
**Pages audited:** 106 (all live, all HTTP 200)
**Method:** 6 parallel specialist audits against the live site, free sources only (no DataForSEO / Moz / GSC / GA4 credentials available). Lab CWV only (no CrUX field data).

---

## Executive Summary

**Overall SEO Health Score: 86 / 100** (June 10 baseline was 64).

The site has been transformed from the June baseline. Every June-10 CRITICAL is
resolved and verified live: the blog is now server-rendered, the mobile nav works,
all redirects resolve in one hop, og:image is a real 1200x630 PNG, and 54 formerly
orphaned pages are now in the sitemap and internally linked.

What remains is mostly **content polish and off-page authority**, not technical debt.

### Top 5 issues
1. [CRITICAL] Unattributed statistics across guides + city pages (E-E-A-T/citability).
2. [HIGH] City/solution FAQ answers too short (35-80 words) for AI citation.
3. [HIGH] Five high-value pages read at college level (Flesch 38-42).
4. [HIGH] No listicle/roundup page for the listicle-dominated commercial queries.
5. [HIGH, off-page] No Wikidata entity → AI engines confuse Neweb with Neweb Technologies (Taiwan).

### Top 5 quick wins
1. Add FAQPage schema to compare/wix + compare/squarespace (30 min).
2. Add `founder` to homepage Organization schema (10 min).
3. Fix Enterprise Offer `price:0` modeling (30 min).
4. Surface Cities + HTML sitemap in homepage footer (30 min).
5. Add Content-Security-Policy header via .htaccess (1-2 hrs).

---

## Category Scores

| Category | Weight | Score | Contribution |
|---|---|---|---|
| Technical SEO | 22% | 92 | 20.2 |
| Content Quality | 23% | 78 | 17.9 |
| On-Page SEO | 20% | 88 | 17.6 |
| Schema / Structured Data | 10% | 88 | 8.8 |
| Performance (CWV) | 10% | 90 | 9.0 |
| AI Search Readiness | 10% | 82 | 8.2 |
| Images | 5% | 90 | 4.5 |
| **Overall** | | **86.3** | |

---

## 1. Technical SEO — 92/100

**Passes:** All 106 sitemap URLs return 200, single-hop redirects only
(www→apex, http→https, trailing-slash, /index.html, legacy /about-us all 301 in
one hop). Every page server-rendered with a self-referencing canonical and
`index,follow`. robots.txt valid, sitemap declared, private paths blocked, 11 AI
bots explicitly allowed. JS-rendering concern resolved: blog index ships post
links in HTML, tool pages render full content + JSON-LD, city pages localized
server-side. Viewport meta correct, no horizontal overflow.

**Issues:**
- [MEDIUM] No Content-Security-Policy header anywhere (all other security headers
  present: HSTS, XCTO, XFO, Referrer-Policy, Permissions-Policy).
- [LOW] `lastmod` on only 4/106 URLs (intentional — only blog posts have real
  dates).
- [LOW] Default LiteSpeed 404 page (no branded 404).

Evidence in `audit-technical.md`.

## 2. Content Quality — 78/100

**Passes:** No doorway-page risk (city/solution/compare pages share only 3-15%
of content, far under the 65% threshold — the June concern is resolved). No thin
content (smallest content-type page is 1,146 words). Clean title/H1 keyword
targeting. Guides/tools/homepage FAQ answers land in the ideal 130-167-word
AI-citation range.

**Issues:**
- [CRITICAL] Unattributed statistics ("near me searches grew 200%", "Nearly 40%
  of local searches…") with no source markers.
- [HIGH] City FAQ answers 35-46 words, solution FAQs 71-80 words — too short to be
  AI-cited.
- [HIGH] 5 pages at college reading level (Flesch 38-42 vs 50+ target):
  upi-payments 39.7, local-seo-india 40.4, + 3 more.
- [MEDIUM] No visible "last updated" dates on city/solution/compare pages.
- [MEDIUM] Visible byline is generic "By Neweb team" though schema names a Person
  author; no author-bio page.

Evidence in `audit-content.md`.

## 3. On-Page SEO — 88/100 (incl. internal linking 96)

**Passes:** Internal-linking health 9.5/10 — every URL reachable within 3 clicks
of home, strong hub-and-spoke cross-linking, a /pages/sitemap HTML hub with 102+
links, zero orphans, no "click here" anchors. Every page type targets a clear
primary keyword in title + H1 + body.

**Issues:**
- [LOW] Cities cluster + HTML sitemap only in inner-page footer (depth 2, not
  depth 1 from home).

Evidence in `audit-sitemap.md` + `audit-sxo-perf.md`.

## 4. Schema / Structured Data — 88/100

**Passes:** Zero broken page-level JSON-LD across 30 sampled pages. Coverage
matches expectations on every type: Organization+WebSite+FAQPage+SoftwareApplication
(home), Product/AggregateOffer (pricing), Article+HowTo+FAQPage (how-to guides),
WebApplication+FAQPage (tools), Service+FAQPage (cities/solutions), ItemList+FAQPage
(compare), BlogPosting (blog), BreadcrumbList everywhere. Organization is strong
(legalName, foundingDate, areaServed, sameAs, dual address, contactPoints) WITH
the Taiwan disambiguation note in place.

**Issues:**
- [MEDIUM] compare/wix + compare/squarespace missing FAQPage.
- [MEDIUM] Enterprise Offer uses `price:0` instead of contact-sales modeling.
- [MEDIUM] Homepage Organization missing `founder` (present on About).
- [LOW] 4 guide Articles missing `image`; index/hub pages could add ItemList.
- Note: do NOT add Review/AggregateRating until real reviews exist.

Evidence in `audit-schema.md`.

## 5. Performance (CWV, lab) — 90/100

**Passes:** LiteSpeed + HTTP/3 + Brotli (home 118KB → 28KB transfer). Single
deferred external JS (nav.js). Fonts use preconnect + preload + display=swap.
Hero LCP is text over a CSS gradient (no large raster). All images have
width/height. The June pricing-CLS concern is RESOLVED — shared.css reserves
min-heights on .price-head (46px), .currency-toggle (40px), .plan-price (46px),
.plan (360px).

**Issues:**
- [MEDIUM] ~54KB inline critical CSS on the homepage (minor LCP gain available by
  splitting).
- Note: lab-only; no CrUX field data available without a Google API key.

Evidence in `audit-sxo-perf.md`.

## 6. AI Search Readiness (GEO) — 82/100

**Passes:** All 10 major AI crawlers explicitly allowed. llms.txt + llms-full.txt
exist (200), valid format, 101 URLs, with the brand disambiguation. Newer pages
have ideal FAQ passages + schema and are highly extractable.

**Per-platform readiness:**
| Platform | Score | Primary bottleneck |
|---|---|---|
| Google AI Overviews | 78 | No Knowledge Graph / Wikidata entity |
| ChatGPT (web) | 85 | No third-party corroboration |
| Perplexity | 84 | Thin citation graph |
| Bing Copilot | 80 | Entity collision + verify index |

**Issues:**
- [HIGH, off-page] No Wikidata item for the Indian SaaS; the only "Neweb" item
  (Q48752309) is the Taiwanese firm. Create one with `different from → Q48752309`.
- [MEDIUM] Legacy core pages (About, Pricing, Features, Why-Neweb) lack FAQ schema
  + self-contained passages; pricing not in citable prose/table.
- [MEDIUM] Brand disambiguation in body text only on homepage, not About/Pricing.

Evidence in `audit-geo.md`.

## 7. Search Experience (SXO) — 88/100

**Passes:** Every target query's page TYPE matches SERP intent. Tool pages render
real worked example output in static HTML (Googlebot sees output, not an empty
form). Restaurant how-to is exemplary (HowTo+Article+FAQ, 2010 words, 18 steps).
Brand query fully covered (WebSite SearchAction sitelinks + Organization sameAs).

**Persona scores:** trust-seeking shop owner 86, comparison shopper 67 (weakest),
tier-2 founder 90.

**Issues:**
- [HIGH] Commercial-investigation queries ("ai website builder india", "website
  builder for small business india") are listicle-dominated; Neweb ships only a
  brand home page, no roundup to compete. This is the comparison-shopper gap.

Evidence in `audit-sxo-perf.md`.

---

## Images — 90/100
All images carry width/height (CLS-safe), og:image is a real 1200x630 PNG sitewide,
hero avoids large rasters. Minor: a few decorative/mockup images lack alt text;
guide Article schema lacks `image`.

---

## Methodology & limitations

- 6 specialist audits run in parallel against the LIVE site via curl + python3 on
  June 17, 2026: technical, content/E-E-A-T, schema, sitemap/internal-linking,
  GEO/AI, and combined SXO + performance.
- Free sources only. No DataForSEO/Moz (no backlink DA/PA or live SERP positions),
  no GSC (indexation inferred, not measured), no GA4 (no traffic data), no CrUX
  (CWV is lab-only). Backlink authority and real ranking positions are therefore
  NOT measured in this audit.
- Per-category detail and evidence: audit-technical.md, audit-content.md,
  audit-schema.md, audit-sitemap.md, audit-geo.md, audit-sxo-perf.md.
- Prioritized fixes: ACTION-PLAN.md.
