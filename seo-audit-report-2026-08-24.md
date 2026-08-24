# SEO Audit Report — neweb.ai

**Date:** 2026-08-24
**Scope:** All `.html` under `pages/` plus `index.html` (167 files), `data/blogs.json`, `tools-data.mjs`, `sitemap.xml`, `robots.txt`
**Base commit:** `26c89c8`

---

## Summary

- **Issues found:** 60
- **Auto-fixed & pushed:** 28
- **Flagged for human review:** 32

Build (`node build-pages.mjs`) completes cleanly. Sitewide JSON-LD validation: exactly **2** invalid blocks, both the known intentional false positives (`pages/tools/faq-schema-generator.html`, `pages/tools/localbusiness-schema-generator.html` — they render example schema as visible text). No sitemap/robots drift. No duplicate titles or descriptions. No stale sitemap entries.

---

## Auto-fixed items (28)

### Broken internal links (4)
Fixed at source in `data/blogs.json` (blog HTML is generated from it; the 3 affected blog pages were regenerated):

| Blog post (source) | Old href | New href | Why safe |
|---|---|---|---|
| `free-tools-every-indian-small-business-needs` | `/pages/tools/invoice-generator` | `/pages/tools/gst-invoice-generator` | Target didn't exist; `gst-invoice-generator` is the real invoice tool. |
| `gst-basics-for-small-business-website` (×2) | `/pages/tools/invoice-generator` | `/pages/tools/gst-invoice-generator` | Same. |
| `whatsapp-business-tips-for-small-business` | `/pages/solutions/retail` | `/pages/solutions/boutiques` | No `retail` solution page exists; the site's own nav already maps "retail" → `boutiques` ("boutique and retail solutions"). |

### Meta descriptions rewritten to 140–160 chars (24)

**Static HTML pages (19)** — edited directly; meta-only fields, not duplicated as visible body copy:

- `pages/cities/`: ahmedabad, bangalore, chennai, coimbatore, delhi, hyderabad, indore, jaipur, kolkata, lucknow, mumbai, nagpur, pune, surat (14) — all were 164–226 chars, trimmed to 149–159.
- `pages/solutions/cafes.html` (174→158)
- `pages/guides/how-to-make-tutoring-website.html` (164→155)
- `pages/guides/rank-on-google-maps-india.html` (163→145)
- `pages/compare/hostinger.html` (163→155)
- `pages/tools/sitemap-generator.html` (161→151, static tool page)

**Generated tool pages (5)** — edited in `tools-data.mjs` `metaDescription` field (meta-only; regenerated via build). Description value also propagates to `og:description`, `twitter:description`, and the `WebApplication` JSON-LD `description` — schema type unchanged:

- `sip-calculator` (174→153)
- `emi-calculator` (166→146)
- `quotation-generator` (166→160)
- `gratuity-calculator` (163→156)
- `income-tax-calculator` (162→157)

---

## Flagged for human review (32)

### A. Truncated meta descriptions from unescaped quotes (2) — HIGH PRIORITY
Two live meta descriptions are silently cut off mid-sentence because a `"` inside the text closes the `content="..."` attribute early:

- `pages/solutions/clinics.html` → renders as: `A clinic's website is its first handshake. Neweb ships sites that load instantly, rank for ` (truncated at `"doctor near me"`).
- `pages/guides/local-seo.html` → renders as: `Practical tactics to rank for ` (truncated at `"near me"`).

**Why not auto-fixed:** both descriptions originate in data arrays *inside* `build-pages.mjs` (the `lead:`/`d:` fields), and edits to `build-pages.mjs` are out of the safe scope.
**Suggested next step:** in `build-pages.mjs`, either HTML-escape the description before injecting into the tag, or reword to remove the literal double-quotes (e.g. use single quotes: `'doctor near me'`). Quick, mechanical, but must be done in the generator file.

### B. Blog post meta descriptions over 160 chars (26)
All 26 blog posts have excerpts of 171–223 chars used as the meta description.

**Why not auto-fixed:** the blog `excerpt` field is dual-purpose — it is both the meta description **and** the visible lede + listing-card text on the page. Trimming it changes visible on-page content, which is a content rewrite (flag-only).
**Suggested next step:** decide whether to (a) shorten excerpts to ≤160 (affects visible copy), or (b) add a separate `metaDescription` field to `data/blogs.json` + `build-pages.mjs` so meta and visible lede can differ. Longest offenders: `how-to-write-a-business-plan-india` (223), `msme-development-amendment-act-2026-explained` (215), `google-business-profile-guide-india` (207).

### C. Generator-sourced page descriptions over/under length (6)
Descriptions defined in data arrays inside `build-pages.mjs`:

- Over 160: `pages/templates.html` (183), `pages/features.html` (176), `pages/best-website-builder-india.html` (174), `pages/solutions.html` (166)
- Under 50: `pages/guides/local-seo.html` (29, and truncated — see item A)

Plus `index.html` description (191 chars).
**Why not auto-fixed:** `index.html` is explicitly flag-only (hand-written, high-risk); the others live in `build-pages.mjs` generator source.
**Suggested next step:** trim these strings in `build-pages.mjs` / rewrite `index.html` meta description to ≤160 by hand.

### D. Short blog description (1)
- `pages/blog/hello-from-neweb.html` — description is `Our blog is live.` (17 chars). This is a thin launch-announcement post.
**Why not auto-fixed:** excerpt is dual-purpose visible content; also borderline thin-content.
**Suggested next step:** expand the excerpt in `data/blogs.json` to a meaningful 140–160-char summary, or retire the placeholder post.

### E. Long `<title>` tags — informational, no action taken
51 pages have titles longer than ~65 chars (mostly blog posts with the `— Neweb Blog` suffix, and `solutions/…` / `tools/…` pages). None are missing or duplicated. Title length beyond ~60 chars only risks SERP truncation, not correctness.
**Why not auto-fixed:** blog/solution titles double as the visible H1 and come from data fields; shortening is an editorial content decision.
**Suggested next step (optional):** if SERP pixel-width matters, shorten the longest (e.g. `how-to-calculate-roi-return-on-investment` at 101, `types-of-business-structures-in-india` at 101).

### Non-issues verified (no action needed)
- **JSON-LD:** the only 2 invalid blocks are the documented false positives.
- **Remaining "broken links" (6):** all false positives — 2 are runtime JS template literals in `pages/blog.html` (`${encodeURIComponent(p.slug)}`), 4 are code samples inside `<pre>` blocks in `pages/tools/favicon-generator.html` (example filenames the tool tells users to create).
- **`<img>` missing alt/dimensions:** all hits are in interactive tool pages (`image-compressor`, `image-resizer`, `favicon-generator`, `open-graph-generator`) where images are JS-injected from user uploads (no static src, dimensions unknown at build), or decorative dynamic blog covers with intentional `alt=""`. Not safely fixable.
- **Pages not in sitemap (2):** `pages/admin.html` (noindex admin panel) and `pages/blog-post.html` (dynamic post template, not a standalone URL). Both intentionally excluded — not orphans.
- **Canonical:** missing only on the two intentionally-non-indexed pages above; `meta-tags-analyzer.html`'s "multiple canonical" is example markup.
- **Sitemap/robots:** `node build-pages.mjs` output matches committed files exactly — no drift.
