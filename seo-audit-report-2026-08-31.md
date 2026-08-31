# SEO Audit Report — neweb.ai

**Date:** 2026-08-31
**Scope:** All `.html` under `pages/` plus `index.html` (174 files), `data/blogs.json`, `tools-data.mjs`, `sitemap.xml`, `robots.txt`
**Base commit:** `a095eef`
**Previous audit:** `seo-audit-report-2026-08-24.md` (base commit `26c89c8`)

---

## Summary

- **Issues found:** 45 (all previously known / re-confirmed; **0 new issues**)
- **Auto-fixed & pushed:** 0
- **Flagged for human review:** 45 (unchanged category set; 7 new items are new blog posts falling into an already-flagged category)

Since last week's audit, 7 new blog posts were added (`freelancer-vs-registered-business-india`, `how-to-price-your-products-india`, `customer-testimonials-how-to-collect-and-use`, `website-vs-social-media-only-which-is-enough`, `how-to-take-online-payments-without-a-website`, `seo-mistakes-new-businesses-make`, `how-to-choose-a-business-name-india`). All were checked individually: correct slugs, present in `sitemap.xml`, present on disk, valid JSON-LD, no broken internal links, no missing schema fields.

`node build-pages.mjs` was run and produced **zero diff** against the committed `sitemap.xml`, `robots.txt`, and all generated pages — no drift. Sitewide JSON-LD validation: exactly **2** invalid blocks, both the known intentional false positives (`pages/tools/faq-schema-generator.html`, `pages/tools/localbusiness-schema-generator.html`). No duplicate titles or descriptions anywhere on the site. No stale sitemap entries. No new orphaned pages (`pages/admin.html` and `pages/blog-post.html` remain intentionally unlinked — noindex admin panel and dynamic post template respectively).

**No safe auto-fixes were available this week.** Everything found either (a) repeats an issue flagged in the 2026-08-24 report that a human has not yet acted on, or (b) is a new blog post hitting the same already-documented "dual-purpose excerpt" pattern. Nothing was committed or pushed as part of this run — the report below is informational only.

One item worth noting: this run's script initially mis-flagged 4 city pages (`bangalore`, `coimbatore`, `lucknow`, `pune`) as over-160-char descriptions and 1 blog post as under-50-char — both were script measurement artifacts (HTML-entity length counting and an apostrophe confusing a quote-matching regex), not real site bugs. Verified by direct inspection; no action needed, noted here for audit-trail transparency.

---

## Still outstanding from the 2026-08-24 audit (human action needed)

### A. Truncated meta descriptions from unescaped quotes (2) — HIGH PRIORITY, unresolved
Still live and still broken:

- `pages/solutions/clinics.html` → renders as: `A clinic's website is its first handshake. Neweb ships sites that load instantly, rank for ` (truncated at the literal `"` before `doctor near me`).
- `pages/guides/local-seo.html` → renders as: `Practical tactics to rank for ` (truncated at the literal `"` before `near me`).

**Why not auto-fixed:** both descriptions originate in data arrays *inside* `build-pages.mjs` (the `lead:`/`d:` fields). `build-pages.mjs` is explicitly out of the safe-edit scope (generator logic file).
**Suggested next step:** in `build-pages.mjs`, HTML-escape the description before injecting into the `content="..."` attribute (proper fix, benefits every page), or reword the two offending strings to avoid literal double quotes (e.g. `'doctor near me'` with single quotes). Either is a few minutes of work but must be done by hand in the generator file.

### B. Blog post meta descriptions over 160 chars (30, was 26)
All blog posts (now including the 7 new ones) use their `excerpt` field as both the meta description **and** the visible lede + listing-card text. 30 posts currently run 165–223 chars.

**Why not auto-fixed:** the excerpt is dual-purpose (see `build-pages.mjs` lines ~2283, 2331, 2525, 2535); trimming it to fit meta-description length also changes visible on-page content — that's a content rewrite, flag-only by policy.
**Suggested next step:** unchanged from last week — either (a) shorten excerpts to ≤160 chars (touches visible copy, needs an editorial pass), or (b) add a separate `metaDescription` field to `data/blogs.json` + `build-pages.mjs` so meta and visible lede can differ without a rewrite. New longest offenders since last week: `how-to-write-a-business-plan-india` (223, unchanged), `msme-development-amendment-act-2026-explained` (215, unchanged), `google-business-profile-guide-india` (207, unchanged) — no new post cracked the top 3, but `how-to-price-your-products-india` (199) and `how-to-list-your-business-on-google-for-free` (199) are close behind.

### C. Generator-sourced page descriptions over/under length (5, was 6)
Descriptions defined in data arrays inside `build-pages.mjs`: `pages/templates.html` (183), `pages/features.html` (176), `pages/best-website-builder-india.html` (174), `pages/solutions.html` (166). Plus `index.html` (189).

**Why not auto-fixed:** `index.html` is explicitly flag-only; the rest live in `build-pages.mjs` generator source.
**Suggested next step:** unchanged — trim these strings by hand in `build-pages.mjs` / rewrite `index.html`'s description to ≤160.

### D. Short blog description (1, unchanged)
- `pages/blog/hello-from-neweb.html` — excerpt is `Our blog is live.` (17 chars), a thin launch-announcement post.
**Why not auto-fixed:** excerpt is dual-purpose visible content; also borderline thin-content, outside meta-only fix scope.
**Suggested next step:** unchanged — expand the excerpt to a meaningful 140–160-char summary, or retire the placeholder post.

### E. Long `<title>` tags — informational only, unchanged
Still mostly blog posts with the `— Neweb Blog` suffix and `solutions/…`/`tools/…` pages running past ~65 chars. None missing or duplicated; only a SERP-truncation risk, not a correctness bug. No action needed unless pixel-width matters to the team.

### Non-issues re-verified this week (no action needed)
- **JSON-LD:** only the same 2 documented false positives; all other blocks (including the 7 new posts' Article/BreadcrumbList schema) parse and carry required fields.
- **"Broken links" (2):** both are runtime JS template literals in `pages/blog.html` (`${encodeURIComponent(...)}`), not real hrefs.
- **`<img>` missing alt/width/height:** all 8 hits are JS-injected images in interactive tool pages (`image-compressor`, `image-resizer`, `favicon-generator`, `open-graph-generator`) or dynamic blog-post/admin templates built via string concatenation — no static `src` or known dimensions at build time, not safely fixable.
- **Orphaned pages (2):** `pages/admin.html` and `pages/blog-post.html`, same as last week — intentionally unlinked (noindex admin panel; dynamic post template rendered via `?slug=`).
- **Sitemap/robots drift:** none — `node build-pages.mjs` output byte-for-byte matches committed files.
- **Stale sitemap entries:** none — every `<loc>` resolves to a real file on disk.
- **Duplicate titles/descriptions:** none anywhere on the site.

---

## What changed since last week

- 7 new blog posts added, all correctly wired (sitemap, JSON-LD, internal links, slugs match filenames).
- No regressions introduced by those additions.
- No human action appears to have been taken yet on Items A–E from the 2026-08-24 report — all still open.
