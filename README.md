# Our Moving Stories

The website for [Our Moving Stories](https://ourmovingstories.com): free movement and arts sessions for
families in Southall and Acton. Content is edited in Sanity Studio at
[ourmovingstories.sanity.studio](https://ourmovingstories.sanity.studio).

## What's here

| Path | What it is |
|---|---|
| `web/` | The site: Astro 7 and Tailwind 4, rendered on request on Cloudflare Workers (Worker `our-moving-stories`, serving `ourmovingstories.com`). |
| `studio/` | Sanity Studio 6: editing, plus live preview of drafts on the site (the Presentation tool). |
| `workers/eventbrite-sync/` | Worker that keeps Sanity's events in step with Eventbrite: a webhook per change and a daily full sync. |
| `packages/eventbrite-sync/` | The sync itself, shared by that Worker and Studio's `sync:eventbrite` script. |
| `docs/redesign/HANDOFF.md` | How everything works and why: hosting, draft mode, the sync, the design system, runbooks. Read it before larger changes. |
| `docs/seo/` | SEO audit and action plan. |

## Where content comes from

- **Events** are managed on **Eventbrite**. The sync copies each event's name, overview, FAQs, price,
  poster, venue and dates into Sanity, and Studio shows those fields read-only. Studio still owns "Who
  it's for", the card photo, key details and session notes.
- **Everything else** (pages, people, navigation, footer, settings) is edited in **Studio**.
- The site reads published content from Sanity's `production` dataset on each request. Pages are cached
  at Cloudflare's edge for up to 5 minutes. `staging` holds the old content: never write to it.

## Getting started

You need Node 22.23 or later, [bun](https://bun.sh) 1.3 and [direnv](https://direnv.net).

```sh
bun install
cp .env.example .env                     # fill it in, then `direnv allow`
cp web/.dev.vars.example web/.dev.vars   # only needed for draft mode
```

| Run | Command | Address |
|---|---|---|
| Site | `cd web && bun run dev` | http://localhost:4321 |
| Studio | `cd studio && bun run dev` | http://localhost:3333 (its preview loads the local site) |
| Eventbrite sync | `cd workers/eventbrite-sync && npx cf dev` | http://localhost:8787 (dry runs only; secrets in `.dev.vars`) |

Use the `cf` CLI (`npx cf`, configured by each `cloudflare.config.ts`) for Cloudflare, not Wrangler.

## Checks

- `web/`: `bun run check` and `npx cf build`
- `studio/`: `bun run typecheck`, `bun run lint` and `bun run build`
- `workers/eventbrite-sync/`: `npx cf build`, then `npx tsc --noEmit`

## Making a change

1. Branch off `master` and open a pull request.
2. CI (`.github/workflows/deploy.yml`) builds and type-checks the site and the sync Worker, and does a
   dry-run deploy of both.
3. Merging to `master` deploys both Workers to Cloudflare.

Two things CI doesn't do:

- **Studio**: after schema or Studio changes, deploy it yourself with
  `cd studio && SANITY_STUDIO_PREVIEW_URL=https://ourmovingstories.com npx sanity deploy`.
- **Worker secrets**: set once by hand with `npx cf deploy --secrets-file <file>`; later deploys keep
  them. HANDOFF → "First deploy and cutover" lists them.

## Eventbrite sync by hand

From `studio/` (dry run unless you use `:apply`):

```sh
bun run sync:eventbrite                 # every upcoming event
bun run sync:eventbrite --event <id>    # one event and its series
bun run sync:eventbrite --all           # every event Eventbrite has ever had
bun run sync:eventbrite:apply           # write the changes
```
