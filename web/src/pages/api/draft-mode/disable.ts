import type { APIRoute } from "astro";
import { disableDraftModeCookies } from "../../../sanity/lib/draft-mode";

/** Turns draft mode off (the "Exit preview" button) and goes back to the page, or the homepage. */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const back = url.searchParams.get("to");
  // Only same-site paths; resolving against our origin rules out "//example.com" and the like.
  let target = new URL(back?.startsWith("/") ? back : "/", url.origin);
  if (target.origin !== url.origin) target = new URL("/", url.origin);

  const headers = new Headers({ Location: target.href, "Cache-Control": "no-store" });
  for (const value of disableDraftModeCookies()) headers.append("Set-Cookie", value);
  return new Response(null, { status: 307, headers });
};
