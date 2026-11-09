# Agent readiness (agentic) - 9 Nov 2026

Standards facts last checked 2026-09-23 (plugin vendor-matrix). WebMCP, Content-Signal, ai-catalog.json (ARD) and Web Bot Auth are drafts/proposals, not settled standards.

## Scores
| | LIVE | LOCAL |
|---|---|---|
| Lighthouse Agentic Browsing (v13.6.0, PSI) | **1/4 mobile, 2/4 desktop** | Not producible: PSI cannot reach localhost, plugin blocks localhost (url_safety). Re-run after deploy. |
| Agent-UX heuristic (0-100, separate metric) | **100, complete** (482 a11y nodes, 18 links, 0 unnamed) | Unavailable (tool blocks localhost). Manual HTML read below; no blocker found. |
| Overall agent-readiness (my judgement) | **45/100** | **~80/100** (pending deployed re-test) |

LIVE Lighthouse audits: agent-accessibility-tree PASS (both); cumulative-layout-shift FAIL mobile / PASS desktop; llms-txt FAIL; ard-schema FAIL. WebMCP audits not applicable (no forms/tools). llms-txt and ard-schema fail only because of the soft-404 catch-all (any URL returns 200 with an empty HTML body, so Lighthouse sees a malformed llms.txt/catalog). A real 404 fixes both with no files to write. Counted-audit paths: llms.txt (needs H1 + links, >=50 chars), /.well-known/ai-catalog.json (if present must be valid), WebMCP form annotations count once every form has toolname+tooldescription.

## Access policy (LIVE)
- Training: unstated. robots.txt is an empty 200 (0 groups); no Content-Signal. Everything allowed by default.
- Search: allowed by default (no rules).
- User-triggered agents: allowed (check robots-user-agents PASS). UA matrix not run (not authorised).
## Access policy (LOCAL, web/public/robots.txt)
`User-agent: * / Allow: / / Sitemap:` - training, search and user-triggered all allowed, explicitly. No Content-Signal. Fine for a non-profit that wants reach; decide deliberately on training (optional `Content-Signal: search=yes, ai-input=yes, ai-train=no`, a preference only).

## Findings
### P0 / what matters (agents finding and booking a session)
1. **LIVE - Critical.** Only 3 pages; no sessions list, no events pages, no sitemap, soft-404 everywhere. Homepage has Eventbrite links (4 found) and server-rendered text (888 words without JS) so a booking is possible, but no dates/venues in structured form. Fixed by the redesign (cutover).
2. **LOCAL - Good.** `/sessions` (web/src/pages/sessions/index.astro) is server-rendered: 94 session rows in plain HTML, each an `<a>` with date/time/event/venue text; filters are real `<button aria-pressed>` and labelled `<select id=f-event/f-venue>` (sr-only labels). Agent-friendly. Homepage "Upcoming sessions" (UpcomingSessionsSection.astro) is SSR too.
3. **LOCAL - Medium.** Filtering/"upcoming" default is Alpine-only (`x-show`). A non-JS fetcher (many AI crawlers) sees all 94 rows including past ones with no marker of which are upcoming. Fix in sessions/index.astro: filter past rows server-side by default (or add a `<time datetime>` and a "Past" section / `?period=` query param), and use `<time datetime={r.date}>` for dates.
4. **LOCAL - Medium.** The `/sessions` row links go to the event page, not Eventbrite; booking is 2 hops (session -> event page "Book free on Eventbrite", `rel=noopener`, new tab). Acceptable; optional: show the booking link or "Book" label in the row (sessions/index.astro, schedule helper).
5. **LOCAL - Medium.** Two `<nav aria-label="Main navigation">` (desktop + mobile) in web/src/components/Nav.astro: duplicates in the a11y tree when the mobile menu is open. Rename mobile one "Mobile navigation". Mobile toggle is a proper button with `aria-expanded` + `aria-controls` (good); the visible text swaps Menu/Close (good). The logo link has aria-label, img alt="".
6. **LOCAL - Good.** Newsletter: Beehiiv iframe in web/src/components/Footer.astro now has a `title`. **LIVE - Low:** same iframe has no title (axe still passed). Note: an agent cannot see inside a cross-origin iframe; offering a plain link to a Beehiiv subscribe page (or mailto) as fallback is the only agent-friendly route (Low).
7. **Contact.** LOCAL: `mailto:hello@ourmovingstories.com` in footer (good). **LIVE - Medium:** no mailto and no email found in homepage HTML; no contact route for an agent. Fixed by redesign.
8. **LOCAL - Medium.** Unknown URLs 302 to /404 (which is a 404): agents see a redirect, not a 404 at the requested URL. Return `new Response(null,{status:404})`/`Astro.rewrite("/404")` in [...slug].astro, events/[slug].astro, people/[slug].astro (also SEO). Cutover note: do not carry LIVE's empty-200 behaviour over.
9. **LOCAL - Low.** /testimonials and /safeguarding-policy have no `<h1>` (landmark/heading outline for agents): add in the page template (web/src/pages/[...slug].astro / Hero or TextSection).
10. **LIVE - Low.** Broken `https://instagram.com/{{settings.instagram}}` link on the homepage is an agent dead-end. Gone in redesign if the Footer uses real settings (verify at deploy).
11. **LIVE - Low.** CLS fails on mobile (Lighthouse). Out of scope here; see performance findings. LOCAL not measurable in dev.

### P1-P3 optional extras (not defects for a tiny community org)
- llms.txt: LIVE fails only through soft-404. LOCAL: /llms.txt 302s -> fine (no file = not applicable... but the 302 to a 404 page: verify it ends 404 after fix #8). Optional: a ~15-line llms.txt with sessions, events, contact, safeguarding.
- Markdown delivery: none (LIVE and LOCAL). Opportunity only; not recommended now.
- /.well-known (api-catalog, OAuth, agent-card, ucp): not applicable; only warn on LIVE because of the catch-all 200. Fixed by real 404s.
- ai-catalog.json (draft/ARD): LIVE "fail" is an artefact of soft-404; do NOT publish one. LOCAL: absent, correct.
- WebMCP (draft): none; no forms except the third-party Beehiiv iframe; skip. Possible future: expose "list sessions" tool - not worth it now.
- Structured data (feeds agents too): no JSON-LD on either target; adding `Event` schema (name, startDate, location, offers free, url=Eventbrite link) to events/[slug].astro and sessions would be the highest-value extra. Sitemap omits events/people/sessions (sitemap.xml.ts) - add.

## Cutover checklist
Real 404 status for unknown paths; robots.txt stays (Allow + Sitemap); expand sitemap; re-run `lighthouse_agentic.py` and `agent_ux_check.py` on the deployed URL (expect 4/4 or 3/4 minus CLS).
