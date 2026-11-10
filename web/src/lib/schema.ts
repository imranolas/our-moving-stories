import { stegaClean } from "@sanity/client/stega";
import type { Event, Session, Venue } from "./schedule";

/**
 * schema.org JSON-LD. Layout.astro puts the organisation and website on every page in one @graph; pages add
 * their own nodes through its `schema` prop. Markup has to match what the page shows, so keep the page
 * templates and these builders in step (dates, the free price, cancellations).
 * Background and the choices made: docs/seo/ourmovingstories.com-audit/findings/schema.md.
 */

export const SITE = "https://ourmovingstories.com";
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;
/** 512×512, purple logo on white (Google shows organisation logos on a white background). */
export const LOGO = `${SITE}/img/logo-512.png`;

export type Json = Record<string, unknown>;

/** Safe inside an inline <script>: a "<" can never close the tag. */
export const ldJson = (data: Json) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Europe/London offset for a local date and time: "+00:00" (GMT) or "+01:00" (BST). */
function londonOffset(date: string, time: string): string {
  const probe = new Date(`${date}T${time}:00Z`);
  const name =
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "longOffset" })
      .formatToParts(probe)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  return name === "GMT" ? "+00:00" : name.replace("GMT", "");
}
const hhmm = (t: string) => (t.length === 4 ? `0${t}` : t);
/** "2026-11-11" + "9:30" → "2026-11-11T09:30:00+00:00". */
export const isoLocal = (date: string, time: string) => `${date}T${hhmm(time)}:00${londonOffset(date, hhmm(time))}`;

export function organizationNode(settings: Record<string, any> = {}): Json {
  const s = stegaClean(settings);
  const email = s.email || "hello@ourmovingstories.com";
  const instagram = s.instagram || "our.movingstories";
  return {
    "@type": "NGO",
    "@id": ORG_ID,
    name: s.title || "Our Moving Stories",
    legalName: s.companyName || "Our Moving Stories CIC",
    url: `${SITE}/`,
    ...(s.companyNumber && {
      identifier: { "@type": "PropertyValue", propertyID: "Companies House company number", value: s.companyNumber },
    }),
    description:
      "Community interest company running free dance, movement and art sessions for babies, toddlers and their grown-ups, and family events, in Southall and Acton, West London.",
    logo: { "@type": "ImageObject", url: LOGO, width: 512, height: 512 },
    image: LOGO,
    email,
    contactPoint: { "@type": "ContactPoint", contactType: "general enquiries", email, availableLanguage: "en-GB" },
    sameAs: [`https://www.instagram.com/${instagram}/`],
    areaServed: [
      { "@type": "AdministrativeArea", name: "London Borough of Ealing" },
      { "@type": "Place", name: "Southall" },
      { "@type": "Place", name: "Acton" },
    ],
    // Sarah's role in Sanity is "Founder"; her profile page carries the matching Person node.
    founder: { "@id": `${SITE}/people/sarah-sulemanji#person` },
  };
}

export const websiteNode = (): Json => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE}/`,
  name: "Our Moving Stories",
  inLanguage: "en-GB",
  publisher: { "@id": ORG_ID },
});

export function breadcrumb(trail: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: stegaClean(t.name),
      item: new URL(t.path, SITE).href,
    })),
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

/**
 * One Event per future session (Google wants each occurrence as its own Event), tied together by an
 * EventSeries when there's more than one. Pass futureSessions(event) so cancelled dates stay in, marked
 * EventCancelled. Sessions without a start time ("Time TBC") are left out: Google needs a start time.
 */
export function eventNodes(event: Event, pageUrl: string, sessions: Session[], images: string[], description: string): Json[] {
  const e = stegaClean(event);
  const seriesId = `${pageUrl}#series`;
  const location = place(e.venue);
  const multi = (e.sessions?.length ?? 0) > 1;
  const bookable = !!e.link && !/instagram\.com/.test(e.link);
  const nodes: Json[] = [];
  if (multi) {
    nodes.push({ "@type": "EventSeries", "@id": seriesId, name: e.name, url: pageUrl, organizer: { "@id": ORG_ID } });
  }
  for (const s of stegaClean(sessions)) {
    if (!s.startTime) continue;
    nodes.push({
      "@type": "Event",
      "@id": `${pageUrl}#${s.date}`,
      name: e.name,
      description: [description, s.cancelled ? undefined : s.note].filter(Boolean).join(" "),
      url: pageUrl,
      startDate: isoLocal(s.date, s.startTime),
      ...(s.endTime && { endDate: isoLocal(s.date, s.endTime) }),
      eventStatus: `https://schema.org/${s.cancelled ? "EventCancelled" : "EventScheduled"}`,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(location && { location }),
      ...(images.length && { image: images }),
      ...(e.audience?.trim() && { audience: { "@type": "PeopleAudience", audienceType: e.audience.trim() } }),
      organizer: { "@id": ORG_ID },
      isAccessibleForFree: !e.price,
      ...(bookable && {
        offers: {
          "@type": "Offer",
          url: e.link,
          price: e.price ?? 0,
          priceCurrency: "GBP",
          availability: `https://schema.org/${s.cancelled ? "Discontinued" : "InStock"}`,
        },
      }),
      ...(multi && { superEvent: { "@id": seriesId } }),
    });
  }
  return nodes;
}

export function personNodes(
  person: { name: string; role?: string; excerpt?: string; image?: string; sameAs: string[] },
  pageUrl: string,
): Json[] {
  const p = stegaClean(person);
  return [
    {
      "@type": "ProfilePage",
      "@id": `${pageUrl}#profile`,
      url: pageUrl,
      name: p.name,
      mainEntity: { "@id": `${pageUrl}#person` },
      isPartOf: { "@id": WEBSITE_ID },
    },
    {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: p.name,
      url: pageUrl,
      ...(p.role && { jobTitle: p.role }),
      ...(p.excerpt && { description: p.excerpt }),
      ...(p.image && { image: p.image }),
      ...(p.sameAs.length && { sameAs: p.sameAs }),
      worksFor: { "@id": ORG_ID },
    },
  ];
}
