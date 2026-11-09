# SXO (Search Experience) findings: ourmovingstories.com

Audit date 9 Nov 2026. Category: Search Experience. **SXO Gap Score** (separate from the SEO Health Score):

| Dimension | Max | LIVE | LOCAL | Evidence (short) |
|---|---|---|---|---|
| Page type fit | 15 | 2 | 9 | LIVE: one-pager, no page for any class query. LOCAL: `/events` + event pages are the right types, but there's no evergreen programme page and seasons are spread across separate URLs |
| Content depth | 15 | 5 | 6 | LOCAL upcoming event pages are 86–127 words with empty `description`/`audience`, thinner than the Eventbrite listing they link to |
| UX signals | 15 | 4 | 11 | LIVE: "Invalid DateTime", "(3362h 0m)", 5 H1s, broken `{{settings.*}}` links. LOCAL: clear next date + "Book free on Eventbrite" + Directions; dead-end past seasons |
| Schema | 15 | 0 | 0 | No JSON-LD on either (refer to `/seo schema`) |
| Media | 15 | 4 | 9 | LIVE posters have no alt and 3 imgs have empty src. LOCAL hero video, team photos with alt, event images alt = name |
| Authority / trust | 15 | 5 | 8 | Funder logos on both. LOCAL adds CIC 14473202, Peabody/Ealing partnership line, people pages. Testimonials buried on both |
| Freshness | 10 | 1 | 9 | LIVE (staging) lists only ended events. LOCAL shows "Next up · Wed 11 Nov" from production |
| **Total** | **100** | **21** | **52** | |

## Lead finding: page-type mismatch

- **LIVE, CRITICAL:** for every non-brand query the SERP rewards *local listing / event-detail pages* (venue, age, day/time, "free", book). LIVE has no such page. Its only "What's On" block lists four events that have all ended (latest 1 Jul 2026, "Every Sat, Apr 25 to Invalid DateTime"). A parent landing today finds no session they can attend.
- **LOCAL, HIGH (right type, wrong signals):** `/events` is the on-site equivalent of the Happity/Hoop "toddler classes near Southall" pages that dominate the SERP. It should be the landing page for class queries, but its title/H1/description say "What's on" and carry none of: free, baby, toddler, under-5s, Southall, dance/art. `/sessions` (a filterable diary) is a utility page, not a landing page.

## SERP backwards analysis (query by query)

Method: WebSearch (not geo-located Google UK; see Limitations). Page types use the plugin taxonomy, which has no "event" or "directory" type. Directory pages (Happity/Hoop/NHS.uk) and single event pages (address + date + book CTA) are both mapped to **Local Page**. Listicles are mapped to Blog/Comparison.

| Query | What ranks (observed) | Dominant type (approx.) | OMS present? | LOCAL page that could compete; what it needs |
|---|---|---|---|---|
| our moving stories (+southall / "dance" / ourmovingstories.com / "Our Moving Stories CIC") | Harvard "Our Moving Stories" podcast, WashU "Moving Stories", movingstories.org.uk (UK theatre co.), Moving Stories Dance Company, Gurnaik Johal *We Move* reviews, Southall history, removals firms, bringo.co.uk company record (CIC 14473202) | Brand Landing (other entities) | **No, on any brand variant** | Homepage. Needs a disambiguating title ("Our Moving Stories · Free family dance & art in Southall"), Organization schema, sameAs to Instagram/Eventbrite/Companies House |
| free baby classes southall | Happity Southall category pages (x7: baby-toddler, bring-your-baby, massage, yoga…), ealing.gov.uk Southall Park children's centre PDF, **peabody.org.uk Move and Make page (OMS's own programme)**, Groupon | Local directory ~70%, event/venue pages ~20% | Only via Peabody (2-line page that links to ourmovingstories.com) | Evergreen Move and Make page / `/events` with "free", "babies & toddlers 0–5", "Southall" in title, summary and address |
| toddler classes southall | Happity toddler-group + baby-toddler, ealing.gov.uk PDF, Peabody Move and Make, Ofsted, NHS.uk service directory | Local directory + event | Only via Peabody | Same as above |
| toddler dance class ealing | hoop.co.uk provider, Happity Ealing dance/gym (many), NHS.uk directory (4 paid ballet schools), cademy | Local directory | No | Move and Make page; the word "dance" never appears on the 2026/27 event page. Add "creative dance & movement for under-5s" |
| kids dance classes southall | Happity Southall dance, Groupon, Wowcher, playsport (Spotlight Dance Academy), NHS directory | Directory / deals | No | Same; also list on Happity/Hoop |
| messy play southall | No Southall result at all: Happity SW London, hoop providers, City of London FIS what's-on, NHS directory | Directory (non-local) | No | **Open gap.** If sessions really include messy art (design mock and a testimonial say so: "egg boxes and cotton wool"; *unverified, confirm with team*), say "messy art & play" on the Move and Make page |
| baby sensory west london free | Baby Sensory franchise schedules via Happity, NHS directory, Time Out listicle | Franchise / brand | No | **Don't target.** "Baby Sensory" is a franchise brand and OMS doesn't offer it |
| stay and play southall | hoop.co.uk event pages (several), council stay & play (Sutton, Worcestershire), schools, hotel noise | Listing-app event pages | No | Off-site: list on Hoop. On-site only if accurate ("relaxed stay-and-play style") |
| baby & toddler groups southall / family hub stay and play | Happity stay-and-play categories, Hoop Grange children's centre, Ealing 135, Hounslow FSD | Directory | No | Off-site listings + Ealing Families Directory |
| free things to do with toddlers southall | thebestof Ealing blog, gladfish "10 best things… Southall", Happity blog, Time Out, Expedia, Wowcher/Groupon, libraries.ealing.gov.uk event | Listicle ~55%, deals ~25%, council events ~10% | No | **No own page should chase this.** Get OMS into those lists (outreach) |
| free family events ealing this week under 5s / things to do with kids ealing this weekend | libraries.ealing.gov.uk single-event pages, Ealing Broadway shopping events, Ealing Living Magazine, makeitealing, Ealing 135, Mumsnet thread, getwestlondon, kidadl | Council event pages + local-magazine listicles | No | `/sessions` "This week" filter exists but is client-only Alpine state (no URL). See M4 |
| "move and make" open havelock southall | Open Havelock venue pages (london.gov.uk, ealing.gov.uk, NLA, ealing.news), Eventbrite 2025/26 event page, aroundealing article mentioning the sessions | Venue / event | No OMS URL | Evergreen Move and Make URL (M5) |

SERP consensus for the class queries: Local (directory + event detail) ≈ 90%, medium confidence. The share captured by listing platforms (Happity, Hoop, NHS.uk directory, council/library pages, Eventbrite, Peabody) means **off-site listings will drive more bookings than ranking OMS's own pages**. OMS pages should be the ones those listings and the brand search point to.

## User stories (SERP-derived)

1. **Parent, decision stage.** As a parent of a toddler in Southall, I want a free session this week near me, because I want my child to play and to meet other parents. I'm blocked by not knowing the age range, whether I must book, and exactly where it is. *Signals:* Happity/Hoop cards lead with age, day/time, price, distance; Peabody leads with "up to five" + "Wednesdays 9.30"; Eventbrite says "one ticket per child".
2. **Price-sensitive parent, consideration stage.** As a carer comparing options, I want proof it's genuinely free and what happens in a session, because the dance/sensory results are paid (£7.50–£14.50/session). I'm blocked by thin event pages and an Eventbrite sign-up in English. *Signals:* paid prices in toddler dance / baby sensory results; "free" modifier queries return children's-centre PDFs. *(The ESL angle comes from the brief, not the SERP.)*
3. **Parent, awareness stage.** As a parent browsing "free things to do with toddlers", I want a list of local options, because I don't know what exists. I'm blocked because OMS isn't in any list. *Signals:* listicle and deals dominance.
4. **Funder/commissioner, consideration stage.** As a grants officer checking a CIC, I search the name and want delivery evidence and safeguarding. I'm blocked because the brand SERP shows other "Moving Stories" organisations and only a company-data record. *Signals:* brand SERP.
5. **Venue/partner, awareness stage.** As a community-space manager (e.g. Open Havelock, which Ealing Council advertises as space for community groups), I want to know what OMS could run at my venue. I'm blocked by a two-sentence partner block with only an email. *Signals:* Open Havelock / ealing.news "space offered to community groups" results.

## Persona scores (Relevance / Clarity / Trust / Action, 25 each), weakest first

| Persona (landing page) | LIVE | LOCAL | LOCAL breakdown |
|---|---|---|---|
| Returning parent searching "move and make" (lands on a past-season page) | 20 | **48** | R15 C10 T15 A8 |
| Venue / partner org (home footer block) | 37 | **52** | R12 C12 T15 A13 |
| Funder / commissioner (brand → home, people, safeguarding) | 34 | **57** | R14 C13 T18 A12 |
| Parent/carer of under-5s in Southall, mobile, possibly ESL (`/events` → event page); **highest weight** | 25 | **66** | R17 C17 T13 A19 |

- **Returning parent (48):** `/events/move-and-make-open-havelock-2025-26` says "No upcoming dates… Follow for new dates ↗ (Instagram)" while the same programme runs Wed 11 Nov. Fix: M5.
- **Partner (52):** there's no "work with us" content beyond "We work with community groups, schools and venues across Ealing…" + email. LIVE's paragraph (dance, movement and yoga for all ages; adapting to community needs) was more specific. Fix: M10.
- **Funder (57):** trust is good (CIC number, Peabody & Ealing Council partnership, National Lottery & London Sport, safeguarding policy, qualifications in bios). Missing: impact numbers, an About page (About is only `/#about`), a named contact or phone, testimonials surfaced. Fix: M9, M10.
- **Parent (66):** the event page above the fold is strong on mobile (big next date, Free tag, Book + Directions). Weaknesses: no age/audience tag on upcoming events or `/events` cards, no description, no "Southall" on Open Havelock pages, no "do I need to book / can I just turn up / what to bring" answers, jargon names ("Move and Make @ Open Havelock - 2026/27"), all-caps condensed display type, no phone/WhatsApp. Fix: M3, M6, M7, M12.

Systemic weakness: **Action for non-parents** (email-only) and **Trust on event pages** (testimonials and safeguarding not where decisions happen).

## Findings and fixes

| ID | Target | Sev | Finding / evidence | Fix (file or Sanity field) |
|---|---|---|---|---|
| M1 | LIVE | Critical | One-pager; titles "Home"/"Testimonials", description "Astro description". What's On shows only ended events, with "Invalid DateTime" and "(3362h 0m)". `mailto:{{settings.email}}` and `instagram.com/{{settings.instagram}}` are broken | Don't fix in place. Cutover to LOCAL is the fix; do it soon |
| M2 | BOTH | Critical | Not found for any brand variant; entity collision (Harvard, WashU, movingstories.org.uk, removals) | `web/src/layouts/Layout.astro`: if `title === "Home"` output "Our Moving Stories · Free family dance & art in Southall, Ealing" (or add a `seoTitle` field to `studio/schemas/page.ts`). Organization JSON-LD with `sameAs` (Instagram, Eventbrite organiser, Companies House). Add ourmovingstories.com to the Eventbrite organiser profile (eventbrite.com/o/90479281303 shows no website link) |
| M3 | LOCAL | High | `/events`: title "What's on", H1 "What's on", 182 words, no intro. `EventRow` cards show no age, "Free" or area (`audience` is empty) | `web/src/pages/events/index.astro`: title like "Free baby, toddler & family sessions in Southall & Ealing", plus a 2–3 sentence intro (ages, free, venues, how booking works). `web/src/components/EventRow.astro`: always render a Free tag + area. Fill `audience` in Sanity. Make `/events` the landing page for class queries |
| M4 | LOCAL | High | `/sessions`: title "Sessions"; the SSR HTML lists every session since 17 Apr 2024 in ascending order (~100 rows) and relies on Alpine (CDN) to hide the past ones. "This week" is not linkable | `web/src/pages/sessions/index.astro`: filter to `date >= today` on the server by default; read `?when=week|month|past` on the server so "This week" is a shareable URL (good for WhatsApp groups). Keep it as a utility page (link from `/events`), not a search landing page |
| M5 | LOCAL | High | Seasonal fragmentation: six Move & Make URLs (`move-and-make`, `-autumn-winter-2024`, `-winter-spring-2025`, `-westcott-park`, `-open-havelock-2025-26`, `-2026-27`). Past seasons dead-end to Instagram; no stable URL for partners to link | Add a `successor` (or `programme`) reference in `studio/schemas/events.ts`. In `web/src/pages/events/[slug].astro`, when `!next` and the successor has a next date, show "This runs again: see 2026/27 dates →" in place of "Follow for new dates". Longer term: an evergreen programme URL that always shows the current season. At cutover give it to Peabody, the Families Directory and Eventbrite |
| M6 | LOCAL | High | Upcoming event pages are thin: 2026/27 Move and Make 127 words, Story Space 86, Winter Together x3 similar. `description`/`audience`/`info` empty. Eventbrite has more (running order, refreshments, baby changing, accessible ground floor, free parking, one ticket per child, National Lottery funded). The design mock (`docs/redesign/screenshots/event-detail-mobile.jpg`) already shows Who/Access rows | Fill the Sanity event fields `audience`, `description`, `info` (Who, Access, What to bring, Do I need to book?, Languages spoken *if any*) for every upcoming event. Optionally let `packages/eventbrite-sync/src/index.ts` fill `description` when empty (it is currently "never touched", line 10) |
| M7 | BOTH | Medium | Location/NAP: site says "Open Havelock, London, UB2 4RH". Eventbrite, Peabody and Ealing Council say "Willowbrook Road, Southall UB2 4RP" (*which postcode is correct is unverified*). "Southall" is absent from all Open Havelock event pages; the hero says "Across Ealing". "Acton, London , W3 6YP" has a stray space | Sanity venue doc for Open Havelock: street + "Southall" + the confirmed postcode. Hero `kicker`/`subtitle` (Sanity hero block): mention Southall and ages, e.g. "Free dance, art & play for under-5s and families in Southall & Ealing" |
| M8 | LOCAL | Medium | Homepage H1 "Everyone has a story to tell through Movement." has no category or place (fine as a brand line, but nothing nearby carries the topic). Badge ring "All ages · All abilities" sits next to under-5 sessions | Keep the H1. Make the visible kicker/subtitle carry the topic (M7). Consider an "Under-5s + grown-ups" chip on the Next-up card (`web/src/components/Hero.astro`) |
| M9 | LOCAL | Medium | Strong Southall-specific testimonials (two-year-old, movement then art & craft, meeting local parents) are only on `/testimonials`, which has no H1 and the default description | Show one quote on event pages and the homepage. Give `/testimonials` an H1 + description (Sanity page `description`; heading level in `web/src/components/TextSection.astro`) |
| M10 | LOCAL | Medium | No About/impact page for funders; partner CTA is two sentences + email | New Sanity `page` "About / Work with us": impact numbers (team to supply), funders, partners, CIC no., safeguarding lead, named contact; session formats offered (under-5s, family events, intergenerational, mindful movement) with past venues |
| M11 | Off-site | High | Class SERPs are owned by Happity, Hoop, NHS.uk service directory, Ealing Families Directory, Ealing libraries/council what's-on, local magazines; OMS appears only via Peabody/Eventbrite | List Move and Make + Story Space on Happity, Hoop, Ealing Families Directory; pitch Ealing Living / thebestof / gladfish "free toddler things in Southall" lists. At cutover, check the Peabody "Further information" link still resolves |
| M12 | LOCAL | Low | Nav label "Whats on" (missing apostrophe). "Join in" → `/#whats-on` while "Whats on" → `/events` (two targets for one intent). The event schedule repeats the "February 2027" header where the list splits at LIMIT=10 (`events/[slug].astro` `groupsFirst`/`groupsRest`). Sanity data typo "9:30–11:300 AM" (move-and-make-westcott-park). No phone/WhatsApp | Sanity nav text; point both CTAs to `/events`; merge month groups across the split; fix the session end times in Sanity; add a WhatsApp/phone contact if the team has one |
| M13 | LOCAL | Info | No Event/Organization JSON-LD, so no event rich results to compete with Eventbrite | Refer to `/seo schema` (Event per session series, Organization on home) |

## Cutover (SXO-relevant)
- LIVE `/#whats-on`, `/testimonials`, `/safeguarding-policy` all exist on LOCAL. No redirects are needed for these.
- Submit the sitemap with events and people included (technical agent) so new event pages get discovered quickly.
- Update off-site profiles to deep links: the Eventbrite organiser website, Peabody, Families Directory, Instagram bio → `/events`.

## Limitations
- The WebSearch tool is not a geo-located Google UK SERP: no PAA, local pack, AI Overview or ads were visible. Rankings are approximate and positions aren't exact. ≥5 results were reviewed per query. Search volumes unknown; no Search Console data.
- `render_page.py` blocks `localhost` (SSRF guard), so LOCAL was fetched with curl (SSR HTML from `astro dev`, drafts perspective) and parsed with `parse_html.py`. Post-JS (Alpine) behaviour was inferred from source. The mobile view was judged from `docs/redesign/screenshots/*` (mock content, not production data).
- Happity returned 403; Hoop and NHS.uk listings were seen only as SERP entries.
- *Unverified:* the correct Open Havelock postcode (UB2 4RH vs 4RP); whether sessions include messy play / stay-and-play format; whether facilitators speak community languages.
- Generate a PDF report? Use `/seo google report`.
