import { defineConfig } from "astro/config";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: process.env.SANITY_STUDIO_DATASET,
      token: process.env.SANITY_STUDIO_READ_TOKEN,
      useCdn: false, // See note on using the CDN
      apiVersion: "2024-07-24", // insert the current date to access the latest version of the API
    }),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
