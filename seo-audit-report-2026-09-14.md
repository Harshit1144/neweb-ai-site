# SEO Audit Report — 2026-09-14

Automated weekly SEO maintenance run. Pulled `origin/main` fresh (at `6eaacec`), ran the full checklist across `index.html` and all files under `pages/` (188 HTML files), auto-fixed everything that was unambiguously safe, and flagged the rest for human review.

## Summary

- **12 genuine issues found** (after filtering out false positives from the audit tooling itself — see Methodology notes)
- **5 auto-fixed and pushed** to `origin/main` (all meta-description length issues on newly published blog posts)
- **7 flagged for human review**: 1 new broken-link issue (14 pages affected), 4 carried-over meta-description-length issues (out of safe-edit scope), 2 carried-over dynamic-image alt/dimension items
- JSON-LD sitewide validation: exactly 2 invalid blocks, matching the two known, expected false positives (`pages/tools/faq-schema-generator.html`, `pages/tools/localbusiness-schema-generator.html`) — no real JSON-LD bugs found
- No duplicate/missing `<title>` tags, no missing canonical tags outside the one known-ambiguous CSR shell page, no sitemap/robots.txt drift — `node build-pages.mjs` output already matched the committed `sitemap.xml` and `robots.txt` exactly
- No broken links found anywhere in blog post bodies (all `/pages/blog-post?slug=...`, `/pages/tools/...`, `/pages/guides/...`, `/pages/solutions/...`, `/pages/compare/...`, `/pages/cities/...` references checked against `data/blogs.json` resolve to real files)

## Auto-fixed items (committed and pushed)

**Category: meta description too long (5 new blog posts)**

Five blog posts published since last week's audit (2026-09-09 through 2026-09-12) had `excerpt` fields in `data/blogs.json` running 165–227 characters, over the 160-char limit. This field doubles as the source for each post's `<meta name="description">`, `og:description`, `twitter:description`, JSON-LD `BlogPosting.description`, and the on-page lede paragraph. All five were rewritten to specific, page-accurate summaries in the 140–150 character range, preserving the original meaning with no keyword stuffing. Fixed via the data file, then regenerated with `node build-pages.mjs` so every derived surface stayed in sync.

| Post slug | Before (chars) | After (chars) |
|---|---|---|
| `pan-tan-for-small-business-explained` | 165 | 141 |
| `current-account-vs-savings-account-business` | 218 | 147 |
| `how-to-write-a-good-business-description` | 227 | 144 |
| `website-security-basics-for-small-business` | 181 | 147 |
| `how-to-handle-negative-google-reviews` | 184 | 149 |

Files changed: `data/blogs.json`, `pages/blog.html` (pre-rendered index cards), the five regenerated `pages/blog/<slug>.html` files themselves, and 29 other `pages/blog/*.html` files whose "related posts" widget teases one of these five posts — the diff there is limited to the teaser snippet text, not their own excerpts. Total: 36 files changed via `node build-pages.mjs`.

No other SAFE-list categories (missing/duplicate titles, missing alt text on static images, broken links, missing canonicals, JSON-LD required-field gaps, missing width/height on static images, orphaned pages, sitemap/robots drift) had genuine issues this cycle.

## Flagged for human review

### NEW: Broken breadcrumb link — no cities hub page exists (14 pages affected)

Every page under `pages/cities/` (ahmedabad, bangalore, chennai, coimbatore, delhi, hyderabad, indore, jaipur, kolkata, lucknow, mumbai, nagpur, pune, surat) has a breadcrumb `<a href="/pages/cities">Cities</a>` that 404s — there is no `pages/cities.html` hub page, unlike the equivalent hub pages for every other section (`pages/solutions.html`, `pages/guides.html`, `pages/compare.html`, `pages/tools.html` all exist and are correctly linked from their own child pages' breadcrumbs).

**Why not auto-fixed:** this isn't a typo'd slug with an obvious correct target — there is genuinely no existing page to point to. The two plausible fixes (build a new `pages/cities.html` hub page listing all 14 cities, or repoint the breadcrumb to an existing page such as `pages/solutions.html`, which already lists city links in its footer) are both judgment calls: one requires creating new page content (out of the "mechanical href fix" scope), the other would make the breadcrumb point somewhere that doesn't match its label. This needs a human decision on which approach fits the site's information architecture.

**Suggested next step:** most consistent with the rest of the site would be to add a `pages/cities.html` hub page (mirroring `pages/solutions.html`/`pages/guides.html` structure) listing all 14 city pages, then wire it into `build-pages.mjs`'s page-generation list and `sitemap.xml`. Until that exists, an interim fix would be to simply remove the link (render "Cities" as plain text in the breadcrumb, not an `<a>`) on all 14 pages.

### Meta description still out of range — fix requires editing a file outside the safe-edit scope (4 items, unchanged from last week)

These pages' `<meta name="description">` content is a hardcoded string literal inside `build-pages.mjs` itself (or, for `index.html`, hand-written directly in the file), not in `pages/`, `data/`, or a `tools-data.mjs` metadata field. Per this run's scope rules, generator logic and `index.html` are off-limits for auto-fix.

| File | Current length | Suggested next step |
|---|---|---|
| `index.html` | 189 chars | Flag-only per policy — hand-written, high-risk. A human should manually tighten the `<meta name="description">`. |
| `pages/best-website-builder-india.html` | 174 chars | `description:` field in `build-pages.mjs`. |
| `pages/features.html` | 176 chars | `description:` field in `build-pages.mjs`. |
| `pages/solutions.html` | 166 chars | `description:` field in `build-pages.mjs`. |
| `pages/templates.html` | 183 chars | `description:` field in `build-pages.mjs`. |

(`pages/templates.html` was previously listed too; all five remain unresolved from the 2026-09-07 report — no action taken on them since, which is expected since they require editing generator logic that is out of this run's scope.)

### Dynamic image preview elements — alt/dimension gaps that can't be safely auto-fixed (2 items, unchanged from last week)

| File | Issue | Why not auto-fixed |
|---|---|---|
| `pages/tools/image-resizer.html` | `#ir-preview` `<img>` has no `alt` attribute and no `width`/`height` | Client-side preview populated at runtime from a user-uploaded image — no source file to read real dimensions from, and the markup lives inline inside `tools-data.mjs`'s tool body (not a clean metadata field), so a source-level fix falls outside this run's safe-edit scope. Suggested: add `alt="Uploaded image preview"` in `tools-data.mjs`. |
| `pages/tools/open-graph-generator.html` | `#og-preview-img` has `alt="OG preview image"` already, but no `width`/`height` | Same reasoning — live OG-preview populated from arbitrary user input. Low CLS risk in practice since the element sits inside a fixed `aspect-ratio: 1.91/1` CSS container. |

## Other observations (no action needed)

- `pages/admin.html` and `pages/blog-post.html` were flagged by the link-graph orphan/canonical/sitemap scans, but both are unchanged from prior audits and orphaned/uncanonicalized by design: `admin.html` is `noindex`'d and intentionally kept out of public nav; `blog-post.html` is a CSR template shell that sets its canonical tag dynamically via JavaScript at runtime (not present in static source, which is why the static scanner flags it) and is deliberately excluded from `sitemap.xml` via `SITEMAP_EXCLUDE` in `build-pages.mjs`.
- No Core Web Vitals / performance audit was run this cycle (out of scope for this checklist).
- No backlink/off-page/directory listing issues surfaced (not checked this cycle — these require external tools/human action per policy).

## Methodology notes

- The audit script initially over-reported "broken links" by flagging `href="/pages/shared.css"` (180 hits) as a missing `.html` page — this is a stylesheet reference, not a page link, and was excluded once noticed.
- Meta description lengths were computed on HTML-entity-decoded text (e.g. `&amp;` counted as one `&`, not four characters) to avoid the false positives noted in the 2026-09-07 report.
- JSON-LD blocks were parsed after blanking out non-`ld+json` `<script>` bodies, so JS template literals containing `/pages/...`-shaped strings were not mistaken for either broken links or JSON-LD.
