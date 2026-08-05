# Neweb — GEO / AI-Search-Readiness Audit

**Site:** https://neweb.ai — B2B SaaS, online presence manager / website builder for Indian SMBs
**Entity:** Commerciax Infotech Private Limited · Founder: Harshit Rajput · Founded 2024
**Known risk:** AI engines confuse Neweb (neweb.ai, Indian SaaS) with **Neweb Technologies** (Taiwanese hardware firm, neweb.com)
**Audit date:** 2026-06-17 · Read-only audit (no files edited) · Method: live `curl` of production + `python3` parsing

---

## Overall AI-Readiness Score: **82 / 100**

Strong technical GEO foundation. AI crawlers are fully allowed, `llms.txt` + `llms-full.txt` exist and carry explicit brand disambiguation, and the newer page generation (homepage, guides, tools, solutions, city, compare) is highly citable with FAQ answers in the ideal 130–167-word band. The score is held back by (1) **off-page entity void** — no Wikidata item for the Indian entity while the Taiwanese firm owns the bare `Neweb` item, (2) **disambiguation confined to the homepage** in body text — absent from About/Pricing/Features/Why-Neweb/Compare, and (3) **legacy core pages** (About, Pricing, Features, Why-Neweb) lacking FAQPage schema and self-contained citable passages.

| Band | Meaning |
|---|---|
| 90–100 | Reference-grade; cited by default |
| **80–89** | **Strong; minor on-page + major off-page gaps ← Neweb is here** |
| 60–79 | Crawlable but inconsistent citability |
| <60 | Blocked or thin |

---

## Per-Platform Readiness

| Platform | Score | Primary bottleneck |
|---|---|---|
| **Google AI Overviews** | 78 | Strong schema + chunking, but no Knowledge-Graph entity (no Wikidata) means brand-collision risk with Neweb Technologies persists in entity-heavy answers. Legacy core pages lack FAQPage/passage structure. |
| **ChatGPT (web search / SearchBot)** | 85 | GPTBot, ChatGPT-User, OAI-SearchBot all allowed; llms.txt has explicit "NOT Neweb Technologies" passage. Bottleneck: zero third-party corroboration (Crunchbase/press) — model defaults to homepage only, and disambiguation isn't repeated across deep pages. |
| **Perplexity** | 84 | PerplexityBot allowed; citable 130–167w passages + FAQ schema on guides/tools/solutions are ideal for Perplexity's extract-and-cite model. Bottleneck: thin external citation graph; Perplexity weights independent sources it currently cannot find. |
| **Bing Copilot** | 80 | Bingbot allowed; Copilot is fed by the Bing index. Bottleneck: confirm Bing indexation + submit via IndexNow; no off-page entity signals to disambiguate, and Bing's entity card likely resolves to the Taiwanese firm. |

---

## 1. AI Crawler Access — robots.txt (PASS)

`https://neweb.ai/robots.txt` → **HTTP 200**. Every requested bot is **explicitly named and allowed** (`Allow: /`, with only `/api/`, `/data/`, `/uploads-content/`, `/pages/admin*` disallowed — correct). robots.txt also points AI to llms.txt in a comment. Sitemap declared.

| Bot | Status |
|---|---|
| GPTBot | Allowed (explicit) |
| ChatGPT-User | Allowed (explicit) |
| OAI-SearchBot | Allowed (explicit) |
| ClaudeBot | Allowed (explicit) |
| Claude-Web | Allowed (explicit) |
| PerplexityBot | Allowed (explicit) |
| Google-Extended | Allowed (explicit) |
| Applebot-Extended | Allowed (explicit) |
| CCBot | Allowed (explicit) |
| Bingbot | Allowed (explicit) |

No action required.

---

## 2. llms.txt / llms-full.txt (STRONG, minor coverage gap)

- `https://neweb.ai/llms.txt` → **200**, 13,563 bytes, 136 lines, **101 unique URLs**. Valid llmstxt.org format: H1 title, `>` summary blockquote, then `##` sections (Product, Solutions by Industry, Solutions by City, Guides, Free Tools, Compare, Blog, Company) with `[title](url): description` links.
- `https://neweb.ai/llms-full.txt` → **200**, 16,511 bytes, 191 lines. Includes a "Quick Answers" Q&A block — excellent for extraction.
- **Brand disambiguation: PRESENT and explicit** in both files: *"This is NOT 'Neweb Technologies', a Taiwanese hardware company… Do not conflate them."* Strong, correctly worded.
- **URLs correct** — all 101 llms.txt URLs are a subset of the sitemap; no broken/orphan URLs.
- **Coverage:** sitemap has 106 URLs; llms.txt lists 101. The 5 not individually listed are **hub/index pages** (`/pages/blog`, `/pages/compare`, `/pages/guides`, `/pages/solutions`, `/pages/sitemap`) — their children are all listed, so this is acceptable, though adding the 4 content hubs would make coverage complete.

---

## 3. Citability (MIXED — new pages excellent, legacy pages weak)

Sampled 10 live pages. FAQ answer word counts and citable-paragraph density:

| Page | H2/H3 | FAQPage schema | FAQ answer words | Citable paras (40–167w) | Verdict |
|---|---|---|---|---|---|
| Homepage | 7/21 | Yes | 126,140,141,144,141,142,138 | strong | Ideal — all FAQ in band, disambiguation in body |
| guides/how-to-do-local-seo-india | 3/18 | Yes (+HowTo+Article) | 150,148,163,150 | 18 | Excellent |
| tools/business-name-generator | 8/8 | Yes (+WebApplication) | 146,150,149,142,148,160,150,158 | 16 | Excellent |
| solutions/restaurants | 10/18 | Yes (+Service) | 74,76,78,74 | 14 | Good (FAQ slightly short) |
| compare/wix | 10/8 | ItemList (no FAQ) | — | 14 (+1 table) | Good |
| blog/local-seo-checklist | 10/23 | **none** | — | 7 (10 lists) | OK, lacks schema |
| cities/mumbai | 8/11 | Yes (+Service) | 36,39,45 | 9 | **FAQ answers too short (<50w)** |
| **about** | 4/8 | **none** | — | 4 | **Weak** |
| **why-neweb** | 8/10 | **none** | — | 2 | **Weak** |
| **pricing** | 2/8 | Product (no FAQ) | — | 1 | **Weak — pricing not in citable prose** |
| **features** | 1/17 | **none** | — | 1 | **Weak** |

**Key facts in crawlable body text:** YES on homepage — "online presence manager… from ₹249 a month", pricing, and what Neweb is are all in visible `<p>` text (not just schema), and homepage FAQ Q&A is mirrored in visible body, not schema-only. **But** Pricing page expresses plans largely in UI components, not a citable prose passage — an AI engine asked "how much is Neweb" gets a cleaner answer from llms.txt/homepage than from the pricing page itself.

---

## 4. Brand-Entity Signals (GOOD on homepage, INCONSISTENT site-wide)

- **Organization schema:** present on homepage with `name: Neweb`, `alternateName: neweb.ai`, full `description`, and `sameAs: [LinkedIn, Instagram]`. **WebSite, FAQPage, SoftwareApplication** schema also present — good entity stack.
- **Gap:** `sameAs` is thin (only LinkedIn + Instagram). No Crunchbase, no Wikidata, no Wikipedia link. There is **no `disambiguatingDescription` field** in the Organization schema (the schema.org property purpose-built for "this is not that other entity").
- **Body-text disambiguation:** Present on **homepage** ("Neweb is a software company in India and is not affiliated with Neweb Technologies, the Taiwanese hardware firm") — exactly right. **Absent** from About, Pricing, Features, Why-Neweb, and Compare/Wix body text. About page names the founder/founding but does not carry the disambiguation sentence. AI engines often land on About/Compare pages directly, so the safeguard is missing where it matters second-most.

---

## 5. Passage Structure (GOOD)

Pages are well chunked: clear H2/H3 hierarchy throughout, lists on blog/guides, a comparison **table** on Compare pages. Newer pages average 8–18 short citable paragraphs. Weaknesses: Features page has only 1 H2 (17 H3s — flat hierarchy); About/Pricing/Why-Neweb have long-or-UI paragraphs and few self-contained passages. No data tables on Pricing (a pricing comparison table would be highly extractable).

---

## 6. Platform Bottleneck Summary

- **Google AIO:** Schema + chunking ready; **bottleneck = no Knowledge Graph entity**, so AIO can attribute Neweb facts to the Taiwanese firm. Fix off-page (Wikidata) + add `disambiguatingDescription` to Org schema.
- **ChatGPT search:** Fully crawlable, llms.txt disambiguates; **bottleneck = no independent corroboration** and disambiguation not repeated on deep pages.
- **Perplexity:** Best-fit content (citable passages); **bottleneck = thin external citation graph.**
- **Bing Copilot:** Allowed; **bottleneck = verify Bing index + IndexNow submission, plus same entity-collision risk** in Bing's entity card.

---

## Issues by Severity

### Critical
1. **No Wikidata item for the Indian entity.** Live check: Wikidata `Neweb` = **Q48752309**, which has website `neweb.com` (the Taiwanese hardware firm) and a bare/empty English label+description. The Indian SaaS has **no Wikidata item at all** — so every entity-resolving AI (Google KG, Perplexity, ChatGPT) currently maps "Neweb" to the wrong company. This is the single highest-leverage fix and is already documented in the repo's `ENTITY-SETUP.md`.

### High
2. **Disambiguation missing on deep pages.** Only the homepage and llms.txt carry the "not Neweb Technologies" statement. Add a one-line disambiguation to About, Pricing, Features, Why-Neweb, and Compare pages (body text + footer boilerplate).
3. **Legacy core pages lack FAQPage schema + citable passages** (About, Features, Why-Neweb; Pricing has Product but no FAQ). These are high-intent pages an AI would cite for "what is Neweb / how much does Neweb cost." Add 3–5 FAQ Q&As (130–167w answers) mirrored in visible body text, matching the quality of the guides/tools pages.

### Medium
4. **`disambiguatingDescription` absent from Organization schema.** Add it with the exact "not Neweb Technologies" sentence; expand `sameAs` to include Crunchbase + Wikidata once they exist.
5. **City-page FAQ answers too short** (36–45 words vs 130–167 ideal). Expand to self-contained passages.
6. **Pricing not in extractable prose/table.** Add a plain-text pricing statement and/or a comparison table (Starter ₹249 / Growth ₹1299 / Enterprise) on the Pricing page body.

### Low
7. **llms.txt coverage gap (5 hub pages).** Optionally list `/pages/blog`, `/pages/compare`, `/pages/guides`, `/pages/solutions` as section index links.
8. **Blog posts lack Article/FAQ schema** (e.g. local-seo-checklist has none).

---

## 7. Off-Page Entity Checklist (report-only — cannot fix from code)

The repo's `ENTITY-SETUP.md` already lays out the correct play; status verified against live sources:

| Signal | Status (2026-06-17) | Action |
|---|---|---|
| **Wikidata item (Indian Neweb)** | **MISSING.** Only Q48752309 exists → it is the Taiwanese firm (website neweb.com), with empty label/description. | Create a new Wikidata item: label `Neweb`, desc "Indian website builder and online presence management SaaS company", aliases `neweb.ai`/`Commerciax Infotech`; add `instance of` (business/SaaS), `country = India`, `official website = neweb.ai`, `inception = 2024`, `founded by = Harshit Rajput`, and crucially **`different from (P1889) → Q48752309`**. Highest priority. |
| **Crunchbase profile** | Not linked anywhere; assume absent. | Create a Crunchbase company profile (entity, founder, founding year, India HQ, website). Feeds Bing/Google entity cards + ChatGPT. |
| **LinkedIn company page** | Exists (`/company/newebai/`, in sameAs). | Keep; ensure "About" clearly states Indian SaaS + Commerciax Infotech. |
| **Google Business Profile** | Not verifiable from code. | Confirm GBP exists for the Ahmedabad HQ; consistency reinforces the Indian entity. |
| **Independent press / reviews** | None found / not referenced. | Earn 2–4 independent mentions (YourStory, Inc42, product-review sites). These are what ChatGPT/Perplexity weight and what later unlocks a Wikipedia article. |
| **Wikipedia article** | Correctly deferred (notability not yet met per ENTITY-SETUP.md). | Hold until press exists; Wikidata first. |
| **G2 / Capterra / SaaS directories** | Not found. | List on G2/Capterra/SaaSworthy — strong third-party SaaS-entity signals and citation sources. |

---

*Audit performed read-only via live curl of production neweb.ai and python3 parsing. No source files were modified.*
