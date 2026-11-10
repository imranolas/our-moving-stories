# Backlink profile: ourmovingstories.com (9 Nov 2026)

Tier 0 only (Moz, Bing, DataForSEO not configured). Applies to the domain, so BOTH targets.

## Score
- LIVE: INSUFFICIENT DATA (not scored). Under 4 scoring factors have any data; a number would mislead.
- LOCAL: INSUFFICIENT DATA (not deployed; same domain, so it inherits the same profile).

## Domain metrics
| Metric | Value | Source |
|---|---|---|
| In Common Crawl | yes | Common Crawl, release cc-main-2026-jan-feb-mar (domain-level, confidence 0.50) |
| In web-graph rankings | no | same |
| PageRank / harmonic centrality / rank | null | same |
Interpretation: CC has crawled the domain, but it is below the ranking threshold of the host web graph. Consistent with a very small site with few or no inbound links. It is not proof of zero links, and it is not a penalty. Freshness: Common Crawl graphs are quarterly and the Q1 2026 release is about 8 months old.

## Referring domains found and verified
No referring domain could be verified. Free sources cannot enumerate backlinks (no Moz/Bing/DataForSEO; search-engine scraping returned nothing usable). Checked directly (Verify crawler/curl, confidence 0.95 for what was observed):
| Page checked | Links to ourmovingstories.com? |
|---|---|
| Eventbrite "Move & Make Westcott Park" listing | No link. Plain-text email hello@ourmovingstories.com only |
| Eventbrite "Creativity & Connection" listing | No mention |
| Instagram @our.movingstories (logged-out HTML) | No bio URL visible in logged-out HTML (login-walled; cannot confirm) |
| ealing.gov.uk homepage | No |
| ealingfamiliesdirectory.org.uk | 403 to the crawler, unverified |
| openhavelock.org.uk | Unreachable from here (guessed domain; unverified) |
Not checked / unknown: Westcott Park and Windmill Park pages, funders, Linktree. Nothing was inferred about them. Treat the real count as "unknown, probably single digits". Confirm in Google Search Console > Links (free, the best source) before cutover.

## Outbound links on LIVE (for context, Parsed 0.95)
Home links out to Instagram (twice, plus a broken `https://instagram.com/{{settings.instagram}}` on every page), 4 Eventbrite event URLs with `?aff=oddtdtcreator`, marthagraham.edu. /safeguarding-policy links to cdmt.org.uk, sportprotects.org.uk, ealingfamiliesdirectory.org.uk (ESCB page), gov.uk DBS, ncdv.org.uk. All of those external links were found only in raw HTML.

## Target URLs receiving links
Unknown (no inbound data). Likely only `/` (and possibly `/testimonials`, `/safeguarding-policy`). Anchor text: no data. Expect brand name or bare URL.
Cutover: LIVE's three URLs all exist on LOCAL (`/`, `/testimonials`, `/safeguarding-policy`), so no redirects are needed for them. Risks:
- Any other URL (`/events`, `/people/...`) returns a 200 empty soft-404 on LIVE, so nobody can legitimately link to them. LOCAL's new URLs are fine.
- Keep `?`-suffixed and `#about`-style anchors working (fragments are not an issue).
- Keep `www` and `http` redirecting to the apex (already so; make it a single hop on Cloudflare).
- Check Search Console Links and Eventbrite/Instagram bios for stale URLs before cutover. If any old Netlify URL (`*.netlify.app`) is linked, redirect it.
- Severity: Low (nothing at risk that we can see).

## Link-earning opportunities (realistic, small free community programme)
Priority High:
1. Venue and park pages: ask Open Havelock, Westcott Park and Windmill Park operators (and their Friends groups) to list sessions with a link. Ideal: they already host you.
2. Eventbrite organiser profile and each event: put https://ourmovingstories.com in the organiser bio/description as a real link (the current event text has only an email). Cheap and immediate (nofollow likely, but it helps discovery and brand signals).
3. Instagram bio link, plus a Linktree or similar if used: it should point to the apex, not a tracking variant.
Priority Medium:
4. Ealing Council / Ealing Families Directory (you already link to their safeguarding page, so you are plausibly eligible) and Ealing Voluntary Service-type local listings; Southall community noticeboards and "what's on for kids in Ealing" sites.
5. Funder and grant-giver acknowledgements: any funder that lists grantees (council, local trusts, Arts Council programmes) should link on its grantee/news page. Provide a one-line blurb plus URL.
6. Press: local papers/hyperlocal (Ealing Times, Southall-area blogs/newsletters), parenting blogs and baby-class directories (Netmums, Mumsnet local, Hoop, Time Out Kids, Little Days Out style sites) with free-event listings.
7. Martha Graham School / alumni and professional networks: Sarah's training, if they feature alumni.
Priority Low:
8. Partner reciprocal mentions with other Ealing early-years groups, libraries and children's centres (genuine collaboration only, no link swaps/directories for volume).
Avoid: bought links, link farms, low-quality directories.
A realistic goal is 5 to 15 relevant referring domains over a year. Even 3 to 5 good local links would be meaningful for local intent. Add an `sameAs` set of Instagram/Eventbrite profile URLs on LOCAL (no JSON-LD exists yet) to tie the profiles together; see technical/schema findings.

## Data limits
- Common Crawl gives domain-level graph metrics only; this site is too small to appear.
- No Moz/Bing/DataForSEO means no referring domain count, spam score, anchors or velocity. Skipped factors: all seven scoring factors.
- Search-engine scraping gave no usable results.
- Next step (free): Google Search Console > Links, and Bing Webmaster Tools import, once verified on the domain.
