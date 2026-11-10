# Our Moving Stories

Monorepo (bun workspaces, Node >= 22.23): `web/` (Astro 7 + Tailwind 4, rendered on request on
Cloudflare Workers), `studio/` (Sanity Studio v6, React 19), `workers/eventbrite-sync` (webhook + cron
Worker) and `packages/eventbrite-sync` (sync logic shared by the Worker and `studio`'s CLI script).
Env comes from the root `.env` via direnv (`.envrc`); `SANITY_STUDIO_DATASET` picks the dataset.
Checks: `bun run check` and `npx cf build` in `web/`; `bun run build` / `typecheck` / `lint` in `studio/`;
`npx cf build` and `npx tsc --noEmit` in `workers/eventbrite-sync`.
Cloudflare: use the `cf` CLI (`npx cf`, configured by `cloudflare.config.ts`), not Wrangler, except for
secrets and log tailing, which `cf` can't do yet. Never run `cf dev`/`build`/`deploy` in a folder without a
`cloudflare.config.ts`; it auto-configures and rewrites files.

Draft mode (Studio's Presentation tool) is per request on the one site Worker: every `loadQuery` call
passes `preview: Astro.locals.preview`, and Sanity strings carry invisible stega markers in that mode
(see HANDOFF → Hosting → Draft mode, and the stega gotcha). Draft mode updates pages by morphing the DOM, so
mark elements whose attributes a `<script>` changes at runtime with `data-preview-keep="<attributes to
watch>"` (see Hero.astro).

The site is live at https://ourmovingstories.com (Cloudflare, since 10 Nov 2026). Flow: branch off
`master`, open a PR (CI builds, checks and dry-run-deploys), merge to `master` (CI deploys both
Workers). Studio isn't deployed by CI: `SANITY_STUDIO_PREVIEW_URL=https://ourmovingstories.com npx sanity
deploy` in `studio/`. `README.md` is the overview; read `docs/redesign/HANDOFF.md` before larger changes:
it covers the design system, code map, schema, the Eventbrite sync, the Sanity dataset plan (work in
`production`; never write to `staging`) and what's left.
