import { defineCliConfig } from "sanity/cli";

// Read env vars directly rather than importing sanity.config.ts: the CLI loads
// this file for every command, and pulling in the whole Studio (schemas, React
// components) here makes config loading slow and fragile.
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  // `sanity deploy` replaces the existing hosted Studio, https://ourmovingstories.sanity.studio (the site's
  // STUDIO_URL in web/src/sanity/lib/studio.ts).
  studioHost: "ourmovingstories",
});
