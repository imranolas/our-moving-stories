import type { PortableTextBlock } from "@portabletext/types";
import { stegaClean } from "@sanity/client/stega";
import { clip, trimVisible } from "./text";

export type Session = {
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;
  note?: string;
  cancelled?: boolean;
};

export type Venue = {
  name?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
  };
  googleMapsLink?: string;
};

export type Event = {
  _id?: string;
  name: string;
  slug?: { current: string };
  link?: string;
  price?: number;
  audience?: string;
  summary?: string;
  poster?: any;
  photo?: any;
  venue?: Venue;
  info?: { label?: string; value?: string }[];
  description?: PortableTextBlock[];
  sessions?: Session[];
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const parseDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Today in London, as YYYY-MM-DD (the server runs in UTC). */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const fmt = (s: string, o: Intl.DateTimeFormatOptions) =>
  parseDate(s).toLocaleDateString("en-GB", o);

export const fmtShort = (s: string) => fmt(s, { weekday: "short", day: "numeric", month: "short" });
export const fmtLong = (s: string) => fmt(s, { weekday: "long", day: "numeric", month: "long" });
export const fmtFull = (s: string) => fmt(s, { day: "numeric", month: "long", year: "numeric" });
export const fmtDayMonth = (s: string) => fmt(s, { day: "numeric", month: "short" });
export const fmtMonth = (s: string) => fmt(s, { month: "long", year: "numeric" });
export const fmtChip = (s: string) => fmt(s, { weekday: "short", day: "numeric" });

const t12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return { s: ((h + 11) % 12) + 1 + (m ? ":" + String(m).padStart(2, "0") : ""), p: h < 12 ? "AM" : "PM" };
};

/** "9:30–11:30 AM" or "11 AM–1 PM". */
export function timeRange(start?: string, end?: string): string {
  if (!start) return "Time TBC";
  const a = t12(start);
  if (!end) return `${a.s} ${a.p}`;
  const b = t12(end);
  return a.p === b.p ? `${a.s}–${b.s} ${b.p}` : `${a.s} ${a.p}–${b.s} ${b.p}`;
}

// GROQ returns null (not undefined) for a projected field that isn't set, so a default parameter isn't enough.
const sorted = (list?: Session[] | null) => [...(list ?? [])].sort((a, b) => a.date.localeCompare(b.date));

/** Future sessions, including cancelled ones (shown crossed out). */
export const futureSessions = (e: Event, today = todayISO()) =>
  sorted(e.sessions).filter((s) => s.date >= today);

export const upcomingSessions = (e: Event, today = todayISO()) =>
  futureSessions(e, today).filter((s) => !s.cancelled);

export const pastSessions = (e: Event, today = todayISO()) =>
  sorted(e.sessions)
    .filter((s) => s.date < today && !s.cancelled)
    .reverse();

export const nextSession = (e: Event, today = todayISO()) => upcomingSessions(e, today)[0];
export const lastSession = (e: Event, today = todayISO()) => pastSessions(e, today)[0];

/** "Every Wed" when sessions run weekly on one day, otherwise a count. */
export function repeatLabel(e: Event): { short: string; long: string } {
  const held = sorted(e.sessions);
  if (held.length <= 1) return { short: "One-off", long: "One day only" };
  const days = new Set(held.map((s) => parseDate(s.date).getDay()));
  const weekly =
    days.size === 1 &&
    held.every((s, i) => {
      if (i === 0) return true;
      const gap = (parseDate(s.date).getTime() - parseDate(held[i - 1].date).getTime()) / 86400000;
      return Math.round(gap) % 7 === 0 && Math.round(gap) <= 28;
    });
  if (weekly && held.length >= 3) {
    const d = DAYS[parseDate(held[0].date).getDay()];
    return { short: `Every ${d.slice(0, 3)}`, long: `Every ${d}` };
  }
  return { short: `${held.length} dates`, long: `${held.length} dates` };
}

export function rangeLabel(e: Event): string {
  const held = sorted(e.sessions);
  if (!held.length) return "";
  const first = held[0].date;
  const last = held[held.length - 1].date;
  if (first === last) return fmt(first, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${fmt(first, { day: "numeric", month: "short", year: "numeric" })} – ${fmt(last, { day: "numeric", month: "short", year: "numeric" })}`;
}

export type MonthGroup = {
  label: string;
  dates: { label: string; state: "next" | "on" | "off"; note?: string }[];
  note: string;
};

/** Upcoming dates grouped by month, with cancellations noted. */
export function monthGroups(list: Session[], next?: Session): MonthGroup[] {
  const groups: MonthGroup[] = [];
  const notes: string[][] = [];
  for (const s of list) {
    const label = fmtMonth(s.date);
    if (!groups.length || groups[groups.length - 1].label !== label) {
      groups.push({ label, dates: [], note: "" });
      notes.push([]);
    }
    const g = groups[groups.length - 1];
    const state = s.cancelled ? "off" : next && s.date === next.date ? "next" : "on";
    g.dates.push({ label: fmtChip(s.date), state, note: s.note });
    if (s.cancelled) {
      notes[notes.length - 1].push(
        `${fmtDayMonth(s.date)}: no session${s.note ? ` (${s.note.toLowerCase()})` : ""}`
      );
    }
  }
  groups.forEach((g, i) => (g.note = notes[i].join(" · ")));
  return groups;
}

export function formatAddress(v?: Venue): string {
  if (!v) return "";
  const a = v.address || {};
  return [a.address1, a.address2, a.city, a.postalCode]
    .map((x) => trimVisible(String(x ?? "")))
    .filter(Boolean)
    .join(", ");
}

/**
 * Meta description for an event page: the editor's summary, or one built from the event's own data,
 * e.g. "Story Space: free, every Thursday, 3:30–5 PM at Open Havelock, Southall. Ages 2–6. Book on Eventbrite."
 */
export function metaDescription(event: Event): string {
  // Meta tags never carry stega (draft mode), and the string work below would corrupt it anyway.
  const e = stegaClean(event);
  if (e.summary?.trim()) return clip(e.summary);
  const repeat = repeatLabel(e);
  const range = rangeLabel(e);
  const when = repeat.long.startsWith("Every ")
    ? repeat.long.replace("Every", "every")
    : repeat.short === "One-off"
      ? range && `on ${range}`
      : [repeat.long, range].filter(Boolean).join(", ");
  const first = sorted(e.sessions).find((s) => s.startTime);
  const time = first ? timeRange(first.startTime, first.endTime) : "";
  const lead = [e.price ? priceLabel(e.price) : "free", when, time].filter(Boolean).join(", ");
  const a = e.venue?.address;
  const where = [e.venue?.name, (a?.address2 || a?.city || "").trim()].filter(Boolean).join(", ");
  const audience = e.audience?.trim().replace(/\.$/, "");
  return clip(
    [
      `${e.name}: ${lead}${where ? ` at ${where}` : ""}.`,
      audience && `${audience}.`,
      /eventbrite/.test(e.link ?? "") && "Book on Eventbrite.",
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function mapLink(v?: Venue): string | undefined {
  if (!v) return undefined;
  if (v.googleMapsLink) return v.googleMapsLink;
  const q = [v.name, formatAddress(v)].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : undefined;
}

export const priceLabel = (price?: number) => (price ? `£${price}` : "Free");

export const eventHref = (e: Event) => (e.slug?.current ? `/events/${e.slug.current}` : e.link || "#");

/** Upcoming events (soonest first) and past events (most recent first). */
export function splitEvents(events: Event[], today = todayISO()) {
  const upcoming = events
    .filter((e) => nextSession(e, today))
    .sort((a, b) => nextSession(a, today)!.date.localeCompare(nextSession(b, today)!.date));
  const past = events
    .filter((e) => !nextSession(e, today) && lastSession(e, today))
    .sort((a, b) => lastSession(b, today)!.date.localeCompare(lastSession(a, today)!.date));
  return { upcoming, past };
}

/** GROQ projection shared by every event query. */
export const EVENT_FIELDS = `
  _id, name, slug, link, price, audience, summary, info, description, sessions,
  poster, photo,
  venue->{ name, address, googleMapsLink }
`;
