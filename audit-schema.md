# Schema / Structured-Data Audit — neweb.ai

**Audit date:** 2026-06-17
**Method:** Live HTML fetched via curl for a 30-page sample across all 7 page types. Every `<script type="application/ld+json">` block extracted and parsed with Python `json.loads()`. Required/recommended fields validated per schema.org + Google Rich Results rules. Read-only — no files edited.

---

## Score: 88 / 100

Structured data on neweb.ai is in **very good** shape. Coverage is broad and consistent, every real page-level JSON-LD block parses cleanly, the Organization entity is well-built with a correct Taiwan disambiguation note, and rich-result-eligible types (FAQ, HowTo, Breadcrumb, Product) are present where expected. Points deducted for: two compare pages missing FAQ schema, listing/index pages lacking ItemList/CollectionPage, the homepage Organization missing `founder`, Enterprise Offer modeling, missing Article `image`, and a SearchAction that targets blog-only search.

---

## 1. JSON parse validity

**All real page-level JSON-LD blocks across all 30 sampled pages parse as valid JSON. Zero broken page-level schema.**

Two blocks raised parse errors during extraction and are **confirmed false positives** (per the audit exclusion note):

| URL | Block | Why it's not an error |
|-----|-------|-----------------------|
| `/pages/tools/faq-schema-generator` | block 3 | JS template literal that *renders example JSON-LD as widget output* (`'\n' + json + '\n<\/script>'`). Not a real schema block. |
| `/pages/tools/localbusiness-schema-generator` | block 3 | Same — JS string `' + json + '` that builds the example output the tool shows users. |

These are the legitimately-excluded example widgets. No action needed.

---

## 2. Coverage matrix (page type × schema types present)

| Page type | Sample | BreadcrumbList | FAQPage | Primary type(s) | Notes |
|-----------|--------|:---:|:---:|---|---|
| Homepage | `/` | — (n/a) | ✓ (7Q) | Organization, WebSite, SoftwareApplication+AggregateOffer | No breadcrumb (correct for home) |
| About | `/pages/about` | ✓ | — | AboutPage, Organization (full, w/ founder) | |
| Pricing | `/pages/pricing` | ✓ | — | Product + AggregateOffer (3 Offers) | |
| Tools index | `/pages/tools` | ✓ | — | CollectionPage | Good — has CollectionPage |
| Tool (×6) | `/pages/tools/*` | ✓ | ✓ (4–9Q) | WebApplication + Offer + Organization | Consistent across all sampled |
| Guides index | `/pages/guides` | ✓ | — | *(none)* | Missing ItemList/CollectionPage |
| How-to guide (×3) | `/pages/guides/how-to-*` | ✓ | ✓ | HowTo, Article+Person+Org | Full stack as expected |
| Non-how-to guide | `/pages/guides/website-cost-india` | ✓ | ✓ | Article+Person+Org | No HowTo (correct — it's not a procedure) |
| Cities (×3) | `/pages/cities/*` | ✓ | ✓ | Service + Org + Offer | areaServed=City, provider=@id ref |
| Compare index | `/pages/compare` | ✓ | — | *(none)* | Missing ItemList/CollectionPage |
| Compare (×3) | `/pages/compare/*` | ✓ | ⚠ mixed | ItemList (8 items) + FAQPage | **wix & squarespace missing FAQ** |
| Solutions index | `/pages/solutions` | ✓ | — | *(none)* | Missing ItemList/CollectionPage |
| Solutions (×3) | `/pages/solutions/*` | ✓ | ✓ | Service + Org + Offer | Consistent |
| Blog post (×4) | `/pages/blog/*` | ✓ (in @graph) | — | BlogPosting + Person + Org | Single @graph block |

Expected-vs-actual: **matches the brief's expectations on every page type.** Homepage has Organization+WebSite+FAQPage+SoftwareApplication; pricing has Product/Offer; how-to guides have Article+HowTo+FAQPage; tools have WebApplication+FAQPage; solutions+cities have Service+FAQPage; compare have ItemList+FAQPage; blog has BlogPosting; BreadcrumbList is everywhere except the homepage (correct).

---

## 3. Required-field validation

### Issues by severity

#### 🔴 HIGH — none
No page is missing a hard-required field that would break rich-result eligibility for its primary type. FAQ Q&A all have `name` + `acceptedAnswer.text`; HowTo steps all have text; BreadcrumbList items all have `position`+`name`+`item`; Product has `name`+`offers`; Article/BlogPosting all have `headline`+`author`+`datePublished`.

#### 🟠 MEDIUM

1. **Compare/wix & compare/squarespace missing FAQPage** — the other 8 compare pages (`bigrock, godaddy, hostinger, jimdo, shopify, webflow, weebly, wordpress`) all carry a 3-question FAQPage; these two do not. Lost FAQ rich-result eligibility + template inconsistency.
   URLs: `https://neweb.ai/pages/compare/wix`, `https://neweb.ai/pages/compare/squarespace`

2. **Enterprise Offer has no direct `price`/`priceCurrency`** (homepage SoftwareApplication AND `/pages/pricing` Product). The Starter/Basic and Growth Offers are clean, but the Enterprise tier uses a nested `priceSpecification` with `"price":"0"`. Google prefers `price`+`priceCurrency` directly on each Offer, and `price:0` is semantically wrong for a contact-sales tier. Use `priceSpecification` without a 0, or omit the Offer / mark availability appropriately.
   URLs: `https://neweb.ai/`, `https://neweb.ai/pages/pricing`

3. **Homepage Organization missing `founder`** — the About-page Organization includes a rich `founder` (Harshit Rajput w/ `knowsAbout`, `worksFor`), but the homepage Organization omits it. Since the homepage Org is the canonical `@id`-referenced entity, the founder signal should live there too (or be merged via @graph).
   URL: `https://neweb.ai/`

#### 🟡 LOW

4. **Guide Articles missing `image`** — all 4 sampled guide Articles (`how-to-make-restaurant-website`, `how-to-do-local-seo-india`, `how-to-accept-upi-payments-website`, `website-cost-india`) have no `image` property. `image` is recommended for Article rich results. (Blog posts DO have `image: og-default.png`, so the fix pattern already exists.)

5. **Plan-name inconsistency between homepage and pricing** — homepage SoftwareApplication labels the first tier **"Basic"** while `/pages/pricing` Product labels it **"Starter"** (same ₹249 price). Cosmetic but reduces entity consistency.

6. **Guide Article datePublished uses date-only (`2026-06-16`)** while blog uses full ISO timestamps. Both valid; just inconsistent.

---

## 4. Organization schema review

| Field | Homepage Org | About Org | Verdict |
|-------|:---:|:---:|---|
| name | ✓ "Neweb" | ✓ | Good |
| alternateName | ✓ "neweb.ai" | ✓ | Good |
| legalName | ✓ "Commerciax Infotech Private Limited" | ✓ | Good |
| foundingDate | ✓ "2024" | ✓ | Good |
| founder | **✗ MISSING** | ✓ (full Person) | **Fix homepage** |
| areaServed | ✓ Country: India | ✓ | Good |
| sameAs | ✓ LinkedIn + Instagram | ✓ | OK (could add X/YouTube/Crunchbase) |
| address | ✓ (IN Ahmedabad + US Sheridan) | ✓ | Good |
| contactPoint | ✓ support + sales | — | Good |
| logo / image | ✓ ImageObject w/ dimensions | ✓ | Good |
| **Taiwan disambiguation** | ✓ **present** | ✓ | **Correct** |

**Disambiguation note (verbatim from homepage description):**
> "A product of Commerciax Infotech Private Limited. **Not affiliated with Neweb Technologies, the Taiwanese hardware company.**"

This is exactly the kind of "different from" signal the brief asked for. Strong. Only gap: the homepage Org omits `founder` (present on About).

---

## 5. Missing schema opportunities

| Opportunity | Status | Recommendation |
|---|---|---|
| **ItemList / CollectionPage on listing indexes** | Missing on `/pages/guides`, `/pages/compare`, `/pages/solutions` (tools index already has CollectionPage) | Add `ItemList` of the child pages → improves crawl understanding + potential carousel eligibility. Quick win, mirror the tools-index pattern. |
| **FAQPage on the 2 gap compare pages** | Missing | Add to wix + squarespace to match the other 8. |
| **VideoObject** | None found | Only add if real product-demo/tutorial videos exist. If demo videos exist on homepage/guides, mark them up (video rich results + Search clip). |
| **Review / AggregateRating** | None found | **Do NOT add unless genuine, verifiable reviews exist.** No customer-stories review data was surfaced in sampled schema. Fabricated ratings = manual-action risk. Leave absent until real testimonials with ratings are collected. |
| **SearchAction (Sitelinks Searchbox)** | Present BUT scoped to blog | Current `potentialAction` targets `/pages/blog?q={search_term_string}`. If a site-wide search exists, point it there; otherwise the blog-only scope is fine but limits sitelinks-searchbox value. |
| **SoftwareApplication aggregateRating** | Not present | Same caution as Review — only with real ratings. |
| **Service `areaServed` on solutions** | Present on cities (City) and solutions (Org) | Fine as-is. |
| **BreadcrumbList** | Present on every non-home page | No gap. |

---

## 6. Rich Results eligibility summary

| Rich result | Eligible pages |
|---|---|
| **FAQ rich results** | Homepage; all tools (`/pages/tools/*`); all how-to guides + non-how-to guides; all cities; all solutions; 8 of 10 compare pages (**not wix, not squarespace**) |
| **HowTo** | The how-to guides (`/pages/guides/how-to-*`) carry valid HowTo with steps. (Note: Google has deprecated HowTo rich results in web search, but the markup remains valid for AI/other consumers.) |
| **Breadcrumbs** | Every page except homepage — all valid (position+name+item present) |
| **Product / price snippet** | `/pages/pricing` (Product+AggregateOffer) and homepage (SoftwareApplication+AggregateOffer) — eligible; Enterprise Offer pricing should be cleaned up |
| **Sitelinks Searchbox** | WebSite+SearchAction present (blog-scoped); homepage eligible |
| **Article** | Guides + blog posts have Article/BlogPosting with headline+author+datePublished; add `image` to guides to strengthen |

---

## Priority fix list

1. **MEDIUM** — Add FAQPage to `/pages/compare/wix` and `/pages/compare/squarespace`.
2. **MEDIUM** — Fix Enterprise Offer: remove `price:0`, model contact-sales correctly (homepage + pricing).
3. **MEDIUM** — Add `founder` to the homepage Organization (copy from About-page Org).
4. **LOW** — Add `image` to the 4 guide Articles.
5. **LOW** — Add `ItemList`/`CollectionPage` to guides/compare/solutions index pages.
6. **LOW** — Align plan name "Basic" (homepage) vs "Starter" (pricing).
