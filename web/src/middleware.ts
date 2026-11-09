import { defineMiddleware } from "astro:middleware";
import { SANITY_READ_TOKEN } from "astro:env/server";
import { getPreview } from "./sanity/lib/draft-mode";
import { STUDIO_ORIGINS } from "./sanity/lib/studio";

/**
 * Runs for every on-request page (static files in public/ are served by Workers Assets and skip it).
 * - 301s "/events/" to "/events" so each page has one URL (Layout.astro's canonical drops the slash too).
 * - Works out draft mode (Astro.locals.preview) from the signed cookie; see src/sanity/lib/draft-mode.ts.
 * - Adds security headers. Only Sanity Studio may frame the site (Presentation tool).
 * - Keeps draft-mode pages and *.workers.dev hosts out of search engines and caches.
 *
 * HTML caching (Cache-Control / edge cache) is deliberately not set here yet: see
 * docs/seo/ourmovingstories.com-audit/ACTION-PLAN.md item 3.3. Any cache added later must skip requests
 * that carry the draft-mode cookie.
 */
// Studios opened from the sanity.io dashboard sit inside a www.sanity.io frame.
const FRAME_ANCESTORS = ["'self'", ...STUDIO_ORIGINS, "https://www.sanity.io"].join(" ");

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return context.redirect(url.pathname + url.search, 301);
  }

  context.locals.preview = await getPreview(context.cookies, SANITY_READ_TOKEN);

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

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
