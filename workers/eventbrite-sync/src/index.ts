/**
 * Keeps Sanity's events in step with Eventbrite (see packages/eventbrite-sync for what it owns).
 *
 * - POST /eventbrite/<WEBHOOK_SECRET>  Eventbrite webhook. Replies 202 at once and syncs in the background.
 *   Eventbrite doesn't sign payloads, so the body is only a signal: everything is re-read with our token.
 * - GET  /eventbrite/<WEBHOOK_SECRET>  Dry run: returns what a sync would change, writes nothing.
 * - GET  /health                       Liveness check.
 * - Cron (hourly)                      Same sync, as a safety net for missed webhooks.
 */
import { env } from "cloudflare:workers";
import { createClient } from "@sanity/client";
import { syncEventbrite } from "@our-moving-stories/eventbrite-sync";

async function runSync(trigger: string, apply: boolean) {
  const lines: string[] = [];
  const client = createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: "2025-02-19",
    token: env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });
  try {
    const result = await syncEventbrite({ client, eventbriteToken: env.EVENTBRITE_PRIVATE_TOKEN, apply, log: (l) => lines.push(l) });
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

const canWrite = () => env.SYNC_APPLY === "true";

export default {
  async fetch(request, _env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return new Response("ok");

    const secret = url.pathname.match(/^\/eventbrite\/([^/]+)\/?$/)?.[1];
    if (!secret || !matchesSecret(decodeURIComponent(secret))) return new Response("Not found", { status: 404 });

    if (request.method === "POST") {
      const payload = (await request.json().catch(() => null)) as { config?: { action?: string }; api_url?: string } | null;
      const action = payload?.config?.action ?? "unknown";
      ctx.waitUntil(runSync(`webhook:${action}`, canWrite()).catch(() => {}));
      return new Response("accepted", { status: 202 });
    }
    if (request.method === "GET") {
      const lines = await runSync("dry-run", false);
      return new Response(lines.join("\n").trim() + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, POST" } });
  },

  async scheduled(controller, _env, ctx) {
    ctx.waitUntil(runSync(`cron:${controller.cron}`, canWrite()));
  },
} satisfies ExportedHandler;
