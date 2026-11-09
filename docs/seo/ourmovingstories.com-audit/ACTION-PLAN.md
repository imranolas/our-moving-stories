# SEO action plan: ourmovingstories.com

Ordered around the Cloudflare cutover (docs/redesign/HANDOFF.md → "First deploy and cutover"). Don't spend time
fixing LIVE: almost everything wrong with it disappears at cutover. Code and copy for each item are in the
`findings/*.md` file named in the **Where** column.

Each item gives:
- **Why:** the principle it rests on.
- **Check:** how you'd know it didn't work.
- **Needs:** the items it depends on, when there are any.

## Progress (9 Nov 2026)

Code for Phase 1 is done and checked on a production build (`astro preview`, Visual Editing off).
- **1.2 Done:** real 404s.
- **1.3 Done:** new sitemap. It lists 14 URLs once 1.1 is done, and 10 today.
- **1.4 Done, except HTML caching:** middleware for security headers, preview/`workers.dev` noindex and the
  trailing-slash 301. HTML caching is left to 3.3.
- **1.5 Done (code side):** `fullTitle` override, H1 on text pages, `/events` and `/sessions` titles and
  descriptions, event descriptions built from the data, people descriptions clipped to 155 characters.
- **1.6 Done:** default share image (`web/public/img/og-default.jpg`) and `og:locale`.
- **Past events (the decision below):** they now get `noindex, follow` and stay out of the sitemap.
- **Also fixed: a homepage crash in production.** Published events with no `sessions` came back as `null`,
  which crashed the homepage after the nav and sent `/events` to the 404 page. Dev never showed it because it
  reads drafts.

**Waiting on Sanity writes** (yours to run, since `production` writes need you):
- **1.1:** publish the step-2a drafts. Until then people pages and 6 events 404 in production.
- **1.5 copy:** run `studio/scripts/seed-seo.ts`, and redeploy Studio for the new "SEO title" field.
- **1.7:** confirm the Open Havelock postcode with the venue.
- **1.8:** fill in the current events' content.

## Phase 1: Before cutover (blockers), week 1

| # | Action | Where | Why | Check |
|---|---|---|---|---|
| 1.1 | **Publish the step-2a drafts.** That's 5 people and 6 events whose slugs exist only as drafts, plus the `nav` draft. Then re-run `seed-redesign.ts`. Also decide on the Safeguarding body edit and the orphaned `peopleSection` draft. | Sanity Studio (`production`); HANDOFF step 2a | The production Worker reads published content only. Today 0/5 people and 7/13 events have a published slug, so 10 URLs would go to the 404 page. | This published-only query returns 5/5 and 13/13: `*[_type in ["person","event"] && !defined(slug.current)]` returns `[]` |
| 1.2 | **Return a real 404:** `Astro.response.status = 404; return Astro.rewrite("/404")` instead of `Astro.redirect("/404")`. | `pages/[...slug].astro`, `events/[slug].astro`, `people/[slug].astro` (findings/technical.md) | Search engines read the status code, not the page. A 302 to a 404 page looks like a temporary move. | On the **built** Worker (not dev), `curl -sI <workers.dev>/nope` shows `404` and no `location:` |
| 1.3 | **Replace the sitemap** with the version in findings/technical.md, adjusted per the decision note below (events with no upcoming dates left out). | `pages/sitemap.xml.ts` | Discovery: 18 of 21 URLs are missing today. | Every `<loc>` returns 200 with no redirect; `/people` and drafts aren't listed |
| 1.4 | **Add `src/middleware.ts`** to set: security headers; `X-Robots-Tag: noindex` on preview and `*.workers.dev` hosts; a trailing-slash 301 (and set `trailingSlash: "never"`); and `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=3600` on 200 HTML in production only. | `web/src/middleware.ts`, `astro.config.mjs` (findings/technical.md) | Stops preview copies being indexed as duplicates. Edge caching makes crawl bursts cheap and TTFB stable. | `curl -sI` the preview URL shows `x-robots-tag: noindex`; `/events/` → 301 → `/events`; production HTML has `cache-control` |
| 1.5 | **Titles, descriptions, H1s:** homepage title without the suffix; fill `description` on all 3 `page` docs; rewrite the 6 boilerplate event descriptions; trim people descriptions to 155 characters or less; let `TextSection` render an `<h1>` for the first section of text pages. | `Layout.astro` (`fullTitle` override), `TextSection.astro`, Sanity `page.description`, `event.summary` (copy table in findings/content.md) | The title and description are the snippet. "Home · Our Moving Stories" uses the most valuable title on the site for nothing. | No two URLs share a description; every page has exactly one `<h1>` |
| 1.6 | **Add a default `og:image`** (1200×630, absolute URL) and `og:locale=en_GB`. | `Layout.astro`, `web/public/img/og-default.jpg` | Shares on WhatsApp and Facebook are how parents pass this on. Today 5 pages share without an image. | The sharing debugger shows an image for `/`, `/events`, `/sessions` |
| 1.7 | **Fix venue data:** confirm the Open Havelock postcode with the venue (Sanity has UB2 4RH; Eventbrite reportedly has 4RP, and Peabody and Ealing Council too). Fill `address1` (Willowbrook Road), set the city to Southall, and trim "London " at Westcott Park. | Sanity `venue` docs; Eventbrite venue record | Inconsistent addresses weaken local trust signals, and event markup must not publish a wrong address. | Site, Eventbrite and partner pages show the same address |
| 1.8 | **Fill the current events:** `description`, `audience` ("Babies and toddlers 0–5 with their grown-ups"), `info` rows and "who leads" for Move and Make 2026/27, Story Space and the Winter Together dates. Move the "what happens in a session" copy from the 2024/25 pages onto the current one. | Sanity `event` docs (HANDOFF step 3 to-dos) | These are the pages that can rank for class searches, and today they're thinner than the Eventbrite listing (81–127 words). | Each current event page has 250+ useful words and answers age, cost, what happens and how to book |

### Decision: what happens to past-event pages

The technical pass said to keep them in the sitemap; the content and SXO passes said to drop them. **My
recommendation:** an event with no future sessions gets `noindex, follow` and stays out of the sitemap. Its page
should carry a prominent "This programme continues → [current season]" link.
- **Why:** a parent landing on "No upcoming dates" is a dead end, and two 2024/25 Move and Make pages are near
  copies of each other.
- **Trade-off:** you lose track-record pages in search. They still exist for people and funders.
- **Longer-term fix:** item 4.1. One evergreen page per programme removes the problem.

## Phase 2: Cutover day

**Needs:** Phase 1.

| # | Action | Where | Check |
|---|---|---|---|
| 2.1 | Run PageSpeed and spot-check all sitemap URLs on the production `workers.dev` URL **before** moving DNS. Confirm a request without the draft-mode cookie gets no drafts (draft mode is per request now; see HANDOFF → Draft mode). | `npx cf deploy` output | No drafts or Visual Editing script in the production HTML; every sitemap URL returns 200 |
| 2.2 | Add one Cloudflare Redirect Rule: `www.*` → `https://ourmovingstories.com/$1`, 301, keep the query string. Keep "Always Use HTTPS" on, so `http://www` takes one hop. SSL should be Full (strict). | Cloudflare dashboard | `curl -sIL http://www.ourmovingstories.com` shows one 301, then 200 |
| 2.3 | Turn off Scrape Shield → Email Address Obfuscation, or wrap the address in `<!--email_off-->`. Check "Block AI bots", AI Crawl Control and managed robots.txt are set the way you intend. | Cloudflare dashboard / `Footer.astro` | `curl -s https://ourmovingstories.com/ \| grep hello@` finds the address; `/robots.txt` is the file from `web/public` |
| 2.4 | Keep the DNS switch short: remove the Netlify `@`/`www` records, then `npx cf deploy` straight away. Then purge everything in the Cloudflare cache. | HANDOFF step 8 | No 52x errors for more than a few minutes |
| 2.5 | **Search Console:** add the Domain property (DNS TXT), submit `/sitemap.xml`, run URL Inspection and request indexing for `/`, `/events`, `/sessions` and 2–3 current event pages. Import into Bing Webmaster Tools. Add the plugin's service account if you want future audits to use GSC data. | search.google.com/search-console | The sitemap shows "Success" with the expected URL count |
| 2.6 | Keep Netlify connected for 48 hours as a rollback, then disconnect. | Netlify | GSC Pages report shows no spike in 404 or soft-404 errors |

## Phase 3: High-impact improvements, weeks 2–3

| # | Action | Where | Why | Check |
|---|---|---|---|---|
| 3.1 | **JSON-LD:** `NGO` + `WebSite` sitewide, `Event` per future session (with `EventCancelled` and free `Offer`), `ProfilePage`/`Person`, `BreadcrumbList`. **Needs:** 1.7 for address data; add a logo file. | `web/src/lib/schema.ts`, `Layout.astro` `schema` prop (findings/schema.md) | Event results are the one SERP feature this site is clearly eligible for, and Organization data gives the brand an entity. | Rich Results Test passes on 2 event pages; the GSC "Events" report shows valid items within 2–3 weeks |
| 3.2 | **Analytics:** turn on Cloudflare Web Analytics (free, no cookies, domain already on Cloudflare), or create GA4 and tag `Layout.astro`. | Cloudflare dashboard or `Layout.astro` | Neither site has any analytics, so nothing in this plan can be measured otherwise. | Visits show up within a day |
| 3.3 | **Speed up SSR:** fetch nav, footer, settings and events once per page in `Promise.all`, or add a short module-level cache. Add an HTML edge-cache rule and purge it from the Sanity/Eventbrite sync. | Page frontmatter, `lib/`, Cloudflare Cache Rules (findings/performance.md) | TTFB is part of LCP, and today there are 4–6 serial Sanity round trips per view. | PageSpeed TTFB under 200 ms on a repeat view |
| 3.4 | **Hero video:** re-cut the tall version at 540×960 (~1.5–2 MB, already on the HANDOFF list); skip video on Save-Data or slow connections for portrait too; preload the right poster per orientation so phones don't fetch both. | `Hero.astro`, `web/public/video/` | 5.1 MB on every portrait phone, including data-saver ones. Parents on mobile data are the audience. | DevTools on a phone profile: ≤2 MB of video, one poster |
| 3.5 | **Fonts:** self-host (Astro fonts or `@fontsource-variable`), preload the display and body woff2, add metric-adjusted fallbacks, drop unused weights. | `Layout.astro`, `tailwind.css` | Removes a render-blocking cross-origin CSS fetch and the font-swap reflow on the huge headline. | No requests to `fonts.googleapis.com`; CLS stays under 0.1 |
| 3.6 | Add `web/public/_headers` (`/video/*`, `/img/*` long `max-age`); reserve height for the Instagram grid; `srcset`/`sizes` for Sanity images; eager-load the first 2–4 event thumbnails; bundle Alpine locally; delete unused `public/img` files. | findings/performance.md, findings/images.md | Cheap wins on CLS, bytes and third-party risk. | PageSpeed mobile ≥90 and CLS <0.1 on `/`, `/events`, `/sessions` |
| 3.7 | Server-filter `/sessions` to upcoming dates by default and add `<time datetime>`. Fix the duplicate "Main navigation" labels. | `pages/sessions/index.astro`, `Nav.astro` | Crawlers that don't run JavaScript, and AI agents, currently see 2024 sessions first. | Raw HTML of `/sessions` starts with the next upcoming date |
| 3.8 | Put a "Book a free session" CTA in the mobile first screen on `/`. Raise nav, label and footer text to 14 px or more, and tap targets to 44 px or more. Swap the Community Fund logo for its colour version. | `Hero.astro`, `Nav.astro`, `Footer.astro`, Sanity `footer.funders` | The homepage is the brand-search landing page, and the next step should be visible without scrolling. | 390 px screenshot shows the CTA above the fold |

## Phase 4: Content and authority, month 2

| # | Action | Where | Why | Check |
|---|---|---|---|---|
| 4.1 | **Evergreen programme pages:** one stable URL per programme (e.g. `/move-and-make`, `/story-space`) that always shows the current season's dates and keeps past seasons as history. Decide how this fits the Eventbrite sync, which creates a new event doc per season (e.g. a `programme` reference on `event`). | Studio schema + new page (findings/sxo.md M5, findings/content.md) | Links and rankings build up on one URL instead of resetting every season. This is how the Peabody page outranks OMS. | The programme URL ranks for "move and make southall" within ~2 months |
| 4.2 | **Get listed where parents search:** Happity, Hoop, Ealing Family Information Service and what's-on, NHS.uk service directory (if eligible), Peabody community listings, library and children's-centre pages. Use the same name everywhere ("Our Moving Stories CIC") and link to the event or programme page. | Off-site | Listing sites own every class search checked. This is the fastest route to bookings and also earns links. | Listings live; referral visits in analytics (3.2) |
| 4.3 | **Links you already deserve:** website link in the Eventbrite organiser profile and every event description, the Instagram bio, funder grantee pages (National Lottery, London Sport, Ealing Council, Peabody), venue sites. Link the funder logos in the footer. | Eventbrite, Instagram, `Footer.astro` | The site has no verifiable inbound links. A realistic goal is 5–15 relevant referring domains in a year. | GSC Links report shows new referring domains |
| 4.4 | **Google Business Profile, only if eligible.** Google rules out "an ongoing service, class, or meeting at a location that you don't own", so there is **no profile at a venue's address**. The one legitimate route: a service-area profile for the work OMS delivers *at clients' sites* (schools, community groups), verified from a real address that is then hidden (no virtual office or PO box), with service areas Ealing, Southall, Acton. Expect video verification. If that doesn't fit, skip it and rely on Event markup (3.1), venue listings and Happity. | business.google.com (findings/local.md) | Brand searches and a place for Google reviews. Venue sessions reach Maps and location searches through Event markup and the venues' own profiles instead. | Profile verified; shows for brand search |
| 4.5 | **Homepage and About copy:** say plainly "free dance, movement and art sessions for babies, toddlers and their grown-ups in Southall and Ealing". Use one age phrase everywhere. Add a short "What happens at a session?" block and real section headings. | Sanity `hero`, `textSection` (findings/geo.md, findings/content.md) | Matches the words parents type and gives AI answers a clean passage to quote. | Brand and "baby dance southall" searches show the site; AI answers cite it |
| 4.6 | **Venue pages** (3 only): getting there, buggy access, indoor or outdoor, what to bring, photos, live sessions, partner link. | New `pages/venues/[slug].astro` from Sanity `venue` (findings/local.md) | Unique local content without doorway risk. | Each page would fail the "swap the venue name" test, so it's genuinely venue-specific |
| 4.7 | **Trust signals:** testimonials with attribution (first name, area, programme) and photos where consented; safeguarding policy updated to current legislation with a review date and a named lead; "who leads" on event pages. | Sanity `page` (testimonials, safeguarding), `event` | Parents and funders both check credibility; this is E-E-A-T for a children's organisation. | Policy shows a 2026 review date |

## Phase 5: Monitoring (ongoing)

Things to watch without re-running the audit:
- **Weekly, first month:** GSC Pages report (indexed count heading toward the sitemap count; no soft-404 or
  "page with redirect" entries), Events rich-result report, Sitemaps status.
- **Monthly:**
  - Impressions for the brand query and for "baby", "toddler" + Southall or Ealing queries.
  - Clicks to Eventbrite (UTM-tag the "Book" links).
  - Referral visits from listing sites.
- **After launch:** capture a drift baseline of the new site (`/seo drift baseline https://ourmovingstories.com`)
  so later changes to titles, canonicals or schema are caught.
- **Field data:** CrUX will stay empty until traffic grows. Rely on Cloudflare Web Analytics' Web Vitals until then.

## Dependency order (short version)

1.1 (publish drafts) → 1.3 (sitemap) → 2.5 (submit sitemap).
1.7 (venue data) → 3.1 (Event markup).
1.2, 1.4 → 2.1 (test on `workers.dev`) → 2.2–2.4 (DNS) → 2.5.
3.2 (analytics) comes before anything in Phase 4 that you want to measure.
4.1 (programme pages) changes the sitemap and the past-events rule. Revisit 1.3 when it ships.
