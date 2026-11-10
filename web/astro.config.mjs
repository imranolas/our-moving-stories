import { defineConfig, envField, fontProviders } from "astro/config";

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

  // Self-hosted from /_astro/fonts, with size-adjusted fallbacks so the swap doesn't reflow the big headlines.
  // Layout.astro renders them with <Font>; tailwind.css maps --font-display/sans/mono onto these variables.
  // Only the weights in use: display 800 (font-extrabold) and 900 (display/font-black), Karla 400 and 700,
  // DM Mono 400. Karla and DM Mono are downloaded from Google Fonts at build time.
  fonts: [
    {
      // Google's font list now has this only as "Big Shoulders" (with an optical-size axis), so the provider
      // can't find it. This is the file Google's CSS API still serves for "Big Shoulders Display" (latin,
      // variable weight; SIL Open Font License), kept as it was so the headlines don't change.
      provider: fontProviders.local(),
      name: "Big Shoulders Display",
      cssVariable: "--font-big-shoulders",
      fallbacks: ["Impact", "sans-serif"],
      options: {
        variants: [
          { weight: "800 900", style: "normal", src: ["./src/assets/fonts/big-shoulders-display-latin.woff2"] },
        ],
      },
    },
    {
      provider: fontProviders.google(),
      name: "Karla",
      cssVariable: "--font-karla",
      weights: ["400 700"],
      // No italic files, as before: the odd <em> from Sanity uses the browser's slanted roman.
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "DM Mono",
      cssVariable: "--font-dm-mono",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],

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
