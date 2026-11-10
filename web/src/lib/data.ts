import { loadQuery } from "../sanity/lib/load-query";
import { EVENT_FIELDS, type Event } from "./schedule";

/**
 * Data that several components on one page need, fetched once per request and shared through Astro.locals.
 * The homepage alone used to ask Sanity for every event three times (Hero, EventsSection,
 * UpcomingSessionsSection) and for settings twice (Nav, Footer).
 *
 * src/middleware.ts starts `siteData` before the page renders, so it runs alongside the page's own query
 * instead of after it. Pass `Astro.locals` (or `context.locals`); `preview` on it picks drafts or published.
 */

export type SiteData = {
  settings: Record<string, any>;
  nav: Record<string, any>;
  footer: Record<string, any>;
};

const SITE_QUERY = `*[_type in ["settings", "nav", "footer"]] {
  ...,
  items[] {
    ...,
    navigationItemUrl {
      ...,
      internalLink { ..., reference-> { slug } }
    }
  }
}`;

export function siteData(locals: App.Locals): Promise<SiteData> {
  return (locals.siteData ??= started(
    loadQuery<any[]>({ query: SITE_QUERY, preview: locals.preview }).then(({ data }) => {
      const find = (type: string) => (data ?? []).find((d) => d?._type === type) ?? {};
      return { settings: find("settings"), nav: find("nav"), footer: find("footer") };
    }),
  ));
}

export function allEvents(locals: App.Locals): Promise<Event[]> {
  return (locals.events ??= started(
    loadQuery<Event[]>({ query: `*[_type == "event"]{ ${EVENT_FIELDS} }`, preview: locals.preview }).then(
      ({ data }) => data ?? [],
    ),
  ));
}

/** Started early and awaited later: a failure still reaches whoever awaits, but isn't reported as unhandled first. */
function started<T>(promise: Promise<T>): Promise<T> {
  promise.catch(() => {});
  return promise;
}
