# GEO / AI search readiness: ourmovingstories.com

Audit date: 9 Nov 2026. Category: AI Search Readiness.
- **LIVE**: https://ourmovingstories.com (Astro 4 on Netlify, proxied by Cloudflare). Fetched raw HTML; it is server-rendered.
- **LOCAL**: http://localhost:4321 (redesign, `web/src`, Sanity `production`). Fetched with curl and read the source.

No DataForSEO tools were available, so the platform scores are estimates from on-page evidence, not measured citations.

## Scores

| Dimension (weight) | LIVE | LOCAL | LOCAL after the fixes below (est.) |
|---|---|---|---|
| Citability (25%) | 35 | 50 | 80 |
| Structural readability (20%) | 25 | 50 | 75 |
| Multi-modal (15%) | 30 | 50 | 65 |
| Authority and brand signals (20%) | 30 | 40 | 65 |
| Technical accessibility (20%) | 50 | 65 | 85 |
| **GEO score (0-100)** | **34** | **51** | **~75** |

| Platform (estimate) | LIVE | LOCAL | Main limiter |
|---|---|---|---|
| Google AI Overviews / AI Mode | 25 | 50 | Uses Googlebot and the Google index. LIVE has title "Home", meta description "Astro description", soft-404s and no sitemap. LOCAL has no Event or Organization schema, and its event pages are thin. |
| ChatGPT Search | 30 | 50 | OAI-SearchBot is allowed. No passage states the audience, ages, location and price together. |
| Perplexity | 30 | 55 | PerplexityBot is allowed. LOCAL event pages are fresh but have under 120 words, so Eventbrite listings probably get cited instead (unverified). |
| Bing Copilot | 25 | 45 | No structured data. The sitemap omits events and people, and there is no IndexNow. |

## AI crawler access

Evidence:
- LIVE `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/.well-known/llms.txt`, `/license.xml` and `/.well-known/rsl.xml` all return `200 text/html`, 0 bytes.
- Spoofed-UA GETs of LIVE `/` all returned `200`, 20,883 B, `server: cloudflare` (Netlify origin). UAs tested: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, CCBot, bingbot, Applebot.
- LOCAL `web/public/robots.txt` is `User-agent: *`, `Allow: /`, plus a Sitemap line.

**Unverified:** I made the UA tests from a normal IP, and I had no dashboard access. So the zone's AI Crawl Control, Block AI bots and managed robots.txt settings, and how Cloudflare treats IP-verified bots, are not confirmed. Because the empty origin robots.txt passes through unchanged, managed robots.txt is currently off.

| Crawler | What it governs | LIVE | LOCAL |
|---|---|---|---|
| OAI-SearchBot | ChatGPT Search results and citations | Allowed (no rules) | Allowed |
| ChatGPT-User | User-initiated fetches in ChatGPT | Allowed | Allowed |
| GPTBot | OpenAI training only (not ChatGPT Search) | Allowed | Allowed |
| Claude-SearchBot | Claude search results and citations | Allowed | Allowed |
| Claude-User | User-initiated fetches in Claude | Allowed | Allowed |
| ClaudeBot | Anthropic training only (not Claude search) | Allowed | Allowed |
| PerplexityBot | Perplexity search index | Allowed | Allowed |
| Googlebot | Google Search, AI Overviews and AI Mode inclusion | Allowed | Allowed |
| Google-Extended (robots token) | Gemini/Vertex training and grounding, plus training of the models behind Search gen-AI. Never AIO inclusion. | Allowed | Allowed |
| Bingbot | Bing index, used by Copilot and ChatGPT Search | Allowed | Allowed |
| Applebot | Siri, Spotlight and Safari discoverability | Allowed | Allowed |
| Applebot-Extended | Apple Intelligence training only | Allowed | Allowed |
| CCBot, cohere-ai | Training | Allowed | Allowed |

Keep every search and user-fetch bot allowed. Blocking training bots is the owner's choice. For a small organisation that wants to be found, allowing them is reasonable. Blocking Google-Extended would not affect AI Overviews, but it would remove Gemini grounding.

## llms.txt / RSL
- **LIVE**: missing. The path returns an empty 200, which is a soft-404, so presence checkers may report it as "present but empty". **LOCAL**: missing (302 to /404). No RSL licence on either.
- **Severity Info.** Google Search ignores llms.txt, and the benefit elsewhere is small. If you add one, keep it to about 15 lines in `web/public/llms.txt`: a one-paragraph description using the canonical facts in G5, plus links to `/events`, `/sessions`, `/people/sarah-sulemanji`, `/safeguarding-policy` and `/testimonials`.

## Can an answer engine lift a clean answer?

| Query | LIVE | LOCAL |
|---|---|---|
| "free baby and toddler dance classes in Southall" | **No.** "baby", "toddler" and "free" (lowercase) never appear. "Free" is only a card badge, and event cards have no description. | **Partial.** The homepage has "Weekly movement and art for under-5s with their parents and carers" and "Always free", but it says "Across Ealing". "baby" and "toddler" never appear, and "dance" is missing from the hero and pillars. The event page says "children aged 0-5" and "Open Havelock, London, UB2 4RH", but never mentions Southall or dance. |
| "what is Our Moving Stories" | **Yes.** The first About paragraph (about 50 words) is self-contained: "a community-focused creative arts organisation based in Southall…". It frames the work as "all ages / across generations", though. | Same paragraph, under the non-descriptive H2 "Made by people, for people." It doesn't mention CIC, the founder, free, or ages. |
| "who runs it" | Partly. "Founder" label, plus "founding Our Moving Stories" in the middle of Sarah's bio. | **Yes.** "Sarah Sulemanji, Founder… Sarah founded Our Moving Stories in Southall", plus `/people/sarah-sulemanji` with qualifications. No org-level sentence says "founded by…". |
| "is it free" | Only "Free" badges. | **Yes.** "Always free: Every session and event, funded for the community", "Cost: Free", "Book free on Eventbrite". |
| "what ages" | No. Only "Early Years (0-4)" in Jennifer's bio. | **Inconsistent.** "under-5s" (pillar), "aged 0-5" (event summary), "All ages · All abilities" (hero badge ring, `Hero.astro` line 40) and "all ages" (About). The brief says babies to about 6. |

## Findings

### G1. No passage answers the core local query (High, BOTH)
Evidence: see the table above. The site's vocabulary is "movement / art / little ones / Ealing". Parents search for "baby / toddler / dance class / Southall". No block puts what, who for, ages, where, price and booking in one place.
Fix (LOCAL, Sanity `page` slug `index`):
- `hero.kicker`: change "Free movement, art & community events · Across Ealing" to "Free dance, movement & art for families · Southall & Ealing".
- `hero.subtitle` (Intro), about 50 words: "Our Moving Stories is a community arts company in Southall, West London. We run free weekly dance, movement and art sessions for babies and children aged 0–5 with their parents and carers, and free community events for all ages, at venues across the London Borough of Ealing."
- `textSection` (About): change `heading` "Made by people, for people." to "What is Our Moving Stories?" (or keep the slogan and add a question-style H2 above the FAQ, see G6). Make the first paragraph of `excerpt` a self-contained answer block of about 120 words: "Our Moving Stories is a community interest company (Our Moving Stories CIC, no. 14473202) founded by dance artist Sarah Sulemanji and based in Southall, West London. We run free dance, movement and art sessions for families across the London Borough of Ealing. Our weekly Move and Make sessions are for babies and children aged 0–5 with a parent or carer: music and movement followed by a themed art and craft activity. We also run Story Space and seasonal community events such as Winter Together that everyone can come to. Every session is free, supported by the National Lottery and London Sport in partnership with Peabody and Ealing Council. Places are booked on Eventbrite." **Owner to confirm** the age range (0–5 or 0–6) and the funder wording.
- `textSection.pillars`: change "Little ones & grown-ups" to "Babies & toddlers, 0–5", with "Weekly dance, movement and art for children aged 0–5 with their parents and carers."
- `web/src/components/Hero.astro` line 40: change the `badgeRing` default to `"Free · Ages 0–5 & families · Southall · "` (or set `hero.badgeRing` in Sanity).

### G2. No structured data anywhere (High, BOTH)
Evidence: 0 JSON-LD blocks on every LIVE and LOCAL page fetched. Confirmed with Companies House: OUR MOVING STORIES CIC, no. 14473202, active, incorporated 9 Nov 2022, registered office in Southall UB2 4GH, SIC 90010/90030/96040.
Fix (LOCAL):
- **Organization**, sitewide in `web/src/layouts/Layout.astro` (or homepage only). Include: `name`, `legalName` "Our Moving Stories CIC", `url`, `logo` (`/img/logo-purple.svg` or a PNG), `email`, `founder` (`{"@type":"Person","name":"Sarah Sulemanji","url":".../people/sarah-sulemanji"}`), `foundingDate` "2022-11-09" (if the owner treats incorporation as founding), `identifier` (PropertyValue "Companies House" / "14473202"), `areaServed` ("Southall", "London Borough of Ealing"), and `sameAs` (Instagram, the Companies House URL, the Eventbrite organiser page, and the Wikidata item once created). Read the values from `settings.companyName`, `settings.companyNumber`, `settings.email` and `settings.instagram`. **Don't publish the registered-office street address** until the owner confirms it isn't a home address. `areaServed` plus the venue addresses is enough.
- **Event** in `web/src/pages/events/[slug].astro`. Add one `Event` per upcoming session (cap about 10) rather than a recurring `eventSchedule`, since Google wants one Event per instance. Include: `startDate`/`endDate` (ISO 8601 with a Europe/London offset), `eventAttendanceMode` Offline, `eventStatus` (EventCancelled when `cancelled`), `location` (Place + PostalAddress from `venue`), `offers` (`price` 0, `priceCurrency` GBP, `url` the Eventbrite link), `isAccessibleForFree` true, `typicalAgeRange` "0-5", `organizer` (Organization @id), `image`.
- **Person** in `web/src/pages/people/[slug].astro`. Include `name`, `jobTitle` (`role`), `worksFor` (Organization @id), `image`, and `sameAs` (from `social`).
- **WebSite** on the homepage.

### G3. Event pages are thin and never say Southall (High, LOCAL)
Evidence: `/events/move-and-make-open-havelock-2026-27` has 118 main words, and `/events/winter-together-open-havelock` has 81. They have an H1 and nothing else. `description`, `audience` and `info` are empty in Sanity, although the template already renders them (lines 75, 120, 122). "Where" reads "Open Havelock, London, UB2 4RH".
Fix (Sanity, per `event`):
- `audience`: "Ages 0–5 + grown-ups".
- `summary`: "Free weekly dance, movement and art for babies and children aged 0–5 with their parents and carers, every Wednesday morning at Open Havelock in Southall."
- `description`: 120–170 words covering what happens in a session, who leads it (link the people pages), what to bring, how booking works, and whether siblings can come.
- `info` rows: Who / Ages / Led by / Booking / Access.
- Sanity `venue` Open Havelock: set `address.city` to "Southall" (and Westcott Park to "Acton"), keeping London as `region`.
- Code: in `events/[slug].astro`, make "About this event" and "Schedule" (lines 119, 132) `<h2>`. Make the meta-description fallback on line 66 include the venue and "free".

### G4. Cloudflare will change what crawlers see after cutover (High, CUTOVER)
- **Email obfuscation is on for the zone.** On LIVE the email reaches crawlers as `[email protected]` via `/cdn-cgi/l/email-protection` and `email-decode.min.js`. LOCAL currently emits a plain `mailto:hello@ourmovingstories.com` (`web/src/components/Footer.astro` line 50). Once the Worker serves the zone, it will probably be rewritten too (unverified for Worker responses). Fix: turn off Scrape Shield's Email Address Obfuscation, or wrap the address in `<!--email_off-->…<!--/email_off-->` in `Footer.astro`. After cutover, check with `curl -s https://ourmovingstories.com/ | grep hello@`.
- **AI Crawl Control, Block AI bots and managed robots.txt.** Their current state is unknown, but they're off in effect today. If someone enables them during Worker setup, Cloudflare prepends `Content-Signal` lines and training-bot disallows to `web/public/robots.txt`, or blocks bots at the edge. After cutover:
  - Confirm in the dashboard that OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Googlebot, Bingbot and Applebot are allowed.
  - Fetch `/robots.txt` and confirm it's the intended file.
- **Preview Worker (Low).** `our-moving-stories-preview` (drafts, Visual Editing) serves the same allow-all robots.txt. Its canonicals point at production, which helps, but add `X-Robots-Tag: noindex` (or a disallow-all robots.txt) in preview mode.

### G5. Entity facts are inconsistent (Medium, BOTH)
Evidence:
- **Location**: "based in Southall" (About), "Across Ealing" (hero kicker and footer), "West London" (default meta in `Layout.astro` line 17), "Southall and Ealing" (`/events` meta). Venues read as just "London".
- **Ages**: "all ages / across generations" (About) vs "under-5s" vs "0-5" vs "All ages · All abilities" (badge).
- **Name**: "Our Moving Stories" vs "Our Moving Stories CIC" (footer). That's fine, but give `legalName` in schema.
Fix: agree one canonical set of facts and use it in the hero, About, the default meta description, the Organization schema, the Eventbrite organiser profile and the Instagram bio.
- Name: Our Moving Stories (Our Moving Stories CIC, 14473202).
- Base: Southall, London Borough of Ealing, West London.
- Founder: Sarah Sulemanji.
- Offer: free dance, movement and art for babies and children aged 0–5 with carers, plus all-ages community events.
- Booking: Eventbrite.

### G6. Headings don't describe the content (Medium, LOCAL; worse on LIVE)
Evidence:
- **LOCAL**: the H1 is the slogan "Everyone has a story to tell through Movement.", and the About H2 is "Made by people, for people.". Event and person pages have only an H1, because their section labels are `<div class="eyebrow">` (`events/[slug].astro` lines 119/132, `people/[slug].astro` lines 64/70). `/testimonials` and `/safeguarding-policy` have no H1. Their page title renders as an H2 through the page builder, and they use the default description. There are no question headings anywhere.
- **LIVE**: five H1s on the homepage ("About", "What's On", "People", "Instagram", "Get in touch"). This is fixed in LOCAL.

Fix:
- Change the eyebrow labels to `<h2>`.
- Give the Testimonials and Safeguarding pages an H1 and their own Sanity `page.description`.
- Add a homepage FAQ: a new `faq` object in `studio/schemas/page.ts` `pageBuilder` plus `web/src/components/FaqSection.astro`, wired in `Block.astro`. Each answer should be 40–60 words. Suggested questions:
  - Is it free?
  - What ages are the sessions for?
  - Where are you?
  - Do I need to book?
  - Who runs Our Moving Stories?
  - Can I bring an older sibling?

  The value is passage extraction. Google restricts FAQ rich results to government and health sites, so don't expect a rich result.

### G7. `/sessions` serves stale dates first to non-JS crawlers (Medium, LOCAL)
Evidence: the server HTML lists every session oldest-first, starting "Wed 17 Apr 2024". Alpine (`x-show`, default `period: 'upcoming'`) hides past rows only in a browser. GPTBot, ClaudeBot and PerplexityBot don't run JS.
Fix: in `web/src/pages/sessions/index.astro` (sort at line 23), render upcoming sessions first in ascending order. Put past sessions in a later section under its own `<h2>Past sessions</h2>`, in descending order, or drop sessions older than about 6 months. Keep the filters on top.

### G8. LIVE publishes garbled facts (Medium, LIVE; fixed in LOCAL)
Evidence:
- "Every Sat, Apr 25 to Invalid DateTime", "3:00 PM - 5:00 PM (3362h 0m)" and "(6722h 0m)".
- A broken link: `https://instagram.com/{{settings.instagram}}`.
- Literal `<img src="post.mediaUrl" alt="post.prunedCaption">` in the server HTML (unrendered Alpine template).
- Event posters with no alt text.
- `title` "Home", meta description "Astro description".

An LLM can lift these strings verbatim. No action beyond the cutover itself.

### G9. Weak off-site entity footprint (Medium, BOTH)
Evidence:
- No Wikipedia article and no Wikidata item (both searched: 0 results).
- Instagram is the only `sameAs`-style link. LOCAL Sarah's page links `instagram.com/sarahsmovingstories`.
- **Unverified**: Reddit, YouTube and LinkedIn presence. reddit.com wasn't fetchable, DuckDuckGo served a bot challenge, Bing ignored the quoted phrase, and YouTube results render client-side. The Eventbrite organiser profile text wasn't checked.

Fix:
- Create a Wikidata item: instance of community interest company, with the Companies House company ID, official website, Instagram username, founder, and located in Southall.
- Post the hero montage and short session clips to a YouTube channel with descriptive titles, e.g. "Free baby & toddler dance and art, Southall | Our Moving Stories". YouTube mentions correlate most strongly with AI citations.
- Make the Eventbrite organiser bio match G5.
- Create a LinkedIn company page.
- Encourage organic mentions in local parent forums. Don't seed them.

### G10. Smaller LOCAL issues (Low, LOCAL)
- **Bad Sanity data**: the "Move and Make - Westcott Park" session on 25 Apr 2025 has `endTime` "11:300" and renders "9:30–11:300 AM". Fix the value, and add an `HH:mm` regex validation to `startTime`/`endTime` in `studio/schemas/events.ts`.
- **Supreet Kaur** has no `slug`, so she has no person page and isn't linked. Her homepage card text is truncated ("families and…") by `PeopleSection.astro` line 27. Fix: set `person.slug` and a short `excerpt` under 200 characters.
- **Instagram grid** (`InstagramSection.astro`) is client-only (Alpine fetch from `feed.ourmovingstories.com`), so crawlers see nothing. That's acceptable; just don't rely on it for content.
- **Dates** have no `<time datetime>` markup (event rows, the event page "Next date", `/sessions`). Add `datetime` attributes.
- **Hero video**: only the poster is in the HTML. The `src` is set by JS, but the `aria-label` describes the montage well. Optional: add a `VideoObject`.
- **Sitemap**: `web/src/pages/sitemap.xml.ts` lists only 3 pages, without `/events/*`, `/people/*` or `/sessions`. This matters for Bing/Copilot and ChatGPT discovery (the technical agent covers it in detail).

## Redesign status

| | Status |
|---|---|
| Fixed by LOCAL | Titles, meta descriptions, canonical/OG, a single H1 on the homepage, a working Instagram link, correct dates, the "Free" and "under-5s" statements, the funders as text, individual event and person pages, and a real robots.txt. |
| Still wrong in LOCAL | No JSON-LD. Thin event pages with no Southall, baby, toddler or dance wording. Inconsistent ages and location. Slogan headings and div section labels. Stale-first `/sessions`. No FAQ. A 3-URL sitemap. |
| At cutover | Cloudflare email obfuscation, the AI Crawl Control / Block AI bots / managed robots.txt check, preview Worker noindex. After launch, re-fetch `/robots.txt` and the homepage as OAI-SearchBot, PerplexityBot and Claude-SearchBot. |

## Top 5 highest-impact changes

| # | Change | Where | Effort |
|---|---|---|---|
| 1 | Rewrite the hero kicker, Intro, About block and pillars into self-contained answers (G1) | Sanity `page` index | 30–45 min |
| 2 | Fill event `summary`, `description`, `audience` and `info`, and set venue city to Southall (G3) | Sanity `event`, `venue` | 1–2 h |
| 3 | Organization + Event + Person JSON-LD (G2) | `Layout.astro`, `events/[slug].astro`, `people/[slug].astro` | 3–4 h |
| 4 | Cutover checks: email obfuscation, AI crawler settings, robots.txt (G4) | Cloudflare dashboard, `Footer.astro` | 15–30 min |
| 5 | FAQ block, `<h2>` section labels and upcoming-first `/sessions` (G6, G7) | `studio/schemas/page.ts`, new `FaqSection.astro`, `events/[slug].astro`, `people/[slug].astro`, `sessions/index.astro` | 3–4 h |

Next tier: Wikidata item, YouTube channel and Eventbrite organiser bio (G9), about 2–3 h.

## Structured findings (for audit-data.json, category "AI Search Readiness")

```json
{
  "category": "AI Search Readiness",
  "scores": { "live": 34, "local": 51, "local_after_fixes_estimate": 75 },
  "dimensions": {
    "citability": { "live": 35, "local": 50 },
    "structural_readability": { "live": 25, "local": 50 },
    "multi_modal": { "live": 30, "local": 50 },
    "authority_brand": { "live": 30, "local": 40 },
    "technical_accessibility": { "live": 50, "local": 65 }
  },
  "platforms": {
    "google_aio": { "live": 25, "local": 50 },
    "chatgpt": { "live": 30, "local": 50 },
    "perplexity": { "live": 30, "local": 55 },
    "bing_copilot": { "live": 25, "local": 45 }
  },
  "crawler_access": { "live": "all allowed (no robots.txt; empty 200)", "local": "all allowed (User-agent: * Allow: /)", "cutover_risk": "Cloudflare AI Crawl Control / managed robots.txt unverified" },
  "llms_txt": { "live": "missing (empty 200 soft-404)", "local": "missing (302 -> /404)" },
  "findings": [
    { "id": "G1", "severity": "High", "target": "BOTH", "title": "No passage answers 'free baby/toddler dance classes in Southall'", "fix_location": "Sanity page index: hero.kicker, hero.subtitle, textSection heading/excerpt/pillars; web/src/components/Hero.astro badgeRing" },
    { "id": "G2", "severity": "High", "target": "BOTH", "title": "No JSON-LD (Organization, Event, Person)", "fix_location": "web/src/layouts/Layout.astro, web/src/pages/events/[slug].astro, web/src/pages/people/[slug].astro" },
    { "id": "G3", "severity": "High", "target": "LOCAL", "title": "Event pages thin (81-118 words), no Southall", "fix_location": "Sanity event.summary/description/audience/info; venue.address.city" },
    { "id": "G4", "severity": "High", "target": "CUTOVER", "title": "Cloudflare email obfuscation and AI crawl settings", "fix_location": "Cloudflare dashboard; web/src/components/Footer.astro" },
    { "id": "G5", "severity": "Medium", "target": "BOTH", "title": "Inconsistent location/age/entity facts", "fix_location": "Sanity page index, web/src/layouts/Layout.astro default description, Eventbrite organiser bio" },
    { "id": "G6", "severity": "Medium", "target": "LOCAL", "title": "Non-descriptive headings, div section labels, no FAQ", "fix_location": "events/[slug].astro, people/[slug].astro, studio/schemas/page.ts, new FaqSection.astro" },
    { "id": "G7", "severity": "Medium", "target": "LOCAL", "title": "/sessions HTML lists 2024 sessions first", "fix_location": "web/src/pages/sessions/index.astro" },
    { "id": "G8", "severity": "Medium", "target": "LIVE", "title": "Garbled dates, template placeholders, broken Instagram link", "fix_location": "Fixed by redesign" },
    { "id": "G9", "severity": "Medium", "target": "BOTH", "title": "No Wikidata/Wikipedia; sameAs only Instagram; Reddit/YouTube/LinkedIn unverified", "fix_location": "Off-site" },
    { "id": "G10", "severity": "Low", "target": "LOCAL", "title": "11:300 time, Supreet no page, JS-only Instagram grid, no <time>, 3-URL sitemap", "fix_location": "Sanity event session endTime; studio/schemas/events.ts; person slug; sitemap.xml.ts" }
  ]
}
```
