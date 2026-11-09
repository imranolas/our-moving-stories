# SEO audit: ourmovingstories.com, live site vs. redesign

9 Nov 2026. Two targets: **LIVE**, the old Astro 4 build on Netlify reading Sanity `staging`, and **LOCAL**, the
redesign (Astro 7 on Cloudflare Workers, Sanity `production`), audited on `astro dev` at `localhost:4321`.
Eleven specialist passes were run. Their detail, evidence and code are in `findings/*.md`, and the shared brief
is in `CONTEXT.md`. The prioritised to-do list, ordered around the Cloudflare cutover, is in `ACTION-PLAN.md`.

**Business type:** local, non-profit, event-based (Our Moving Stories CIC 14473202). It runs free dance, art and
movement sessions for under-5s and carers at partner venues in Southall and Ealing, booked through Eventbrite.
There is no storefront.

## SEO Health Score

| Category (weight) | LIVE | LOCAL today | Source |
|---|---|---|---|
| Technical SEO (22%) | 22 | 66 | findings/technical.md |
| Content quality (23%) | 38 | 56 | findings/content.md |
| On-page SEO (20%) | 18 | 62 | findings/content.md |
| Schema / structured data (10%) | 0 | 0 | findings/schema.md |
| Performance / CWV (10%) | 68 | 66* | findings/performance.md |
| AI search readiness (10%) | 39 | 60 | findings/geo.md (34 / 51), findings/agentic.md (~45 / ~80) |
| Images (5%) | 38 | 76 | findings/images.md |
| **Weighted total** | **30 / 100** | **56 / 100** | |

\* LOCAL performance is a code review, not a measurement. The dev server can't be measured meaningfully.

**Important qualifier on LOCAL's 56.** It was audited with Visual Editing on, so it rendered Sanity **drafts**.
Deployed today, the production Worker reads **published** content. Checked against Sanity, 0 of 5 people and
6 of 13 events have a published slug, so 10 of the redesign's URLs would go to the 404 page on day one
(HANDOFF step 2a). Once the Phase 1–2 fixes in the action plan are done, LOCAL should land around **80**
(estimate).

Supplementary scores (not in the weighted total): Local SEO 22 → 34, Search experience (SXO) 21 → 52,
Visual/mobile 48 → 82. Backlinks: no score possible. Common Crawl has the domain but no rank, and no
referring domain could be verified. Google field data: none. CrUX reports insufficient traffic, and the plugin's
service account has no Search Console access to this domain (findings/google.md).

## Executive summary

The live site is close to invisible to search engines, and the redesign fixes most of the reasons why.
- **Live site:**
  - Every unknown URL, including `/robots.txt` and `/sitemap.xml`, returns an empty `200`.
  - Every page's meta description is the Astro boilerplate "Astro description".
  - Titles are just "Home" or "Testimonials".
  - Event dates render as "Invalid DateTime", and "What's On" lists only ended events.
  - The SXO pass found the site **doesn't appear even for its own brand name** (the search wasn't run from a UK
    location, so confirm with a UK search).
- **The redesign already fixes:**
  - Real titles, canonicals, Open Graph tags and a robots.txt.
  - One H1 on the homepage.
  - Working event pages with "Book free on Eventbrite" above the fold on mobile.
  - Alt text throughout.
  - About 22 crawlable URLs instead of 3.

The redesign still has four gaps that matter for search, plus cutover hygiene:
1. **Content readiness in Sanity:** unpublished slugs (above), plus empty event `description`, `audience` and
   `info` fields. As a result, the current flagship page (Move and Make 2026/27) is 114 words and the useful copy
   sits on past-season pages.
2. **Status codes and discovery:** unknown URLs `302 → /404` instead of returning 404. The sitemap lists 3 of 22
   URLs.
3. **No structured data:** no Organization, Event or Person markup. Event markup is this site's best shot at
   visibility in Google's event listings.
4. **Local wording:** the homepage never says "baby", "toddler" or "Southall" together with dance. The homepage
   title is "Home · Our Moving Stories".

The most important strategic point comes from the SXO pass: **listing sites own the class searches.** Searches
like "free baby classes Southall" and "stay and play Southall" are won by Happity, Hoop, NHS.uk, council and
library pages, Eventbrite and Peabody. A short Peabody page about Move and Make ranks where OMS doesn't. Getting
OMS sessions listed there, with links back, will bring more bookings sooner than any on-site change.

### Top 5 critical issues

| # | Issue | Target | Fix |
|---|---|---|---|
| 1 | 10 redesign URLs (all people, 6 events) have no published slug in `production`, so they 404 once deployed | LOCAL | Publish the step-2a drafts, re-run the seed (HANDOFF step 2a) |
| 2 | Unknown URLs `302 → /404` instead of a real 404 | LOCAL | `Astro.rewrite("/404")` + status 404 in `[...slug].astro`, `events/[slug].astro`, `people/[slug].astro` |
| 3 | Sitemap lists 3 of 22 URLs | LOCAL | Replace `web/src/pages/sitemap.xml.ts` (code in findings/technical.md) |
| 4 | No JSON-LD anywhere: no Event rich results, no entity for the brand | BOTH | `web/src/lib/schema.ts` + `schema` prop on `Layout.astro` (code in findings/schema.md) |
| 5 | Empty `200`s for every unknown URL, no robots/sitemap, "Astro description" everywhere | LIVE | Don't patch Netlify; the cutover replaces it. Don't delay the cutover for SEO reasons |

### Top 5 quick wins (under an hour each)

| # | Win | Where |
|---|---|---|
| 1 | Homepage title "Our Moving Stories: Free Baby & Toddler Dance and Art, Southall", without the "· Our Moving Stories" suffix | `Layout.astro` `fullTitle` override; Sanity `page` (index) |
| 2 | Fill `description` on the three Sanity `page` docs and give `/testimonials` and `/safeguarding-policy` a real `<h1>` | Sanity `page.description`; `TextSection.astro` (allow h1) |
| 3 | Default `og:image` (1200×630) and `og:locale=en_GB` | `Layout.astro` |
| 4 | Link the funder/partner logos in the footer, and ask each funder for a link back | `Footer.astro` |
| 5 | Put a real link to the site in the Eventbrite organiser profile, every event description and the Instagram bio | Eventbrite, Instagram (off-site) |

## Technical SEO: LIVE 22, LOCAL 66

- **LIVE:**
  - Every path returns `200 text/html` with an empty body, including `/robots.txt` and `/sitemap.xml`. That makes
    every unknown URL a soft 404, and there is no sitemap.
  - `http://www` takes 2 hops to reach the apex.
  - Only HSTS and nosniff are set.
- **LOCAL fixes:** a real `robots.txt`, absolute canonicals, `lang="en-GB"`, and all primary content in the server
  HTML. Only the Instagram feed is client-side.
- **LOCAL still wrong:**
  - **Critical:** the 302→`/404` pattern.
  - **High:**
    - No security headers at all. There is no middleware and no `_headers`, and `_headers` wouldn't cover SSR
      responses anyway.
    - No HTML `Cache-Control`.
    - Nothing stops the `workers.dev` and preview hosts being indexed.
  - **Medium:**
    - Trailing-slash duplicates (`/events/` returns 200, and its canonical keeps the slash).
    - Alpine comes from jsDelivr without SRI.
    - Duplicate "copy" files ship in `public/img`.
- **Sitemap:** LIVE 0, LOCAL 45. The redesign's sitemap lists only the three `page` docs. findings/technical.md has
  a corrected, draft-safe version (escaping, hub lastmod, cache header). See the note in ACTION-PLAN.md on
  whether past events belong in it.
- A middleware sketch (security headers, slash redirect, preview noindex, cache header) and the full cutover
  checklist are in findings/technical.md.

## Content quality: LIVE 38, LOCAL 56 · On-page: LIVE 18, LOCAL 62

- **LIVE:** "Astro description" on every page, five H1s on the homepage, dates broken, What's On full of ended
  events, and the template-variable Instagram link.
- **LOCAL:**
  - **Strong:** the hero ("Free movement, art & community events across Ealing"), the pillar rows (Always free,
    Little ones & grown-ups), real team bios with credentials, and event pages that answer when, where, free and
    how to book.
  - **Gaps:**
    - **Thin flagship page:** the current-season Move and Make page is 114 words with an empty `description`.
      The good "what happens in a session" copy only exists on past 2024/25 pages, and two of those are
      near-duplicates.
    - **Weak local wording:** "baby", "toddler" and "Southall" don't appear together anywhere crawlable. Age
      wording is inconsistent ("under-5s", "0–5", "All ages").
    - **Meta descriptions:** the default is used on home, testimonials and safeguarding. Six events have the
      boilerplate "{name} with Our Moving Stories.", and people descriptions run 199–273 characters.
    - **Headings:** no H1 on `/testimonials` or `/safeguarding-policy`, because `TextSection.astro` always
      renders an h2.
    - **Trust:** the two testimonials are anonymous. The safeguarding policy cites outdated legislation and has
      no review date. Event pages don't say who leads the session.
- findings/content.md has a title and meta description for every LOCAL URL, each mapped to its Sanity field or
  file.

## Schema / structured data: LIVE 0, LOCAL 0

Neither target has JSON-LD, but LOCAL's data model is ready for it, so this is a small build. findings/schema.md
has:
- **The design:**
  - A sitewide `@graph`: `NGO` + `WebSite`, with `legalName`, CIC number, `areaServed` (Ealing, Southall),
    `founder` and `sameAs`.
  - One `Event` per future session on event pages:
    - per-date Europe/London offsets, tested across the BST change;
    - `EventCancelled` for cancelled sessions;
    - free `Offer` with the Eventbrite URL;
    - a `Place` with `PostalAddress`;
    - `PeopleAudience`.
  - An optional `EventSeries` per multi-session event.
  - `ProfilePage` + `Person` on people pages, with no email.
  - `BreadcrumbList`.
- **The code:** a builder (`web/src/lib/schema.ts`), the Layout prop and page snippets.
- **Data gaps to fix first:**
  - Open Havelock has no `address1`.
  - Westcott Park's city is stored as "London " with a trailing space.
  - There's no logo file in `web/public`.
  - The Open Havelock postcode is unresolved (see Local).

## Performance: LIVE 68, LOCAL 66 (code review)

- **LIVE (PageSpeed lab):**
  - `/` scores 90 on mobile and 86 on desktop. LCP is 1.6 s on mobile.
  - **CLS fails on mobile:** 0.151 on `/` and 0.182 on `/testimonials`.
  - The homepage transfers 7.1 MB because four gallery photos are served as unresized Sanity originals.
- **LOCAL, from source:**
  - **High:**
    - Nothing is cached, and nothing is prerendered.
    - Nav, Footer, Hero and the page each `await` Sanity in sequence, a waterfall of about 4–6 round trips.
    - Google Fonts is a render-blocking stylesheet (3 families, 8 weights) with no fallback metrics.
    - **Hero video:** every portrait phone gets `hero-tall.mp4` (5.1 MB, 1080×1920). That's larger than the
      720p wide file, and data-saver mode is ignored on that path. Phones may also download both posters.
      HANDOFF already says the tall cut needs redoing, so do the re-cut at 540×960 (~1.5–2 MB).
  - **Medium:**
    - No `_headers` for long-lived caching of `/video/*` and `/img/*`.
    - The Instagram feed shifts layout when it arrives.
    - Sanity images have no `srcset`.
    - Above-the-fold event thumbnails are `loading="lazy"`.
- **Re-measure after deploy:** run PageSpeed on the `workers.dev` URL before the DNS switch.

## AI search readiness: LIVE 39, LOCAL 60

- **Crawler access:** every AI and search bot is allowed on both targets.
- **Cloudflare (cutover risks):**
  - **Email obfuscation** is on for the zone. Crawlers already see `[email protected]` on LIVE, and it will
    probably rewrite the redesign's footer mailto too.
  - **AI crawl settings:** "Block AI bots", AI Crawl Control and the managed robots.txt could change crawler
    access during the Worker setup. Check them at cutover.
- **Citability:** no passage answers "free baby and toddler dance classes in Southall". "Is it free?" and "Who runs
  it?" are answered well on LOCAL.
- **`/sessions`:** crawlers that don't run JavaScript see 2024 sessions first, because the "upcoming only" filter
  runs in the browser. Server-filter upcoming sessions and add `<time datetime>`.
- **Entity:** Companies House confirms the CIC. There's no Wikidata entry and no structured data.
- **Agent readiness:**
  - **Good:** LOCAL's `/sessions` has labelled, server-rendered controls and the booking links work.
  - **Fixes:** the two `<nav>` elements are both labelled "Main navigation".
  - **Not worth doing:** llms.txt, WebMCP and ai-catalog.json.

## Images: LIVE 38, LOCAL 76

- **LIVE:**
  - 4 gallery photos have no `alt`.
  - Those photos are unresized originals.
  - No page has an `og:image`.
- **LOCAL:**
  - **Good:** alt coverage is complete, and Sanity images are requested at fixed sizes with `auto=format`.
  - **Gaps:**
    - No `og:image` on `/`, `/events`, `/sessions`, `/testimonials` or `/safeguarding-policy`.
    - No `srcset`.
    - Funder logos are missing `auto=format` and a `width`.
    - About 2.5 MB of unused files in `web/public/img`.
- **Visual note:** the National Lottery Community Fund logo is white on a cream chip and nearly invisible. Upload
  the colour version in Sanity.

## Local SEO: LIVE 22, LOCAL 34

- **Business model:** a hybrid, service-area business that uses partner venues. So: `Organization`/`NGO`, not
  `LocalBusiness`, and no venue address as the business address.
- **Google Business Profile:**
  - None exists.
  - A hidden-address service-area profile is worth trying, if it can be verified.
  - Choose one category carefully ("Arts organization" is the safe one).
- **Open Havelock postcode is unresolved:**
  - Sanity has **UB2 4RH**.
  - Eventbrite has **UB2 4RP**, and the SXO pass reports Peabody and Ealing Council listing 4RP too.
  - The local pass found the 4RH postcode centroid sits on Willowbrook Road and 4RP about 200 m north.
  - **Ask the venue**, then fix Sanity or Eventbrite. Don't publish address schema until it's settled.
- **Venue pages:** add three (Open Havelock, Westcott Park, Windmill Park), each with real getting-there, access and
  what-to-bring details plus live sessions. Skip "classes in {area}" pages, which would be doorway pages.
- **Citations to claim:**
  - Ealing Family Information Service / what's-on.
  - Happity and Hoop listings.
  - NHS.uk service directory (if eligible).
  - Peabody community listings.
  - Funder grantee pages.

## Search experience (SXO): LIVE 21, LOCAL 52

- **Class searches:** results are local listing pages and event-detail pages.
  - LOCAL has the right page types (`/events`, event pages).
  - But `/events`' title and opening copy don't say free, ages, toddler or Southall.
- **Seasonal URLs:** Move and Make is spread across six seasonal pages.
  - Past seasons say "No upcoming dates" while the programme runs this Wednesday.
  - So a page that earns links or rankings in one season loses them the next.
  - The structural fix is one **evergreen page per programme** that stays put across seasons (see ACTION-PLAN.md).
- **Persona scores (LOCAL):**

  | Persona | Score |
  |---|---|
  | Parent | 66 |
  | Funder | 57 |
  | Venue / partner | 52 |
  | Returning parent | 48 |

## Visual / mobile: LIVE 48, LOCAL 82

- **LIVE:**
  - The mobile first screen says only "Community - Arts - Creativity" and SUBSCRIBE.
  - Tap targets are small.
  - The Instagram section is empty.
- **LOCAL:**
  - The hero communicates free, Ealing and families immediately. Event pages are excellent on mobile.
  - **Gaps:**
    - No booking button in the mobile first screen on `/`. "See what's on" starts about 1,070 px down
      (`Hero.astro`).
    - Nav, label and footer text is 12–13 px.
    - Several tap targets are under 44 px.
    - `/sessions` shows desktop CLS of 0.41 in dev. Re-measure it on a build.
  - The Beehiiv newsletter iframe rendered blank in headless Chrome on both targets. Check it in a real browser.
- Screenshots: `screenshots/live/`, `screenshots/local/`. The dark pill in LOCAL captures is the Astro dev toolbar.
- **Correction:** the visual pass reported blank funder logos as a cutover blocker. That was a lazy-loading
  artifact of full-page capture. I re-checked: the logos render, and findings/visual.md is corrected.

## Data limits

- **No Search Console data.** The plugin's service account only has access to southbankart.co.uk. Verify
  `sc-domain:ourmovingstories.com` (DNS TXT in Cloudflare), then add
  `claude-seo@adloop-493408.iam.gserviceaccount.com`. That unlocks queries, indexed URLs and a real redirect map.
- **No CrUX field data:** insufficient traffic. No GA4 property, and no analytics tag on either target.
- **SERP checks weren't geo-located to the UK.**
- **Instagram bio and some directories were behind logins or 403s.**
- **Backlinks:** no Moz or Bing API keys, so there is no backlink inventory.
