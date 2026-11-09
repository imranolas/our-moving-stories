import { bindings, defineConfig } from "cf/config";

/**
 * The public site: Astro on Cloudflare Workers via @astrojs/cloudflare. `cf build` runs `astro build`;
 * `cf deploy` deploys it. There's one Worker: draft mode for Studio's Presentation tool is switched on per
 * request by a signed cookie (src/sanity/lib/draft-mode.ts), so no separate preview deployment.
 *
 * Secrets (upload with `cf deploy --secrets-file <file>`; later deploys keep them; locally they come from
 * web/.dev.vars):
 * - SANITY_READ_TOKEN: Sanity token with Viewer access. Only draft mode uses it.
 *
 * Astro reads SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET at build time (astro.config.mjs), so set
 * those in the build environment, not as Worker bindings. See docs/redesign/HANDOFF.md → Hosting.
 */
export default defineConfig({
  worker: {
    name: "our-moving-stories",
    compatibilityDate: "2026-11-01",
    compatibilityFlags: ["nodejs_compat"],
    observability: { enabled: true },
    env: {
      SANITY_READ_TOKEN: bindings.secret(),
    },
    // Add at DNS cutover, when ourmovingstories.com should move off Netlify:
    // domains: ["ourmovingstories.com", "www.ourmovingstories.com"],
  },
});
