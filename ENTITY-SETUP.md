# Neweb — Entity & Knowledge Graph Setup Playbook

The single biggest lever for stopping AI engines (ChatGPT, Perplexity, Google AI
Overviews, Bing Copilot) from confusing **Neweb (neweb.ai, the Indian SaaS)**
with **Neweb Technologies (the Taiwanese hardware firm)** is to create a
machine-readable entity record. This file gives you everything to do it.

---

## IMPORTANT: Wikidata first, not Wikipedia (yet)

**Do not start with a Wikipedia article.** Wikipedia requires "notability":
multiple independent, in-depth secondary sources (major press, not press
releases). A 2024 startup almost always fails this bar, and a premature article
gets flagged and deleted within days, which can also make a later, legitimate
article harder. 

**Wikidata** is the right first move:
- Far lower bar: a real company with an official website and a couple of
  external references qualifies.
- It is the structured database that Google's Knowledge Graph, ChatGPT, and
  Perplexity actually read for entity facts and disambiguation.
- It lets you state, in machine-readable form, "this Neweb is **different from**
  Neweb Technologies" via the `different from (P1889)` property. That property
  is precisely what fixes the brand-collision problem.

Sequence:
1. Wikidata item now (this week).
2. Crunchbase + a clean LinkedIn company page + Google Business Profile.
3. Earn 2-4 independent press mentions (YourStory, Inc42, a product review).
4. THEN consider a Wikipedia draft once notability is real.

---

## PART 1 — Confirmed brand facts (use these verbatim)

| Field | Value |
|---|---|
| Brand name | Neweb |
| Also known as | neweb.ai |
| What it is | Online presence manager / website builder SaaS for Indian small businesses |
| Legal entity | Commerciax Infotech Private Limited |
| Founded | 2024 |
| Founder | Harshit Rajput (Founder) |
| Country | India |
| HQ | 909 Sharan Circle Business Hub, Zundal Circle, Ahmedabad, Gujarat 382421 |
| US office | 30 N Gould St Ste R, Sheridan, WY 82801, USA |
| Website | https://neweb.ai/ |
| LinkedIn | https://www.linkedin.com/company/newebai/ |
| Instagram | https://www.instagram.com/neweb.ai/ |
| Pricing | Starter Rs 249/mo, Growth Rs 1299/mo, Enterprise custom |
| Industry | Software / SaaS / website building |
| NOT | Neweb Technologies (Taiwan, hardware) — a different, unrelated company |

---

## PART 2 — Wikidata item (do this first)

### Step-by-step

1. Create / log in to a Wikidata account: https://www.wikidata.org → "Create account"
   (use a company email so it is traceable; not strictly required).

2. Before creating, SEARCH to confirm no Neweb item already exists:
   https://www.wikidata.org/w/index.php?search=neweb
   - You will likely find "Neweb Technologies" (the Taiwanese firm). Note its
     Q-number (e.g. Qxxxxxxx). You will reference it in the "different from"
     statement below. If you cannot find one, that is fine, skip that one
     statement.

3. Create a new item: https://www.wikidata.org/wiki/Special:NewItem
   - **Label (English):** `Neweb`
   - **Description (English):** `Indian website builder and online presence management SaaS company`
   - (Keep the description distinct from the Taiwanese firm's so reviewers and
     AI engines tell them apart at a glance.)
   - **Also known as (aliases):** `neweb.ai`, `Neweb.ai`, `Commerciax Infotech`

4. Add the following statements (click "add statement", type the property name,
   then the value). Wikidata auto-suggests the P-numbers as you type.

   | Property | Value |
   |---|---|
   | instance of (P31) | `business` (Q4830453) — or `software company` if offered |
   | instance of (P31) | also add `enterprise` if relevant |
   | industry (P452) | `software industry` (Q881100) |
   | inception (P571) | `2024` |
   | country (P17) | `India` (Q668) |
   | headquarters location (P159) | `Ahmedabad` (Q1070) |
   | founded by (P112) | `Harshit Rajput` (create as a new item if needed, see Part 3) |
   | official website (P856) | `https://neweb.ai/` |
   | **different from (P1889)** | **the "Neweb Technologies" Wikidata item (the Q-number from step 2)** |

5. Add external identifiers / reference links (these are how Google and AI
   engines cross-verify the entity). Under statements, add:
   | Property | Value |
   |---|---|
   | LinkedIn company ID (P4264) | `newebai` (the slug from linkedin.com/company/newebai) |
   | Instagram username (P2003) | `neweb.ai` |
   | Crunchbase organization ID (P2088) | add once you create the Crunchbase profile (Part 4) |

6. **Add a reference to every important statement.** Wikidata reviewers remove
   unreferenced claims. For the website/inception/founder statements, click the
   "add reference" link under each and set:
   - `reference URL (P854)` = `https://neweb.ai/pages/about`
   - `retrieved (P813)` = today's date
   This points at your own About page, which now carries Organization + Person
   schema, so the claims are corroborated on-site.

7. Save. The item gets a Q-number (e.g. Q1234567). **Write it down** — you will
   reference it everywhere else.

### The disambiguation that actually matters
The `different from (P1889)` statement linking your item to the Taiwanese
"Neweb Technologies" item is the key fix. When an AI engine resolves "Neweb",
Wikidata now explicitly tells it these are two separate entities. Add the
reciprocal too if you can edit the Taiwanese item: open it, add
`different from (P1889)` → your new Neweb item.

---

## PART 3 — Founder item (Harshit Rajput)

A founder with a Wikidata item strengthens the company entity (the `founded by`
link resolves to a real node instead of a string).

1. Special:NewItem
   - Label: `Harshit Rajput`
   - Description: `Indian entrepreneur, founder of Neweb`
2. Statements:
   | Property | Value |
   |---|---|
   | instance of (P31) | `human` (Q5) |
   | occupation (P106) | `entrepreneur` (Q131524) |
   | country of citizenship (P27) | `India` (Q668) |
   | employer (P108) or founder of via the company's P112 | link to the Neweb item |
3. Reference: `https://neweb.ai/pages/about`.

Note: a founder item is "nice to have," not essential. If reviewers push back on
notability for the person, skip it and keep `founded by` as a plain string value
on the company item.

---

## PART 4 — Supporting profiles (do these alongside Wikidata)

These give Wikidata its references AND independently feed Google's Knowledge
Graph. Keep NAP (name, address, phone) identical across all of them to match the
site exactly.

1. **Crunchbase** (https://www.crunchbase.com/add-new) — free org profile.
   - Name: Neweb. Legal: Commerciax Infotech Private Limited. Founded 2024.
     HQ Ahmedabad. Website neweb.ai. Founder Harshit Rajput. Category: SaaS /
     website builder. Add the LinkedIn + Instagram links.
   - Grab the Crunchbase org ID (the URL slug) and add it to the Wikidata item
     (P2088).

2. **LinkedIn company page** (you already have linkedin.com/company/newebai):
   - Fill the About fully: tagline, "Online presence manager for Indian small
     businesses," founded 2024, website, HQ, industry "Software Development."
     A complete LinkedIn page is a strong Knowledge Graph signal.

3. **Google Business Profile** (https://business.google.com) for the Ahmedabad
   office — needs verification (postcard/phone). Use the exact HQ address. Pick
   primary category "Software company" or "Website designer." This is also your
   single biggest local-SEO lever.

4. **Optional, high value:** a short company entry on **IndiaMART / StartupIndia
   / YourStory's company directory**, and getting listed in any "website builder"
   roundup. Each one is another corroborating source.

---

## PART 5 — On-site reinforcement (already partly done; finish this)

Your homepage + About page already carry Organization schema with `legalName`,
`foundingDate`, `areaServed`, and `sameAs` (LinkedIn + Instagram). Two upgrades
once the external profiles exist:

1. **Expand `sameAs`** in the Organization JSON-LD (in `build-pages.mjs` for
   generated pages and `index.html` / `about.html`) to include the new profiles:
   ```
   "sameAs": [
     "https://www.linkedin.com/company/newebai/",
     "https://www.instagram.com/neweb.ai/",
     "https://www.crunchbase.com/organization/<your-slug>",
     "https://www.wikidata.org/wiki/<your-Q-number>"
   ]
   ```
   Linking your own schema to your Wikidata item closes the loop: the site points
   at Wikidata, Wikidata points at the site, and they corroborate each other.
   (Tell me when you have the Q-number and Crunchbase slug and I will add these
   sitewide and redeploy.)

2. The llms.txt and llms-full.txt already state the disambiguation in prose, which
   AI crawlers read directly. No change needed there.

---

## Priority order (what moves the needle fastest)

1. **Wikidata item + `different from` statement** — this week. Fixes AI confusion.
2. **Crunchbase + complete LinkedIn** — this week. Feeds Knowledge Graph + gives
   Wikidata its references.
3. **Google Business Profile (Ahmedabad)** — start now, verification takes 1-2 weeks.
4. **Add Wikidata Q + Crunchbase to on-site `sameAs`** — 5 minutes once you have
   the IDs (I will do this).
5. **Press / reviews / listicle inclusion** — ongoing; unlocks a real Wikipedia
   article later.

---

## When to revisit Wikipedia

Only after you have 2-4 pieces of **independent, substantial** coverage:
- A feature or profile in YourStory, Inc42, Economic Times, or similar (not a
  press release, not a sponsored post).
- An independent review on a recognised software-review site.
- Coverage that discusses the company in depth, written by someone unaffiliated.

At that point, draft the article in your Wikipedia sandbox, cite those sources,
and submit through Articles for Creation (AfC). Until then, Wikidata + the
supporting profiles do the entity-resolution job without the deletion risk.
