/**
 * Eventbrite → Sanity event sync, shared by the CLI script (studio/scripts/sync-eventbrite.ts) and the
 * webhook/cron Worker (workers/eventbrite-sync). Runs in Node and in the Workers runtime.
 *
 * One Sanity event per Eventbrite series or one-off event. Ownership:
 * - Eventbrite owns sessions (date, start, end, cancelled) and the booking link.
 *   Future sessions the sync created that Eventbrite no longer lists are removed.
 * - Set once, then Sanity-owned: name, slug.
 * - Filled only when empty: summary, venue, poster (Eventbrite's event image).
 * - Never touched: audience, description, photo, info, price, and sessions editors added themselves
 *   (e.g. a cancelled "Christmas break" entry).
 * Events Sanity already tracks that have left Eventbrite's live listing are looked up directly, so a
 * cancelled event's sessions are marked cancelled rather than left looking upcoming.
 */
import type { SanityClient } from "@sanity/client";

const API = "https://www.eventbriteapi.com/v3";

export type SyncOptions = {
  /** Sanity client with the target dataset configured. Needs a write token when `apply` is true. */
  client: SanityClient;
  eventbriteToken: string;
  /** Write changes. When false, only logs what would change. */
  apply: boolean;
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
  logo?: { original?: { url?: string } };
};
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
export function mergeSessions(existing: Session[], incoming: Session[], today = todayInLondon()) {
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
    if (s._key.startsWith("eb-") && s.date >= today) {
      log.push(`- removed ${day(s.date)} ${s.date} (no longer on Eventbrite)`);
      return false;
    }
    log.push(`= kept ${day(s.date)} ${s.date}${s.cancelled ? " [cancelled]" : ""}${s.note ? ` "${s.note}"` : ""} (not on Eventbrite)`);
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
  /** Every occurrence of a series (including past ones), or the single event. */
  async function occurrences(id: string): Promise<EbEvent[]> {
    const ev = await eb<EbEvent>(`/events/${id}/?expand=venue`);
    if (ev.is_series_parent || ev.is_series) {
      const all = await ebPaged(`/series/${ev.series_id || id}/events/?time_filter=all&expand=venue`);
      return all.filter((e) => e.status !== "draft");
    }
    return [ev];
  }

  const { organizations } = await eb<{ organizations: { id: string }[] }>("/users/me/organizations/");
  const upcoming: EbEvent[] = [];
  for (const org of organizations) {
    upcoming.push(...(await ebPaged(`/organizations/${org.id}/events/?time_filter=current_future&status=live,started&expand=venue`)));
  }
  const groups = new Map<string, EbEvent[]>();
  for (const e of upcoming.filter((e) => e.listed)) {
    const id = e.series_id || e.id;
    groups.set(id, [...(groups.get(id) ?? []), e]);
  }
  for (const [id, evs] of groups) if (evs[0].is_series) groups.set(id, await occurrences(id));

  const sanity = await client.fetch<{
    events: any[];
    venues: { _id: string; name: string; address?: { postalCode?: string } }[];
    slugs: string[];
  }>(`{
    "events": *[_type == "event" && !(_id in path("drafts.**"))]{ _id, name, "slug": slug.current, eventbriteId, link, summary, venue, poster, sessions,
      "hasDraft": defined(*[_id == "drafts." + ^._id][0]._id) },
    "venues": *[_type == "venue" && !(_id in path("drafts.**"))]{ _id, name, address },
    "slugs": *[_type == "event"].slug.current
  }`, {}, { perspective: "raw" });
  const slugs = new Set(sanity.slugs.filter(Boolean));
  const today = todayInLondon();

  // Events Sanity tracks with upcoming sessions that have left the live listing (cancelled, unpublished,
  // or moved to another series): look them up so their sessions reflect Eventbrite.
  for (const doc of sanity.events) {
    const id = doc.eventbriteId;
    if (!id || groups.has(id)) continue;
    if (!(doc.sessions ?? []).some((s: Session) => s._key?.startsWith("eb-") && s.date >= today && !s.cancelled)) continue;
    try {
      const evs = await occurrences(id);
      if (evs.length) groups.set(id, evs);
    } catch (err) {
      log(`⚠ ${doc.name}: could not look up Eventbrite ${id} (${(err as Error).message.slice(0, 120)})`);
    }
  }

  const tx = client.transaction();
  let writes = 0;
  const venueIdFor = new Map<string, string>();
  const uploads: { docId: string; url: string; filename: string }[] = [];

  function resolveVenue(v: EbVenue | undefined, eventName: string): { id?: string; note: string } {
    if (!v) return { note: "no venue on Eventbrite" };
    if (venueIdFor.has(v.id)) return { id: venueIdFor.get(v.id)!, note: "" };
    const pc = postcode(v.address?.postal_code);
    const ebName = norm(v.name);
    const match =
      sanity.venues.find((x) => x._id === `venue-eb-${v.id}`) ??
      sanity.venues.find((x) => pc && postcode(x.address?.postalCode) === pc) ??
      sanity.venues.find((x) => norm(x.name) && (ebName === norm(x.name) || ebName.startsWith(`${norm(x.name)} `)));
    if (match) {
      venueIdFor.set(v.id, match._id);
      const pcNote =
        pc && match.address?.postalCode && postcode(match.address.postalCode) !== pc
          ? ` (postcode differs: Sanity ${match.address.postalCode}, Eventbrite ${v.address?.postal_code})`
          : "";
      return { id: match._id, note: `existing venue "${match.name}"${pcNote}` };
    }
    // Eventbrite venue names are sometimes just an address ("1 Tulip Cl"); prefer the "@ Place" in the event name.
    const fromEvent = tidy(eventName.split("@")[1] ?? "");
    const name = /^\d/.test(tidy(v.name)) && fromEvent ? fromEvent : tidy(v.name);
    const _id = `venue-eb-${v.id}`;
    const lat = Number(v.latitude);
    const lng = Number(v.longitude);
    const region = tidy(v.address?.region);
    const address = {
      address1: tidy(v.address?.address_1) || undefined,
      address2: tidy(v.address?.address_2) || undefined,
      city: tidy(v.address?.city) || undefined,
      region: /^(england|scotland|wales|united kingdom|uk)$/i.test(region) ? undefined : region || undefined,
      postalCode: tidy(v.address?.postal_code) || undefined,
    };
    tx.createIfNotExists({
      _id,
      _type: "venue",
      name,
      address,
      ...(Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0
        ? { location: { _type: "geopoint", lat, lng }, googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` }
        : {}),
    });
    writes++;
    venueIdFor.set(v.id, _id);
    sanity.venues.push({ _id, name, address });
    return { id: _id, note: `NEW venue "${name}" — ${Object.values(address).filter(Boolean).join(", ")}` };
  }

  for (const [ebId, evs] of groups) {
    const first = [...evs].sort((a, b) => a.start.local.localeCompare(b.start.local))[0];
    const name = tidy(first.name.text);
    // Link series to the series page (it has the date picker), not the first occurrence.
    const link = first.is_series ? cleanUrl(first.url).replace(/\d{9,}$/, ebId) : cleanUrl(first.url);
    const incoming = evs.map(sessionFrom);
    const existing =
      sanity.events.find((d) => d.eventbriteId === ebId) ?? sanity.events.find((d) => eventbriteIdFromUrl(d.link) === ebId);
    const live = evs.some((e) => e.status === "live" || e.status === "started");

    log(`\n■ ${name}  [Eventbrite ${ebId}${first.is_series ? `, series of ${evs.length}` : ""}${live ? "" : `, ${first.status}`}]`);

    if (!existing) {
      if (!live) continue; // don't create events that aren't on sale
      const venue = resolveVenue(first.venue, name);
      if (venue.note) log(`  venue: ${venue.note}`);
      let slug = slugify(name);
      for (let n = 2; slugs.has(slug); n++) slug = `${slugify(name)}-${n}`;
      slugs.add(slug);
      const _id = `event-eb-${ebId}`;
      const { sessions, log: sessionLog } = mergeSessions([], incoming, today);
      tx.createIfNotExists({
        _id,
        _type: "event",
        name,
        slug: { _type: "slug", current: slug },
        eventbriteId: ebId,
        link,
        ...(first.summary ? { summary: tidy(first.summary) } : {}),
        ...(venue.id ? { venue: { _type: "reference", _ref: venue.id } } : {}),
        sessions,
      });
      writes++;
      log(`  CREATE event ${_id}  slug "${slug}"`);
      log(`  link: ${link}`);
      if (first.summary) log(`  summary: ${tidy(first.summary)}`);
      sessionLog.forEach((l) => log(`  ${l}`));
      if (first.logo?.original?.url) uploads.push({ docId: _id, url: first.logo.original.url, filename: `${slug}-poster.jpg` });
    } else {
      const set: Record<string, unknown> = {};
      const changes: string[] = [];
      if (existing.eventbriteId !== ebId) {
        set.eventbriteId = ebId;
        changes.push(`eventbriteId → ${ebId}`);
      }
      if (!existing.link || (eventbriteIdFromUrl(existing.link) === ebId && cleanUrl(existing.link) !== link)) {
        set.link = link;
        changes.push(`link → ${link}`);
      }
      if (!existing.summary && first.summary) {
        set.summary = tidy(first.summary);
        changes.push("summary filled");
      }
      if (!existing.venue) {
        const venue = resolveVenue(first.venue, name);
        if (venue.id) {
          set.venue = { _type: "reference", _ref: venue.id };
          changes.push(`venue filled: ${venue.note}`);
        }
      }
      const { sessions, log: sessionLog } = mergeSessions(existing.sessions ?? [], incoming, today);
      if (JSON.stringify(sessions) !== JSON.stringify(existing.sessions ?? [])) set.sessions = sessions;
      log(`  UPDATE ${existing._id} ("${existing.name}")`);
      changes.forEach((c) => log(`  ${c}`));
      sessionLog.filter((l) => !l.startsWith("=")).forEach((l) => log(`  ${l}`));
      if (Object.keys(set).length) {
        tx.patch(existing._id, (p) => p.set(set));
        writes++;
      } else log("  no changes");
      if (existing.hasDraft) log("  ⚠ has an unpublished draft in Studio; it won't show these changes until it's published or discarded");
      if (!existing.poster?.asset && first.logo?.original?.url && live)
        uploads.push({ docId: existing._id, url: first.logo.original.url, filename: `${slugify(name)}-poster.jpg` });
    }

    if (first.is_series && live) {
      const gaps = weeklyGaps(incoming.filter((s) => s.date >= today).map((s) => s.date));
      if (gaps.length) log(`  gaps in the weekly pattern: ${gaps.map((d) => `${day(d)} ${d}`).join(", ")} (add as cancelled sessions with a note in Studio if the diary should show them)`);
    }
  }

  for (const u of uploads) log(`\n  poster for ${u.docId}: ${apply ? "uploading" : "would upload"} ${u.url.split("?")[0]}`);
  log(`\n${groups.size} Eventbrite event(s); ${writes} document write(s)${uploads.length ? ` + ${uploads.length} poster upload(s)` : ""} ${apply ? "on" : "planned on"} "${dataset}".`);

  const result: SyncResult = { dataset, applied: apply, eventbriteEvents: groups.size, writes, uploads: uploads.length, changed: writes + uploads.length > 0 };
  if (!apply) return result;

  if (writes) await tx.commit();
  for (const u of uploads) {
    const img = await fetch(u.url);
    if (!img.ok) {
      log(`  poster download failed for ${u.docId}: ${img.status}`);
      continue;
    }
    const body = new Uint8Array(await img.arrayBuffer());
    const asset = await client.assets.upload("image", body as any, { filename: u.filename, contentType: img.headers.get("content-type") ?? "image/jpeg" });
    await client.patch(u.docId).setIfMissing({ poster: { _type: "image", asset: { _type: "reference", _ref: asset._id } } }).commit();
    log(`  poster set on ${u.docId}`);
  }
  return result;
}
