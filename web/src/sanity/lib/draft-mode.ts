/**
 * Draft mode: shows unpublished changes on the live site, for Sanity Studio's Presentation tool.
 *
 * Presentation opens /api/draft-mode/enable?sanity-preview-secret=… in its iframe. That route checks the secret
 * against the dataset (@sanity/preview-url-secret), sets two cookies and redirects to the page:
 * - DRAFT_MODE_COOKIE (HttpOnly) is the gate: "<expiry>.<HMAC>", signed with a key derived from
 *   SANITY_READ_TOKEN, so it can't be forged. (Sanity's own Astro example gates on the perspective cookie,
 *   which anyone can set by hand to read drafts and skip the CDN.)
 * - The perspective cookie says what to read: "drafts", "published" or a content-release stack. The Visual
 *   Editing island rewrites it when the editor switches perspective. It's only read behind a valid gate.
 *
 * src/middleware.ts turns the cookies into Astro.locals.preview, which every loadQuery call passes on.
 * Server-only: never import this from client code.
 */
import { validateApiPerspective, type ClientPerspective } from "@sanity/client";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import type { AstroCookies } from "astro";

export const DRAFT_MODE_COOKIE = "oms-draft-mode";
/** How long draft mode lasts after Presentation enables it (Presentation re-enables it each time it opens). */
export const DRAFT_MODE_TTL_SECONDS = 8 * 60 * 60;

export type Preview = { perspective: ClientPerspective };

const encoder = new TextEncoder();

function hmacKey(token: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`oms-draft-mode:${token}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (value: string) =>
  Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function signDraftModeCookie(token: string, now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + DRAFT_MODE_TTL_SECONDS);
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(token), encoder.encode(expires));
  return `${expires}.${toBase64Url(signature)}`;
}

async function verifyDraftModeCookie(token: string, value: string, now = Date.now()) {
  const [expires, signature, ...rest] = value.split(".");
  if (rest.length || !/^\d+$/.test(expires ?? "") || !signature || Number(expires) * 1000 <= now) return false;
  try {
    // crypto.subtle.verify compares in constant time.
    return await crypto.subtle.verify("HMAC", await hmacKey(token), fromBase64Url(signature), encoder.encode(expires));
  } catch {
    return false;
  }
}

/** The perspective cookie holds "drafts", "published", or a release stack as a comma list. */
function parsePerspective(raw: string | undefined): ClientPerspective {
  if (!raw) return "drafts";
  const perspective: unknown = raw.includes(",") ? raw.split(",") : raw;
  try {
    validateApiPerspective(perspective);
  } catch {
    return "drafts";
  }
  return perspective === "raw" ? "drafts" : perspective;
}

/** Draft-mode settings for this request, or undefined for normal (published, CDN-cached) rendering. */
export async function getPreview(cookies: AstroCookies, token: string | undefined): Promise<Preview | undefined> {
  const gate = cookies.get(DRAFT_MODE_COOKIE)?.value;
  if (!gate || !token || !(await verifyDraftModeCookie(token, gate))) return undefined;
  return { perspective: parsePerspective(cookies.get(perspectiveCookieName)?.value) };
}

/**
 * Presentation frames the site from another site (ourmovingstories.sanity.studio), so the cookies must be
 * SameSite=None; Secure. Safari only keeps them there with the CHIPS Partitioned attribute; top-level visits
 * stay unpartitioned so the disable route can clear them.
 */
function isCrossSiteFrame(request: Request) {
  return request.headers.get("sec-fetch-dest") === "iframe" && request.headers.get("sec-fetch-site") === "cross-site";
}

function cookie(name: string, value: string, { httpOnly, partitioned, maxAge }: { httpOnly: boolean; partitioned: boolean; maxAge: number }) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "Secure",
    "SameSite=None",
    `Max-Age=${maxAge}`,
    httpOnly && "HttpOnly",
    partitioned && "Partitioned",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function enableDraftModeCookies(request: Request, token: string, perspective: string) {
  const partitioned = isCrossSiteFrame(request);
  const maxAge = DRAFT_MODE_TTL_SECONDS;
  return [
    cookie(DRAFT_MODE_COOKIE, await signDraftModeCookie(token), { httpOnly: true, partitioned, maxAge }),
    cookie(perspectiveCookieName, perspective, { httpOnly: false, partitioned, maxAge }),
  ];
}

/** Expires both cookies, partitioned and not, since either may have been set. */
export function disableDraftModeCookies() {
  return [DRAFT_MODE_COOKIE, perspectiveCookieName].flatMap((name) =>
    [false, true].map((partitioned) => cookie(name, "", { httpOnly: name === DRAFT_MODE_COOKIE, partitioned, maxAge: 0 })),
  );
}
