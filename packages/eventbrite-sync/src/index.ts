/**
 * Eventbrite → Sanity event sync, shared by the CLI script (studio/scripts/sync-eventbrite.ts) and the
 * webhook/cron Worker (workers/eventbrite-sync). Runs in Node and in the Workers runtime.
 *
 * One Sanity event per Eventbrite series or one-off event. A run covers every upcoming event (the daily
 * cron, the CLI), one event's series (a webhook, via `eventId`), or every event Eventbrite has ever had
 * (a backfill, via `all`), and only writes what differs. Ownership:
 * - Eventbrite owns (Studio shows these read-only on synced events; edit them on Eventbrite):
 *   name, summary, description (Eventbrite's "Overview"), FAQs, price, booking link, poster (the event
 *   image), venue, and sessions (date, start, end, cancelled): a date Eventbrite doesn't list is removed,
 *   unless an editor marked it cancelled or gave it a note (e.g. a "Christmas break" entry). Venues: one Sanity venue per place, linked to an Eventbrite
 *   venue and kept in step with it (name, address, map pin), read-only in Studio; see venueFor.
 * - Set once (when missing), then Sanity-owned: slug.
 * - Never touched: audience, photo, info, session notes, and cancelled or noted dates editors added.
 * An unpublished Studio draft of a synced event gets the same changes, so publishing it doesn't undo them.
 * Events Sanity already tracks that have left Eventbrite's live listing are looked up directly, so a
 * cancelled event's sessions are marked cancelled rather than left looking upcoming.
 */
import type { SanityClient } from "@sanity/client";
import { htmlToPortableText } from "./portable-text";

const API = "https://www.eventbriteapi.com/v3";

export type SyncOptions = {
  /** Sanity client with the target dataset configured. Needs a write token when `apply` is true. */
  client: SanityClient;
  eventbriteToken: string;
  /** Write changes. When false, only logs what would change. */
  apply: boolean;
  /**
   * Sync only this Eventbrite event, or the whole series it belongs to (webhooks). Same rules as a full
   * sync: it's synced if it's listed and on sale, or if Sanity already has it. Default: every event.
   */
  eventId?: string;
  /** Every event Eventbrite has, past ones included, creating the ones Sanity lacks (a backfill). */
  all?: boolean;
  /** Writes are refused unless the client's dataset is one of these. Default: ["production"]. */
  writableDatasets?: string[];
  log?: (line: string) => void;
};

export type SyncResult = {
  dataset: string;
  applied: boolean;
  eventbriteEvents: number;
  writes: number;
  uploads: number;
  changed: boolean;
};

type EbVenue = {
  id: string;
  name: string;
  latitude?: string;
  longitude?: string;
  address?: { address_1?: string; address_2?: string; city?: string; region?: string; postal_code?: string };
};
type EbEvent = {
  id: string;
  series_id?: string;
  is_series?: boolean;
  is_series_parent?: boolean;
  name: { text: string };
  summary?: string;
  url: string;
  status: string;
  listed: boolean;
  start: { local: string };
  end: { local: string };
  venue?: EbVenue;
  logo?: { id?: string; original?: { url?: string } };
  is_free?: boolean;
  ticket_availability?: { minimum_ticket_price?: { major_value?: string } };
};
/** An event page's content blocks: "text" modules make up the Overview; the "faqs" widget holds the FAQs. */
type EbContent = {
  modules?: { type: string; data?: { body?: { text?: string } } }[];
  widgets?: { type: string; data?: { faqs?: { question?: string; answer?: string }[] } }[];
};
type Faq = { _type: "faq"; _key: string; question: string; answer: string };
type Session = { _key: string; _type?: string; date: string; startTime?: string; endTime?: string; note?: string; cancelled?: boolean };

const tidy = (s = "") => s.replace(/\s+/g, " ").trim();
const norm = (s = "") => tidy(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const postcode = (s = "") => s.replace(/\s+/g, "").toUpperCase();
const slugify = (s: string) =>
  tidy(s).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
const cleanUrl = (u: string) => u.split("?")[0].replace("eventbrite.com/", "eventbrite.co.uk/");
export const eventbriteIdFromUrl = (u?: string) => u?.match(/eventbrite\.[a-z.]+\/e\/[^?#]*?-(\d{9,})/)?.[1];
const day = (d: string) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(`${d}T12:00:00Z`).getUTCDay()];
const todayInLondon = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

function sessionFrom(e: EbEvent): Session {
  return {
    _key: `eb-${e.id}`,
    _type: "object",
    date: e.start.local.slice(0, 10),
    startTime: e.start.local.slice(11, 16),
    endTime: e.end.local.slice(11, 16),
    cancelled: e.status === "canceled",
  };
}

/** Merge Eventbrite occurrences into existing sessions; returns the merged list and a change log. */
export function mergeSessions(existing: Session[], incoming: Session[]) {
  const log: string[] = [];
  const result = existing.map((s) => ({ ...s }));
  for (const inc of incoming) {
    const byKey = result.findIndex((s) => s._key === inc._key);
    const i = byKey >= 0 ? byKey : result.findIndex((s) => s.date === inc.date && !s._key.startsWith("eb-"));
    const label = `${day(inc.date)} ${inc.date} ${inc.startTime}–${inc.endTime}`;
    if (i < 0) {
      result.push(inc.cancelled ? inc : { ...inc, cancelled: undefined });
      log.push(`+ ${label}${inc.cancelled ? " (cancelled on Eventbrite)" : ""}`);
      continue;
    }
    const cur = result[i];
    // Times come from Eventbrite; an editor's note and cancellation are kept.
    const next: Session = { ...cur, date: inc.date, startTime: inc.startTime, endTime: inc.endTime };
    if (inc.cancelled && !cur.cancelled) next.cancelled = true;
    const changed = (["date", "startTime", "endTime", "cancelled"] as const).filter((k) => cur[k] !== next[k]);
    if (changed.length) log.push(`~ ${label} (${changed.join(", ")} updated)`);
    result[i] = next;
  }
  const incomingKeys = new Set(incoming.map((s) => s._key));
  const incomingDates = new Set(incoming.map((s) => s.date));
  const kept = result.filter((s) => {
    if (incomingKeys.has(s._key) || incomingDates.has(s.date)) return true;
    if (!s.cancelled && !s.note) {
      log.push(`- removed ${day(s.date)} ${s.date} (not on Eventbrite)`);
      return false;
    }
    log.push(`= kept ${day(s.date)} ${s.date}${s.cancelled ? " [cancelled]" : ""}${s.note ? ` "${s.note}"` : ""} (an editor's entry; not on Eventbrite)`);
    return true;
  });
  for (const s of kept) if (s.cancelled === undefined) delete s.cancelled;
  kept.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  return { sessions: kept, log };
}

/** Weeks missing from a weekly series, e.g. holiday breaks, so editors can add cancelled entries. */
export function weeklyGaps(dates: string[]) {
  const gaps: string[] = [];
  const sorted = [...new Set(dates)].sort();
  for (let i = 1; i < sorted.length; i++) {
    const a = new Date(`${sorted[i - 1]}T12:00:00Z`).getTime();
    const b = new Date(`${sorted[i]}T12:00:00Z`).getTime();
    for (let t = a + 7 * 864e5; t < b - 864e5; t += 7 * 864e5) gaps.push(new Date(t).toISOString().slice(0, 10));
  }
  return gaps;
}

/** JSON with sorted object keys, so values compare equal however Sanity orders their keys. */
const stable = (v: unknown): string =>
  JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));
const plainText = (html = "") => htmlToPortableText(html).map((b) => b.children.map((c) => c.text).join("")).join("\n").trim();

/** Lowest ticket price across the occurrences still running, in pounds; 0 when free. */
function priceOf(evs: EbEvent[]): number | undefined {
  const prices = evs
    .filter((e) => e.status !== "canceled")
    .map((e) => (e.is_free ? 0 : Number(e.ticket_availability?.minimum_ticket_price?.major_value)))
    .filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : undefined;
}

/** What Eventbrite's page content says. Null means Eventbrite has none, so Sanity's copy is removed. */
function fromContent(content: EbContent) {
  const html = (content.modules ?? []).filter((m) => m.type === "text").map((m) => m.data?.body?.text ?? "").join("");
  const blocks = htmlToPortableText(html);
  const faqs: Faq[] = (content.widgets?.find((w) => w.type === "faqs")?.data?.faqs ?? [])
    .map((f) => ({ question: plainText(f.question), answer: plainText(f.answer) }))
    .filter((f) => f.question && f.answer)
    .map((f, i) => ({ _type: "faq", _key: `f${i}`, ...f }));
  return { description: blocks.length ? blocks : null, faqs: faqs.length ? faqs : null };
}

export async function syncEventbrite(opts: SyncOptions): Promise<SyncResult> {
  const { client, eventbriteToken, apply } = opts;
  const log = opts.log ?? ((line: string) => console.log(line));
  const { dataset = "" } = client.config();
  const writable = opts.writableDatasets ?? ["production"];
  if (apply && !writable.includes(dataset)) {
    throw new Error(`Refusing to write: sync only writes to ${writable.map((d) => `"${d}"`).join(", ")} (current: "${dataset}").`);
  }

  async function eb<T>(path: string): Promise<T> {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${eventbriteToken}` } });
    if (!res.ok) throw new Error(`Eventbrite ${path}: ${res.status} ${await res.text()}`);
    return res.json() as Promise<T>;
  }
  async function ebPaged(path: string): Promise<EbEvent[]> {
    const out: EbEvent[] = [];
    let continuation = "";
    for (;;) {
      const sep = path.includes("?") ? "&" : "?";
      const page = await eb<{ events: EbEvent[]; pagination: { has_more_items: boolean; continuation?: string } }>(
        `${path}${sep}page_size=100${continuation ? `&continuation=${continuation}` : ""}`
      );
      out.push(...page.events);
      if (!page.pagination.has_more_items || !page.pagination.continuation) return out;
      continuation = page.pagination.continuation;
    }
  }
  const EXPAND = "expand=venue,ticket_availability";
  const getEvent = (id: string) => eb<EbEvent>(`/events/${id}/?${EXPAND}`);
  /** Every occurrence of the event's series (including past ones, not drafts), or just the event. */
  async function occurrences(ev: EbEvent): Promise<EbEvent[]> {
    if (!ev.is_series_parent && !ev.is_series) return [ev];
    const all = await ebPaged(`/series/${ev.series_id || ev.id}/events/?time_filter=all&${EXPAND}`);
    return all.filter((e) => e.status !== "draft");
  }

  // The fields the sync owns, for published events and their drafts.
  const OWNED = "name, slug, summary, description, faqs, price, link, eventbriteId, venue, poster, sessions";
  const sanity = await client.fetch<{
    events: any[];
    venues: Record<string, any>[];
    slugs: string[];
  }>(`{
    "events": *[_type == "event" && !(_id in path("drafts.**"))] | order(_createdAt asc){ _id, ${OWNED},
      "draft": *[_id == "drafts." + ^._id][0]{ _id, ${OWNED} } },
    "venues": *[_type == "venue" && !(_id in path("drafts.**"))] | order(_createdAt asc){ _id, eventbriteId, name, address, location, googleMapsLink },
    "slugs": *[_type == "event"].slug.current
  }`, {}, { perspective: "raw" });
  const slugs = new Set(sanity.slugs.filter(Boolean));
  const today = todayInLondon();
  const sanityEventFor = (ebId: string) =>
    sanity.events.find((d) => d.eventbriteId === ebId) ?? sanity.events.find((d) => eventbriteIdFromUrl(d.link) === ebId);
  const onSale = (e: EbEvent) => e.listed && (e.status === "live" || e.status === "started");
  const uniqueSlug = (name: string) => {
    let slug = slugify(name);
    for (let n = 2; slugs.has(slug); n++) slug = `${slugify(name)}-${n}`;
    slugs.add(slug);
    return slug;
  };

  // Eventbrite series or one-off event ID → its occurrences.
  const groups = new Map<string, EbEvent[]>();
  if (opts.eventId) {
    const ev = await getEvent(opts.eventId);
    const id = ev.series_id || ev.id;
    const evs = await occurrences(ev);
    if (evs.length && (evs.some(onSale) || sanityEventFor(id))) groups.set(id, evs);
    else log(`Eventbrite ${opts.eventId} ("${tidy(ev.name.text)}", ${ev.status}${ev.listed ? "" : ", unlisted"}): not on sale and not in Sanity, so nothing to sync.`);
  } else {
    const { organizations } = await eb<{ organizations: { id: string }[] }>("/users/me/organizations/");
    const listing = opts.all ? "time_filter=all&status=all" : "time_filter=current_future&status=live,started";
    for (const org of organizations) {
      const upcoming = await ebPaged(`/organizations/${org.id}/events/?${listing}&${EXPAND}`);
      for (const e of upcoming.filter((e) => e.listed && e.status !== "draft")) {
        const id = e.series_id || e.id;
        groups.set(id, [...(groups.get(id) ?? []), e]);
      }
    }
    for (const [id, evs] of groups) if (evs[0].is_series) groups.set(id, await occurrences(evs[0]));

    // Events Sanity tracks with upcoming sessions that have left the live listing (cancelled, unpublished,
    // or moved to another series): look them up so their sessions reflect Eventbrite.
    for (const doc of sanity.events) {
      const id = doc.eventbriteId;
      if (!id || groups.has(id)) continue;
      if (!(doc.sessions ?? []).some((s: Session) => s._key?.startsWith("eb-") && s.date >= today && !s.cancelled)) continue;
      try {
        const evs = await occurrences(await getEvent(id));
        if (evs.length) groups.set(id, evs);
      } catch (err) {
        log(`⚠ ${doc.name}: could not look up Eventbrite ${id} (${(err as Error).message.slice(0, 120)})`);
      }
    }
  }

  const tx = client.transaction();
  let writes = 0;
  const venueIdFor = new Map<string, string>();
  const uploads: { docIds: string[]; url: string; filename: string; imageId: string }[] = [];

  /**
   * The Sanity venue for an Eventbrite venue. One Sanity venue per place, because the site filters on it,
   * though Eventbrite makes a venue record per event (Open Havelock has several):
   * 1. the venue linked to this Eventbrite record (`eventbriteId`): its name, address and pin follow it;
   * 2. else a venue at the same place (postcode or name). It follows the newest Eventbrite record for the
   *    place (venue IDs only go up), so fixing the venue on the latest event fixes it, and older events'
   *    records, synced later, can't overwrite it;
   * 3. else a new `venue-eb-<id>` venue.
   * Names get two clean-ups: "Open Havelock, Southall, UB2 4RP" → "Open Havelock", and a name that's only
   * an address ("1 Tulip Cl") → the "@ Place" from the event name.
   */
  function venueFor(v: EbVenue, eventName: string): string {
    if (venueIdFor.has(v.id)) return venueIdFor.get(v.id)!;

    const pc = tidy(v.address?.postal_code);
    let name = tidy(v.name);
    if (pc && postcode(name).endsWith(postcode(pc)) && name.includes(",")) name = tidy(name.split(",")[0]);
    const fromEvent = tidy(eventName.split("@")[1] ?? "");
    if (/^\d/.test(name) && fromEvent) name = fromEvent;
    const lat = Number(v.latitude);
    const lng = Number(v.longitude);
    const hasPin = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0;
    const region = tidy(v.address?.region);
    const fields: Record<string, unknown> = {
      eventbriteId: v.id,
      name,
      address: JSON.parse(JSON.stringify({
        address1: tidy(v.address?.address_1) || undefined,
        address2: tidy(v.address?.address_2) || undefined,
        city: tidy(v.address?.city) || undefined,
        region: /^(england|scotland|wales|united kingdom|uk)$/i.test(region) ? undefined : region || undefined,
        postalCode: pc || undefined,
      })),
      location: hasPin ? { _type: "geopoint", lat, lng } : null,
      googleMapsLink: hasPin ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null,
    };
    const summary = `"${name}" (${Object.values(fields.address as object).join(", ")})`;

    const doc =
      sanity.venues.find((x) => x.eventbriteId === v.id || x._id === `venue-eb-${v.id}`) ??
      sanity.venues.find((x) => pc && postcode(x.address?.postalCode) === postcode(pc)) ??
      sanity.venues.find((x) => norm(x.name) && norm(x.name) === norm(name));
    if (!doc) {
      const _id = `venue-eb-${v.id}`;
      const created = { _id, _type: "venue", ...Object.fromEntries(Object.entries(fields).filter(([, x]) => x !== null)) };
      tx.createIfNotExists(created);
      writes++;
      sanity.venues.push(created);
      venueIdFor.set(v.id, _id);
      log(`  NEW venue ${summary}`);
      return _id;
    }
    venueIdFor.set(v.id, doc._id);
    if (doc.eventbriteId && Number(doc.eventbriteId) > Number(v.id)) return doc._id; // a newer record leads

    const set = Object.fromEntries(Object.entries(fields).filter(([k, x]) => x !== null && stable(doc[k]) !== stable(x)));
    const unset = Object.keys(fields).filter((k) => fields[k] === null && doc[k] != null);
    if (Object.keys(set).length || unset.length) {
      tx.patch(doc._id, (p) => p.set(set).unset(unset));
      writes++;
      log(`  venue "${doc.name}" → ${summary}: ${[...Object.keys(set), ...unset].join(", ")} from Eventbrite`);
      Object.assign(doc, set);
      for (const k of unset) delete doc[k];
    }
    return doc._id;
  }

  for (const [ebId, evs] of groups) {
    const first = [...evs].sort((a, b) => a.start.local.localeCompare(b.start.local))[0];
    const name = tidy(first.name.text);
    // Link series to the series page (it has the date picker), not the first occurrence.
    const link = first.is_series ? cleanUrl(first.url).replace(/\d{9,}$/, ebId) : cleanUrl(first.url);
    const incoming = evs.map(sessionFrom);
    const existing = sanityEventFor(ebId);
    const live = evs.some((e) => e.status === "live" || e.status === "started");

    log(`\n■ ${name}  [Eventbrite ${ebId}${first.is_series ? `, series of ${evs.length}` : ""}${live ? "" : `, ${first.status}`}]`);
    // Only create events that are on sale, or (backfill) that took place.
    if (!existing && !live && !(opts.all && evs.some((e) => e.status === "ended" || e.status === "completed"))) continue;
    for (const other of sanity.events.filter((d) => d !== existing && (d.eventbriteId === ebId || eventbriteIdFromUrl(d.link) === ebId)))
      log(`  ⚠ "${other.name}" (${other._id}) also links to this Eventbrite event; it's left as it is (delete it if it's a duplicate)`);

    let content: ReturnType<typeof fromContent> | undefined;
    try {
      content = fromContent(await eb<EbContent>(`/events/${ebId}/structured_content/?purpose=listing`));
    } catch (err) {
      log(`  ⚠ couldn't read the event page (${(err as Error).message.slice(0, 120)}); description and FAQs left as they are`);
    }
    const summary = tidy(first.summary) || null;
    const price = priceOf(evs);
    const image = first.logo?.id && first.logo.original?.url ? { id: first.logo.id, url: first.logo.original.url } : undefined;

    if (!existing) {
      const venue = first.venue ? venueFor(first.venue, name) : undefined;
      if (!venue) log("  no venue on Eventbrite");
      const slug = uniqueSlug(name);
      const _id = `event-eb-${ebId}`;
      const { sessions, log: sessionLog } = mergeSessions([], incoming);
      tx.createIfNotExists({
        _id,
        _type: "event",
        name,
        slug: { _type: "slug", current: slug },
        eventbriteId: ebId,
        link,
        ...(summary ? { summary } : {}),
        ...(content?.description ? { description: content.description } : {}),
        ...(content?.faqs ? { faqs: content.faqs } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(venue ? { venue: { _type: "reference", _ref: venue } } : {}),
        sessions,
      });
      writes++;
      log(`  CREATE event ${_id}  slug "${slug}"`);
      log(`  link: ${link}`);
      if (summary) log(`  summary: ${summary}`);
      if (content?.description) log(`  description: ${content.description.length} paragraph(s)`);
      if (content?.faqs) log(`  FAQs: ${content.faqs.length}`);
      if (price !== undefined) log(`  price: ${price ? `£${price}` : "free"}`);
      sessionLog.forEach((l) => log(`  ${l}`));
      if (image) uploads.push({ docIds: [_id], url: image.url, imageId: image.id, filename: `${slug}-poster.jpg` });
    } else {
      // Events made by hand before the sync may have no slug, so no page of their own. Their draft's
      // slug, if they have one, is theirs.
      const newSlug = existing.slug?.current ? undefined : existing.draft?.slug?.current || uniqueSlug(name);
      /** The changes one document (the published event or its draft) needs. */
      const changesFor = (doc: any) => {
        const set: Record<string, unknown> = {};
        const unset: string[] = [];
        const notes: string[] = [];
        const own = (field: string, value: unknown, note: (v: any) => string) => {
          if (value === undefined) return; // unknown: leave as is
          if (value === null) {
            if (doc[field] !== undefined && doc[field] !== null) {
              unset.push(field);
              notes.push(`${field} removed (empty on Eventbrite)`);
            }
          } else if (stable(doc[field]) !== stable(value)) {
            set[field] = value;
            notes.push(note(value));
          }
        };
        own("name", name, (v) => `name → "${v}"`);
        if (newSlug && !doc.slug?.current) own("slug", { _type: "slug", current: newSlug }, (v) => `slug → "${v.current}" (gets a page)`);
        own("summary", summary, () => "summary updated");
        own("description", content?.description, (v) => `description updated (${v.length} paragraph(s))`);
        own("faqs", content?.faqs, (v) => `FAQs updated (${v.length})`);
        own("price", price, (v) => `price → ${v ? `£${v}` : "free"}`);
        if (doc.eventbriteId !== ebId) own("eventbriteId", ebId, (v) => `eventbriteId → ${v}`);
        if (!doc.link || (eventbriteIdFromUrl(doc.link) === ebId && cleanUrl(doc.link) !== link)) own("link", link, (v) => `link → ${v}`);
        if (first.venue) {
          const venue = venueFor(first.venue, name);
          if (doc.venue?._ref !== venue) own("venue", { _type: "reference", _ref: venue }, () => `venue → ${venue}`);
        }
        const merged = mergeSessions(doc.sessions ?? [], incoming);
        if (stable(merged.sessions) !== stable(doc.sessions ?? [])) set.sessions = merged.sessions;
        const poster = !!image && evs.some((e) => e.status !== "canceled") && doc.poster?.eventbriteId !== image.id;
        return { set, unset, notes, sessionLog: merged.log, poster };
      };

      const pub = changesFor(existing);
      log(`  UPDATE ${existing._id} ("${existing.name}")`);
      pub.notes.forEach((c) => log(`  ${c}`));
      pub.sessionLog.filter((l) => !l.startsWith("=")).forEach((l) => log(`  ${l}`));
      if (Object.keys(pub.set).length || pub.unset.length) {
        tx.patch(existing._id, (p) => p.set(pub.set).unset(pub.unset));
        writes++;
      } else if (!pub.poster) log("  no changes");

      const docIds = pub.poster ? [existing._id] : [];
      if (existing.draft) {
        const draft = changesFor(existing.draft);
        if (Object.keys(draft.set).length || draft.unset.length) {
          tx.patch(existing.draft._id, (p) => p.set(draft.set).unset(draft.unset));
          writes++;
          log(`  draft in Studio: same changes made there, so publishing it won't undo them`);
        }
        if (draft.poster) docIds.push(existing.draft._id);
      }
      if (image && docIds.length) uploads.push({ docIds, url: image.url, imageId: image.id, filename: `${slugify(name)}-poster.jpg` });
    }

    if (first.is_series && live) {
      const gaps = weeklyGaps(incoming.filter((s) => s.date >= today).map((s) => s.date));
      if (gaps.length) log(`  gaps in the weekly pattern: ${gaps.map((d) => `${day(d)} ${d}`).join(", ")} (add as cancelled sessions with a note in Studio if the diary should show them)`);
    }
  }

  for (const u of uploads) log(`\n  poster for ${u.docIds.join(" + ")}: ${apply ? "uploading" : "would upload"} Eventbrite image ${u.imageId}`);
  log(`\n${groups.size} Eventbrite event(s); ${writes} document write(s)${uploads.length ? ` + ${uploads.length} poster upload(s)` : ""} ${apply ? "on" : "planned on"} "${dataset}".`);

  const result: SyncResult = { dataset, applied: apply, eventbriteEvents: groups.size, writes, uploads: uploads.length, changed: writes + uploads.length > 0 };
  if (!apply) return result;

  if (writes) await tx.commit();
  for (const u of uploads) {
    const img = await fetch(u.url);
    if (!img.ok) {
      log(`  poster download failed for ${u.docIds.join(" + ")}: ${img.status}`);
      continue;
    }
    const body = new Uint8Array(await img.arrayBuffer());
    // Identical files map to the same Sanity asset, so re-sending an unchanged image costs no storage.
    const asset = await client.assets.upload("image", body as any, { filename: u.filename, contentType: img.headers.get("content-type") ?? "image/jpeg" });
    const poster = { _type: "image", asset: { _type: "reference", _ref: asset._id }, eventbriteId: u.imageId };
    for (const id of u.docIds) await client.patch(id).set({ poster }).commit();
    log(`  poster set on ${u.docIds.join(" + ")}`);
  }
  return result;
}
