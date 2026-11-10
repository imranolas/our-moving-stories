/**
 * Syncs Eventbrite events into Sanity by hand. The same sync runs automatically in the
 * workers/eventbrite-sync Worker (webhooks + a daily full sync); the logic lives in packages/eventbrite-sync.
 *
 * Dry run (default) prints what would change; nothing is written:
 *   bun run sync:eventbrite
 * Apply (only allowed on the "production" dataset):
 *   bun run sync:eventbrite:apply
 * One event (or its whole series) only, as a webhook would: add `--event <Eventbrite event ID>`.
 * Every event Eventbrite has ever had, creating past ones Sanity lacks (a backfill): add `--all`.
 *
 * Needs EVENTBRITE_PRIVATE_TOKEN in the environment (root .env, loaded by direnv).
 */
import { getCliClient } from "sanity/cli";
import { syncEventbrite } from "@our-moving-stories/eventbrite-sync";

const apply = process.argv.includes("--apply");
const all = process.argv.includes("--all");
const eventArg = process.argv.indexOf("--event");
const eventId = eventArg >= 0 ? process.argv[eventArg + 1] : undefined;
if (eventArg >= 0 && !/^\d+$/.test(eventId ?? "")) {
  console.error("--event needs an Eventbrite event ID.");
  process.exit(1);
}
const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
if (!token) {
  console.error("EVENTBRITE_PRIVATE_TOKEN is not set (add it to the root .env).");
  process.exit(1);
}

syncEventbrite({ client: getCliClient({ apiVersion: "2025-02-19" }), eventbriteToken: token, apply, eventId, all })
  .then((result) => {
    if (!apply) console.log("Dry run: nothing was written. Re-run with `bun run sync:eventbrite:apply` to write.");
    else if (result.changed) console.log("Done. The site shows the changes within 5 minutes (its edge cache).");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
