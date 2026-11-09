import type { APIRoute } from "astro";
import { SANITY_READ_TOKEN } from "astro:env/server";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { withoutSecretSearchParams } from "@sanity/preview-url-secret/without-secret-search-params";
import { sanityClient } from "sanity:client";
import { enableDraftModeCookies } from "../../../sanity/lib/draft-mode";

/**
 * Presentation's previewMode.enable route (studio/sanity.config.ts). Checks the one-off secret the Studio
 * just wrote to the dataset, turns draft mode on and redirects to the page being previewed.
 */
export const GET: APIRoute = async ({ request }) => {
  if (!SANITY_READ_TOKEN) {
    return new Response("Draft mode isn't set up: the SANITY_READ_TOKEN secret is missing.", { status: 500 });
  }

  const { isValid, redirectTo = "/", studioPreviewPerspective } = await validatePreviewUrl(
    sanityClient.withConfig({ token: SANITY_READ_TOKEN }),
    request.url,
  );
  if (!isValid) return new Response("Invalid or expired preview secret", { status: 401 });

  // Resolve against this origin and send an absolute URL, so a path like "//example.com" can't redirect away.
  const origin = new URL(request.url).origin;
  let target = withoutSecretSearchParams(new URL(redirectTo, origin));
  if (target.origin !== origin) target = new URL("/", origin);

  const headers = new Headers({ Location: target.href, "Cache-Control": "no-store" });
  for (const value of await enableDraftModeCookies(request, SANITY_READ_TOKEN, studioPreviewPerspective || "drafts")) {
    headers.append("Set-Cookie", value);
  }
  return new Response(null, { status: 307, headers });
};
