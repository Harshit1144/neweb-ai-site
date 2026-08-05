# Neweb.ai — SEO Action Plan (June 17, 2026)

**Overall SEO Health Score: 86 / 100** (up from 64 on the June 10 baseline)

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 92 |
| Content Quality | 23% | 78 |
| On-Page SEO | 20% | 88 |
| Schema / Structured Data | 10% | 88 |
| Performance (CWV) | 10% | 90 |
| AI Search Readiness | 10% | 82 |
| Images | 5% | 90 |

Business type: B2B SaaS (online presence manager / website builder for Indian SMBs).
Scope: 106 URLs audited live, all returning 200. No CRITICAL technical blockers.

The score is now held back almost entirely by **Content Quality (78)** and the
**off-page entity gap (Wikidata)**, not by technical debt. The technical
foundation is excellent.

---

## CRITICAL (fix immediately)

**C1. Unattributed statistics across guides and city pages.**
Claims like "near me searches grew 200%", "Nearly 40% of local searches are for
local businesses" appear with zero source markers. This is an E-E-A-T and
trust/citability risk, and the single thing dragging Content Quality down.
Fix: add an inline source + year to every statistic (e.g. "(Google, 2024)"), or
soften unverifiable ones to non-numeric claims. Affected: most how-to guides,
several city pages. Effort: 2-3 hrs.

(No other CRITICAL items. The June 10 criticals — CSR blog, no mobile nav,
redirect rot, og:image SVG — are all resolved and verified.)

---

## HIGH (fix within 1 week)

**H1. City + solution FAQ answers too short for AI citation.**
City FAQs run 35-46 words, solution FAQs 71-80 words. The AI-citation optimum is
130-167 self-contained words. Expand each to that range (direct answer first,
then India-specific specifics, then a tip). Keep visible FAQ and FAQPage schema
in sync. Effort: 1 day (good agent task).

**H2. Five high-value pages read at college level.**
Flesch reading ease 38-42 (target 50+ for an SMB audience):
upi-payments (39.7), local-seo-india (40.4), and 3 others flagged in
audit-content.md. Shorten sentences, split dense paragraphs, swap jargon for
plain words. Effort: half day.

**H3. Build a "best AI website builders in India" listicle/roundup page.**
The two biggest commercial queries ("ai website builder india", "website builder
for small business india") return listicle-dominated SERPs. Neweb has only a
brand product home page, so it cannot rank there. A genuinely useful, honest
roundup page (that includes Neweb among real competitors) is the page type that
wins those head terms. This is the comparison-shopper persona's weak spot (67/100).
Effort: 1-2 days.

**H4. Create the Wikidata entity (off-page, you action).**
The only "Neweb" Wikidata item (Q48752309) is the Taiwanese hardware firm with an
empty label, so AI engines resolve the brand to the wrong entity. Create a
Wikidata item for the Indian SaaS with `different from (P1889) -> Q48752309`.
This is the single biggest GEO lever. Full steps in ENTITY-SETUP.md. Effort: 1 hr.

---

## MEDIUM (fix within 1 month)

**M1. Add Content-Security-Policy header.**
The only missing security header (HSTS, X-Content-Type-Options, X-Frame-Options,
Referrer-Policy, Permissions-Policy are all present). Add a CSP, ideally
Report-Only first to catch breakage, via .htaccess. Effort: 1-2 hrs.

**M2. FAQPage schema missing on 2 compare pages.**
`compare/wix` and `compare/squarespace` lack FAQPage (the other 8 have it).
Add it to match. Effort: 30 min.

**M3. Add citable passages + FAQ schema to 4 legacy core pages.**
About, Pricing, Features, Why-Neweb lack self-contained 130-167-word passages and
FAQ schema. They are the pages AI engines hit for core brand facts. Also repeat
the "Neweb is the Indian SaaS, not Neweb Technologies" disambiguation in
crawlable body text on About + Pricing (currently only on homepage). Effort: half day.

**M4. Pricing not in citable prose/table.**
Pricing tiers live in styled cards but not as an extractable table or prose
sentence ("Neweb costs Rs 249/month for Starter, Rs 1299 for Growth"). Add a
plain-text pricing statement + a semantic pricing table for AI extraction.
Effort: 1 hr.

**M5. Named author byline + author bio page.**
Guides carry a Person author in schema (Harshit Rajput) but the visible byline
reads generic "By Neweb team". Add a visible byline matching the schema and a
short /pages/about-style author bio (or anchor on About) so E-E-A-T is verifiable
on-page, not just in JSON-LD. Effort: 2-3 hrs.

**M6. Enterprise Offer schema uses price:0.**
Homepage + pricing model the Enterprise tier as `price:0`, which misrepresents a
contact-sales plan. Use a proper "contact for pricing" modeling (omit price or
use priceSpecification with a note). Effort: 30 min.

**M7. Homepage Organization missing `founder`.**
It's on About but not the homepage Organization block. Add it for consistency.
Effort: 10 min.

**M8. Surface Cities + HTML sitemap in the homepage footer.**
The cities cluster and /pages/sitemap hub are only in the inner-page footer, so
they sit at crawl depth 2 from home instead of depth 1. Add them to the homepage
footer. Effort: 30 min.

---

## LOW (backlog)

- **L1.** `lastmod` on only 4/106 sitemap URLs — intentional (only blog posts have
  real dates). Leave as-is or add real dates if a CMS ever tracks them.
- **L2.** Custom 404 page (currently the default LiteSpeed page).
- **L3.** Add `image` to the 4 guide Article schemas.
- **L4.** Add ItemList/CollectionPage to the guides / compare / solutions INDEX
  (hub) pages.
- **L5.** "Last updated" visible dates on city/solution/compare pages.
- **L6.** Image alt-text spot gaps (most present; a few decorative/mockup images).
- **L7.** Split the ~54KB inline critical CSS on the homepage (minor LCP gain).

---

## Off-page (cannot be done from code — highest remaining ranking lever)

These are why AI/brand authority still lags despite a near-perfect technical site:

1. **Wikidata item** (see H4 + ENTITY-SETUP.md) — fixes AI brand confusion.
2. **Crunchbase + complete LinkedIn company page + Google Business Profile** —
   feed Google's Knowledge Graph; give Wikidata its references.
3. **G2 / Capterra profiles + real reviews** — own the head-term comparison SERPs.
   (Do NOT add Review/AggregateRating schema until real reviews exist — manual
   action risk.)
4. **Listicle inclusion + 2-4 independent press mentions** (YourStory, Inc42) —
   unlocks the commercial-query SERPs and a future Wikipedia article.

---

## Recommended execution order

Week 1: C1 (attribute stats) + H1 (expand FAQs) + H2 (readability) + M2/M6/M7
(quick schema fixes) + M8 (footer) + H4 (Wikidata, you).
Week 2: H3 (listicle page) + M3/M4 (legacy-page citability + pricing prose) + M5
(author bylines) + M1 (CSP).
Ongoing: off-page authority (Crunchbase, GBP, reviews, press).

Estimated lift if Week 1 + Week 2 shipped: Content 78 -> ~88, AI 82 -> ~90,
overall **86 -> ~91**.
