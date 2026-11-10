import { handle } from "@astrojs/cloudflare/handler";

/**
 * The site's Worker entrypoint (cloudflare.config.ts): Astro's handler, plus a redirect from www and plain
 * http to https://ourmovingstories.com, and byte ranges for /video/*.
 * Cloudflare's static assets ignore `Range` and always send the whole file with 200, and Safari (so every
 * iPhone) won't play a video without 206 Partial Content. `assets.runWorkerFirst` routes /video/* here.
 */
type Env = Parameters<typeof handle>[1];
type Context = Parameters<typeof handle>[2];

/** The site's one address. www and plain http redirect to it in a single hop (Layout's canonical matches). */
const SITE_HOST = "ourmovingstories.com";

export default {
  fetch(request: Request, env: Env, context: Context) {
    const url = new URL(request.url);
    if (url.hostname === `www.${SITE_HOST}` || (url.hostname === SITE_HOST && url.protocol === "http:")) {
      url.hostname = SITE_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith("/video/")) return serveWithRanges(request, env);
    return handle(request, env, context);
  },
};

async function serveWithRanges(request: Request, env: Env): Promise<Response> {
  // Fetched without the Range header, which the assets binding would ignore anyway.
  const asset: Response = await env.ASSETS.fetch(request.url);
  if (!asset.ok) return asset;
  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  const body = (data: BodyInit | null) => (request.method === "HEAD" ? null : data);

  // One range: "bytes=500-999", "bytes=500-" (to the end) or "bytes=-500" (the last 500 bytes).
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("Range") ?? "");
  if (!range || (!range[1] && !range[2])) return new Response(body(asset.body), { status: 200, headers });

  const file = await asset.arrayBuffer();
  const size = file.byteLength;
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" } });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(body(file.slice(start, end + 1)), { status: 206, headers });
}
