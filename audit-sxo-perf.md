# Neweb.ai — Combined SXO + Performance Audit

**Date:** 2026-06-17
**Scope:** Read-only audit of https://neweb.ai (B2B SaaS website builder for Indian SMBs)
**Method:** `curl` (HTTP/2, with and without Brotli) + `python3` HTML parsing. Lab-only (no field/CrUX data).
**Pages sampled:** home, /pages/pricing, /pages/tools/business-name-generator, /pages/tools/upi-qr-code-generator, /pages/guides/how-to-make-restaurant-website, /pages/shared.css

---

## SECTION 1 — SXO / Search-Experience Score: **88 / 100**

Neweb has done the hard part of SXO right: for every target query the *page type it ships matches the page type Google rewards*, and — critically — the SEO-load-bearing content (worked examples, sample tool output) is **server-rendered in static HTML**, not hidden behind a JS form. Googlebot sees real output on first paint.

### Per-query page-type-fit table

| Query | Intent | SERP rewards | Neweb page | Type match? | ATF aligned? | Tool output visible to Googlebot? | Fit |
|---|---|---|---|---|---|---|---|
| ai website builder india | Commercial investigation | Product page / listicle | Home (SoftwareApplication + WebSite schema) | Partial — has product page, not a listicle | H1 "Your entire online presence, on autopilot" is brand-led, not query-led | n/a | **74** |
| business name generator | Tool | Interactive tool + examples | /pages/tools/business-name-generator (WebApplication + FAQPage) | Yes | "Type your industry + keywords. Get 12 short names…" | **Yes** — worked example renders real names in static HTML (Aaji's Achaar, Roop Pickle Co, Bhakar Pickle House…) inside `.example-card` | **94** |
| how to make a restaurant website india | How-to | Step-by-step guide | /pages/guides/how-to-make-restaurant-website (HowTo + HowToStep + Article + FAQPage) | Yes — textbook | H1 query-exact; 2010 words, 18 h3 steps | n/a | **96** |
| website builder for small business india | Commercial | Listicle-dominated | Home / solutions | Partial — listicle-led SERP, Neweb has only a brand product page + a "Compare" hub | Brand-led, not "best builders" framing | n/a | **70** |
| free upi qr code generator | Tool | Interactive generator | /pages/tools/upi-qr-code-generator (WebApplication + FAQPage) | Yes | "Type your UPI ID + payee name. We render a UPI-spec QR…" | **Yes** — full "Indu Beauty Studio, Indore" walkthrough + 4 `upi://` strings + 18 inline SVGs in static HTML; live QR is JS-rendered but the example is not | **93** |
| neweb | Brand | Brand homepage + sitelinks | Home (WebSite + SearchAction sitelinks searchbox, Organization sameAs) | Yes | Brand name + tagline + sitelinks searchbox schema present | n/a | **96** |

**Average page-type fit: ~87**

### Key SXO findings
- **Tool pages pass the "empty form" test.** Both tool pages embed a *worked example with real output* (names / a UPI payment walkthrough) as server-rendered prose inside `.example-card`. The interactive result region is JS-hydrated, but Google does not need JS to see representative output. This is the single biggest SXO win on the site.
- **How-to guide is exemplary:** HowTo + HowToStep + Article + FAQPage + BreadcrumbList, query-exact H1, 2010 words, 18 sub-steps. Eligible for how-to / FAQ rich results.
- **Two commercial-investigation queries are the weak spots.** "ai website builder india" and "website builder for small business india" are listicle-dominated SERPs, but Neweb only offers a brand product home page (H1 is brand-led "online presence on autopilot", not query-framed). There is a `/pages/compare` hub, but no ranked "best AI website builders in India" listicle/roundup to compete for the comparison real estate. This is where ranking will lag despite clean tech.
- **Schema coverage is broad and correct** across all page types (SoftwareApplication, WebApplication, Product/AggregateOffer, HowTo, FAQPage, BreadcrumbList, Organization, WebSite/SearchAction).
- `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Bingbot, Google-Extended; points to `llms.txt` + `llms-full.txt`. Strong GEO/AI-search posture.

### Persona scores (1–100)
- **(a) Trust-seeking shop owner — 86.** Concrete India-context worked examples (Indore salon, Pune pickle brand), DPDP mentions, Organization schema with PostalAddress/ContactPoint, customer-stories nav. Could surface ratings/social proof higher ATF.
- **(b) Comparison shopper — 67.** A "Compare" hub exists, but there is no head-to-head listicle/roundup and the home H1 doesn't engage comparison intent. This persona lands on a brand pitch, not a neutral comparison, and bounces toward listicle results.
- **(c) Tier-2 founder in a regional context — 90.** Best-served persona: Hindi/Marathi name flavours, UPI/QR for cash-rush businesses, tier-2 city examples (Indore, Pune), industry verticals (jewellers, clinics, tutoring). Strongly localized.

---

## SECTION 2 — Performance / Core Web Vitals Score: **90 / 100**

Host: **LiteSpeed**, HTTP/2 advertised + **HTTP/3 (h3) via alt-svc**, **Brotli** active, static assets cached 1yr immutable. Measured response times 0.08–0.21s.

### Transfer sizes (measured)

| Page | HTML uncompressed | HTML over Brotli | Compression |
|---|---|---|---|
| Home | 118,389 B | **28,202 B** | 4.2× |
| Pricing | 29,770 B | **7,874 B** | 3.8× |
| Business name gen | 57,833 B | ~ | — |
| UPI QR gen | 60,331 B | **15,101 B** | 4.0× |
| Restaurant guide | 41,111 B | ~ | — |

### Render-blocking / resource profile (consistent across pages)
- **External JS:** 1 file — `/assets/nav.js?v=3` with `defer` (non-blocking). Guide page has 0 external JS. INP risk minimal.
- **Stylesheets:** 2–3 `<link rel=stylesheet>`. Home additionally inlines **53.8 KB of CSS in a single `<style>`** — render-blocking but in-document (no extra round trip). Largest contributor to home's raw HTML size.
- **Fonts:** Google Fonts with `preconnect` (×2, incl. crossorigin gstatic), `preload as=style`, and `display=swap` confirmed on the served CSS (4 `font-display: swap` rules). Good — minimal FOIT.
- **Images:** Only 2 `<img>` per page (logo), both with explicit `width`/`height`, `fetchpriority=high` on the primary logo, `loading=lazy`+`decoding=async` on the secondary. No large raster hero.
- **JSON-LD:** Home carries 4 blocks / ~9.2 KB inline (acceptable; not render-blocking).

### Core Web Vitals — qualitative risk

| Metric | Risk | Reasoning |
|---|---|---|
| **LCP** | **Low** | Hero is a **text H1 over CSS radial gradients** — no large image to download. Background-image refs are tiny inline `data:image/svg+xml` URIs. Fonts preloaded + swap. LCP should be fast on LiteSpeed/HTTP3. |
| **CLS** | **Low (resolved)** | Pricing-page currency-toggle reflow concern is **fixed** — see verification below. |
| **INP** | **Low** | One deferred external script (nav.js). Tool pages run JS on interaction only; no heavy main-thread libs in critical path. |

### CLS verification — pricing currency-toggle (historic ~0.16)
Min-heights are now **reserved** in `/pages/shared.css`:
```
.price-head{min-height:46px}        /* line 180 */
.currency-toggle{min-height:40px}   /* line 181 */
.plan-price{min-height:46px}        /* line 182 */
.plan{min-height:360px}             /* line 185 — reserves card height for 3-up grid */
.price{min-height:46px}             /* line 186 */
.currency-toggle button{min-height:38px}  /* line 200, mobile */
```
**Verdict: the CLS-0.16 regression is mitigated.** The price head, plan price, currency toggle, and plan card all reserve vertical space, so toggling INR/USD should not reflow the grid. Touch targets (44px) are also enforced — good for mobile.

### Specific offenders (minor)
1. **Home inline CSS = 53.8 KB** render-blocking in `<head>`. Brotli shrinks total to 28 KB, but a large chunk is one critical-CSS blob shared site-wide. Consider splitting truly-critical CSS from below-the-fold rules.
2. **HTML `cache-control: public, max-age=0, must-revalidate`** on documents — normal, but means a revalidation round-trip per navigation. (Static assets are correctly 1yr immutable.)
3. **Home raw HTML 118 KB** — heavy for a landing page, driven by inline CSS + full nav/footer + 4 JSON-LD blocks. Brotli mitigates over the wire; only matters for parse time on low-end devices.

---

## Issues by severity

**High (revenue/ranking impact)**
- No listicle/roundup page for commercial-investigation queries ("ai website builder india", "website builder for small business india"). Brand product page cannot win listicle-dominated SERPs. **Build a ranked "Best AI website builders for Indian small businesses" roundup** + strengthen the Compare hub. (SXO)

**Medium**
- Comparison-shopper persona underserved (67): home H1 is brand-led; add comparison-intent framing/entry above the fold.
- Home inline critical CSS (53.8 KB) is large; split critical vs deferred CSS to trim render-blocking bytes. (Perf)

**Low / nits**
- Consider surfacing social proof / ratings higher ATF for trust-seeking shop owners.
- HTML documents revalidate every navigation (max-age=0) — expected, monitor TTFB.

**Resolved (verified)**
- Pricing currency-toggle CLS — min-heights reserved on `.plan-price`, `.price-head`, `.currency-toggle`, `.plan`, `.price`.
- Tool pages render real example output for Googlebot (not an empty form).
- Fonts: preconnect + preload + display=swap all present.
