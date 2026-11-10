# Structured data / schema audit, 9 Nov 2026

**Scores: LIVE 0/100 · LOCAL 0/100** (nothing to validate on either; LOCAL's data model is ready, so it is a ~1 day build).

## Detection (verified)
| Target | Pages checked | JSON-LD / Microdata / RDFa |
|---|---|---|
| LIVE | `/`, `/testimonials` (and `/safeguarding-policy` per recon) | none (`grep ld+json` = 0) |
| LOCAL | `/`, `/events`, 3 event pages, `/people/sarah-sulemanji` | none (0 on all) |

`web/src/layouts/Layout.astro` has no JSON-LD and no head slot. `web/public` has only `favicon.svg`: **there is no logo file**, which Organization needs (see S-3).

## Findings
| ID | Sev | Target | Finding | Fix |
|---|---|---|---|---|
| S-1 | High | BOTH | No Event markup. Sessions are the site's core content (free, dated, Eventbrite-booked) and the only Google rich result that fits. | Event per session (below), on `web/src/pages/events/[slug].astro` only. |
| S-2 | High | BOTH | No Organization / WebSite; entity is unclear to Google (LIVE title is "Home"). | Site-wide `@graph` from Layout (below). |
| S-3 | Medium | LOCAL | No square logo asset. | Add 512x512+ PNG (e.g. `web/public/logo.png`) and pass its absolute URL to `organizationNode`. |
| S-4 | Medium | LOCAL | Venue data gaps hurt `location.address`: Open Havelock has **no street line** (rendered "Open Havelock, London, UB2 4RH"); Westcott has `city: "London "` with a stray trailing space ("London , W3 6YP"). `geo` exists in Sanity (`venue.location` geopoint) but is not projected. | Fill Open Havelock `address1` in Sanity (production; user performs writes); trim in builder (done below); add `location` to `venue->{...}` in `EVENT_FIELDS` (`web/src/lib/schedule.ts`) if you want `geo`. |
| S-5 | Medium | LOCAL | Cancelled sessions must stay in markup as `EventCancelled`. `futureSessions()` already includes them, so use it, not `upcomingSessions()`. | As builder. |
| S-6 | Low | LOCAL | Sessions with no `startTime` render "Time TBC"; Google wants a start time. | Builder skips them. |
| S-7 | Info | LOCAL | No page has a real `/people` index, so breadcrumb for people is Home > Name only (the "← The team" link is `/#people`, a fragment). | Keep 2-level crumb. |
| S-8 | Info | BOTH | No FAQPage / HowTo present; none recommended (FAQ rich results retired 7 May 2026; HowTo deprecated). Use QAPage only for real user Q&A (none exists). | none |

## Design decisions
- **Organization type**: `NGO` (subtype of Organization). Not `LocalBusiness`: no storefront or opening hours, and Google's LocalBusiness features would mislead. Footer shows "Our Moving Stories CIC 14473202", so include `legalName` and `identifier`. `areaServed` Ealing + Southall; `contactPoint` hello@; `sameAs` Instagram (only profile found; add Facebook/LinkedIn if they exist). `founder` links to Sarah's Person node.
- **WebSite**: name/url/publisher only. No `SearchAction` (no site search; Google dropped the sitelinks searchbox).
- **Event**: one `Event` per future session (Google wants each occurrence as its own Event). Fields available: `date`, `startTime`, `endTime`, `cancelled`, `note`; `price`, `link`, `audience`, `summary`, `venue`, `photo|poster`.
  - Timezone: sessions are Europe/London local; builder computes `+00:00`/`+01:00` per date (tested: 11 Nov 2026 -> +00:00, 31 Mar 2027 -> +01:00).
  - Free: `offers.price: 0`, `priceCurrency: GBP`, `url` = Eventbrite link (all 3 sampled pages link Eventbrite), plus `isAccessibleForFree`.
  - Cancelled: `eventStatus: EventCancelled`, offer `Discontinued`. Do not add `previousStartDate` (no reschedule data).
  - `eventAttendanceMode: OfflineEventAttendanceMode` for all.
  - `audience` is free text in Sanity ("Under-5s + grown-ups"), so `PeopleAudience.audienceType`; do not invent `suggestedMinAge`.
  - Images: pass 3 crops (16:9, 4:3, 1:1) from `urlFor`; Google prefers multiple ratios.
- **EventSeries / superEvent**: yes, but lightly. Emit one `EventSeries` node (`#series`) only when an event has >1 session, each Event points to it with `superEvent: {"@id"}`. It is not a Google rich-result type, so it is harmless semantic context; the per-session Events carry the rich-result value. Past-only events (no future sessions): emit no Event nodes, only breadcrumb. Do **not** put Event markup on `/events` or `/sessions` listings (duplicates, not eligible).
- **Person**: on `/people/[slug]`, `ProfilePage` wrapper with `mainEntity` Person (`jobTitle`=role, `description`=excerpt, `image`, `sameAs` from `social` using the same URL map as the page, `worksFor` org). **Never output `person.email`**.
- **BreadcrumbList**: events: Home > Events > Name; people: Home > Name; `/events`: Home > Events. Matches visible "← All events".

## Implementation

### `web/src/lib/schema.ts` (new)
```ts
import type { Event, Session, Venue } from "./schedule";

export const SITE = "https://ourmovingstories.com";
export const ORG_ID = `${SITE}/#organization`;
export const SITE_ID = `${SITE}/#website`;
type Json = Record<string, unknown>;

/** Safe for an inline <script>: a "<" can never close the tag. */
export const ldJson = (data: Json | Json[]) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Europe/London offset for a local date+time: "+00:00" (GMT) or "+01:00" (BST). */
function londonOffset(date: string, time: string): string {
  const probe = new Date(`${date}T${time}:00Z`);
  const tz = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "longOffset" })
    .formatToParts(probe).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  return tz === "GMT" ? "+00:00" : tz.replace("GMT", "");
}
const pad = (t: string) => (t.length === 4 ? `0${t}` : t);
export const isoLocal = (date: string, time: string) => `${date}T${pad(time)}:00${londonOffset(date, pad(time))}`;

export function organizationNode(opts: { email?: string; instagram?: string; logo?: string } = {}): Json {
  const ig = opts.instagram || "our.movingstories";
  const email = opts.email || "hello@ourmovingstories.com";
  return {
    "@type": "NGO",
    "@id": ORG_ID,
    name: "Our Moving Stories",
    legalName: "Our Moving Stories CIC",
    url: `${SITE}/`,
    identifier: { "@type": "PropertyValue", propertyID: "Companies House number", value: "14473202" },
    description: "Free community dance, art and movement sessions for families in West London.",
    ...(opts.logo && { logo: { "@type": "ImageObject", url: opts.logo, width: 512, height: 512 }, image: opts.logo }),
    email,
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email, areaServed: "GB", availableLanguage: "en-GB" },
    sameAs: [`https://www.instagram.com/${ig}/`],
    areaServed: [
      { "@type": "AdministrativeArea", name: "London Borough of Ealing" },
      { "@type": "City", name: "Southall" },
    ],
    founder: { "@id": `${SITE}/people/sarah-sulemanji#person` },
  };
}

export const websiteNode = (): Json => ({
  "@type": "WebSite", "@id": SITE_ID, url: `${SITE}/`, name: "Our Moving Stories",
  inLanguage: "en-GB", publisher: { "@id": ORG_ID },
});

export function breadcrumb(trail: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: new URL(t.path, SITE).href })),
  };
}

function place(v?: Venue): Json | undefined {
  if (!v?.name) return undefined;
  const a = v.address ?? {};
  const street = [a.address1, a.address2].map((x) => x?.trim()).filter(Boolean).join(", ");
  return {
    "@type": "Place",
    name: v.name,
    address: {
      "@type": "PostalAddress",
      ...(street && { streetAddress: street }),
      addressLocality: a.city?.trim() || "London",
      ...(a.region?.trim() && { addressRegion: a.region.trim() }),
      ...(a.postalCode?.trim() && { postalCode: a.postalCode.trim() }),
      addressCountry: "GB",
    },
    ...(v.googleMapsLink && { hasMap: v.googleMapsLink }),
  };
}

/** One Event per future session. Pass futureSessions(e) so cancelled sessions are kept. */
export function eventNodes(e: Event, pageUrl: string, sessions: Session[], images: string[]): Json[] {
  const seriesId = `${pageUrl}#series`;
  const loc = place(e.venue);
  const multi = (e.sessions?.length ?? 0) > 1;
  const out: Json[] = [];
  if (multi) out.push({ "@type": "EventSeries", "@id": seriesId, name: e.name, url: pageUrl, organizer: { "@id": ORG_ID } });
  for (const s of sessions) {
    if (!s.startTime) continue; // "Time TBC": not eligible
    out.push({
      "@type": "Event",
      "@id": `${pageUrl}#${s.date}`,
      name: e.name,
      description: [e.summary, s.cancelled ? undefined : s.note].filter(Boolean).join(" "),
      url: pageUrl,
      startDate: isoLocal(s.date, s.startTime),
      ...(s.endTime && { endDate: isoLocal(s.date, s.endTime) }),
      eventStatus: `https://schema.org/${s.cancelled ? "EventCancelled" : "EventScheduled"}`,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(loc && { location: loc }),
      ...(images.length && { image: images }),
      ...(e.audience && { audience: { "@type": "PeopleAudience", audienceType: e.audience } }),
      organizer: { "@id": ORG_ID },
      isAccessibleForFree: !e.price,
      ...(e.link && {
        offers: { "@type": "Offer", url: e.link, price: e.price ?? 0, priceCurrency: "GBP",
          availability: `https://schema.org/${s.cancelled ? "Discontinued" : "InStock"}` },
      }),
      ...(multi && { superEvent: { "@id": seriesId } }),
    });
  }
  return out;
}

export function personNodes(p: { name: string; role?: string; excerpt?: string; image?: string; sameAs: string[] }, pageUrl: string): Json[] {
  return [
    { "@type": "ProfilePage", "@id": `${pageUrl}#profile`, url: pageUrl, name: p.name, mainEntity: { "@id": `${pageUrl}#person` }, isPartOf: { "@id": SITE_ID } },
    {
      "@type": "Person", "@id": `${pageUrl}#person`, name: p.name, url: pageUrl,
      ...(p.role && { jobTitle: p.role }), ...(p.excerpt && { description: p.excerpt }),
      ...(p.image && { image: p.image }), ...(p.sameAs.length && { sameAs: p.sameAs }),
      worksFor: { "@id": ORG_ID },
    },
  ];
}
```

### `web/src/layouts/Layout.astro`
Add prop `schema?: Record<string, unknown>[]`; emit one graph. Org + WebSite on every page (same `@id`s, so they merge); page nodes appended.
```astro
---
import { ldJson, organizationNode, websiteNode } from "../lib/schema";
// ...Props: add  schema?: Record<string, unknown>[];
const { title, description = "...", ogImage, schema = [] } = Astro.props;
const graph = { "@context": "https://schema.org", "@graph": [organizationNode({ logo: "https://ourmovingstories.com/logo.png" }), websiteNode(), ...schema] };
---
<head>
  ...
  <script type="application/ld+json" set:html={ldJson(graph)} />
</head>
```
(Optional: only emit Org/WebSite when `Astro.url.pathname === "/"` and reference by `@id` elsewhere; Google resolves `@id` only within the same document, so site-wide is safer.)

### `web/src/pages/events/[slug].astro`
```astro
import { eventNodes, breadcrumb } from "../../lib/schema";
const pageUrl = new URL(Astro.url.pathname, "https://ourmovingstories.com").href;
const ratios: [number, number][] = [[1600, 900], [1200, 900], [1200, 1200]];
const ldImages = image?.asset ? ratios.map(([w, h]) => urlFor(image).width(w).height(h).fit("crop").auto("format").url()) : [];
const schema = [
  breadcrumb([{ name: "Home", path: "/" }, { name: "Events", path: "/events" }, { name: event.name, path: Astro.url.pathname }]),
  ...eventNodes(event, pageUrl, future /* futureSessions(event) */, ldImages),
];
// <Layout ... schema={schema}>
```
`/people/[slug].astro`: `schema={[breadcrumb([{name:"Home",path:"/"},{name:person.name,path:Astro.url.pathname}]), ...personNodes({ name: person.name, role: person.role, excerpt: person.excerpt, image: person.profile && urlFor(person.profile).width(840).height(1050).fit("crop").url(), sameAs: (person.social ?? []).map(s => socialUrls[s.platform]?.(s.handle)).filter(Boolean) }, pageUrl)]}`.
`/events`: `schema={[breadcrumb([{name:"Home",path:"/"},{name:"Events",path:"/events"}])]}`.

## Validation against LOCAL data
Real values scraped from localhost:4321 (Sanity `production`): Move and Make Open Havelock 2026/27 (Wed 9:30-11:30, Eventbrite link, UB2 4RH, maps.app.goo.gl link, 11 future dates 11 Nov 2026-10 Feb 2027), Winter Together Westcott Park (Fri 11 Dec 2026 15:30-17:30, "Ferguson Drive, Acton, London , W3 6YP"), Story Space (Thu 3:30-5pm). I ran the builder (Node, type-stripped) on the first two plus synthetic cancelled/BST sessions. Results:
- PASS: all required Google Event props present (name, startDate with offset, location.address). `2026-11-11` -> `+00:00`; `2027-03-31` -> `+01:00`; cancelled -> `EventCancelled` + `Discontinued`; free offer `price: 0` with Eventbrite URL; `superEvent` resolves to `#series`; single-session event (Westcott) correctly omits EventSeries/superEvent.
- WARN (data): Open Havelock output has no `streetAddress` (Google "recommended" warning until `address1` is filled). Westcott trailing-space city is trimmed by the builder.
- Not verifiable: real cancelled sessions (none visible in sampled pages; `line-through` hits were class strings).
- Not run: Google Rich Results Test / validator.schema.org (needs the pages public). After cutover, test one event URL in the Rich Results Test and monitor Search Console > Enhancements > Events.

## Cutover notes
- LIVE has no schema, so nothing to preserve or redirect.
- Add `/events/*` and `/people/*` to `web/src/pages/sitemap.xml.ts` (currently 3 pages only) so Google discovers the Event pages (cross-ref SEO/sitemap finding).
- Markup must match visible content (dates, free price, cancellations are all visible on the page); keep it that way when editing the page template.
