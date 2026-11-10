# Our Moving Stories redesign: handoff

The site was moved to the "zine" design prototyped as v3.12 (see `design-v3.12.dc.html`) and went live
on Cloudflare on 10 Nov 2026 (PR #4). This file explains what exists, what decisions were made, and what
is left. `README.md` has the short version and the day-to-day flow.

## Where things stand

- `web/` (Astro 7 + Tailwind 4, rendered on request on Cloudflare Workers) restyled end to end.
  Builds and deploys with the `cf` CLI; see "Hosting (Cloudflare)".
  All dependencies were upgraded on 9 Nov 2026; see "Dependency upgrade" below.
- `studio/` schemas extended with optional fields only. Existing content stays valid.
- Sanity: the site and Studio now read `SANITY_STUDIO_DATASET=production` from the root `.env`
  (loaded by direnv via `.envrc`). `production` now holds a copy of staging plus the seeded design copy.
  `staging` is the old content and must not be written to.
- The live site is this build, on Cloudflare at https://ourmovingstories.com since 10 Nov 2026 (see
  "First deploy and cutover"). Netlify no longer serves it.

## Next steps

1. ✅ Done 9 Nov 2026. Copy staging into production (from `studio/`):
   ```
   npx sanity dataset export staging staging-backup.tar.gz
   npx sanity dataset import staging-backup.tar.gz production --missing
   ```
2. ✅ Done 9 Nov 2026. Fill the design copy into production:
   `SANITY_STUDIO_DATASET=production npx sanity exec scripts/seed-redesign.ts --with-user-token`
   (refuses to run on any dataset but `production`; see the header comment for exactly what it changes).
2a. Resolve the 13 drafts that came over from staging. The seed only patches published documents, but
   draft mode (Studio's Presentation tool) shows drafts, so the nav still looks unseeded there.
   - 6 events (all but "Move and Make @ Open Havelock 2025/26" and "Creativity & Connection") have drafts
     adding `slug` and their past `sessions`; 4 people (not Supreet) have drafts adding `slug` + `excerpt`;
     `nav` has a draft with the old order. Publish these, then re-run step 2 (it is safe to re-run) to
     restore the nav fix and event audience/summary that publishing the drafts drops.
   - Safeguarding Policy has an unpublished body edit from Oct 2024, and there is an orphaned
     `peopleSection` draft from Oct 2024. Check and publish or discard.
   - Querying for drafts with `apiVersion` 2025-02-19 or later needs `perspective: "raw"`; the default
     `published` perspective hides them.
3. ✅ Done 9 Nov 2026. 2026/27 events added by the Eventbrite sync (logic in `packages/eventbrite-sync`;
   its header says which fields it owns). It created one event per Eventbrite series/one-off (`_id`
   `event-eb-<id>`), the Windmill Park venue (`venue-eb-<id>`) and posters from Eventbrite's images:
   Move and Make @ Open Havelock 2026/27 (Wed 09:30–11:30, 4 Nov – 10 Feb, 12 dates), Story Space
   (Thu 15:30–17:00, 5 Nov – 10 Dec, 6 dates), and three Winter Together one-offs (Westcott Park Fri 11 Dec,
   Windmill Park Sat 12 Dec, Open Havelock Sat 19 Dec). From now on the `workers/eventbrite-sync` Worker
   keeps it in step (webhooks + a daily full sync); by hand, from `studio/`: `bun run sync:eventbrite` (dry run)
   or `bun run sync:eventbrite:apply`. Still to do in Studio:
   - set "Who it's for" on the new events (the sync leaves audience to editors);
   - add cancelled sessions with a "Christmas break" note for Move and Make on 16, 23, 30 Dec if the
     diary should show the gap (the sync keeps editor-added sessions);
   - the venue is "Westcot Park Community Centre" on purpose: that's how Google Maps spells it. A correction
     was suggested to Google (Nov 2026); if it changes, rename it on Eventbrite under the latest event
     held there (→ Location) and the venue follows.
4. Optional content: write short person excerpts (cards truncate the bio at ~200 chars otherwise).
   Event images come from Eventbrite (the sync fills "Poster" once, when it's empty), and the current ones
   are photos that crop well at 3:4. Only set an event's "Card photo" when its Eventbrite image is a text
   flyer that crops badly; it then replaces the poster on cards and the event page. `photos/*.jpg` here
   were design placeholders, not needed.
5. `bun run dev` in `web/` and review every page at desktop and ~390px wide.
   First pass done 9 Nov 2026 against production: home, events, event detail, sessions, text pages and 404
   match the design at both widths. Not yet reviewable: person pages (no published person has a slug
   until 2a) and anything driven by upcoming sessions (needs step 3).
6. When happy: deploy to Cloudflare and cut the domain over; follow "First deploy and cutover" below.

## Hosting (Cloudflare)

Everything is managed with the Cloudflare CLI `cf` (beta; a pinned dev dependency, configured by
`cloudflare.config.ts` files rather than `wrangler.jsonc`). Run it with Node (`npx cf …`), not Bun.
`cf` can't set single secrets or tail logs yet: use `cf deploy --secrets-file` and the dashboard's
Observability tab (or `npx wrangler tail <worker>`).

- **Site** (`web/`): Worker `our-moving-stories`, the only site deployment (draft mode is per request; see
  below). It uses `@astrojs/cloudflare` 15 (beta), the version that works with `cf` (v14 needs Wrangler
  config). Every page renders on request, and static files are served by Workers Assets (`/_astro/*`
  immutable). Cloudflare's static assets ignore `Range` (always a full 200), and Safari won't play video without
  206 Partial Content, so `/video/*` goes to the Worker first (`assets.runWorkerFirst`) and `src/worker.ts`, the
  entrypoint wrapping Astro's handler, answers byte ranges. There are no KV or Images bindings: sessions are
  off and images come from Sanity. Astro reads
  `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` at build time. One Worker secret,
  `SANITY_READ_TOKEN` (Viewer), read at runtime and only by draft mode; locally it comes from
  `web/.dev.vars` (see `web/.dev.vars.example`). `bun run dev` runs Astro on workerd.
- **Draft mode** (Studio's Presentation tool shows unpublished changes on the real site, click-to-edit).
  Three ways a change reaches the preview:
  1. **Entering draft mode.** Presentation opens `/api/draft-mode/enable?sanity-preview-secret=…` in its
     iframe. The route checks the one-off secret against the dataset (`@sanity/preview-url-secret`), sets an
     HttpOnly cookie signed with a key derived from `SANITY_READ_TOKEN` (8 hours) and redirects to the page.
     (Sanity's own Astro example uses an unsigned cookie that anyone could set; ours can't be forged.)
     `src/middleware.ts` turns a valid cookie into `Astro.locals.preview`, which every `loadQuery` call must
     pass (a required argument): queries then skip the CDN, read the editor's perspective (drafts or a
     content release) with the token and add stega, and the page gets the Visual Editing island and
     `Cache-Control: private, no-store`. Everyone else gets published content from the CDN.
  2. **Typing, instantly.** Presentation only tells the page about an edit once the Studio has saved it, so
     `studio/components/LivePreviewInput.tsx` (`form.components.input`) posts the unsaved document to the
     preview iframe on every change. `web/src/components/live-text.ts` accepts it only from the parent
     window on a Studio origin (`web/src/sanity/lib/studio.ts`) and rewrites the text nodes whose stega
     marker names the edited field, if they show it verbatim (the value, or a ≤3-character edit of it).
     Formatted text such as `*accent*` headings, and anything that isn't text, waits for step 3.
  3. **After each save, in place.** Visual Editing calls `refresh`; `components/preview-refresh.ts` fetches
     the page and morphs the new `<body>` in with Alpine's morph plugin, keeping scroll, Alpine state and
     the playing hero video. For 10 s after the last keystroke, typed text beats the server's older copy.
     Elements whose state a script owns carry `data-preview-keep="<attributes>"` and are left alone; a
     change to a listed attribute (the hero video's sources) reloads instead. List attributes explicitly:
     dev mode adds `data-astro-source-*` attributes that the dev toolbar strips from the live page.
  - `components/SanityVisualEditing.tsx` mounts `@sanity/visual-editing` directly (not `@sanity/astro`'s
    wrapper) with our own `history` (`preview-history.ts`: @sanity/astro 3.6.1's compares the Studio's
    relative URL with the absolute `location.href` and reloads on every reconnect) and `refresh`.
  - Full reloads only happen for the Studio's refresh button, a perspective switch, another page, an
    expired cookie or a changed hero video, and each logs a `[preview] …` line saying why. Debug a refresh
    from the console with `await __previewRefresh()`.
  - Opened outside Presentation (e.g. in a new tab), the page shows a "Previewing drafts · Exit" button;
    `/api/draft-mode/disable` clears the cookies.
  - Only the Studio (`ourmovingstories.sanity.studio`; `localhost:3333` in dev) and `www.sanity.io` (the
    dashboard) may frame the site (`Content-Security-Policy: frame-ancestors`).
  - Test locally: run Studio (`studio/`, `bun run dev`, port 3333) and the site (`web/`, port 4321), open
    Presentation. Draft mode needs `web/.dev.vars`.
- **Eventbrite sync** (`workers/eventbrite-sync`): Worker `our-moving-stories-eventbrite-sync`, the only
  thing holding a Sanity write token.
  - `POST /eventbrite/<WEBHOOK_SECRET>`: Eventbrite webhook. It replies 202, then syncs the event named
    by the payload's `api_url` (its whole series) in the background. The secret in the URL is what
    authenticates Eventbrite (payloads aren't signed); `api_url` is only accepted as
    `https://www.eventbriteapi.com/v3/events/<id>/`, and the sync builds its own requests from the ID.
    A payload without one (the "Test" button) runs a full sync.
  - `GET` on the same path: dry run that returns the log and writes nothing. `?event=<id>` dry-runs one
    event the way its webhook would.
  - A daily cron (05:17 UTC) runs a full sync. Eventbrite gets its 202 before the sync runs, so it never
    retries one that failed; this catches up anything a failed or missed webhook left behind.
  - Every run writes only what differs, so documents' `_updatedAt` only moves when something changed.
  - Eventbrite owns a synced event's name, summary, description (its "Overview", converted to Portable
    Text by `packages/eventbrite-sync/src/portable-text.ts`), FAQs, price, booking link, poster, venue
    and session times; Studio shows those read-only on synced events (`readOnly: fromEventbrite` in
    `studio/schemas/events.ts`), so editors change them on Eventbrite. Audience, card photo, key details
    and session notes stay Sanity's. A Studio draft of a synced event gets the same changes, so publishing
    it doesn't undo them. The package header has the full list.
  - Venues: one Sanity venue per place (the site filters on venue), though Eventbrite makes a venue
    record per event. `venueFor` uses the venue linked to the Eventbrite record (`eventbriteId`), else
    one with the same postcode or name, else creates `venue-eb-<id>`. A venue takes its name, address and
    map pin from the newest Eventbrite record for the place (the latest event held there); older records
    only point events at it, so they can't overwrite it. Linked venues are read-only in Studio: fix a
    venue's name or address on Eventbrite, on the latest event held there (→ Location).
  - The shared logic is in `packages/eventbrite-sync`, also used by `studio`'s `bun run sync:eventbrite`
    (dry run; `bun run sync:eventbrite:apply` writes). Add `--event <id>` for one event, or `--all` for
    every event Eventbrite has ever had, creating past ones Sanity lacks (the history backfill).
  - Sessions: Eventbrite's dates win. A date Eventbrite doesn't list is removed unless an editor marked
    it cancelled or gave it a note.
  - Locally: `npx cf dev` (dry runs only), with secrets in `.dev.vars` (see `.dev.vars.example`).
    Fire the cron with `curl 'localhost:8787/cdn-cgi/local/scheduled?cron=17+5+*+*+*'`.
- **CI** (`.github/workflows/deploy.yml`): PRs build, type-check and dry-run. Pushes to `master` deploy
  the site and the sync Worker. There is no `develop` branch: branch off `master` and open a PR.

### First deploy and cutover

1. Sign in: `npx cf auth login`.
   - Needed now: Workers Scripts (edit), account and user details (read), Workers Observability/Tail (read).
   - For step 8, on the `ourmovingstories.com` zone: zone read, Workers routes, DNS and SSL certificates
     (edit).
2. Create a Sanity robot token with the Editor role for the sync Worker: sanity.io/manage → project → API
   → Tokens.
3. Deploy the sync Worker with its secrets.
   - Put `SANITY_WRITE_TOKEN`, `EVENTBRITE_PRIVATE_TOKEN` and `WEBHOOK_SECRET` (e.g. `openssl rand -hex 24`)
     in `workers/eventbrite-sync/.dev.vars.production`. It's gitignored.
   - Run `npx cf deploy --secrets-file .dev.vars.production` from that folder.
   - Check that `https://our-moving-stories-eventbrite-sync.<subdomain>.workers.dev/eventbrite/<secret>`
     shows a dry-run log.
4. ✅ Done 10 Nov 2026. Deploy the site with its secret.
   - Create a Sanity token with the Viewer role for draft mode (sanity.io/manage → project → API → Tokens)
     and put `SANITY_READ_TOKEN=<token>` in `web/.dev.vars.production` (gitignored).
   - From `web/` (env from the root `.env`): `npx cf build && npx cf deploy --prebuilt --secrets-file .dev.vars.production`.
   - Check the workers.dev URL. The site works without the secret; only draft mode needs it. (Since step 8
     the site's workers.dev address is off: with `domains` set, `cf deploy` disables it by default.)
5. Point Studio at the site and redeploy it (step 8 is done, so the site URL is `https://ourmovingstories.com`).
   - Add the site as a CORS origin with credentials:
     `cd studio && npx sanity cors add https://ourmovingstories.com --credentials`
     (and `http://localhost:4321` for local Presentation).
   - `SANITY_STUDIO_PREVIEW_URL=https://ourmovingstories.com npx sanity deploy` from `studio/` (it replaces
     https://ourmovingstories.sanity.studio; `studioHost` in `sanity.cli.ts`), then open Presentation and
     check that click-to-edit works. The root `.env` has `localhost:4321`, which only works locally.
6. ✅ Done 10 Nov 2026. Set up GitHub.
   - Repository secrets: `CLOUDFLARE_API_TOKEN` (Workers Scripts edit), `CLOUDFLARE_ACCOUNT_ID`.
   - Repository variables: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` = `production`.
7. Add the Eventbrite webhook. It needs an organisation Admin (Imran is one since November 2026):
   - Eventbrite → Account Settings → Developer Links → Webhooks → Add webhook.
   - URL: the Worker's `/eventbrite/<WEBHOOK_SECRET>` address.
   - Actions: `event.created`, `event.published`, `event.updated`, `event.unpublished`, for all events.
   - Done 2026-11-10 through the API (`POST /v3/organizations/2281976374053/webhooks/`): webhook 15946660.
     If `WEBHOOK_SECRET` changes, update the webhook's URL too.
8. ✅ Done 10 Nov 2026 (10:30 UTC). Cut the domain over.
   - `domains` in `web/cloudflare.config.ts` attaches `ourmovingstories.com` and `www` as Worker custom
     domains; `src/worker.ts` 301s `www` and plain `http` to `https://ourmovingstories.com` in one hop.
   - The Netlify records were deleted first (Cloudflare won't attach a custom domain over them). To roll
     back: remove `domains`, redeploy, and recreate them: `A ourmovingstories.com 75.2.60.5` and
     `CNAME www ourmovingstories.netlify.app`, both proxied. The Google Workspace MX records were untouched.
   - Still to do: stop builds / disconnect the repo in Netlify, so merges to `master` don't build there.
9. ✅ Done 10 Nov 2026. Analytics (SEO action plan 3.2): Cloudflare Web Analytics site
   `317ea4db9e694a94a534956c4f6f6977` (zone `ourmovingstories.com`). Its token is the GitHub variable
   `PUBLIC_CF_WEB_ANALYTICS_TOKEN`; Layout.astro adds the beacon only when it's set at build time, and never
   in draft mode. Cloudflare's automatic injection is off (it didn't reach Worker responses, and would count
   draft mode). No cookies, so no consent banner. Leave the token out of local `.env` files so local visits
   aren't counted; a manual `cf deploy` without it ships pages with no beacon, so deploy through CI.

## Design system

Defined in the `@theme` block of `web/src/styles/tailwind.css` (Tailwind 4 is CSS-first; there is no
`tailwind.config.mjs`). A token `--color-ink` gives `bg-ink`, `text-ink`, etc.

| Token | Value | Use |
|---|---|---|
| `ink` | #1E1433 | text, rules, dark footer |
| `grape` | #4B2E8F | primary purple, headings, primary buttons |
| `coral` / `coral-soft` / `coral-deep` | #FF6B57 / #FF8A78 / #C2412E | accents; `-soft` on dark, `-deep` for coral text on cream |
| `cream` | #F3EDE2 | page background |
| `lilac` / `lilac-light` / `lilac-mid` / `lilac-dash` | #DCD0F7 / #B9A6EE / #8C74D9 / #9F8BDB | text and rules on purple |
| `peach` | #FFD9CF | row hover |
| `sand` | #E8DED0 | image placeholders |
| `mauve` (+ `-dim`, `-line`) | #A898C9 / #8A79AE / #3A2C5C | footer small print |

Fonts, self-hosted through Astro's `fonts` config (`astro.config.mjs`) and rendered by `<Font>` in
`Layout.astro`: Big Shoulders Display 800/900 (`font-display`, uppercase, line-height ~0.84), Karla 400/700
(`font-sans`, body), DM Mono 400 (`font-mono`, labels/buttons, uppercase). Karla and DM Mono download from
Google at build time. Big Shoulders Display is a file in `src/assets/fonts/`, because Google's font list
now only has it as "Big Shoulders", which the provider can't match. Add a weight to the config before using
it in a class, or the browser fakes it. Small mono labels (`.eyebrow`, nav, footer, buttons) are 14px; keep
anything tappable at least 44px tall.
Legacy colour names (`text`, `primary`, `dark`, `light`) are remapped to the new palette.

Component classes (Tailwind `@utility` blocks, so they work with variants and `@apply`): `.wrap`
(1360px page width + gutters), `.eyebrow`, `.display`, `.btn-primary`, `.btn-outline`,
`.btn-outline-light`, `.btn-coral`, `.tag`, `.rich` (portable text).

Decorations: `web/public/img/leaves/*` (leaf-1..6, spray, wing-left/right). `leaf(i)` in
`src/lib/text.ts` cycles leaves for people cards and section labels.

Editors mark coral words in any heading with asterisks: `Made by people, *for people.*`
(`highlight()` / `splitHighlight()` in `src/lib/text.ts`). In the hero title the starred part becomes
the giant coral word with the brush swash. It's sized for one short word ("Movement.") and shrinks to keep
longer text on one line (`accentSize` in `Hero.astro`), down to the white lead's 40px on phones, after which
it wraps. Shorter is still better: the title is "Everyone has a story to tell through art & *movement.*"
rather than "*Movement & Arts.*", which keeps the coral word at full size.

## Code map (web/src)

- `lib/schedule.ts`: event/session types, the GROQ projection `EVENT_FIELDS` used by every event query,
  date/time formatting (London time for "today"), next/last session, "Every Wed" detection,
  month-grouped schedule with cancellations, address/map helpers.
- `lib/text.ts`: asterisk highlighting, HTML escaping, leaf decorations.
- `lib/data.ts`: `siteData()` (settings + nav + footer) and `allEvents()`, each fetched once per request
  and shared through `Astro.locals`. Use them rather than querying events or settings again in a component.
- `lib/schema.ts`: JSON-LD builders (organisation, website, breadcrumbs, one Event per future session,
  profile pages). Pages pass their nodes to Layout's `schema` prop. The markup must match what the page
  shows (dates, free price, cancellations), so change both together.
- `sanity/lib/urlFor.ts`: `urlFor`, plus `srcset()` for responsive Sanity images and `imageSize()`.
- `layouts/Layout.astro`: fonts, meta, JSON-LD, skip link, Nav + Footer (from `siteData`), Alpine (bundled
  from npm) for small interactions, optional Cloudflare Web Analytics beacon.
- `components/Nav.astro`: sticky cream header, Sanity nav items + "Join in", mobile menu (Alpine).
- `components/Hero.astro`: full-bleed video hero, "Free" badge with spinning ring and paper wings (at least
  220px wide so the ring text stays readable on phones; its text scales with the badge via `cqi`),
  "Book a free session" button (only when something is coming up), intro strip with buttons and
  "Next up". The poster is a `<picture>` under the video (one poster per screen shape, WebP first; it's
  the LCP image). Video choice happens client-side: portrait file when the viewport is ≤4:5, 720p when
  width×DPR ≤ 1400 or on 3G, else 1080p. Reduced motion and Save-Data/2G download no video until Play.
  Media precedence: uploaded Sanity video → hero image (non-home pages) → bundled montage
  (`/video/hero-*.mp4`, homepage only).
- `components/TextSection.astro`: cream/purple/dark themes, split or stacked layout, "highlights" rows.
- `components/EventsSection.astro` + `EventRow.astro`: "Coming up" list, then a count of past events (not
  links; they live on /events). Past events are labelled with when they ran (`ranLabel`: "20 Dec 2025",
  "Apr – Sept 2026"), not "last held".
- `components/UpcomingSessionsSection.astro`, `PeopleSection.astro`,
  `Footer.astro` (dark contact block, Beehiiv iframe in the newsletter card, funder logos, legal line).
- `components/Block.astro` maps page-builder blocks to components and skips types it doesn't know.
- Pages: `[...slug].astro` (Sanity pages), `events/index.astro`, `events/[slug].astro`,
  `sessions/index.astro` (Alpine filters), `people/[slug].astro`, `404.astro`.

## Schema changes (studio/schemas)

- `hero`: `kicker`, `showNextUp`, `videoSmall`, `videoTall`, `videoDescription`, `posterTall`,
  `badge`, `badgeRing`; field groups; `subtitle` became a text field labelled "Intro".
- `textSection`: `eyebrow`, `theme` (cream/purple/dark), `layout` (split/stacked), `pillars[]`
  ({title, text, accent}).
- `event`: `audience`, `summary`, `photo` (card photo, falls back to poster), `info[]` ({label, value}),
  `faqs[]` ({question, answer}; from Eventbrite on synced events, shown under the key details), and
  `poster.eventbriteId` (hidden: which Eventbrite image the poster is).
- `eventsSection`: `eyebrow`, `intro`. `upcomingSessionsSection`, `peopleSection`: `eyebrow`.
- Removed: `instagramSection` (the page-builder Instagram feed) and `settings.beholdFeedUrl`. The feed
  host (`feed.ourmovingstories.com`) no longer resolves. `seed-redesign.ts` deletes the leftover data;
  `settings.instagram` (the handle) stays for the footer link and the organisation's `sameAs`.
- `footer`: `contactEyebrow`, `contactHeading`, `contactText`, `newsletterHeading`, `newsletterText`,
  `partnersLine`.

## Gotchas

- `footer` has `id="contact"`. The old homepage "Get in touch" text block also uses anchor `contact`;
  the seed script removes that block. Don't reintroduce a second `#contact`.
- The old staging hero has an uploaded video (old reel) and a portrait photo as `image`. If either is
  set, it wins over the bundled montage. The seed script clears both on production.
- Event "repeat" labels are derived from session dates (≥3 sessions on one weekday, ≤4-week gaps).
- Nothing is prerendered: every page renders on request, so Studio edits and Eventbrite syncs show up
  without a rebuild (production reads Sanity's CDN, which can lag by a few seconds). Don't add
  `export const prerender = true` / `getStaticPaths()` back to Sanity-driven pages, or they go stale.
- **Drafts only show in draft mode.** `bun run dev` and production both render published content; Studio's
  Presentation tool turns draft mode on per browser. Check a production build before deploying: from
  `web/`, with the root `.env` loaded, `npx cf build && npx astro preview --port 4329` (`npx astro preview
  stop` when done; if another preview is already running, add `--ignore-lock` and stop it with Ctrl-C). The
  preview keeps the edge cache on disk in `.cloudflare/state` between runs, so after a rebuild use a new
  port (the cache is keyed by URL) or wait 5 minutes, or you'll be looking at the old build's pages. This caught a homepage crash on 9 Nov 2026: published events with no `sessions` came
  back as `null`. (`PUBLIC_SANITY_VISUAL_EDITING_ENABLED` in the root `.env` is no longer used.)
- **Stega in draft mode.** Every Sanity string then ends in invisible zero-width characters that power
  click-to-edit. Comparing, parsing or putting such a string in an attribute breaks. The default filter
  skips slugs, URLs, dates, `layout`, `theme`, `*type*` and similar; `load-query.ts` adds this site's
  fields (session times, anchors, handles). Also: `trim()` and `\s` eat part of the payload (U+FEFF), so
  use `trimVisible`/`splitStega` from `lib/text.ts`; anything for `<head>` or a truncated excerpt goes
  through `stegaClean` (Layout.astro, `clip`, `metaDescription` already do).
- GROQ returns `null`, not `undefined`, for a projected field that isn't set (e.g. `sessions`, `people[]->`),
  so default parameters and destructuring defaults don't apply. Use `?? []`.
- Unknown slugs use `Astro.rewrite("/404")` (real 404 at the requested URL), never `Astro.redirect("/404")`.
  Events with no upcoming sessions render with `noindex, follow` and are left out of `sitemap.xml`.
- `src/middleware.ts` adds security headers, 301s trailing slashes, works out draft mode, starts the
  `siteData` query, and sends `X-Robots-Tag: noindex` in draft mode and from `*.workers.dev` hosts.
- **Published pages are edge-cached for 5 minutes** (Workers Cache API in `src/middleware.ts`, `X-Cache:
  HIT/MISS`). Studio and Eventbrite changes therefore take up to 5 minutes to show on the live site; draft
  mode is never cached, so editors see changes there straight away. Not cached: draft mode, non-GET,
  query strings, `/api/*`, non-200 responses, `astro dev`. The cache is per Cloudflare location and nothing
  purges it; lower `EDGE_TTL` if 5 minutes is too long.
- Static files: `web/public/_headers` gives `/img/*` and `/video/*` a week's browser cache (the build adds
  `immutable` for hashed `/_astro/*`). Rename a file in those folders if a replacement must show sooner.
- SEO audit and remaining actions: `docs/seo/ourmovingstories.com-audit/`.

## Dependency upgrade (9 Nov 2026)

Astro 4 → 7, Tailwind 3 → 4, Sanity Studio 3 → 6, React 18 → 19, @sanity/client 6 → 8, nx 20 → 24.
TypeScript stays on 6.x because `astro check` doesn't support TypeScript 7 yet. Things that bite:

- Node >= 22.23 everywhere (Astro 7, `cf`). CI pins Node 24 and Bun 1.3.14 in `.github/workflows/deploy.yml`.
- Astro 6+ no longer coerces env vars: compare `import.meta.env.PUBLIC_*` to `"true"`, don't test truthiness.
  Component `<script>`s render where declared (not hoisted), and `compressHTML` defaults to `'jsx'`.
- Tailwind 4 class names: `aspect-3/4`, `z-100`, `rotate-[-8deg]`, `max-w-208` (spacing scale), etc.
  Buttons get `cursor: pointer` from a compat rule in `tailwind.css`; borders default to gray-200 there too.
- Sanity: import icons from per-icon paths (`import { BoltIcon } from "@sanity/icons/Bolt"`); the root
  barrel is gone. In `@sanity/ui`, `Stack`/`Inline` take `gap` (old `space` is silently ignored) and
  `Code` comes from `@sanity/ui/code`. The web client uses `apiVersion: "2025-02-19"`; draft mode reads the
  `drafts` perspective (was `previewDrafts`).
- `studio/sanity.cli.ts` reads env vars directly; don't import `sanity.config.ts` there (the CLI can't
  load the JSX it pulls in).

## Hero video

Files in `web/public/video/`: `hero-wide.mp4` (1080p, 30 fps, ~10 MB), `hero-wide-720.mp4` (~4.7 MB),
`hero-wide-poster.jpg`, `hero-tall.mp4` (phone cut of the same final edit, 22.8s loop; exported at
1080×1920, then 540×960 at ~0.7 Mbps, ~1.9 MB, since every portrait phone downloads it: `ffmpeg -i <export>
-map 0:v:0 -vf scale=540:960:flags=lanczos -c:v libx264 -preset slower -tune film -crf 25 -maxrate 700k
-bufsize 1400k -pix_fmt yuv420p -movflags +faststart -an hero-tall.mp4`; the 9 Nov 2026 file was made from
the earlier 720×1280 encode), `hero-tall-poster.jpg` (720×1280, its first frame). Each poster has a `.webp`
copy (`cwebp -q 78 -m 6`), which Hero.astro serves first; regenerate it when you replace a poster.
The wide cut is the "Cut 3 polish 30p" timeline in DaVinci Resolve project `oms-banner`
(masters in `~/Downloads/Our Moving Stories 2/_masters/`, ProRes 422 HQ). Grading: per-clip skin-tone
white balance on node 1 + shared `MCP/oms-finish.cube` LUT; iPhone HLG clips need the project's
timeline working luminance at SDR 100 or highlights clip. Web encodes are x264 (`-preset slower -tune
film -crf 24 -maxrate 3.2M`, 720p `-crf 26 -maxrate 1.5M`), which measured better than Resolve's own
H.264 at the same size. The portrait (9:16) version still needs re-cutting from the same shots.

## Verifying without Sanity network access

If you need to render offline: install `groq-js`, replace `loadQuery` with
`evaluate(parse(query), { dataset })` over a fixture array, switch `output` to `static`, and add a
`getStaticPaths` to `[...slug].astro`. Don't commit that.
