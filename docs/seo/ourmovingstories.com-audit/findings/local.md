# Local SEO findings (9 Nov 2026)

Business type: **hybrid / service-area, event-based non-profit (Our Moving Stories CIC, no. 14473202)**. No storefront; sessions at partner venues (Open Havelock, Westcott Park, Windmill Park). Vertical: community arts / family activities (closest to arts-education/non-profit; none of the six standard verticals fits).

## Scores
| Dimension (weight) | LIVE | LOCAL |
|---|---|---|
| GBP signals (25) | 3 | 3 |
| Reviews and reputation (20) | 8 | 9 |
| Local on-page (20) | 4 | 11 |
| NAP and citations (15) | 4 | 6 |
| Local schema (10) | 0 | 0 |
| Local links/authority (10) | 3 | 5 |
| **Total /100** | **22** | **34** |

Proximity (outside our control) dominates local ranking, and there is no storefront, so the realistic target is organic + "what's on" queries ("free baby dance classes Southall", "toddler activities Ealing"), not the 3-pack.

## Findings

### Critical
- **BOTH: no JSON-LD, so no machine-readable local entity.** LIVE and LOCAL both emit none. Fix in `web/src/layouts/Layout.astro` (sitewide `Organization`) and `web/src/pages/events/[slug].astro` (`Event`). Requirements below.

### High
- **LIVE: place data is broken.** Home shows "Open Havelock , London, UB2 4RH" (no street, stray space, "London" not Southall). Event dates render "Every Sat, Apr 25 to Invalid DateTime" and "(3362h 0m)". Homepage also has the dead `instagram.com/{{settings.instagram}}` link. Retired at cutover.
- **BOTH: Open Havelock postcode conflict.** Sanity (LIVE shows it; LOCAL reads the same venue) = UB2 4RH; Eventbrite page for Creativity & Connection = "Willowbrook Road, Southall, UB2 4RP". postcodes.io: both valid. 4RH centroid 51.49906,-0.37294; 4RP centroid 51.50194,-0.37329. OSM places Willowbrook Road at lat 51.4987-51.5003, so 4RH sits on the road and 4RP is ~200m north of its end. **4RH is most likely correct, but I could not confirm from Open Havelock/Peabody/Ealing pages (fetch failed). Verify with the venue or Royal Mail PAF, then fix whichever is wrong (Eventbrite venue record or Sanity venue doc, which must be done by the user in `production`).** Do not publish geo/address schema until settled.
- **BOTH: no Google Business Profile / no location entity.** No Maps embed, no place link on LIVE. LOCAL has `mapLink()` (`web/src/lib/schedule.ts`) only as a Google Maps search link on events. Recommendation: create a **Service-area business GBP with address hidden** (Ealing / Southall), only if the CIC has a verifiable base (registered office/mail address does not qualify for a hidden-address SAB unless staffed; Google verification may need video). Primary category: "Arts organization" or "Dance school"/"Community center" are options; "Non-profit organization" as secondary. Sessions are at third-party venues, so do NOT list venue addresses as the business address. If GBP is not viable, rely on Eventbrite organiser + venue listings. Wrong category is the top negative factor: pick one, do not use "Dance school" if no classes are taught as lessons.
- **LOCAL: venue/area content is thin and generic.** "Across Ealing" language is good (footer, home), but there is no per-venue or per-area page. See recommendation.

### Medium
- **BOTH: NAP is email-only.** Footer (`web/src/components/Footer.astro`) has hello@ourmovingstories.com, Instagram, "Our Moving Stories CIC" + company number (LOCAL) but no phone, no postal/service area statement in text, no "Southall, West London" line near the contact block. For a hidden-address SAB that is acceptable, but add an area line ("Serving Southall, Ealing and West London") and keep the name string identical everywhere: "Our Moving Stories CIC" (Instagram, Eventbrite organiser "Our Moving Stories CIC", footer). Site homepage `<title>` is "Home", so brand/location is absent from title (LIVE) or reads "Home · Our Moving Stories" (LOCAL; no location). Fix homepage title/description to include "free family dance and art sessions, Southall and Ealing".
- **LOCAL: funder/partner signals present but not linked.** Footer shows logos for Ealing Council, London Sport, National Lottery and "In partnership with Peabody & Ealing Council". Logos have no outbound links, losing trust/authority links and a citation foothold. Link them (`rel` plain) and ask each to link back.
- **BOTH: Eventbrite is the NAP source for events.** Eventbrite organiser name "Our Moving Stories CIC", venue "Open Havelock", locality Southall: consistent with site apart from postcode. Instagram profile title "Our Moving Stories CIC (@our.movingstories)"; bio not retrievable without login, so bio/link-in-bio NAP is unverified.
- **BOTH: reviews exist as 1+ testimonial only on `/testimonials`.** LIVE has a visible parent quote (named by first name/anonymous, mentions "local area", Gabi). No ratings, no third-party review profile, no `Review` markup. LOCAL has the page but no h1 and the default description (see content agent). Do not mark up self-collected testimonials as `aggregateRating` (self-serving reviews are ineligible); if Google reviews come via GBP, those can count.

### Low / Info
- Citations (could not verify via search engines; no usable SERP access, treat as to-do): Eventbrite organiser (exists), Instagram (exists). Check/claim: Ealing Council family information / "Ealing Family Information Service" and What's On, Peabody community listings, Open Havelock site, Southall community directories, West London parenting sites (Mumsnet local, Netmums-style, Time Out Kids, Kids' Club/Little Seeds/"Hoop"-type activity directories), Yelp/BBB are low value for a UK non-profit (skip), Charity/CIC register entry (Companies House CIC 14473202; verify listing and registered address matches), 360Giving/funder grantee pages (London Sport, National Lottery) which give high-trust links.
- INFO LOCAL: `sitemap.xml.ts` omits `/events/*`, `/people/*`, `/sessions`; venue/event pages are the local-intent pages, so include them.
- INFO: LOCAL is not deployed; LIVE comparison scores reflect a 3-page site with soft-404s.

## Venue/area landing content: worth it, carefully
Existing event pages already name venue + (via Address.tsx) street + postcode, e.g. "Open Havelock, Willowbrook Road, UB2 4RH". Recommended: **3 venue pages only** (`/venues/open-havelock`, `/venues/westcott-park`, `/venues/windmill-park`) built from Sanity `venue` docs, each with: real getting-there info (nearest station/bus, buggy access, indoor/outdoor, what to bring), photos from that venue, current/next sessions (dynamic from events), venue-specific testimonial, partner link, embedded map, and `Place`/`Event.location` data. Gate with the swap test: if the venue name could be swapped for another and the page still reads fine, it is doorway content. Do **not** create generic "dance classes in {area}" pages for Hanwell, Acton etc.; that is the doorway risk. Hub: `/sessions` or `/events` linking to venue pages; breadcrumbs.

## Local schema requirements (for the schema agent)
- Sitewide `@graph` on home: `Organization` (use `["Organization","NGO"]` or plain `Organization`; do **not** use `LocalBusiness` unless a physical address is published) with stable `@id` (`https://ourmovingstories.com/#org`), `name` "Our Moving Stories CIC", `url`, `logo`, `email`, `sameAs` [instagram, eventbrite organiser, GBP URL once exists, Companies House], `areaServed` [`AdministrativeArea` "London Borough of Ealing", `City` Southall], `identifier`/company number 14473202, `funder`/`parentOrganization` as applicable, `founder` -> `Person` Sarah Sulemanji.
- No `address` for the org unless a public base is chosen; no `aggregateRating`.
- Event pages: `Event` with `eventAttendanceMode: OfflineEventAttendanceMode`, `eventStatus`, `location` as `Place` with `name`, `PostalAddress` (streetAddress, addressLocality "Southall", postalCode **after** conflict resolved, addressCountry GB) and `geo` at 5 decimal places, `isAccessibleForFree: true`, `offers` price 0 + Eventbrite `url` + availability, `organizer` -> org `@id`, `typicalAgeRange` e.g. "0-6", `startDate`/`endDate` ISO with offset (fix the "Invalid DateTime" class of bug), and for recurring series use `eventSchedule`.
- Person pages: `Person` with `worksFor` -> org `@id`.
- Postcode centroids from postcodes.io are only centroids; take geo from the venue's real entrance.

## Limitations
No Google/Bing SERP access or DataForSEO, so Tier-1/UK directory presence, GBP existence, review counts and local-pack position were not verified. Instagram bio inaccessible (login wall). Postcode right/wrong is inferred from geography, not an authoritative source. Proximity (about 55% of ranking variance) is not addressable.

## Top actions
1. Resolve UB2 4RH vs 4RP with the venue (High; Sanity venue doc / Eventbrite venue).
2. Add Organization + Event JSON-LD (Critical; Layout.astro, events/[slug].astro).
3. Decide on and create a hidden-address SAB GBP (High).
4. Retitle/redescribe home and events with "Southall / Ealing" (Medium; Layout.astro props).
5. Add event, people, sessions to sitemap (Medium; sitemap.xml.ts).
6. Link funder/partner logos; seek backlinks from Ealing Council, Peabody, London Sport (Medium).
7. Build 3 venue pages with real unique content (Medium).
8. Claim Ealing Council family/what's-on and parenting directory listings, keeping name/area text identical (Medium).
9. Add area line + keep "Our Moving Stories CIC" consistent in footer, Instagram bio, Eventbrite (Low).
10. Collect Google reviews via GBP and more attributable testimonials; fix h1/description on `/testimonials` (Low).
