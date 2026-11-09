/**
 * Syncs Eventbrite events into Sanity by hand. The same sync runs automatically in the
 * workers/eventbrite-sync Worker (webhooks + hourly cron); the logic lives in packages/eventbrite-sync.
 *
 * Dry run (default) prints what would change; nothing is written:
 *   bun run sync:eventbrite
 * Apply (only allowed on the "production" dataset):
 *   bun run sync:eventbrite:apply
 *
 * Needs EVENTBRITE_PRIVATE_TOKEN in the environment (root .env, loaded by direnv).
 */
import { getCliClient } from "sanity/cli";
import { syncEventbrite } from "@our-moving-stories/eventbrite-sync";

const apply = process.argv.includes("--apply");
const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
if (!token) {
  console.error("EVENTBRITE_PRIVATE_TOKEN is not set (add it to the root .env).");
  process.exit(1);
}

syncEventbrite({ client: getCliClient({ apiVersion: "2025-02-19" }), eventbriteToken: token, apply })
  .then((result) => {
    if (!apply) console.log("Dry run: nothing was written. Re-run with `bun run sync:eventbrite:apply` to write.");
    else if (result.changed) console.log("Done. Pages render on request, so the site shows the changes straight away.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
