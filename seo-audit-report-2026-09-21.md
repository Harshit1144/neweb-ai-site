# SEO Audit Report — 2026-09-21

Automated weekly SEO maintenance run. Pulled `origin/main` fresh (at `77ae93d`), ran the full checklist across `index.html` and all files under `pages/` (195 HTML files), auto-fixed everything that was unambiguously safe, and flagged the rest for human review.

## Summary

- **13 genuine issues found** (after excluding the two known, expected JSON-LD false positives)
- **8 auto-fixed and pushed** to `origin/main`: 7 blog-post meta-description length fixes, 1 missing `alt` attribute
- **5 flagged for human review**: all carried over unchanged from prior weeks (4 meta-description-length issues stuck in generator code / `index.html`, 1 missing-canonical pair that's correct-by-design)
- JSON-LD sitewide validation: exactly 2 invalid blocks, matching the two known, expected false positives (`pages/tools/faq-schema-generator.html`, `pages/tools/localbusiness-schema-generator.html`) — no real JSON-LD bugs found
- No missing/duplicate `<title>` tags, no broken internal links, no orphaned pages, no sitemap/robots.txt drift — `node build-pages.mjs` output already matched the committed `sitemap.xml` and `robots.txt` exactly
- No stale sitemap entries (every `<loc>` in `sitemap.xml` resolves to a real file on disk)

## Auto-fixed items (committed and pushed)

**Category: meta description too long (7 blog posts)**

Seven existing blog posts had `excerpt` fields in `data/blogs.json` running 180–230 characters, over the 160-char limit. This field doubles as the source for each post's `<meta name="description">`, `og:description`, `twitter:description`, JSON-LD `BlogPosting.description`, and the on-page lede paragraph. All seven were rewritten to specific, page-accurate summaries in the 143–159 character range, preserving the original meaning with no keyword stuffing. Fixed via the data file, then regenerated with `node build-pages.mjs` so every derived surface stayed in sync.

| Post slug | Before (chars) | After (chars) |
|---|---|---|
| `common-mistakes-in-gst-invoices` | 230 | 155 |
| `how-to-set-up-google-analytics-for-small-business` | 219 | 145 |
| `quick-commerce-vs-your-own-website` | 196 | 159 |
| `best-practices-for-mobile-friendly-websites-india` | 193 | 153 |
| `gst-2-0-guide-for-small-business-website` | 186 | 152 |
| `how-to-write-seo-friendly-product-descriptions` | 182 | 154 |
| `website-loading-speed-why-it-matters-india` | 180 | 143 |

**Category: missing alt text (1 image)**

`pages/tools/image-resizer.html` — the `#ir-preview` `<img>` (the client-side resized-image preview) had no `alt` attribute. Added `alt="Uploaded image preview"`, a generic-but-accurate description inferred from the surrounding context (the preceding "Choose an image" file input and the element's id/purpose). Fixed at the source in `tools-data.mjs`'s `widget.html` template, then regenerated `pages/tools/image-resizer.html`. Unlike the width/height gap flagged on this same element in prior weeks (still present, see below), alt text doesn't require reading actual pixel dimensions from a file, so this half of the issue was safe to fix directly.

Files changed in total: `data/blogs.json`, `tools-data.mjs`, `pages/blog.html` (pre-rendered index cards), the 7 regenerated `pages/blog/<slug>.html` files themselves, 44 other `pages/blog/*.html` files whose "related posts" widget teases one of the 7 changed posts (diff limited to the teaser snippet text), and `pages/tools/image-resizer.html`. Total: 54 files changed via `node build-pages.mjs`.

No other SAFE-list categories (missing/duplicate titles, broken links, missing canonicals beyond the known-correct exclusions, JSON-LD required-field gaps, missing width/height on static images, orphaned pages, sitemap/robots drift) had genuine issues this cycle.

## Flagged for human review

### Meta description still out of range — fix requires editing a file outside the safe-edit scope (4 items, unchanged from prior weeks)

These pages' `<meta name="description">` content is a hardcoded string literal inside `build-pages.mjs` itself (or, for `index.html`, hand-written directly in the file), not in `pages/`, `data/`, or a `tools-data.mjs` metadata field. Per this run's scope rules, generator logic and `index.html` are off-limits for auto-fix.

| File | Current length | Suggested next step |
|---|---|---|
| `index.html` | 189 chars | Flag-only per policy — hand-written, high-risk. A human should manually tighten the `<meta name="description">`. |
| `pages/best-website-builder-india.html` | 174 chars | `description:` field in `build-pages.mjs` (line ~1655). |
| `pages/features.html` | 176 chars | `description:` field in `build-pages.mjs`. |
| `pages/solutions.html` | 166 chars | `description:` field in `build-pages.mjs`. |
| `pages/templates.html` | 183 chars | `description:` field in `build-pages.mjs`. |

These five have now been flagged unresolved across at least three consecutive weekly audits. Since they're all hardcoded literals rather than data-file fields, a human could batch-fix all five in one pass through `build-pages.mjs` (plus `index.html` separately) in a few minutes — this is a good candidate for someone to just do directly rather than waiting on further automated flags.

### Dynamic image preview element — width/height gap that can't be safely auto-fixed (1 item, unchanged from prior weeks)

| File | Issue | Why not auto-fixed |
|---|---|---|
| `pages/tools/open-graph-generator.html` | `#og-preview-img` has `alt="OG preview image"` already, but no `width`/`height` | Live OG-preview populated from arbitrary user input at runtime — no source file to read real dimensions from. Low CLS risk in practice since the element sits inside a fixed `aspect-ratio: 1.91/1` CSS container. |

(The equivalent alt-text gap on `pages/tools/image-resizer.html`'s `#ir-preview` element, flagged in prior weeks alongside a missing-dimensions note, was resolved this cycle — see Auto-fixed items above. That element's own dimensions remain CSS-controlled via `max-width`/`max-height`, not raw `width`/`height` attributes, so it wasn't re-flagged here; it poses the same low, CSS-bounded CLS risk as the OG-generator preview.)

## Other observations (no action needed)

- `pages/admin.html` and `pages/blog-post.html` are missing a `<link rel="canonical">` and are absent from `sitemap.xml` — both by design, unchanged from prior audits: `admin.html` is `noindex`'d and intentionally kept out of public nav; `blog-post.html` is a CSR template shell that sets its canonical tag dynamically via JavaScript at runtime (not present in static source) and is deliberately excluded from `sitemap.xml` via `SITEMAP_EXCLUDE` in `build-pages.mjs`.
- No orphaned pages found: every `.html` file under `pages/` is reachable from nav, a hub page, `build-pages.mjs`, or `sitemap.xml`.
- No Core Web Vitals / performance audit was run this cycle (out of scope for this checklist).
- No backlink/off-page/directory listing issues surfaced (not checked this cycle — these require external tools/human action per policy).

## Methodology notes

- Meta description lengths were computed on HTML-entity-decoded text (e.g. `&amp;` counted as one `&`, not five characters) to avoid inflated-length false positives.
- JSON-LD blocks were parsed after blanking out non-`ld+json` `<script>` bodies, so JS template literals containing `/pages/...`-shaped strings were not mistaken for either broken links or JSON-LD.
- Internal `href="/pages/..."` links were resolved against the filesystem (accepting `.html` suffix and `index.html` fallback); stylesheet/script references were excluded from the link-integrity check.
- Orphan detection cross-referenced every `pages/**/*.html` file's slug/basename against the combined text of all pages, `index.html`, `build-pages.mjs`, `tools-data.mjs`, `data/blogs.json`, and `sitemap.xml`.
