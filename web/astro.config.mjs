import { defineConfig } from "astro/config";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify";

const isPreview = process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED;

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: process.env.SANITY_STUDIO_DATASET,
      token: isPreview
        ? process.env.SANITY_PREVIEW_TOKEN
        : process.env.SANITY_READ_TOKEN,
      useCdn: !isPreview,
      perspective: isPreview ? "previewDrafts" : "published",
      apiVersion: "2024-10-17",
    }),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],

  output: "server",
  adapter: netlify(),
});
