# Content quality and on-page SEO: ourmovingstories.com (9 Nov 2026)

Scope: the 3 LIVE pages; 23 LOCAL URLs fetched from `localhost:4321` (dev, **drafts perspective**); read-only
Sanity CLI queries on `production` (published perspective); source in `web/src` and `studio/schemas`.
Word counts are text inside `<main>` and include template chrome. Readability scores use an approximate syllable
counter. Items marked **[unverified]** were not confirmed against a primary source.

## Scores

| | LIVE | LOCAL |
|---|---|---|
| **Content Quality** | **38 / 100** | **56 / 100** |
| **On-Page SEO** | **18 / 100** | **62 / 100** |
| E-E-A-T (weighted) | 45 | 57 |
| · Experience (20%) | 40: 2 anonymous testimonials, flyers rather than photos | 55: hero video "Filmed at our sessions", same 2 testimonials, still flyers |
| · Expertise (25%) | 60: full team bios with credentials on the homepage | 62: person pages and qualification lists, but event pages don't say who leads |
| · Authoritativeness (25%) | 40: funder logos, CIC number | 48: funder logos plus "In partnership with Peabody & Ealing Council · Supported by National Lottery & London Sport" |
| · Trustworthiness (30%) | 40: "Invalid DateTime", stale What's On, broken link | 62: accurate dates and clear "Free"; safeguarding policy dated, postcode doubtful |
| AI citation readiness | 15 | 35 |

Templated-metadata check (`metadata_template.py`, pairs from all fetched URLs): **site_risk `low`, templated_ratio
0.0, no shared CTA phrases** on both targets. The script misses plain duplication, so it was counted by hand
(see O1 and O3).

---

## Content Quality findings

### C1. High (LOCAL): the current flagship event page is thin, while past pages hold the best copy
- `/events/move-and-make-open-havelock-2026-27` has 114 words. The "About this event" section is empty
  (`description` is null in Sanity) and there is no audience tag. It is the next session on the homepage
  and the main booking target.
- The session run-down ("Arrive 9.30, Movement 10.00, Refreshment break, Arts & crafts 10.40, Goodbye song 11.15",
  "accessible ground-floor space", "baby changing", "tea/coffee provided", "led by Gabriela Bolton and Sarah
  Sulemanji") appears only on the past pages `move-and-make-autumn-winter-2024` and `move-and-make-winter-spring-2025`.
- `story-space` (80 words) and all three `winter-together-*` pages (74–84 words) also have no description.
- **Fix (Sanity, event docs `event-eb-2002907813186`, `event-eb-2003451709996`, `event-eb-2004289*`):** fill in
  `description`, set `audience` ("Under-5s + grown-ups", "Ages 2–6 + grown-ups", "All ages"), and add `info`
  rows: Ages / Do I need to book? / What happens / Accessibility / Who leads. The Eventbrite sync never touches
  `description`, `audience` or `info` (`packages/eventbrite-sync/src/index.ts` header), so these edits are safe.

### C2. High (LOCAL; LIVE worse): copy doesn't match what West London parents search for
- On the LOCAL homepage, "baby", "toddler" and "stay and play" appear 0 times, "under-5s" once, "Southall" twice
  and "Ealing" 3 times. "West London" appears only in the meta description. On LIVE, ages are never mentioned
  on the homepage and "Free" appears only as price badges.
- Answers to a parent's questions:

| Question | LIVE home | LOCAL home | LOCAL M&M 2026/27 | LOCAL Story Space | LOCAL Winter Together |
|---|---|---|---|---|---|
| Free? | badge only | yes (badge, "Always free") | yes | yes | yes |
| What age? | no | "under-5s" once | summary "0-5" | summary "2–6" | **no** |
| Where? | address, no postcode for some | venue names | yes + map | yes + map | yes + map |
| When? | broken ("Invalid DateTime") | yes | yes | yes | yes |
| How to book? | Eventbrite links | via event pages | "Book free on Eventbrite" | yes | yes |
| What happens in a session? | no | pillars only | **no** | one line | one line |
| Who leads / is it safe? | bios | team section | **no** | **no** | **no** |

- **Fix:** add a short FAQ-style block to the homepage covering these questions, plus a sentence each on
  `/events` and the current event pages. The page builder has no FAQ block yet: add one (`studio/schemas` +
  `web/src/components`) or use a `textSection`. FAQ rich results are limited to government and health sites, so
  this is for users and AI answers, not for snippets. Work "baby", "toddler", "under-5s", "Southall", "Acton"
  and "West London" into the hero `subtitle` and the About `excerpt` (Sanity `page` index → `pageBuilder`).

### C3. High (LIVE): broken and stale event data damages trust
- The homepage shows "Every Sat, Apr 25 to Invalid DateTime", "3:00 PM - 5:00 PM (3362h 0m)" and "(6722h 0m)".
- Its "What's On" lists events that ended in March 2025 (Spring Party, Move and Make Westcott Park), with no years.
- LOCAL fixes all of this: dates come from the Eventbrite sync and are split into upcoming and past.

### C4. Medium (LOCAL): past events are near-duplicates and thin; decide what stays indexable
- `move-and-make-autumn-winter-2024` and `move-and-make-winter-spring-2025` share identical 844-char descriptions
  and summaries (5-gram Jaccard **0.81**). Both say "One-off / One day only" while the body says "every Wednesday"
  (incomplete `sessions` in the drafts).
- `mindful-movement` has 63 words, no summary and no description. `move-and-make` (2024) shares its opening
  paragraph with both of the pages above.
- 8 of the 13 event pages are past and show "No upcoming dates". None links to the current season.
- The `winter-together-*` trio scores 0.19–0.26 similarity. These are genuinely separate events, so keep them
  indexable while upcoming, but give each a unique line about its venue.
- **Recommendation:**
  - Keep past URLs live (200), since Instagram and Eventbrite posts link to them.
  - Emit `<meta name="robots" content="noindex, follow">` when an event has no upcoming session: add a `robots`
    prop to `web/src/layouts/Layout.astro` and set it from `web/src/pages/events/[slug].astro` when `!next`.
  - Leave past events out of `web/src/pages/sitemap.xml.ts`.
  - Add a `continuedBy` reference field (`studio/schemas/events.ts`) and render "This season has ended, see
    Move and Make 2026/27 →".
  - Consider deleting one of the two duplicate 2024/25 docs and redirecting it.
  - Longer term: an evergreen `/move-and-make` page doc, because the sync gives every season a new slug, so
    each year's link equity resets.

### C5. Medium (BOTH): testimonials are few, anonymous and hidden away
- There are 2 quotes (297 words), with no name, area, session or date. They appear only on `/testimonials`, which
  is linked only from the footer. On LOCAL they are `<p><em>`, not `<blockquote>`/`<figcaption>`.
- **Fix (Sanity `page` testimonials → `pageBuilder[0].excerpt`):** add more quotes with an attribution
  ("Parent of a 2-year-old, Southall, Move and Make 2024"). Pull 1–2 onto the homepage and the Move and Make page.
  Don't add Review star markup: it's self-serving and not eligible.

### C6. Medium (BOTH): safeguarding policy shows its age
- It cites "Working together to Safeguard Children 2015" (superseded; the 2023 edition is current) and the
  "Disability Discrimination act 2005" (replaced by the Equality Act 2010, which it also lists). **[verify the
  editions with the client]**
- It has no "last reviewed" date. HANDOFF notes an unpublished body edit from Oct 2024 (LOCAL shows 1,435 words
  vs LIVE 1,475).
- **Fix (Sanity `page` safeguarding-policy):** update the references and add "Last reviewed / next review".
  Add a one-line "All our staff are DBS-checked and safeguarding-trained" to event pages and the team section.
  This is the strongest trust signal for parents and it's currently buried.

### C7. Medium (LOCAL): Experience signals are under-used
- All 13 events use `poster` (a flyer with text in the image). `photo` is unset and the posters have no `alt`.
- The real photos in `docs/redesign/photos/*.jpg` aren't uploaded (HANDOFF step 4).
- Instagram photos load client-side, so crawlers never see them.
- **Fix:** upload the photos as each event's `photo` with descriptive `alt` text. Pass `alt` through in
  `events/[slug].astro`, which currently uses `alt={event.name}`.

### C8. Medium (LOCAL): Expertise isn't connected to the sessions
- Event pages don't say who leads. People pages don't link to the sessions those people run.
- Jennifer Benson and Nadia Butt have no `role`. Jennifer has no `qual` even though her bio says "Level 3".
- Sarah's quals list omits Martha Graham training, the Middlesex lectureship and FCD membership (all in her bio).
- Supreet Kaur appears on the homepage but has no profile page (no slug).
- **Fix:** add a `leaders` reference array to `studio/schemas/events.ts` and render it. Fill `role` and `qual` on
  the person docs.

### C9. Medium (LOCAL): readability
- About copy (homepage `textSection`): FRE ~22, grade ~15, abstract ("foster healthier, more connected
  communities").
- Sarah's bio: FRE ~26. Move and Make 2025 description: FRE ~52 (good). Safeguarding: ~29 (acceptable for a policy).
- **Fix:** open the About copy with concrete facts: what, who, where, free. For example, "Since April 2024 we've
  run 75+ free sessions at Open Havelock and Westcott Park" **[the 75 is counted from Sanity session data, which
  is incomplete for past seasons; confirm]**. Facts like this are also what AI answers quote.

### C10. Medium (LOCAL): venue accuracy
- Open Havelock is UB2 4RH in Sanity but UB2 4RP on Eventbrite **[unverified, from HANDOFF]**. The wrong one
  feeds "Where" and the maps link on 9 pages.
- Westcott Park renders "Acton, London , W3 6YP" (trailing space in the venue `city`).
- **Fix:** venue docs in Sanity.

### C11. Low (LOCAL): AI-content check
- The seeded excerpts and hero copy are specific (names, venues, qualifications), not generic filler.
- One awkward sentence in Jennifer's excerpt ("their Move and Make sessions cemented…").
- No QRG low-quality-AI markers beyond the abstract About copy (C9).

---

## On-Page SEO findings

### O1. High (BOTH): meta descriptions
- **LIVE:** all 3 pages use "Astro description".
- **LOCAL:** home, `/testimonials` and `/safeguarding-policy` fall back to the site-wide default in
  `web/src/layouts/Layout.astro` (as does `/404`), because the `description` field is null on all three Sanity
  `page` docs (verified by CLI).
- **LOCAL:** 6 events fall back to "`{name}` with Our Moving Stories." in `events/[slug].astro`: mindful-movement,
  move-and-make, both 2024/25 seasons, move-and-make-westcott-park and spring-party-westcott-park. This is a
  drafts-perspective view; per HANDOFF 2a, the published summaries return after the seed re-run.
- `creativity-and-connection` uses a 50-char fragment with no facts.
- People descriptions are 199–273 chars (Sarah 273), so they get truncated, because `excerpt` doubles as card text.
- **Fix:** copy table below.

### O2. High (BOTH): titles
- **LIVE:** "Home", "Testimonials", "Safeguarding Policy", with no brand or keyword.
- **LOCAL:** "Home · Our Moving Stories" wastes the homepage title. `Layout.astro` builds
  `` `${title} · Our Moving Stories` `` from `page.title`, which also names the doc in Studio.
- **Fix:** add an optional `seoTitle` to `studio/schemas/page.ts`, `events.ts` and `person.ts`, and a
  `fullTitle` override prop in `Layout.astro` (the homepage title shouldn't get the suffix).
- Event names make poor titles: "Move and Make @ Open Havelock - 2026/27". Trailing spaces in "Move and Make -
  Westcott Park " and "Spring Party @ Westcott Park " produce a double space before "·". Trim `name` in Sanity.

### O3. Medium (BOTH): headings
- **LIVE:** the homepage has 5 `<h1>`s ("About", "What's On", "People", "Instagram", "Get in touch"). Event cards
  are h3s with no h2 above them.
- **LOCAL:** `/testimonials` and `/safeguarding-policy` have no h1. `TextSection.astro` always renders `<h2>`.
  Pass a `headingLevel` (h1 for the first block when it isn't a hero) from `[...slug].astro` through `Block.astro`.
- **LOCAL:** the safeguarding sub-sections ("Policy Statement", "Definitions", "Safeguarding Lead", …) are
  `<p><strong>` with empty `<p></p>` spacers. Restyle them as H2/H3 in Sanity: the `portableText` type allows
  heading styles.
- **LOCAL:** event pages have no h2 in `<main>`. Make the "About this event" and "Schedule" eyebrows `<h2>`
  in `events/[slug].astro`.
- **LOCAL:** the homepage h1 text reads "…tell throughMovement." because there's no whitespace between the two
  spans (`Hero.astro` ~L173–174). Add `{" "}`.

### O4. Medium (BOTH): internal linking and anchor text
- **LOCAL:** every nav item points to a homepage anchor: About, What's on → `/#whats-on`, People, Contact; also
  the "Join in" CTA and the 404 "See what's on". These come from the Sanity `nav` doc, which also has a stale
  draft (HANDOFF 2a).
- **LOCAL:** `/events` and `/sessions` are linked only from homepage sections and "← All events".
  `/testimonials` and `/safeguarding-policy` are footer-only.
- **LOCAL:** there are no contextual links from event pages to people, safeguarding, testimonials or the current
  season, and none from people pages to events.
- **Fix:** point nav "What's on" to `/events`, add contextual links (C4, C5, C8), and put "What's on" and
  "Sessions" in the `footer` doc's `items`.
- **LIVE:** the footer on every page has `https://instagram.com/{{settings.instagram}}` (broken). The nav is
  anchors only. The 4 event poster `<img>`s have no `alt` attribute.

### O5. Low (LOCAL): `/sessions` server-renders 94 rows starting with April 2024
- Alpine hides the past rows client-side. Render upcoming rows first, server-side
  (`web/src/pages/sessions/index.astro`), and give the page a 1–2 sentence intro.

### O6. Low (LOCAL): Open Graph images
- There is no `og:image` on home (the hero is a video), `/events`, `/sessions`, `/testimonials` or
  `/safeguarding-policy`.
- **Fix:** add a default 1200×630 image in `Layout.astro`, e.g. derived from `public/video/hero-wide-poster.jpg`.

### O7. Low (LOCAL): no privacy notice is linked, although the footer collects newsletter emails (beehiiv)

---

## Cutover dependencies (content)
1. **Publish the drafts (HANDOFF 2a) before cutover.** Production reads `published`. There, the 4 people and 6
   past events have no `slug` and the people have no `excerpt` (verified by CLI), so people pages and those event
   pages would 302 → `/404`, and the people cards and descriptions would change. Then re-run the seed.
2. LIVE has 3 URLs and all 3 keep their paths, so no content redirects are needed. After the fixes above, ask
   Search Console to re-crawl `/`.
3. Extend the sitemap to upcoming events, people, `/events` and `/sessions`, and exclude past events (C4).

---

## Proposed titles and descriptions: every LOCAL URL

The title shown is the full rendered `<title>`; lengths are in characters. **Where:** P = Sanity `page` doc
(`seoTitle` is a new field; `description` already exists), E = Sanity `event` doc (new `seoTitle` /
`seoDescription`; without them, title comes from `name` and description from `summary`),
H = hard-coded in the named file, Pe = Sanity `person` doc (new `seoTitle` / `seoDescription`; description
currently from `excerpt`).

| URL | Where | Title (len) | Meta description (len) |
|---|---|---|---|
| `/` | P index; needs the `fullTitle` override in Layout | Our Moving Stories: Free Baby & Toddler Dance and Art, Southall (63) | Free dance, movement and art sessions for babies, toddlers and their grown-ups in Southall and Acton, West London, plus family events for all ages. (147) |
| `/events` | H `pages/events/index.astro` | Free Family Events in Southall & Acton · Our Moving Stories (59) | Free weekly sessions for under-5s and their carers, story time and seasonal family parties in Southall and Acton. See dates, venues and book free on Eventbrite. (160) |
| `/sessions` | H `pages/sessions/index.astro` | Session Timetable · Our Moving Stories (38) | Dates, times and venues for every free Our Moving Stories session in Southall and Acton. Filter by this week or this month, then book free on Eventbrite. (153) |
| `/testimonials` | P testimonials | What Parents Say About Move and Make · Our Moving Stories (57) | Southall parents on Move and Make, our free movement and art class for under-5s: "unique to anything else we have participated in locally". (139) |
| `/safeguarding-policy` | P safeguarding-policy | Safeguarding Policy · Our Moving Stories (40, keep) | How Our Moving Stories CIC keeps children and adults safe: DBS-checked staff, safe-touch guidance, photo consent and how to reach our safeguarding lead. (152) |
| `/events/move-and-make-open-havelock-2026-27` | E `event-eb-2002907813186` | Move and Make: Free Under-5s Class, Southall · Our Moving Stories (65) | Free weekly movement and art for 0–5s and their grown-ups. Wednesdays 9:30–11:30am at Open Havelock, Southall, 4 Nov 2026 to 10 Feb 2027. Book free. (148) |
| `/events/story-space` | E `event-eb-2003451709996` | Story Space: Free Story Time, Ages 2–6 · Our Moving Stories (59) | Free weekly stories, books and creative play for children aged 2–6 with a parent or carer. Thursdays 3:30–5pm at Open Havelock, Southall. Book free. (148) |
| `/events/winter-together-westcott-park` | E `event-eb-2004289460731` | Winter Together at Westcott Park, Acton · Our Moving Stories (60) | Free winter crafts, movement and games for all ages at Westcott Park Community Centre, Acton W3. Friday 11 December 2026, 3:30–5:30pm. Book free. (145) |
| `/events/winter-together-windmill-park` | E `event-eb-2004416498705` | Winter Together at Windmill Park, Southall · Our Moving Stories (63) | Free winter crafts, movement and games for all ages at Windmill Park, Southall UB2. Saturday 12 December 2026, 2–4pm. Book free on Eventbrite. (142) |
| `/events/winter-together-open-havelock` | E `event-eb-2004289383500` | Winter Together at Open Havelock, Southall · Our Moving Stories (63) | Free winter crafts, movement and games for all ages at Open Havelock, Southall. Saturday 19 December 2026, 2–4pm. Book free on Eventbrite. (138) |
| `/events/creativity-and-connection` *(past → noindex)* | E `539f5070…` | Creativity & Connection, Southall · Our Moving Stories (54) | A free monthly community arts afternoon at Open Havelock, Southall, led by a different guest artist each time. All ages, refreshments included. (143) |
| `/events/move-and-make-open-havelock-2025-26` *(past)* | E `08551bb3…` | Move and Make 2025/26, Open Havelock · Our Moving Stories (57) | Our 2025/26 season of free Wednesday movement and art for under-5s at Open Havelock, Southall (Sept 2025 to July 2026). See this season's dates. (144) |
| `/events/move-and-make-westcott-park` *(past)* | E `0c335488…` (also trim `name`) | Move and Make at Westcott Park, Acton · Our Moving Stories (58) | Free movement and art for all ages at Westcott Park Community Centre, Acton, spring 2025. See what's on now at our Southall and Acton venues. (141) |
| `/events/spring-party-westcott-park` *(past)* | E `47ce9095…` (also trim `name`) | Spring Party at Westcott Park, Acton · Our Moving Stories (57) | A free spring arts party for all ages at Westcott Park Community Centre, Acton, on 28 March 2025. See our upcoming free family events. (134) |
| `/events/move-and-make-winter-spring-2025` *(past; duplicate)* | E `9effacff…` | Move and Make Winter/Spring 2025 · Our Moving Stories (53) | Free Wednesday movement and art for 0–5s and carers at Open Havelock, Southall, early 2025: arrival, movement, snack, crafts and a goodbye song. (144) |
| `/events/move-and-make-autumn-winter-2024` *(past; duplicate)* | E `d3d5abb6…` | Move and Make Autumn/Winter 2024 · Our Moving Stories (53) | Free Wednesday movement and art for 0–5s and carers at Open Havelock, Southall, autumn 2024, led by Sarah Sulemanji and Gabriela Bolton. (136) |
| `/events/move-and-make` *(past)* | E `a83c483d…` | Move and Make Spring 2024 · Our Moving Stories (46) | The first Move and Make season: free movement and art for 0–5s and their carers at Open Havelock, Southall, April to May 2024. (126) |
| `/events/mindful-movement` *(past)* | E `2c4adf12…` | Mindful Movement, Southall (2024) · Our Moving Stories (54) | Free Monday mindful movement sessions at Open Havelock, Southall, April to June 2024. See our current free sessions and events. (127) |
| `/people/sarah-sulemanji` | Pe `7d309646…` | Sarah Sulemanji, Founder and Dance Artist · Our Moving Stories (62) | Founder of Our Moving Stories in Southall. Martha Graham-trained dance artist, Middlesex University dance lecturer 2010–2023, MA, FHEA. (135) |
| `/people/gabriela-bolton` | Pe `7192248a…` | Gabriela Bolton, Artist and Facilitator · Our Moving Stories (60) | London artist and workshop facilitator with 8+ years in the creative sector and a BA (Hons) in dance performance. Has led Move and Make in Southall. (148) |
| `/people/jennifer-benson` | Pe `006f067a…` | Jennifer Benson, Early Years Practitioner · Our Moving Stories (62) **[role assumed; confirm]** | Level 3 qualified childcare professional with 15+ years working with children and families, focused on the early years (0–4). (125) |
| `/people/nadia-butt` | Pe `967c7fce…` | Nadia Butt, Community Artist · Our Moving Stories (49) **[role assumed; confirm]** | Multi-disciplinary artist with a BA (Hons) in Dance Science and experience in community outreach, events and charity fundraising. (129) |
| `/404` | H `pages/404.astro` | Page not found · Our Moving Stories (keep) | Returns status 404, so not indexed; no change needed. |

Code fallback when `seoDescription` is empty: build it from the data, e.g. "Free {repeat} {time} at {venue},
{city}. {summary}", instead of "`{name}` with Our Moving Stories." (`events/[slug].astro`). For people,
truncate `excerpt` to about 155 characters at a word boundary (`people/[slug].astro`).
