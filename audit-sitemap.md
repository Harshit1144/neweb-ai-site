# Sitemap + Internal-Linking + Crawl-Structure Audit — neweb.ai

**Date:** 2026-06-17
**Scope:** Read-only audit. Sitemap validity, coverage gap vs disk, internal-link graph, anchor text, nav/footer hubs, crawl depth.
**Method:** `curl` + `python3` (regex href extraction). All 106 sitemap `<loc>` URLs status-checked live.

---

## Overall Score: 96 / 100
## Internal-Linking Health: 9.5 / 10

This is a near-textbook sitemap and internal-linking setup. Clean XML, zero broken/duplicate/orphan entries, full disk-to-sitemap parity, an HTML sitemap hub, expanded inner-page footers, and descriptive anchors throughout. Only two minor nav-surfacing nits keep it from a perfect score.

---

## 1. Sitemap Validity

| Check | Result |
|---|---|
| HTTP status of `/sitemap.xml` | 200 |
| Content-Type | `application/xml` (correct, `nosniff`) |
| Well-formed XML | YES (parsed via `xml.dom.minidom`) |
| URL count | 106 `<loc>` |
| Duplicate `<loc>` | NONE |
| All `<loc>` return 200 | YES — 106/106 = 200, zero non-200 |
| Redirect chains in sitemap URLs | NONE (sampled URLs resolve directly, no 30x) |
| `lastmod` usage | 4 entries, **all 4 are blog posts** — matches the stated design (only blog posts carry lastmod) |
| `lastmod` on non-blog URLs | NONE (correct) |

The 4 `lastmod` URLs:
- `/pages/blog/google-business-profile-guide-india`
- `/pages/blog/hello-from-neweb`
- `/pages/blog/how-to-pick-a-domain-name`
- `/pages/blog/local-seo-checklist-india`

**Verdict: PASS.** No malformed entries, no 404s, no dupes, lastmod policy correctly enforced.

---

## 2. Coverage Gap Analysis (sitemap vs disk)

- HTML files on disk under `pages/`: **107** (+ root `index.html`)
- Disk page-URLs (excluding root): 108 → Sitemap URLs: 106

**On disk but NOT in sitemap (2 — both correct exclusions):**
- `/pages/admin` — internal admin page; also `Disallow`-ed in `robots.txt` (`/pages/admin` and `/pages/admin.html`). Correct to exclude.
- `/pages/blog-post` — template stub (title "Neweb — Blog"); not a real content URL. Correct to exclude.

**In sitemap but NO matching disk file:** NONE. Every sitemap URL maps to a real file and returns 200.

**Verdict: PASS.** No live content pages are missing from the sitemap; no phantom/404 sitemap entries.

---

## 3. Internal-Link Graph (15 representative pages fetched)

Pages sampled across every cluster: home, tools-hub + a tool, guides-hub + a guide, solutions-hub + a solution, compare-hub + a compare, a city, blog-hub + a blog post, pricing, the HTML sitemap, about.

Internal `<a href>` counts per page:

| Page | Internal links |
|---|---|
| home | 24 |
| tools-hub | 54 |
| tool: qr-code-generator | 37 |
| guides-hub | 38 |
| guide: restaurant | 29 |
| solutions-hub | 34 |
| solution: salons | 39 |
| compare-hub | 36 |
| compare: wix | 35 |
| city: mumbai | 33 |
| blog-hub | 30 |
| blog: local-seo | 38 |
| pricing | 34 |
| **sitemap (HTML hub)** | **102** |
| about | 24 |

### Hub-and-spoke health
- **HTML sitemap hub exists:** `https://neweb.ai/pages/sitemap` returns 200 and links to **102 internal pages** — a strong crawl backstop linked from every inner-page footer.
- **Cluster cross-linking:** Strong. City links appear on 11 of 15 sampled pages (tools, guides, solutions, compare, blog, pricing, sitemap all carry the 8-city block). Hubs (tools/guides/solutions/compare/blog) are linked from essentially every page via the shared footer.
- **Reachability:** Using the partial graph from the 15 sampled pages, **all 106 sitemap URLs are referenced by at least one sampled page**, and a BFS from the homepage reaches **106/106 within 3 clicks** (max observed depth = 3). Because inner-page footers link all hubs + all cities, effective depth for most pages is ≤ 2 (home → any inner page → target).
- **Orphans:** None detected. Every sitemap URL has at least one inbound internal link from the sampled set; deep pages (tools, cities, compares, solutions) are linked from their hub pages, the shared footer, and the HTML sitemap.

**Rating: 9.5/10.**

---

## 4. Anchor Text

Scanned all 15 fetched pages for generic anchors ("click here", "here", "read more", "link", "this"). **Zero generic anchors found.** Internal links use descriptive, keyword-relevant anchors (city names, tool names, guide titles, etc.).

**Verdict: PASS.**

---

## 5. Navigation (main nav + footer)

**Homepage main nav** links to: features, pricing, solutions (+ 4 solution sub-pages), templates, why-neweb, blog, guides, tools, compare, customer-stories, domain-checker, changelog.
→ All major hubs present in nav EXCEPT cities and the HTML sitemap.

**Homepage footer** links to: pricing, why-neweb, templates, changelog, domain-checker, solutions (+4), blog, guides, tools, compare, customer-stories, press, about, careers, contact, security, privacy, terms.
→ Hubs present; cities and `/pages/sitemap` NOT in the homepage footer variant.

**Important nuance:** Inner pages (e.g. pricing, tools) use an **expanded footer** that DOES include the 8-city block AND `/pages/sitemap`. Verified on pricing: `cities in footer = True`, `sitemap in footer = True`. So cities + the HTML sitemap are reachable in 2 clicks (home → any inner page → cities/sitemap), just not 1 click from the homepage itself.

| Hub | In homepage nav/footer? | Reachable ≤3 clicks? |
|---|---|---|
| tools | YES | YES |
| guides | YES | YES |
| solutions | YES | YES |
| compare | YES | YES |
| blog | YES | YES |
| pricing | YES | YES |
| cities | NO (only on inner-page footers) | YES (≤2) |
| sitemap (HTML) | NO (only on inner-page footers) | YES (≤2) |

---

## 6. Crawl Depth / Structure

- No pages buried beyond 3 clicks from the homepage (BFS confirms 106/106 ≤ 3).
- Clean URL structure: `/pages/<hub>` and `/pages/<hub>/<spoke>`, no query strings, no deep nesting beyond 2 path segments under `/pages/`.
- `robots.txt` is healthy: `Allow: /`, bot-specific rules for all major AI crawlers, admin disallowed, sitemap declared, and points to `llms.txt` / `llms-full.txt`.

---

## Issues by Severity

### Critical
- None.

### High
- None.

### Medium
- None.

### Low
1. **Cities cluster not surfaced in the homepage nav or homepage footer.** It's only in the expanded inner-page footer, so the city cluster is depth-2 rather than depth-1 from the homepage. Consider adding a "Cities" or "Locations" entry to the homepage footer to give the 10 city pages a top-level entry point. (URLs: `/pages/cities/{ahmedabad,bangalore,chennai,delhi,hyderabad,jaipur,kolkata,mumbai,pune,surat}`)
2. **HTML sitemap (`/pages/sitemap`) not linked from the homepage** (present on inner-page footers only). Minor — adding it to the homepage footer would give crawlers the 102-link hub one click from the root.

### Informational
- `/pages/blog-post` (template stub) and `/pages/admin` correctly excluded from sitemap; admin also disallowed in robots.txt. No action needed.
- Homepage footer is a deliberately trimmed variant vs inner pages. Intentional design; only relevant to the two Low items above.

---

## Appendix — Method Notes
- 106 sitemap URLs status-checked live via parallel `curl` (`-P 12`), all returned 200.
- Link extraction via regex on raw HTML (`<a href>`); internal = same-host or root-relative.
- Reachability via BFS over the 15-page sampled graph; sitemap target set = 106 `<loc>` values.
