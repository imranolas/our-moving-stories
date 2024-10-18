import { defineConfig } from "astro/config";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify";

const isPreview = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED;

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: import.meta.env.SANITY_STUDIO_PROJECT_ID,
      dataset: import.meta.env.SANITY_STUDIO_DATASET,
      token: isPreview ? import.meta.env.SANITY_PREVIEW_TOKEN : undefined,
      useCdn: !isPreview,
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
