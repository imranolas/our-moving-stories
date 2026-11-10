# Technical SEO + Sitemap findings, ourmovingstories.com (9 Nov 2026)

Scope: LIVE (Netlify, old Astro 4) vs LOCAL (Astro 7 on Workers, dev server; performance not scored from dev).

## Scores

| | LIVE | LOCAL (as coded) | LOCAL after fixes below |
|---|---|---|---|
| **Technical** | **22/100** | **66/100** | ~88 |
| **Sitemap** | **0/100** (none) | **45/100** | ~95 |

Category status (LIVE / LOCAL): Crawlability FAIL / PASS-with-gaps; Indexability FAIL / PARTIAL; Security PARTIAL / FAIL (nothing set yet); URLs+redirects FAIL / PARTIAL; Mobile PASS-ish / PASS; JS rendering PASS / PASS (see JS section); Structured data FAIL / FAIL; IndexNow n/a (optional, low value for a 20-URL site).

## Findings by severity

### Critical

1. **LIVE: soft 404 everywhere, no robots.txt, no sitemap.** Verified: `/`-style unknown URLs, `/robots.txt`, `/sitemap.xml`, `/Testimonials` and `/testimonials/` all return `200 text/html` (the latter with an empty body). Googlebot treats an empty 200 robots.txt as "allow all" but the soft-404s waste crawl and can get the real pages mis-clustered. Fix: resolved by cutover (LOCAL serves real files). Nothing worth patching on Netlify.
2. **LOCAL: unknown URLs return 302 -> /404, not 404** (`web/src/pages/[...slug].astro`, `events/[slug].astro`, `people/[slug].astro`; same `/people`, `/Events`, `/nope`: verified 302 to `http://localhost:4321/404`). Google follows the 302 to a 404 and eventually drops the URL, but it is slower, adds a hop, and the original URL briefly looks like a temporary move. Every expired/mistyped event URL will do this. See "Real 404 in Astro on Workers" below.

### High

3. **LOCAL: sitemap omits 13 events, 4 people, `/events` and `/sessions`** (only the 3 Sanity `page` docs). Corrected implementation below.
4. **LOCAL: no security headers at all.** No `public/_headers`, no `src/middleware.ts`, nothing in `astro.config.mjs`/`cloudflare.config.ts`. Workers Static Assets `_headers` only applies to static assets, not SSR responses, so the HTML will go out with Cloudflare defaults only. See Security section.
5. **LOCAL: www and apex both attach to the Worker at cutover** (`cloudflare.config.ts` comment lists both domains). Without a redirect rule both serve 200 with canonical -> apex. Add a single 301 www -> apex (Cloudflare Redirect Rule) as part of cutover; otherwise duplicate hosts persist indefinitely. LIVE currently canonicalises to apex via Netlify, so this would be a regression.
6. **LOCAL: `/testimonials` and `/safeguarding-policy` have no `<h1>`** and use the default site description (content issue, belongs in the on-page report; Sanity `page.description` should be filled).
7. **BOTH: no structured data.** LOCAL should add `Organization`/`NonprofitOrganization` (home) and `Event` (event detail pages) JSON-LD in `Layout.astro` (slot) and `events/[slug].astro`. Event rich results need `startDate`, `location`, `name`; free `offers` with `price: 0`.

### Medium

8. **LIVE: redirect chain** `http://www` -> `https://www` -> `https://apex` (2 hops, verified `hops=2`). Moot after cutover; ensure the new setup is a single hop (Cloudflare "Always Use HTTPS" + the www redirect rule: http://www -> https://apex in one rule, not two).
9. **LOCAL: trailing slash not normalised.** `/events/`, `/events/story-space/`, `/testimonials/` all return 200 with the same content, and `Layout.astro` builds the canonical from `Astro.url.pathname` (`new URL(Astro.url.pathname, ...)`), so the canonical of `/events/` is `https://ourmovingstories.com/events/` (self-referencing the duplicate). Fix: strip the trailing slash in the canonical (`pathname.replace(/(.)\/+$/, "$1")`) and 301 slash URLs to the slashless form in middleware (below). Also set `trailingSlash: "never"` in `astro.config.mjs` and verify behaviour on the built Worker, since dev differs.
10. **LOCAL: case sensitivity.** `/Events` -> 302 -> 404 (fine, lowercase is the only canonical). No fix needed beyond the real-404 change; do not add case redirects. LIVE returns 200-empty for any case.
11. **LOCAL: no `Cache-Control` on SSR HTML.** Every request runs Sanity queries. Add `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=3600` in middleware for 200 HTML (not for preview mode or 404s), so crawl bursts do not hit Sanity and TTFB is stable. Preview mode (`PUBLIC_SANITY_VISUAL_EDITING_ENABLED`) must stay uncached.
12. **LOCAL: `og:image` only when a page passes one.** `/`, `/events`, `/sessions`, `/testimonials`, `/safeguarding-policy` mostly have none. Add a default 1200x630 in `Layout.astro` (`ogImage ?? "https://ourmovingstories.com/img/og-default.jpg"`). Also add `og:locale=en_GB`.
13. **LOCAL: Alpine loaded from jsDelivr with no SRI** (`Layout.astro`). Supply-chain and availability risk; either self-host (bundle via npm `alpinejs`) or add `integrity`/`crossorigin`. Self-hosting also lets a CSP drop jsdelivr.

### Low / Info

14. LOCAL: `<link rel="sitemap">` present (good, harmless). `lang="en-GB"` set (good). Viewport meta present. Font preconnects present.
15. LOCAL: `/people` has no index page (`pages/people/` only has `[slug].astro`), so it falls into the 302->404 path. That is acceptable (people are linked from `/#people`), but breadcrumbs/JSON-LD must not reference `/people`. If you want a hub, create `pages/people/index.astro`; not required for SEO with 4 people.
16. LIVE homepage contains a broken link `https://instagram.com/{{settings.instagram}}` (recon). Disappears at cutover.
17. LOCAL `public/img` has duplicate "copy" files (`dance-bg copy.png` 711K, `icon copy.svg`, `logo-white-trans copy.png`): not referenced? Delete before deploy (they ship publicly and are crawlable). Hero videos are 9.6MB/4.5MB/5.1MB (`public/video`): perf agent should confirm they are lazy and `preload="none"`/poster-first on mobile.
18. LOCAL `/404` is a real route returning 404 (verified), so it will not index. Do not put it in the sitemap (it is not).
19. IndexNow: optional; Bing/Yandex only. Skip unless Bing traffic matters.

## Real 404 in Astro on Workers

Replace each `return Astro.redirect("/404")` with a response that renders the 404 page at the original URL with status 404. Two options; verify the status on the built Worker (`curl -I`), not dev:

```astro
---
// [...slug].astro / events/[slug].astro / people/[slug].astro
if (!page) {
  Astro.response.status = 404;
  Astro.response.statusText = "Not Found";
  return Astro.rewrite("/404");   // renders 404.astro at the requested URL, keeps the URL, no redirect
}
---
```

If the rewrite keeps a 200 in your Astro 7 build, the guaranteed variant is to render the 404 markup inline (extract `404.astro` body into `components/NotFound.astro`, wrap in `<Layout title="Not found">`, add `<meta name="robots" content="noindex">` via a `noindex` prop) and set `Astro.response.status = 404` before the markup. Both unknown-slug cases AND `/people` (create `pages/people/index.astro` that does the same, or let `[...slug]` catch it, which it already does) then return a true 404. Add a `noindex` prop to `Layout.astro` as belt-and-braces for the 404 body.

Also guard: `Astro.params.slug` in `[...slug].astro` can be a nested path (`a/b`), also 404 correctly.

## Canonicals / meta robots

- LOCAL canonical present on all pages, absolute, apex https (good); issue is only trailing slash (finding 9). Query strings are dropped (good).
- LOCAL has no meta robots (default index,follow, correct). No `X-Robots-Tag` set. Make sure preview Worker (`our-moving-stories-preview`, `--mode preview`) sends `X-Robots-Tag: noindex, nofollow` and a Disallow robots.txt, or `workers.dev` URLs will get indexed with duplicate content. Currently nothing prevents this: `public/robots.txt` is shared by both builds. Add middleware: if `PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true"` or host ends `.workers.dev`, set `X-Robots-Tag: noindex, nofollow`. Also disable the production `workers.dev` subdomain after cutover (or the same header covers it).
- LIVE: no canonical, no robots meta, titles "Home" / "Testimonials", description "Astro description". Fixed by LOCAL.

## robots.txt

- LIVE: nonexistent (200-empty).
- LOCAL `web/public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://ourmovingstories.com/sitemap.xml`. Valid and sufficient. Optional: `Disallow: /404`. No AI-crawler policy is stated; decision for the owner (nothing sensitive on the site).

## Security headers

| Header | LIVE (Netlify via Cloudflare) | LOCAL (Worker, as coded) | Recommended |
|---|---|---|---|
| HSTS | `max-age=31536000` (no includeSubDomains) | none | Turn on at Cloudflare edge (SSL/TLS > Edge Certificates > HSTS) 6 months first; add includeSubDomains only after checking `feed.` subdomain is https. Don't preload yet |
| X-Content-Type-Options | `nosniff` | none | `nosniff` |
| X-Frame-Options / frame-ancestors | none | none | Studio Presentation needs framing of the **preview** Worker only. Production: `frame-ancestors 'none'`/`X-Frame-Options: DENY`. Preview: allow Studio origin |
| Referrer-Policy | none | none | `strict-origin-when-cross-origin` |
| Permissions-Policy | none | none | `camera=(), microphone=(), geolocation=()` |
| CSP | none | none | Report-only first. Needs: `script-src 'self' https://cdn.jsdelivr.net` + `'unsafe-eval'` (standard Alpine build evaluates inline expressions; the sessions page's long `x-data` needs it; switch to `@alpinejs/csp` to remove it, a bigger rewrite), `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src https://fonts.gstatic.com`, `img-src 'self' data: https://cdn.sanity.io` + the Instagram CDN hosts, `connect-src 'self' https://feed.ourmovingstories.com`, `media-src 'self' https://cdn.sanity.io` |
| Cache-Control | `no-cache` | none | see finding 11 |

LOCAL implementation point: `web/src/middleware.ts` (does not exist). Sketch:

```ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (ctx, next) => {
  const url = new URL(ctx.request.url);
  // 301 trailing slash -> slashless (not for "/")
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    return Response.redirect(url.toString(), 301);
  }
  const res = await next();
  const h = new Headers(res.headers);
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  const preview = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true" || url.hostname.endsWith(".workers.dev");
  if (preview) h.set("X-Robots-Tag", "noindex, nofollow");
  else {
    h.set("X-Frame-Options", "DENY");
    if (res.status === 200 && res.headers.get("content-type")?.includes("text/html"))
      h.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
});
```

## Mobile

- LOCAL: viewport meta correct; mobile nav is a 44px-ish bordered button (`px-3 py-2`, 12px text: about 36px tall, slightly under the 44px target; raise to `py-3`); filter buttons `py-2.5` ok. Desktop nav hidden `md:` with a separate mobile list, both server-rendered. `theme-color` set. Fonts load via Google CSS with `display=swap` (good).
- LIVE: not assessed in depth (3 thin pages); viewport present per recon.

## JS dependence (Alpine)

| Feature | In server HTML? | Verdict |
|---|---|---|
| Mobile nav | Yes: `<nav id="mobile-menu">` links are in HTML (hidden by `x-show`/`x-cloak`) plus the desktop nav | OK, links crawlable |
| `/sessions` filters | Yes: all session rows (past and upcoming) are rendered server-side as `<li><a href=...>`; Alpine only hides rows. Verified `<h1>` and rows in HTML | OK. Note: past rows are in the DOM, only hidden. Rows lack `x-cloak`, so before Alpine loads all rows show (flash/CLS). Add `x-cloak` or server-filter upcoming |
| `/events` tabs | Yes: 13 event links in HTML; `x-show` tab switch | OK |
| Instagram feed | **No**: client-side `fetch('https://feed.ourmovingstories.com')` in `InstagramSection.astro`; server HTML has only "Loading posts…" | Not SEO-relevant (third-party content, not needed for ranking), but shows "Loading posts…" to non-JS crawlers and if the feed host fails. Show a static fallback "Follow us on Instagram" link (already has one). Confirm CORS and uptime of feed host |
| Hero, events, people, text | Yes (SSR) | OK |

No page requires JS to expose its primary content. LIVE is static and also fine.

## Sitemap

### Evaluation of `web/src/pages/sitemap.xml.ts`

- **LIVE:** none (200-empty). 0/100.
- **LOCAL** works, valid XML, correct namespace, absolute https apex URLs, `application/xml`. Verified output begins with `<?xml` (the `.trim()` handles the template's leading whitespace; keep the trim, a leading space before the declaration is invalid XML). Problems:
  1. Only the 3 `page` docs: missing 13 `/events/*`, 4 `/people/*`, `/events`, `/sessions` (18 of 21 URLs missing; this is the biggest gap).
  2. No XML escaping of slugs (low risk with Sanity slugs, but escape anyway).
  3. Homepage `lastmod` is the `page` doc's `_updatedAt` (2026-11-09T15:04:38Z, i.e. today because it is being edited) while the real content (events) changes elsewhere; `/testimonials` and `/safeguarding-policy` lastmod are 2024: accurate for static pages, fine. Index/hub `lastmod` should reflect the newest linked content.
  4. Not draft-safe: in preview mode (`perspective: "drafts"`) the query can return `drafts.*` docs; filter them.
  5. No Cache-Control; each fetch runs Sanity queries.
  6. Pages with a `noindex` or no slug would still be listed (none currently).
- **Past events: include them.** Event detail pages persist after the last session (they show "past", photos, description) and are evergreen entry points for "free baby dance classes Southall/Ealing" style queries and for the organisation's track record. Exclude only events with no `slug` (link-only events) and cancelled/never-held events if the owner wants. Past events are fine for lastmod as `_updatedAt`. The risk to watch: the Eventbrite sync rewriting docs hourly would bump `_updatedAt` for every event even when nothing changed; confirm the sync only patches on change, otherwise lastmod becomes noise and Google will ignore it. If it does rewrite every hour, set event lastmod to the latest session date <= today instead.
- Priority/changefreq: omit (Google ignores them).
- Sitemap hosts: submit `https://ourmovingstories.com/sitemap.xml` only. Single file is fine (<50,000 URLs).

### Corrected implementation (`web/src/pages/sitemap.xml.ts`)

```ts
import { loadQuery } from "../sanity/lib/load-query";

const SITE = "https://ourmovingstories.com";
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

type Doc = { slug?: string; updated: string };

export async function GET() {
  // Published docs only (drafts appear in the preview perspective). Skip docs without a slug.
  const { data } = await loadQuery<{ pages: Doc[]; events: Doc[]; people: Doc[] }>({
    query: `{
      "pages":  *[_type == "page"   && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current, "updated": _updatedAt },
      "events": *[_type == "event"  && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current, "updated": _updatedAt },
      "people": *[_type == "person" && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current, "updated": _updatedAt }
    }`,
  });

  const newest = (docs: Doc[]) => docs.reduce((m, d) => (d.updated > m ? d.updated : m), "");
  const eventsUpdated = newest(data.events);
  const peopleUpdated = newest(data.people);

  const urls: { loc: string; lastmod?: string }[] = [];

  for (const p of data.pages) {
    const isHome = p.slug === "index";
    // Home also reflects events and people shown on it.
    const lastmod = isHome ? [p.updated, eventsUpdated, peopleUpdated].sort().at(-1) : p.updated;
    urls.push({ loc: isHome ? `${SITE}/` : `${SITE}/${p.slug}`, lastmod });
  }
  // Hubs (no Sanity doc of their own)
  if (eventsUpdated) {
    urls.push({ loc: `${SITE}/events`, lastmod: eventsUpdated });
    urls.push({ loc: `${SITE}/sessions`, lastmod: eventsUpdated });
  }
  for (const e of data.events) urls.push({ loc: `${SITE}/events/${e.slug}`, lastmod: e.updated });
  for (const p of data.people) urls.push({ loc: `${SITE}/people/${p.slug}`, lastmod: p.updated });

  const body = urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

Expected result: 3 pages + `/events` + `/sessions` + 13 events + 4 people = 22 URLs. Check after deploy: no duplicate `<loc>` (if a Sanity `page` doc ever has slug `events` or `sessions`, dedupe by loc), every URL returns 200 without redirect, and `/people` is not listed. If a `page` doc exists for `404`, exclude it.

Sitemap score rationale: LOCAL 45 = valid and referenced in robots.txt and `<link rel=sitemap>` (+), but misses 82% of URLs (-). After fix ~95.

## Cutover checklist

### URL mapping LIVE -> LOCAL

| LIVE | LOCAL | Redirect needed? |
|---|---|---|
| `/` | `/` | No |
| `/testimonials` | `/testimonials` | No (same path) |
| `/safeguarding-policy` | `/safeguarding-policy` | No |
| `/sitemap.xml`, `/robots.txt` | same, now real | No |
| anything else on LIVE | was a soft-404 (empty 200) | None to preserve. New pages (`/events`, `/sessions`, `/events/*`, `/people/*`) are net-new |
| `http://`, `www.` variants | apex https | Yes, one-hop 301s (new rule, see below) |

Because the 3 real URLs keep identical paths, **no page-to-page redirects are required**. Check Sanity `page` slugs `testimonials` and `safeguarding-policy` exist in the **production** dataset (LIVE reads `staging`; HANDOFF says LOCAL reads `production`) and are published, not draft; otherwise day one serves 404s on two of the three indexed URLs.

Redirect rules to create in Cloudflare (Rules > Redirect Rules), before or at cutover:
1. `www.ourmovingstories.com/*` -> `https://ourmovingstories.com/${1}`, 301, preserve query string (also covers http://www in one hop if "Always Use HTTPS" is on at the zone).
2. Trailing-slash 301 (middleware above).
3. Optional: if any old Netlify preview/`*.netlify.app` URLs were ever shared, ignore (not indexed given empty sitemap).

### Search Console

1. Add a **Domain property** `ourmovingstories.com` (DNS TXT record in Cloudflare DNS; covers http/https/www). If one exists already, use it; no URL-prefix property needed.
2. Before cutover, note baseline: Pages report (indexed count; expect ~3), Performance (queries/clicks), Core Web Vitals.
3. After cutover: submit `https://ourmovingstories.com/sitemap.xml` (Sitemaps report), expect status Success with 22 discovered URLs.
4. URL Inspection > Live Test then "Request indexing" for `/`, `/events`, `/sessions`, and 2-3 key event pages. Check "Page fetch" is OK and the rendered HTML shows the content.
5. Watch the Pages report for 7 days: "Not found (404)", "Soft 404", "Crawled - currently not indexed" and "Page with redirect". Re-validate fixes.
6. Verify `robots.txt` in the Settings > robots.txt report is fetched without error.
7. Bing Webmaster Tools: import from Search Console (one click), submit the sitemap.

### Things that would make Google see the new site badly on day one

1. **Preview/`workers.dev` indexation and no noindex** (above): block with header; also ensure the preview Worker is not what is linked from anywhere public.
2. **Deploying with `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` or a drafts perspective on the production Worker**: would expose draft content and token-requiring queries; production build must have it unset (HANDOFF step 4 vs 5; keep them separate builds).
3. **Dataset mismatch**: production dataset missing `page` docs for the 3 slugs, or events not synced there (HANDOFF: work in `production`). Check the sitemap output and each of the 22 URLs return 200 before flipping DNS (test on the Worker's `workers.dev` URL).
4. **302 -> /404 pattern** live on day one (Critical #2); fix before deploy.
5. **Missing/placeholder metadata**: pages with default description, no `<h1>` on two pages, no default og:image.
6. **Downtime window**: HANDOFF step 8 requires deleting the Netlify `@`/`www` DNS records before attaching the Worker domain. Do it in one quick sequence (record removal, `cf deploy`) and check that the DNS-only gap is minutes, not hours; Googlebot meeting 522/1001 errors for hours is harmless but days is not. After that, confirm no stale Netlify DNS record or `www` CNAME remains pointing at Netlify.
7. **Cache**: Cloudflare may hold the old LIVE empty 200 for `/robots.txt` and `/sitemap.xml` (Netlify returned `cache-control: no-cache`, but purge anyway). Purge Cloudflare cache (Purge Everything) after cutover.
8. **SSL/HSTS**: LIVE already sends HSTS for a year, so every http-only misconfiguration is unrecoverable for browsers for that period. Make sure the Worker custom domain has a valid cert for both apex and www and that SSL mode is Full (strict).
9. **Hero media weight on mobile** (9.6MB hero video) hurts LCP in field data over the first 28 days; confirm poster-first and no autoplay preload on mobile (perf report).
10. **Performance of cold SSR**: each uncached request hits Sanity; add the cache header (finding 11) so Googlebot bursts are cheap.
11. **Duplicate "copy" assets** and unused files in `web/public` get published; remove.
12. After cutover, disconnect Netlify only after verifying Search Console reports no spike in errors for 48h (HANDOFF says to disconnect right after; a rollback target is worth keeping for two days).
13. Post-launch: add Event JSON-LD and Organization JSON-LD, fill descriptions for `/testimonials` and `/safeguarding-policy`, and request indexing again.
