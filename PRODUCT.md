# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Families with young children in Southall and the wider Ealing area (primary).** Usually a parent or
  carer of an under-5, looking on a phone for something free, nearby and good to do with their child this
  week. Their job: find a session that suits their child's age and their week, check when, where and that
  it's free, and book it on Eventbrite. Many speak a language other than English at home.
- **Local people of all ages (primary, for one-off events).** Community events such as Winter Together and
  the Spring Party are open to everyone; the job is the same: when, where, who it's for, book.
- **Funders and partners (secondary).** Funders (National Lottery, London Sport), partners (Peabody, Ealing
  Council) and community groups, schools and venues that might host sessions. They check that the
  organisation is real, well run and worth backing, and get in touch. The site backs funding bids and
  partnership enquiries, but never at the expense of a family finding a session.
- **The team, as editors.** The small team edits pages, people, navigation and footer in Sanity Studio and
  manages events on Eventbrite. They aren't designers; layouts have to hold up under whatever they enter.

## Product Purpose

Our Moving Stories is a community arts organisation (a CIC) running free movement and arts sessions in
Southall and across Ealing: weekly sessions for little ones and their grown-ups, and community events
everyone is welcome at. The website exists so local families can find a session and book it, and so
partners and funders can see who runs it and why it matters.

Success, in order: families book sessions on Eventbrite; people join the newsletter to hear about new
dates; community groups, schools and venues get in touch to run something together; funders and partners
come away confident in the organisation.

## Positioning

Free, local and led by trained artists. Every session and event is free, funded for the community. Sessions
are run by dancers, artists and early-years practitioners who live and work locally, led by a founder trained
at the Martha Graham School and formerly a Lecturer in Dance at Middlesex University. A session combines
movement and dance with an art-making activity around a weekly theme, and grown-ups take part and meet other
local parents. Parents describe it as unlike anything else locally or in central London. The work spans
generations and cultures: dance, music, storytelling, spoken word and visual arts.

## Operating Context

- **Booking happens on Eventbrite, not on the site.** The site links each event to its Eventbrite page. One
  ticket per child; the accompanying adult doesn't need one.
- **Events and sessions.** An "event" is a weekly series (e.g. Move and Make @ Open Havelock 2026/27,
  Wednesdays 9:30–11:30; Story Space, Thursdays 15:30–17:00) or a one-off (Winter Together). A "session" is
  one dated occurrence. Series run in blocks with breaks (e.g. Christmas); editors can mark a session
  cancelled or add a note.
- **Venues.** Open Havelock (Willowbrook Road, Southall, UB2 4RP), Westcot Park Community Centre (spelled as
  Google Maps has it, on purpose) and Windmill Park. Event FAQs carry practical access details: step-free
  access, buggy parking, how to find the entrance.
- **Where content comes from.** Eventbrite owns each event's name, overview, FAQs, price, poster, venue and
  dates (synced into Sanity). Studio owns "Who it's for", the card photo, key details, session notes and
  everything else on the site. Published changes reach the live site within about 5 minutes.
- **Staying in touch.** Newsletter on beehiiv (embedded in the footer), Instagram @our.movingstories,
  email hello@ourmovingstories.com.

## Capabilities and Constraints

- Surfaces: home, What's on (`/events`), each event's page, the session diary (`/sessions`, with filters),
  each team member's page, editor-built pages (Testimonials, Safeguarding Policy) and the 404 page.
- The site takes no bookings, payments or sign-ups of its own beyond the beehiiv newsletter embed.
- No cookies and no consent banner: analytics is cookieless Cloudflare Web Analytics. Anything that would
  need consent is a product decision, not a design detail.
- Content is editor-driven and uneven: long event names ("Move and Make @ Open Havelock - 2026/27"),
  events without a card photo, people without a short excerpt, cancelled dates, events with no upcoming
  sessions.
- Terminology on the site: "What's on", "Join in", "Who it's for", "little ones and their grown-ups",
  "Everyone welcome", "Book a free session".
- **Open decision:** translated content is required (see Accessibility & Inclusion) but not built. Which
  languages, which content, and who translates are undecided.

## Brand Commitments

- Name: Our Moving Stories; legally Our Moving Stories CIC, company number 14473202.
- Voice: warm, plain and local. "Made by people, for people." "Everyone has a story to tell through art &
  movement." Free is said up front, every time.
- Logo files: `web/public/img/logo-purple.svg`, `web/public/img/logo-cream.svg`,
  `web/public/img/logo-512.png`.
- Credit line: "In partnership with Peabody & Ealing Council · Supported by National Lottery & London
  Sport", with funder logos in the footer.
- **Imagery of children:** only consented footage and photos from the organisation's own sessions (the hero
  montage, Instagram, session photos). Never stock imagery of children.

## Evidence on Hand

- Testimonials: two long parent testimonials on `/testimonials` (Sanity page).
- Team, with bios on their pages: Sarah Sulemanji (founder; Martha Graham School, NYC; Lecturer in Dance at
  Middlesex University 2010–2023; BA(Hons), MA, PGCHE, FHEA; professional member of the Foundation for
  Community Dance), Gabriela Bolton (artist), Supreet Kaur, Nadia Butt, Jennifer Benson.
- Funding and partners: Peabody and Ealing Council (partners), National Lottery and London Sport
  (supporters); Story Space is National Lottery funded.
- Track record: past events listed on `/events` since 2024 (Move and Make series, Mindful Movement,
  Creativity & Connection, Spring Party, Winter Together).
- Media: hero montage video (`web/public/video/hero-*`, edited in DaVinci Resolve project `oms-banner`),
  event posters from Eventbrite, default share image `web/public/img/og-default.jpg`, Instagram downloads in
  `instagram/` (local only, gitignored).
- **Absent, don't fabricate:** attendance figures, impact statistics, press coverage, case studies, awards,
  further testimonials and translated copy.

## Product Principles

1. **The facts come first.** Every event surface answers when, where, who it's for and that it's free
   before anything else.
2. **One step to booking.** A family should reach the right session's Eventbrite page without having to read
   the organisation's story first.
3. **Real people, real sessions.** Proof is the team, families' own words and consented footage from real
   sessions; no stock imagery, no invented numbers.
4. **Readable by everyone.** Plain English that holds up as a second language, translated where it matters,
   accessible to WCAG 2.2 AA.
5. **Partners are welcome, families come first.** The case for funders and partners is on the site, but it
   never crowds out finding and booking a session.

## Accessibility & Inclusion

- WCAG 2.2 AA is required, not just good practice.
- Many families speak a language other than English at home: write plain, short English and make the key
  facts (date, time, place, age, free) readable at a glance without reading every line.
- Translated content is required; languages and scope are an open decision (see Capabilities and
  Constraints).
- Sessions and events are for all ages and abilities; practical access information (step-free access, buggy
  parking, finding the entrance) must stay easy to find.
