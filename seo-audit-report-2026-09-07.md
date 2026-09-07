# SEO Audit Report — 2026-09-07

Automated weekly SEO maintenance run. Pulled `origin/main` fresh (at `dfc3736`), ran the full checklist across `index.html` and all files under `pages/` (180 HTML files), auto-fixed everything that was unambiguously safe, and flagged the rest for human review.

## Summary

- **45 genuine issues found** (after filtering out false positives from the audit tooling itself — see Methodology notes below)
- **36 auto-fixed and pushed** to `origin/main`
- **9 flagged for human review** (5 meta descriptions, 3 dynamic-image alt/dimension items, 1 canonical-tag ambiguity)
- **2 additional observations** noted but requiring no action (false-positive "orphan" pages that are orphaned by design)
- JSON-LD sitewide validation: exactly 2 invalid blocks, matching the two known, expected false positives (`pages/tools/faq-schema-generator.html`, `pages/tools/localbusiness-schema-generator.html`) — no real JSON-LD bugs found
- No broken internal links, no duplicate/missing `<title>` tags, no sitemap/robots.txt drift — `node build-pages.mjs` output already matched the committed sitemap and robots.txt exactly

## Auto-fixed items (committed and pushed)

**Category: meta description too long (36 blog posts)**

All 36 were "excerpt" fields in `data/blogs.json`, which doubles as the source for each blog post's `<meta name="description">`, `og:description`, `twitter:description`, JSON-LD `BlogPosting.description`, and the on-page lede paragraph. Originals ran 161–223 characters (over the 160-char limit); all were rewritten to specific, page-accurate summaries in the 140–160 character range, preserving the original meaning without keyword stuffing. Fixed via the data file, then regenerated with `node build-pages.mjs` so every derived surface (meta tags, JSON-LD, lede, and the "related posts" teaser snippets on other blog pages that reference these posts) stayed in sync. No visible content was rewritten beyond tightening this one field.

Files changed: `data/blogs.json`, `pages/blog.html` (pre-rendered index cards), and the regenerated `pages/blog/*.html` for:

- best-website-builder-in-india-2026
- business-ideas-with-website-first-approach
- digital-marketing-tips-for-small-business-india
- festive-season-website-checklist-india
- free-tools-every-indian-small-business-needs
- freelancer-vs-registered-business-india
- google-business-profile-guide-india
- gst-basics-for-small-business-website
- gst-registration-process-explained
- hello-from-neweb (was also under the 50-char minimum: "Our blog is live.")
- how-much-does-a-website-cost-in-india
- how-to-calculate-roi-return-on-investment
- how-to-create-a-business-email
- how-to-get-more-google-reviews
- how-to-get-your-first-10-customers
- how-to-list-your-business-on-google-for-free
- how-to-pick-a-domain-name
- how-to-price-your-products-india
- how-to-register-a-company-in-india
- how-to-sell-products-online-in-india
- how-to-start-a-business-in-india
- how-to-take-online-payments-without-a-website
- how-to-write-a-business-plan-india
- how-to-write-google-business-profile-posts
- instagram-marketing-for-indian-small-business
- instagram-shop-vs-own-website
- local-seo-checklist-india
- msme-development-amendment-act-2026-explained
- msme-registration-benefits-small-business
- shop-and-establishment-registration-guide
- small-business-ideas-low-investment-india
- types-of-business-structures-in-india
- udyam-msme-registration-guide
- what-is-a-landing-page-and-do-you-need-one
- whatsapp-business-tips-for-small-business
- whatsapp-catalog-setup-guide

Six further blog files (`customer-testimonials-how-to-collect-and-use.html`, `domain-name-tips-for-indian-business.html`, `how-to-check-domain-name-availability-india.html`, `how-to-choose-a-business-name-india.html`, `local-seo-mistakes-indian-businesses-make.html`, `seo-mistakes-new-businesses-make.html`, `website-vs-social-media-only-which-is-enough.html`) show up in the diff only because their "related posts" widget teases one of the 36 fixed posts — their own excerpts were untouched.

**Category: missing alt text — not fixed, see flagged list.** No other SAFE-list categories (broken links, missing canonicals, JSON-LD required fields, orphaned pages, sitemap drift) had genuine issues this cycle.

## Flagged for human review

### Meta description still out of range — fix requires editing a file outside the safe-edit scope (5 items)

These five pages' `<meta name="description">` content is a hardcoded string literal inside `build-pages.mjs` itself (or, for `index.html`, hand-written directly in the file), not in `pages/`, `data/`, or a `tools-data.mjs` metadata field. Per this run's scope rules, generator logic and `index.html` are off-limits for auto-fix, so these were left untouched.

| File | Current length | Suggested next step |
|---|---|---|
| `index.html` | 189 chars | Explicitly flag-only per policy — hand-written, high-risk. A human should manually tighten the `<meta name="description">` on line 10. |
| `pages/best-website-builder-india.html` | 174 chars | `description:` field on the page object at `build-pages.mjs:1655`. Suggested replacement (140–160 chars): "An honest, hands-on comparison of the best website builders for Indian small businesses in 2026: Neweb, Wix, Squarespace, GoDaddy, Shopify, and WordPress." |
| `pages/features.html` | 176 chars | `description:` field near `build-pages.mjs:957-963`. |
| `pages/solutions.html` | 166 chars | `description:` field near `build-pages.mjs:1307`. |
| `pages/templates.html` | 183 chars | `description:` field near `build-pages.mjs:1001-1005`. |

Note: 11 other pages (4 `pages/cities/*.html`, 6 `pages/solutions/*.html` industry pages, `pages/tools/utm-builder.html`) initially looked over 160 chars but only because the raw HTML source counts the `&amp;` entity as 4 characters — the actual rendered/indexed text is within range. No action needed on these.

### Dynamic image preview elements — alt/dimension gaps that can't be safely auto-fixed (3 items, 2 files)

| File | Issue | Why not auto-fixed |
|---|---|---|
| `pages/tools/image-resizer.html` | `#ir-preview` `<img>` has no `alt` attribute and no `width`/`height` | This is a client-side preview element populated at runtime from a user-uploaded image; there is no source file to read real dimensions from, and any `alt` text would be generic rather than genuinely descriptive. The tool's interactive HTML body lives in `tools-data.mjs` (not a clean "metadata field"), so a source-level fix falls outside this run's safe-edit scope. Suggested: add `alt="Uploaded image preview"` in `tools-data.mjs` and let the CSS `max-width`/`max-height` constraints keep handling responsive sizing (no fixed width/height is appropriate here since the aspect ratio is user-controlled). |
| `pages/tools/open-graph-generator.html` | `#og-preview-img` has `alt` already, but no `width`/`height` | Same reasoning — the image is a live OG-preview populated from arbitrary user input; no static dimensions exist to set. Low CLS risk in practice since the element is inside a fixed-aspect preview frame. |

### Ambiguous canonical/indexability on a CSR shell page (1 item)

| File | Issue | Why not auto-fixed |
|---|---|---|
| `pages/blog-post.html` | `<meta name="robots" content="index,follow,...">` but no `<link rel="canonical">`, and the page is explicitly excluded from `sitemap.xml` generation (`SITEMAP_EXCLUDE` in `build-pages.mjs`) | This looks like an inconsistency by design rather than a simple oversight — the generator clearly does not want this shell page indexed as a distinct URL (it's excluded from the sitemap), but the robots meta still says `index,follow` and there's no canonical to point crawlers elsewhere. The correct fix (add `noindex`, or add a canonical, or point it at `/pages/blog`) depends on what this shell page is actually for, which needs a human decision, not a mechanical patch. |

## Other observations (no action needed)

- `pages/admin.html` and `pages/blog-post.html` were flagged by the link-graph orphan scan (not referenced by any nav/hub link on disk), but both are orphaned by design: `admin.html` is `noindex`'d and intentionally kept out of `robots.txt`-allowed crawl paths and public nav (it's an internal admin tool), and `blog-post.html` is a generic CSR template shell, not a page meant to be linked to directly.
- No Core Web Vitals / performance audit was run this cycle (out of scope for this checklist — flagging is the correct handling per policy, no code changes attempted).
- No backlink/off-page/directory listing issues surfaced (not checked this cycle — these require external tools/human action per policy).

## Methodology notes

The audit script initially over-reported two categories of false positives, both corrected before drawing conclusions:
1. **"Broken links"** — the raw regex scan matched `href="/pages/blog/${...}"` JavaScript template literals inside `<script>` blocks (client-side rendering code in `pages/blog.html`) as if they were literal broken hrefs. Fixed by stripping non-JSON-LD `<script>` content before the link/alt scan.
2. **Meta description length** — raw HTML source counts `&amp;` as 4 characters even though it renders/indexes as one `&`. Lengths were recomputed on HTML-entity-decoded text before deciding what was genuinely over 160 characters, which excluded 11 pages that were actually fine.
