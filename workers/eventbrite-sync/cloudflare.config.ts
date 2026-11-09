import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

/**
 * Eventbrite → Sanity sync Worker. Holds the only write token; the public site only reads.
 * `cf dev` runs in "development" mode, which never writes (dry runs only).
 *
 * Secrets (upload with `cf deploy --secrets-file <file>`; locally they come from .dev.vars):
 * - SANITY_WRITE_TOKEN: Sanity robot token with Editor access to the project.
 * - EVENTBRITE_PRIVATE_TOKEN: Eventbrite private token.
 * - WEBHOOK_SECRET: random string; the webhook URL is /eventbrite/<WEBHOOK_SECRET>.
 */
export default defineConfig(({ mode }) => ({
  worker: {
    name: "our-moving-stories-eventbrite-sync",
    entrypoint,
    compatibilityDate: "2026-11-01",
    compatibilityFlags: ["nodejs_compat"],
    observability: { enabled: true },
    env: {
      SANITY_PROJECT_ID: bindings.text("othhiu7y"),
      SANITY_DATASET: bindings.text("production"),
      SYNC_APPLY: bindings.text(mode === "development" ? "false" : "true"),
      SANITY_WRITE_TOKEN: bindings.secret(),
      EVENTBRITE_PRIVATE_TOKEN: bindings.secret(),
      WEBHOOK_SECRET: bindings.secret(),
    },
    // Hourly at :17, a safety net for webhooks that never arrive.
    triggers: [triggers.scheduled({ schedule: "17 * * * *" })],
  },
}));
