/**
 * Fills the redesign's new fields with the copy from the v3.12 design.
 *
 * Run from the studio folder, against the *production* dataset (the new site's copy of staging) only:
 *   SANITY_STUDIO_DATASET=production npx sanity exec scripts/seed-redesign.ts --with-user-token
 *
 * What it changes (published documents only):
 * - Homepage hero: kicker, headline, intro, badge. Clears the old uploaded video and
 *   poster so the montage bundled with the site plays.
 * - Homepage "About" text: label, coral heading, purple theme, the three highlight rows.
 * - Homepage events / sessions / people headings.
 * - Removes the homepage "Get in touch" text block (the new footer covers it).
 * - Footer: contact and newsletter copy, partners line.
 * - Nav: fixes "Whats on" and puts the links in the design's order.
 * - Events: adds "Who it's for" tags and summaries where missing.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2024-10-17" });
const { dataset } = client.config();

if (dataset !== "production") {
  console.error(`Refusing to run: this script only writes to the "production" dataset (current: "${dataset}").`);
  process.exit(1);
}

const key = () => Math.random().toString(36).slice(2, 14);

async function run() {
  const home = await client.fetch(`*[_type == "page" && slug.current == "index" && !(_id in path("drafts.**"))][0]`);
  if (!home) throw new Error("No homepage (slug 'index') found.");

  const anchor = (b: any) => b?.anchorId?.current;
  const blocks = (home.pageBuilder ?? [])
    .filter((b: any) => !(b._type === "textSection" && anchor(b) === "contact"))
    .map((b: any) => {
      switch (b._type) {
        case "hero": {
          const { video, videoSmall, videoTall, image, backgroundImage, filters, ...rest } = b;
          return {
            ...rest,
            kicker: "Free movement, art & community events · Across Ealing",
            title: "Everyone has a story to tell through *Movement.*",
            subtitle:
              "Free movement and art across Ealing, run with and for local people. Weekly sessions for little ones and their grown-ups, and community events everyone is welcome at.",
            showNextUp: true,
            cta: undefined,
            overlayStrength: 60,
            badge: "Free",
            badgeRing: "All ages · All abilities · Free · ",
            videoDescription:
              "Montage from our sessions: the garden at Open Havelock, a mural being spray painted, dancers at the graffiti wall, drumming and group dance, toddlers with scarves, painting and making with little ones, and a girl standing in the paper leaf wings",
          };
        }
        case "textSection":
          if (anchor(b) !== "about") return b;
          return {
            ...b,
            eyebrow: "About",
            heading: "Made by people, *for people.*",
            theme: "purple",
            layout: "split",
            pillars: [
              { _key: key(), _type: "pillar", title: "Always free", text: "Every session and event, funded for the community." },
              { _key: key(), _type: "pillar", title: "Little ones & grown-ups", text: "Weekly movement and art for under-5s with their parents and carers.", accent: true },
              { _key: key(), _type: "pillar", title: "Everyone welcome", text: "Parties, workshops and community-run events for all ages and abilities." },
            ],
          };
        case "events":
          return {
            ...b,
            eyebrow: "What's on",
            title: "Coming up",
            intro: "Free sessions and events across Ealing, soonest first. Open one for the full schedule and how to book.",
          };
        case "upcomingSessions":
          return { ...b, eyebrow: "Diary" };
        case "people":
          return {
            ...b,
            eyebrow: "The people",
            title: "A small, *mighty* team",
            description: b.description || "Dancers, artists and early-years practitioners who live and work locally.",
          };
        default:
          return b;
      }
    });

  const tx = client.transaction();
  tx.patch(home._id, (p) => p.set({ pageBuilder: JSON.parse(JSON.stringify(blocks)) }));

  const footer = await client.fetch(`*[_type == "footer" && !(_id in path("drafts.**"))][0]{ _id }`);
  if (footer) {
    tx.patch(footer._id, (p) =>
      p.set({
        contactEyebrow: "Get in touch",
        contactHeading: "Bring movement to your *community.*",
        contactText:
          "We work with community groups, schools and venues across Ealing to bring free movement and art sessions to more people. If you'd like to run something together, we'd love to talk.",
        newsletterHeading: "Stay in the loop",
        newsletterText: "New dates, projects and community stories, straight to your inbox.",
        partnersLine: "In partnership with Peabody & Ealing Council · Supported by National Lottery & London Sport",
      })
    );
  }

  const nav = await client.fetch(`*[_type == "nav" && !(_id in path("drafts.**"))][0]`);
  if (nav?.items) {
    const order = ["about", "whats on", "what's on", "people", "contact"];
    const items = nav.items
      .map((i: any) => (/^whats on$/i.test(i.text?.trim()) ? { ...i, text: "What's on" } : i))
      .sort((a: any, b: any) => {
        const ia = order.indexOf(a.text?.toLowerCase().trim());
        const ib = order.indexOf(b.text?.toLowerCase().trim());
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
    tx.patch(nav._id, (p) => p.set({ items }));
  }

  const events = await client.fetch(`*[_type == "event" && !(_id in path("drafts.**"))]{ _id, name, audience, summary, description }`);
  for (const e of events) {
    const name = (e.name || "").toLowerCase();
    const audience = /move (and|&) make/.test(name) && /havelock/.test(name) ? "Under-5s + grown-ups" : /westcott/.test(name) ? "All ages" : "Everyone";
    const firstPara = (e.description ?? [])
      .map((b: any) => (b.children ?? []).map((c: any) => c.text).join(""))
      .find((t: string) => t.trim().length > 0);
    const set: Record<string, string> = {};
    if (!e.audience) set.audience = audience;
    if (!e.summary && firstPara) set.summary = firstPara;
    if (Object.keys(set).length) tx.patch(e._id, (p) => p.set(set));
  }

  const res = await tx.commit();
  console.log(`Updated ${res.results.length} documents in "${dataset}".`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
