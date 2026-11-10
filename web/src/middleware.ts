import { defineMiddleware } from "astro:middleware";
import { SANITY_READ_TOKEN } from "astro:env/server";
import { getPreview } from "./sanity/lib/draft-mode";
import { STUDIO_ORIGINS } from "./sanity/lib/studio";
import { siteData } from "./lib/data";

/**
 * Runs for every on-request page (static files in public/ are served by Workers Assets and skip it).
 * - 301s "/events/" to "/events" so each page has one URL (Layout.astro's canonical drops the slash too).
 * - Works out draft mode (Astro.locals.preview) from the signed cookie; see src/sanity/lib/draft-mode.ts.
 * - Starts the settings/nav/footer query (src/lib/data.ts) so it runs alongside the page's own query.
 * - Caches published pages at the edge for 5 minutes (EDGE_TTL below).
 * - Adds security headers. Only Sanity Studio may frame the site (Presentation tool).
 * - Keeps draft-mode pages and *.workers.dev hosts out of search engines and caches.
 */
// Studios opened from the sanity.io dashboard sit inside a www.sanity.io frame.
const FRAME_ANCESTORS = ["'self'", ...STUDIO_ORIGINS, "https://www.sanity.io"].join(" ");

/**
 * Edge cache for published HTML and the sitemap, through the Workers Cache API: Cloudflare doesn't cache
 * what a Worker returns by itself. A hit skips rendering and every Sanity query, which keeps responses fast
 * when crawlers arrive in bursts. Changes from Studio or the Eventbrite sync show up within EDGE_TTL
 * seconds; nothing purges it. The cache is per Cloudflare location, and off in `astro dev`.
 * Never cached: draft mode (signed cookie; those responses are `private, no-store`), anything but GET,
 * URLs with a query string, /api/*, and responses that aren't 200 or that set a cookie.
 */
const EDGE_TTL = 300;

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return context.redirect(url.pathname + url.search, 301);
  }

  context.locals.preview = await getPreview(context.cookies, SANITY_READ_TOKEN);
  const isApi = url.pathname.startsWith("/api/");

  const cache =
    !import.meta.env.DEV && context.request.method === "GET" && !context.locals.preview && !url.search && !isApi
      ? (globalThis as { caches?: { default?: Cache } }).caches?.default
      : undefined;
  if (cache) {
    const hit = await cache.match(context.request.url);
    if (hit) {
      const response = new Response(hit.body, hit);
      response.headers.set("X-Cache", "HIT");
      return response;
    }
  }

  if (!isApi && !url.pathname.endsWith(".xml")) siteData(context.locals);

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", `frame-ancestors ${FRAME_ANCESTORS}`);

  if (context.locals.preview) {
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
  } else if (url.hostname.endsWith(".workers.dev")) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (url.protocol === "https:") {
    // Matches what Netlify sends today, so browsers' existing HSTS entries carry on unchanged.
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }

  const store =
    !!cache && response.status === 200 && !headers.has("Set-Cookie") && /text\/html|xml/.test(headers.get("Content-Type") ?? "");
  if (store) {
    // Browsers always revalidate; only the edge keeps a copy.
    headers.set("Cache-Control", `public, max-age=0, s-maxage=${EDGE_TTL}`);
    headers.set("X-Cache", "MISS");
  }
  const out = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  if (store) {
    const put = cache.put(context.request.url, out.clone()).catch(() => {});
    const cf = (context.locals as { cfContext?: { waitUntil(promise: Promise<unknown>): void } }).cfContext;
    if (cf) cf.waitUntil(put);
    else await put;
  }
  return out;
});
