import { defineConfig, envField } from "astro/config";

import sanity from "@sanity/astro";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    // Published content from the CDN by default. Draft mode (Studio's Presentation tool) switches per request
    // to the token, the editor's perspective and stega in src/sanity/lib/load-query.ts. Never put the token
    // here: this config is also shipped to the browser.
    sanity({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID,
      dataset: process.env.SANITY_STUDIO_DATASET,
      useCdn: true,
      perspective: "published",
      apiVersion: "2025-02-19",
    }),
    react(),
  ],

  env: {
    schema: {
      // Sanity Viewer token, read at runtime from the Worker secret (locally: web/.dev.vars). Only draft mode
      // uses it; without it the site still works and /api/draft-mode/enable says it isn't set up.
      SANITY_READ_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Pre-bundle Visual Editing (draft mode's island), or dev serves @sanity/mutate's CommonJS lodash
      // imports unbundled ("no default export").
      include: ["@sanity/visual-editing/react"],
    },
  },

  // Every page renders on request (Sanity's CDN keeps queries fast), so content changes from Studio or
  // the Eventbrite sync show up without a rebuild, and draft mode works per request.
  output: "server",
  adapter: cloudflare({
    // Images come from Sanity's image CDN (urlFor), not astro:assets, so skip the IMAGES binding.
    imageService: "passthrough",
  }),
  // Astro sessions aren't used; this stops the adapter provisioning a KV namespace for them.
  session: false,
});
