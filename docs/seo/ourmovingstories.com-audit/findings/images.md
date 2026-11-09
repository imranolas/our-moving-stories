# Images, 9 Nov 2026

Scores: **LIVE 38/100**. **LOCAL 76/100** (HTML + source review).

## LIVE (served HTML of `/`, `/testimonials`, `/safeguarding-policy`)

Counts (`<img>` in served HTML):
- `/`: 20 imgs. **4 content photos with NO `alt` attribute at all** (Sanity 2550x3300, 1749x2481, 2481x3508 jpg, 2481x3508 png - the session gallery). 2 decorative blobs (`yellow.svg`, `teal.svg`) with `alt=""` (correct). Named alt present on: 5 team photos, 3 social/mail icons, 4 funder logos. 3 Alpine-template Instagram `<img x-bind:src>` have only bound alt (`post.prunedCaption`); one has `width=""` (invalid empty). No lazy loading on any.
- `/testimonials`, `/safeguarding-policy`: 7 imgs each, all have alt (icons + funder logos). No content images.
- **High, LIVE**: 4 missing `alt` (WCAG 1.1.1, image-search loses them). Fix: add alt text in the Sanity document (it is a pageBuilder gallery) and render `alt`.
- **High, LIVE**: gallery images are served as **unresized originals** (up to 2481x3508 / 2550x3300 PNG/JPG, likely 1-2 MB each); no `w=`/`auto=format`/width/height → drives the 7.1 MB payload and mobile CLS 0.151.
- **Medium, LIVE**: team photos are `rect=...&w=320&h=400` JPG, no `auto=format` (no WebP/AVIF), no width/height, no lazy, no srcset.
- **Low, LIVE**: funder logos `&h=50` PNGs without `auto=format` or width.
- **High, LIVE**: **no `og:image` / `twitter:image` on any page** (0 matches on all three).
- Images point to the `staging` Sanity dataset (`cdn.sanity.io/images/othhiu7y/staging/`); content depends on staging after cutover is irrelevant but production assets must be re-checked.

## LOCAL (dev-server HTML, source review)

Alt coverage per page (served HTML):
- `/`: ~29 imgs; **0 missing alt attribute** (every `<img>` has `alt`). Empty alt (decorative) on: nav logo (inside link with `aria-label`, fine), 2 hero wing svgs, ~10 leaf svgs (also `aria-hidden`), 4 events-list thumbnails (`EventRow.astro:23`). Content alts present: 5 team photos (names), footer logo, 4 funder logos. Hero `<video>` has `aria-label`.
- `/events`: 8+ thumbnails with `alt=""` (events/index.astro:45) and 4 more in EventRow. **Medium, LOCAL**: they are inside links; if the link has the event title text, empty alt is OK. If any is image-only link, add `alt={event.name}`. Check.
- `/sessions`, `/testimonials`: only decorative + logo + funder logos, all fine.
- `/events/[slug]`, `/people/[slug]`: main image has `alt={event.name}` / `alt={person.name}`. Alt is the title only; **Low**: consider a Sanity `alt` field for richer descriptions.
- **Info, LOCAL**: Funder logo alt = `f.name || ""`; a funder without name yields empty alt.

Formats / size:
- Sanity images use `auto=format` (AVIF/WebP) with explicit crop dimensions (240x320, 440x587, 600x750, 840x1050, 1040x1387): **good, no oversized originals**. Gaps: no `srcset`/`sizes` (Medium, see performance.md), funder logos lack `auto=format` (Low), OG images 1200x630 JPG without `auto=format` (correct).
- Local assets: `web/public/video/hero-wide-poster.jpg` 1920x1080 392 KB (JPEG; could be AVIF/WebP ~120 KB), `hero-tall-poster.jpg` 720x1280 58 KB. Leaf/wing SVGs: `wing-left.svg` 53 KB, `wing-right.svg` 61 KB (Medium: used twice on pages as `<img>`, optimise with svgo; they are paint-heavy decoration in the hero and footer).
- **Low, LOCAL**: unused files in `web/public/img/` (grep finds no reference in `src`): `dance-bg.png` and `dance-bg copy.png` (711 KB each), `gabi_profile.jpg`, `sarah_profile.jpg`, `mindful-movement.jpeg`, `move-make.jpeg`, `logo-white-trans.png` + ` copy`, `icon copy.svg`. They are public, so deployed and crawlable (~2.5 MB dead weight). Delete.

Loading / dimensions:
- Lazy: used on thumbs, people, funders, Instagram. **Medium**: the first events thumbs above the fold are lazy (EventRow.astro, events/index.astro) - make the first few eager. Hero poster/video: no preload/fetchpriority (see performance.md).
- width/height: present on nav logo, footer logo, event detail, people card; missing on events thumbs and funder logos (aspect boxes mitigate CLS except funder logos).

og:image presence (LOCAL, checked via dev HTML):
| Page | og:image |
|---|---|
| `/` | **missing** (Hero uses video; `[...slug].astro:37` reads `hero.image.asset.url` which is undefined) |
| `/events`, `/sessions`, `/testimonials`, `/safeguarding-policy` | **missing** |
| `/events/[slug]` | present when event has image (1200x630 crop) |
| `/people/[slug]` | present when profile exists |
- **High, LOCAL** (`Layout.astro:20`): no default `ogImage`. Fix: default `/img/og-default.jpg` (1200x630, absolute URL) in Layout, and for the homepage use the hero poster (also resize). `ogImage` must be an absolute URL; `heroImage` from Sanity is absolute but events/people use full `cdn.sanity.io` URLs (good).
- Also add `og:image:width/height/alt` and keep `twitter:card=summary_large_image` only when an image exists.

## What the redesign already fixes
- Alt text on all content images; sized/`auto=format` Sanity requests; lazy loading; logo dims; og:image on events/people.
## Still wrong / do at cutover
- Default og:image everywhere; srcset; delete dead public assets; AVIF poster; funder logo `auto=format`; make sure the gallery on `/` (if reintroduced from Sanity) always gets alt; Instagram feed imgs get alt from caption (ok) but are unoptimised third-party URLs.
