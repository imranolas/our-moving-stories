import { loadQuery } from "../sanity/lib/load-query";
import { nextSession, type Session } from "../lib/schedule";

const SITE = "https://ourmovingstories.com";

type Doc = { slug: string; updated: string };
type EventDoc = Doc & { name: string; sessions?: Session[] };

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/**
 * Every indexable page: Sanity pages, the events and sessions hubs, people, and events that still have
 * upcoming dates. Events with none are left out because their pages are noindex (events/[slug].astro).
 */
export async function GET() {
  const published = `defined(slug.current) && !(_id in path("drafts.**"))`;
  const { data } = await loadQuery<{ pages: Doc[]; events: EventDoc[]; people: Doc[] }>({
    query: `{
      "pages": *[_type == "page" && ${published}] { "slug": slug.current, "updated": _updatedAt },
      "events": *[_type == "event" && ${published}] { "slug": slug.current, "updated": _updatedAt, name, sessions },
      "people": *[_type == "person" && ${published}] { "slug": slug.current, "updated": _updatedAt }
    }`,
    // Always published: search engines never see drafts.
    preview: undefined,
  });

  const events = data.events.filter((e) => nextSession({ name: e.name, sessions: e.sessions }));
  const latest = (docs: Doc[]) => docs.map((d) => d.updated).sort().at(-1);
  const eventsUpdated = latest(events);

  const urls = new Map<string, string | undefined>();
  for (const p of data.pages) {
    if (p.slug === "index") {
      // The homepage lists events and people, so it changes when they do.
      urls.set(`${SITE}/`, [p.updated, eventsUpdated, latest(data.people)].filter(Boolean).sort().at(-1));
    } else if (p.slug !== "404") {
      urls.set(`${SITE}/${p.slug}`, p.updated);
    }
  }
  urls.set(`${SITE}/events`, eventsUpdated);
  urls.set(`${SITE}/sessions`, eventsUpdated);
  for (const e of events) urls.set(`${SITE}/events/${e.slug}`, e.updated);
  for (const p of data.people) urls.set(`${SITE}/people/${p.slug}`, p.updated);

  const body = [...urls]
    .map(([loc, lastmod]) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
