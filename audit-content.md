# Content Quality & AI-Citation Audit — neweb.ai

**Date:** 2026-06-17
**Site:** https://neweb.ai — B2B SaaS (online presence manager / website builder for Indian SMBs)
**Publisher:** Commerciax Infotech Private Limited (brand "Neweb" / neweb.ai)
**Method:** Live curl fetch of 31 pages across all 7 page types; HTML stripped to `<main>` body text; word counts + approximate Flesch Reading Ease computed in python3 (vowel-group syllable counting); 5-gram shingle Jaccard for duplicate analysis; JSON-LD parsed for E-E-A-T / FAQ signals.

---

## Overall Score: 78 / 100

Content is genuinely strong: pages are well over thin-content thresholds, city/solution/compare pages are **not** doorway pages (5–15% overlap), keyword targeting is clean, and schema coverage is excellent. The score is held back by (1) **unattributed statistics** across guides and blog — the historically flagged issue persists; (2) **sub-citation-length FAQ answers** on city and solution pages; (3) **college-level readability** on the highest-value guides; and (4) **no visible freshness dates** on city/solution/compare pages.

### Pages sampled (31)
Home; guides (5): restaurant-website, local-seo-india, website-cost-india, upi-payments, picking-a-domain; cities (4): mumbai, delhi, jaipur, surat; solutions (5): restaurants, clinics, jewellers, gyms, photographers; compare (4): wix, godaddy, shopify, jimdo; blog (3): local-seo-checklist, pick-domain-name, gbp-guide; tools (5): business-name-generator, gst-invoice, local-seo-audit, word-counter, qr-code-generator, favicon-generator; corporate (3): pricing, about, features.

---

## What Passes (keep doing this)

- **No doorway-page risk.** City pages share only **5–15%** of 5-gram content (avg Jaccard 6%); solution pages **2–13%** (avg 5%); compare pages **3–8%** (avg 3%). All far below the 65% doorway threshold. These are genuinely unique pages, not spun templates.
- **No thin content in audited content types.** Smallest real content page sampled in guides/cities/solutions/compare/blog/tools is `/pages/compare/jimdo` at **1,160 words**; `/pages/cities/delhi` at 1,146; everything else 1,100–2,500 words. Nothing under 800 in those types.
- **Clear primary keyword in title + H1 + body for every page type.** Cities → "Website Builder in {City}"; compare → "Neweb vs {Competitor}"; guides → "How to … in India (2026)"; tools → "{Tool} Generator". Title/H1 alignment is consistent and intent-matched.
- **Publisher / Organization is unambiguous.** `Organization` schema present site-wide; `AboutPage` + `Organization` + `Person` + `PostalAddress` on /pages/about. Author identity (`Person`: Harshit Rajput, Founder) wired into blog and guide schema with `sameAs` LinkedIn.
- **Excellent schema depth for AI extraction.** Guides carry `Article` + `HowTo` + `HowToStep` + `FAQPage` + `Person` + `Organization`; home carries `SoftwareApplication` + `FAQPage` + `WebSite`+`SearchAction`; tools carry `WebApplication` + `FAQPage`. `BreadcrumbList` near-universal.
- **FAQ answers on guides/tools/home hit the AI-citation sweet spot.** website-cost-india: 5/5 answers in 130–167 words; gst-invoice: 7/8 ideal; how-to-do-local-seo: 4/4 ideal (145–161); home: 6/7 ideal. These are textbook extractable passages.
- **Some freshness signals exist.** Guides show visible "Updated June 2026" + read time + "By Neweb team"; blog posts carry `datePublished`/`dateModified` and visible author "Harshit Rajput".

---

## Issues

### [CRITICAL] Unattributed statistics persist across guides and blog (E-E-A-T)
The historically flagged issue is **not fixed**. Numeric claims appear with **zero** "according to / source / study by" attribution markers anywhere in sampled content.
- `/pages/guides/how-to-do-local-seo-india`: *"'near me' searches have grown 200% in three years"* and *"The Local Pack … captures 3X…"* — 2 stats, 0 sources.
- `/pages/blog/local-seo-checklist-india`: *"Nearly 40% of local searches in India happen on mobile data that isn't 4G"*, *"Response rate: 20–30%"*, *"Real SEO is 90% specific…"* — 4 stats, 0 sources.
Unsourced statistics undercut E-E-A-T (Trust) and are a known AI-citation liability — LLMs and AI Overviews preferentially cite passages with named sources. **Fix:** add inline source attribution (with link) to every quantitative claim.

### [HIGH] City + solution FAQ answers are too short for AI citation
FAQ answers on these page types fall below the 130–167 word self-contained range that AI engines extract.
- `/pages/cities/mumbai`: 3 FAQ answers at **35 / 41 / 46 words** — none in ideal range; two barely clear 40.
- `/pages/solutions/restaurants`: 4 answers at **71–80 words** — all below 130.
Contrast with guides (140–166) and tools (158–170) which are ideal. **Fix:** expand city/solution FAQ answers to 130–167 self-contained words so they become extractable for AI Overviews / Perplexity.

### [HIGH] Top guides read at college level (Flesch < 35 target breached / borderline)
Target for an SMB audience is Flesch 50+. Several high-traffic guides read hard:
- `/pages/cities/surat` — **Flesch 38.9** (1,150 words)
- `/pages/cities/jaipur` — **Flesch 39.4** (1,167 words)
- `/pages/guides/how-to-accept-upi-payments-website` — **Flesch 39.7** (2,228 words)
- `/pages/guides/how-to-do-local-seo-india` — **Flesch 40.4** (2,225 words)
- `/pages/compare/shopify` — **Flesch 41.6** (1,103 words)
None breach the hard <35 floor, but five pages sit in the 38–42 "difficult / college" band — measurably harder than the 50+ SMB target. **Fix:** shorten sentences, cut multi-clause constructions, prefer simpler words on these pages.

### [MEDIUM] No visible "last updated" date on city, solution, or compare pages
Guides and blog show freshness; city/solution/compare pages show **none** (verified: mumbai, restaurants, wix all return no visible "updated/last reviewed" text). Freshness signals aid both SEO and AI trust for evergreen-but-changeable pages (pricing, competitor features). **Fix:** add a visible "Last updated {Month Year}" stamp to these page types.

### [MEDIUM] Inconsistent FAQPage schema on compare pages
`/pages/compare/godaddy` and `/pages/compare/shopify` carry `FAQPage` JSON-LD; `/pages/compare/wix` and `/pages/compare/jimdo` do **not** (0 occurrences). Inconsistent schema means some comparison pages are eligible for FAQ rich results / AI extraction and others are not. **Fix:** standardise FAQPage across all 10 compare pages.

### [LOW] Author byline is schema-only on guides; visible byline is generic "By Neweb team"
Blog posts surface a real human byline ("Harshit Rajput") in visible text; guides put the named `Person` only in JSON-LD and show the visible byline as "By Neweb team". Named, credentialed human bylines on-page (not just in schema) strengthen E-E-A-T. **Fix:** surface "By Harshit Rajput, Founder" (or relevant author) visibly on guides, ideally linked to an author bio page.

### [LOW] No dedicated author bio page / author credentials beyond job title
Author is identified as "Harshit Rajput, Founder" with a LinkedIn `sameAs`, but there is no author-bio page establishing topical expertise/experience (the first "E" in E-E-A-T). **Fix:** add an author page with credentials and link `Person.url`/visible bylines to it.

---

## Evidence Table (sampled, sorted by word count)

| URL | Words | Flesch | Author(schema) | FAQPage | Article | Visible "updated" |
|---|---|---|---|---|---|---|
| /pages/pricing | 264 | 57.2 | – | – | – | – |
| /pages/features | 293 | 55.5 | – | – | – | – |
| /pages/about | 583 | 61.9 | Person | – | – | – |
| /pages/compare/shopify | 1103 | 41.6 | – | yes | – | – |
| /pages/cities/delhi | 1146 | 51.0 | Org | yes | – | no |
| /pages/cities/surat | 1150 | 38.9 | Org | yes | – | no |
| /pages/compare/jimdo | 1160 | – | – | no | – | no |
| /pages/cities/jaipur | 1167 | 39.4 | Org | yes | – | no |
| /pages/cities/mumbai | 1173 | 46.1 | Org | yes | – | no |
| /pages/tools/word-counter | 1262 | – | – | – | – | no |
| /pages/compare/godaddy | 1254 | 45.7 | – | yes | – | – |
| /pages/compare/wix | 1345 | 54.8 | – | no | – | – |
| /pages/guides/picking-a-domain | 1356 | 65.1 | Person | – | – | – |
| /pages/tools/local-seo-audit | 1496 | 53.2 | Org | yes | – | – |
| /pages/solutions/restaurants | 1655 | 59.1 | Org | yes | – | no |
| /pages/guides/how-to-make-restaurant-website | 1760 | 56.9 | Person | yes | yes | – |
| /pages/blog/how-to-pick-a-domain-name | 1800 | 61.9 | Person | – | yes | (byline) |
| /pages/solutions/clinics | 1817 | 49.8 | Org | yes | – | no |
| /pages/solutions/jewellers | 1821 | 53.4 | Org | yes | – | no |
| /pages/blog/google-business-profile-guide-india | 1902 | 65.3 | Person | – | yes | (byline) |
| / (home) | 2117 | 61.0 | Org | yes | – | – |
| /pages/tools/favicon-generator | 2094 | – | – | – | – | yes |
| /pages/blog/local-seo-checklist-india | 2133 | 59.3 | Person | – | yes | (byline) |
| /pages/solutions/gyms | 2147 | 59.1 | Org | yes | – | no |
| /pages/solutions/photographers | 2169 | – | – | – | – | no |
| /pages/guides/website-cost-india | 2165 | 58.0 | Person | yes | yes | yes |
| /pages/guides/how-to-do-local-seo-india | 2225 | 40.4 | Person | yes | yes | yes |
| /pages/guides/how-to-accept-upi-payments-website | 2228 | 39.7 | Person | yes | yes | yes |
| /pages/tools/qr-code-generator | 2412 | – | – | – | – | no |
| /pages/tools/business-name-generator | 2371 | 68.3 | Org | yes | – | – |
| /pages/tools/gst-invoice-generator | 2524 | 63.3 | Org | yes | – | – |

### Duplicate-content (5-gram shingle Jaccard)
| Group | Avg similarity | Range | Doorway risk (>65%)? |
|---|---|---|---|
| City pages | 6% | 5–15% | No |
| Solution pages | 5% | 2–13% | No |
| Compare pages | 3% | 3–8% | No |

### FAQ answer length vs AI-citation range (130–167 words ideal)
| Page | #FAQ | Answer words (min/med/max) | In ideal range |
|---|---|---|---|
| guides/website-cost-india | 5 | 140/150/166 | 5/5 |
| guides/how-to-do-local-seo-india | 4 | 145/150/161 | 4/4 |
| tools/gst-invoice-generator | 8 | 158/162/170 | 7/8 |
| home | 7 | 125/140/147 | 6/7 |
| solutions/restaurants | 4 | 71/79/80 | 0/4 |
| cities/mumbai | 3 | 35/41/46 | 0/3 |

---

## Priority Fix Order
1. **[CRITICAL]** Attribute every statistic in guides + blog (inline source + link).
2. **[HIGH]** Expand city + solution FAQ answers to 130–167 self-contained words.
3. **[HIGH]** Simplify the five Flesch 38–42 pages to reach 50+.
4. **[MEDIUM]** Add FAQPage schema to wix/jimdo (and audit remaining 6 compare pages); add visible "last updated" to city/solution/compare.
5. **[LOW]** Surface visible human bylines on guides + add an author-bio page with credentials.
