/**
 * Keeps Sanity's events in step with Eventbrite (see packages/eventbrite-sync for what it owns).
 *
 * - POST /eventbrite/<WEBHOOK_SECRET>  Eventbrite webhook. Replies 202 at once, then syncs the event the
 *   payload names (its whole series), or everything if it names none (Eventbrite's "Test" button).
 * - GET  /eventbrite/<WEBHOOK_SECRET>  Dry run: returns what a sync would change, writes nothing.
 *   Add ?event=<Eventbrite event ID> to dry-run one event, as its webhook would.
 * - GET  /health                       Liveness check.
 * - Cron (daily)                       Full sync. The webhook is answered before it syncs, so Eventbrite
 *                                      never retries a sync that failed; this catches it up.
 */
import { env } from "cloudflare:workers";
import { createClient } from "@sanity/client";
import { syncEventbrite } from "@our-moving-stories/eventbrite-sync";

async function runSync(trigger: string, apply: boolean, eventId?: string) {
  const lines: string[] = [];
  const client = createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: "2025-02-19",
    token: env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });
  try {
    const result = await syncEventbrite({ client, eventbriteToken: env.EVENTBRITE_PRIVATE_TOKEN, apply, eventId, log: (l) => lines.push(l) });
    console.log(JSON.stringify({ trigger, ...result }));
    if (result.changed) console.log(lines.join("\n"));
    return lines;
  } catch (err) {
    console.error(JSON.stringify({ trigger, error: (err as Error).message }));
    throw err;
  }
}

/** Constant-time comparison so the secret can't be guessed byte by byte from response timing. */
function matchesSecret(candidate: string) {
  const secret = env.WEBHOOK_SECRET;
  if (!secret) return false;
  const a = new TextEncoder().encode(candidate);
  const b = new TextEncoder().encode(secret);
  return a.byteLength === b.byteLength && crypto.subtle.timingSafeEqual(a, b);
}

/**
 * The event a webhook is about. Event actions send `api_url: "https://www.eventbriteapi.com/v3/events/<id>/"`.
 * Only that exact shape is accepted, and the sync builds its own requests from the ID.
 */
const eventIdFrom = (apiUrl: unknown) =>
  typeof apiUrl === "string" ? /^https:\/\/www\.eventbriteapi\.com\/v3\/events\/(\d+)\/?$/.exec(apiUrl)?.[1] : undefined;

const canWrite = () => env.SYNC_APPLY === "true";

export default {
  async fetch(request, _env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return new Response("ok");

    const secret = url.pathname.match(/^\/eventbrite\/([^/]+)\/?$/)?.[1];
    if (!secret || !matchesSecret(decodeURIComponent(secret))) return new Response("Not found", { status: 404 });

    if (request.method === "POST") {
      const payload = (await request.json().catch(() => null)) as { config?: { action?: string }; api_url?: unknown } | null;
      const action = payload?.config?.action ?? "unknown";
      const eventId = eventIdFrom(payload?.api_url);
      ctx.waitUntil(runSync(`webhook:${action}${eventId ? `:${eventId}` : ""}`, canWrite(), eventId).catch(() => {}));
      return new Response("accepted", { status: 202 });
    }
    if (request.method === "GET") {
      const eventId = url.searchParams.get("event") ?? undefined;
      if (eventId !== undefined && !/^\d+$/.test(eventId)) return new Response("?event must be an Eventbrite event ID\n", { status: 400 });
      const headers = { "content-type": "text/plain; charset=utf-8" };
      try {
        const lines = await runSync(eventId ? `dry-run:${eventId}` : "dry-run", false, eventId);
        return new Response(lines.join("\n").trim() + "\n", { headers });
      } catch (err) {
        return new Response(`Sync failed: ${(err as Error).message}\n`, { status: 502, headers });
      }
    }
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, POST" } });
  },

  async scheduled(controller, _env, ctx) {
    ctx.waitUntil(runSync(`cron:${controller.cron}`, canWrite()));
  },
} satisfies ExportedHandler;
