# Performance / Core Web Vitals, 9 Nov 2026

Scores: **LIVE 68/100** (PSI lab 86-91 mobile/desktop on `/`, but CLS fails and payload is 7 MB).
**LOCAL 66/100 (code review only, not measured)**: good structure, but video/fonts/SSR-caching gaps below.
LOCAL was not scored from `astro dev` network numbers (per brief). CrUX field data was left to the other agent.

## LIVE: PSI lab (Lighthouse 13.6.0, one run each, Netlify behind Cloudflare)

| Page | Strat | Perf | LCP | CLS | TBT | SI | TTI | Weight |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 90 | 1.6 s | **0.151 (needs improvement)** | 50 ms | 4.7 s | 6.3 s | 7,159 KiB |
| `/` | desktop | 86 | 0.5 s | 0.001 | 250 ms | 2.3 s | 1.9 s | 7,169 KiB |
| `/testimonials` | mobile | 91 | 1.5 s | **0.182 (needs improvement)** | 0 | 1.5 s | 4.7 s | 463 KiB |
| `/testimonials` | desktop | 100 | 0.4 s | 0 | 40 ms | 0.8 s | 1.2 s | 512 KiB |

Other categories on `/` mobile: a11y 82, best-practices 73, SEO 91. No `field_metrics` in PSI response (CrUX not used here). INP is not measurable in lab; TBT is the proxy (fine except desktop `/` 250 ms, 10 long tasks).

Findings (LIVE):
- **High, LIVE**: Homepage transfers ~7.1 MB. Cause: 4 content images pulled from `cdn.sanity.io/.../staging/` as **full originals (2550x3300 jpg, 1749x2481, 2481x3508 jpg/png) with no `w=`/`h=`, no width/height, no lazy**. Fix (moot after cutover, but the same trap is avoidable in LOCAL): always request sized, `auto=format` URLs.
- **Medium, LIVE**: Mobile CLS 0.151 on `/` and 0.182 on `/testimonials` (above the 0.1 "good" line, below 0.25). Lab shows 2-3 shifts; unsized images, late Alpine/Instagram injection (`<img x-bind:src ... width="">`), and webfont/CSS timing are the likely sources. Desktop is fine.
- **Medium, LIVE**: Alpine loaded from jsdelivr as `alpinejs@3.x.x` (floating major, third-party, 159 KiB unused JS flagged).
- **Low, LIVE**: Response headers `cache-control: no-cache`, Netlify edge `fwd=miss`; server-response-time opportunity 105-213 ms. Acceptable.
- **Info, LIVE**: Homepage HTML only 20 KB; LCP is text, so LCP is good (1.6 s mobile).
- LIVE will be replaced, so prioritise the LOCAL list.

## LOCAL: from source (`web/src`, `web/public`)

### Likely LCP elements
- **Home `/`** (Hero.astro): when no Sanity image/video, falls back to bundled video. LCP candidate = **`<video poster>`** (`/video/hero-wide-poster.jpg`, 1920x1080, 392 KB) on landscape; `hero-tall-poster.jpg` (720x1280, 58 KB) on portrait. Poster has no `<link rel=preload as=image fetchpriority=high>`, so it is found only when the parser reaches the `<video>` (late in body, after Nav's Sanity await). Otherwise the huge `h1` (Big Shoulders, web font) is the contender.
- **`/events/[slug]`** (`pages/events/[slug].astro:109`): the 1040x1387 Sanity image (`auto=format`) in a 540 px column. Has width/height but **no `fetchpriority="high"`** and no `srcset`; on mobile it is below the h1/text, so the h1 is LCP there. Fine, but add `fetchpriority="high"` on desktop-LCP image.
- **`/sessions`** (`pages/sessions/index.astro`): no images; LCP = h1 text, gated by Google Fonts CSS (see below).
- **Events list**: all thumbs `loading="lazy"` including those in the first viewport (EventRow.astro:23, events/index.astro:45). Lazy on likely-above-the-fold images delays them; make the first 2-4 eager.

### Hero video strategy
- Files (`web/public/video`): `hero-wide.mp4` 9.6 MB (1080p), `hero-wide-720.mp4` 4.5 MB, `hero-tall.mp4` 5.1 MB (1080x1920), posters above. Total on disk ~19.7 MB.
- `<video preload="metadata" poster=... muted loop playsinline>` has **no `src`**; a module script sets `video.src` after parse (`pick()`), then `play()`. Consequences:
  - **Medium, LOCAL** (Hero.astro `<script>`): the video is invisible to the preload scanner, so the download starts only after JS runs; no `<source>` fallback means no-JS users get poster only (acceptable) but crawlers/Lighthouse still see poster.
  - **High, LOCAL** (Hero.astro `pick()`): selection order is `tall ? tall : small ? 720 : wide`. Every portrait phone (`max-aspect-ratio: 4/5`) gets **hero-tall.mp4 (1080x1920, 5.1 MB)**, bigger than the 720p wide file and over-spec for a ~390 px screen; `saveData`/2g/3g only influences the landscape branch, so slow-network portrait phones still get 5.1 MB. Fix: re-cut tall at 540x960 (~1.5-2 MB) and check `saveData`/slow-connection before choosing tall; skip video entirely (poster only) on saveData/reduced-motion (reduced-motion only sets `paused`, but the file is still fetched).
  - **Medium, LOCAL**: the SSR HTML sets `poster={posterWide}` (392 KB landscape) and JS swaps it to the tall poster on portrait, so portrait phones may download **both** posters and the LCP candidate can change. Fix: emit `poster` according to a `<picture>`-like approach or set media-specific preload (`<link rel=preload as=image href=tall-poster media="(max-aspect-ratio:4/5)">`), and drop the default wide poster for narrow screens.
  - **Low, LOCAL**: 1080p chosen only when `innerWidth*dpr > 1400` (most 1440p/Retina laptops and desktops). 9.6 MB for muted decoration is heavy; consider capping at 720p/2.5 Mbps for everyone, or 1080p at ~5 MB.
  - Good: `muted playsinline` (autoplay-safe), pause button, reduced-motion respected, fixed-height section (`h-[calc(100svh-...)]`) so **no CLS from the hero**.
- **Medium, LOCAL**: static assets in `public/` have no `_headers` file; Workers Assets default revalidation applies, so videos/posters/SVGs are not `immutable`. Fix: add `web/public/_headers` with `/video/* Cache-Control: public, max-age=31536000, immutable` (rename on content change) and `/img/*` a long max-age.

### Fonts (Layout.astro:30-35)
- **High, LOCAL**: one render-blocking `<link rel=stylesheet>` to `fonts.googleapis.com` for **3 families / 8 weights** (Big Shoulders 600/800/900, Karla 400/500/700, DM Mono 400/500) + 2 preconnects. `display=swap` helps text visibility but the CSS fetch (cross-origin, 2 hops) blocks first render and delays LCP on text-LCP pages (`/sessions`, `/events`, narrow screens). Fix: self-host with Astro fonts / `@fontsource-variable/*` (variable Karla and Big Shoulders collapse the weights), preload the display + body woff2, keep `display=swap`. Drop unused weights.
- **Medium, LOCAL**: no metric-adjusted fallback; the hero h1 (up to 232 px, Big Shoulders vs Impact fallback) will reflow on swap = CLS risk. Fix: `size-adjust`/`ascent-override` fallback face (Astro fonts does this).

### Third parties / JS
- **Medium, LOCAL** (Layout.astro:45): Alpine 3.15.11 from `cdn.jsdelivr.net`, `defer`, version pinned (better than LIVE). Extra DNS/TLS to a third origin and a single point of failure for Nav menu. Fix: `bun add alpinejs` and bundle (`import Alpine`), or `@astrojs/alpinejs`. INP risk low (small handlers).
- **Low, LOCAL** (Footer.astro:60): Beehiiv iframe, `loading="lazy"`, fixed `height=52` so **no CLS**. It is on every page though; only loads near viewport. Optional: facade (click-to-load) if its JS shows up in field INP/TBT.
- **Medium, LOCAL** (InstagramSection.astro:27): client-side `fetch('https://feed.ourmovingstories.com')` after Alpine init. Placeholder row ("Loading posts...", `py-12`) is replaced by a 2/3-column grid of `aspect-square` tiles, so there is a **height jump when the feed arrives** (CLS if the section is in view, and it re-flows everything below, i.e. the footer). Fix: reserve `min-height` equal to the grid (e.g. 6 skeleton squares), or SSR the feed server-side with `Cache-Control` caching. Images have no `width/height` (container aspect-ratio covers it) and are full-size Instagram CDN images without `srcset`.
- `InstagramSection.tsx` duplicates the `.astro` version; check which is used and delete the other.

### Images (Sanity)
- `urlFor.ts` is a bare `@sanity/image-url` builder; callers add `width/height/fit("crop")/auto("format")`. **Good**: `auto=format` (AVIF/WebP), fixed crop dims, `loading=lazy` below fold, width/height on event detail/people/logo.
- **Medium, LOCAL**: **no `srcset`/`sizes`/DPR variants anywhere**. Event detail requests 1040x1387 for a <=540 px box (fine at 2x desktop, ~3x over-served on a 390 px phone); People 600x750 for a ~170-300 px card; Events index 440x587. Fix: helper that emits 3 widths (e.g. 400/800/1200) with `sizes`.
- **Low, LOCAL**: Events-list `<img>` (events/index.astro:45) has no width/height (parent aspect box covers). Funder logos (Footer.astro:84) have `h=80` but **no `auto=format` and no width attr** (PNG; width unknown until load → small horizontal shift). Add `.auto("format")` and `width`/`height`.
- `og:image` URLs are 1200x630 JPG (no `auto=format`, correct for crawlers).

### SSR, TTFB and HTML caching (astro.config.mjs, `output: "server"`)
- **High, LOCAL**: no page is prerendered and **no `Cache-Control` is set anywhere** (only sitemap sets `Content-Type`). Cloudflare does not cache HTML by default → every view runs the Worker plus Sanity CDN calls. Expect TTFB ~150-400 ms warm, worse cold, vs. Netlify's cached ~100-200 ms today.
- **High, LOCAL**: queries are issued **in series in component frontmatter**: Nav, Footer, the page query, plus Hero ("next up" events), EventsSection/UpcomingSessionsSection each `await loadQuery`. Astro awaits components in order, so these form a waterfall of ~4-6 Sanity round trips (each ~30-80 ms) before the HTML finishes streaming. Fix: hoist data fetching to the page and run `Promise.all`, or cache settings/nav/footer per isolate (module-level TTL cache), and fetch `*[_type=="event"]` once and share it.
- **Fix** (`Layout.astro` or middleware): `Astro.response.headers.set("Cache-Control","public, max-age=0, s-maxage=300, stale-while-revalidate=86400")` + a Cloudflare Cache Rule ("cache everything" for HTML) or Workers Cache API keyed by URL; purge from the Sanity webhook / Eventbrite sync. This keeps content freshness while giving edge-cached TTFB (<100 ms). Keep drafts/visual-editing paths `private, no-store`.
- Confirm `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` is **false in production**: it switches off `useCdn`, adds drafts perspective and a token, which makes every query slower and uncached.
- Sanity client `useCdn: !isPreview` is right for prod.

### CLS risk summary (LOCAL)
Hero (fixed height, ok), Beehiiv (fixed height, ok), nav logo (width/height, ok); risks: Instagram feed injection, web-font swap on huge display type, funder logos, lazy events thumbs (aspect boxes ok).

### Cutover items
- Add `_headers` (static caching) and HTML cache rule before DNS cutover; Netlify currently serves edge-cached HTML.
- Remove the Netlify-era assumptions (`web/netlify.toml` already deleted).
- Re-run PSI against the deployed Workers URL (not `astro dev`) and verify LCP element + TTFB there.

## Priority list
1. HTML edge caching + parallelise Sanity queries (LOCAL, High)
2. Self-host fonts with preloaded woff2 + fallback metrics (LOCAL, High)
3. Rework hero video delivery: smaller tall cut, honour saveData, poster preload/avoid double poster (LOCAL, High)
4. Static asset caching `_headers` (LOCAL, Medium)
5. Instagram feed placeholder/SSR to kill CLS (LOCAL, Medium)
6. Bundle Alpine locally (LOCAL, Medium)
7. srcset/sizes for Sanity images; eager first thumbs; `fetchpriority` on event image (LOCAL, Medium)
