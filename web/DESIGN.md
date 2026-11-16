---
name: Our Moving Stories
description: Free movement and arts sessions in Southall and across Ealing, set like a joyful, loud community zine.
colors:
  ink: "#1e1433"
  grape: "#4b2e8f"
  coral: "#ff6b57"
  coral-soft: "#ff8a78"
  coral-deep: "#c2412e"
  coral-light: "#ffa395"
  cream: "#f3ede2"
  lilac: "#dcd0f7"
  lilac-light: "#b9a6ee"
  lilac-mid: "#8c74d9"
  lilac-dash: "#9f8bdb"
  peach: "#ffd9cf"
  sand: "#e8ded0"
  mauve: "#a898c9"
  mauve-dim: "#8a79ae"
  mauve-line: "#3a2c5c"
typography:
  hero:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(34px, 4.5vw, 68px)"
    fontWeight: 900
    lineHeight: 0.9
  title:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(56px, 7.5vw, 112px)"
    fontWeight: 900
    lineHeight: 0.9
  heading:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(44px, 5.25vw, 76px)"
    fontWeight: 900
    lineHeight: 0.9
  sub:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(32px, 3.6vw, 52px)"
    fontWeight: 900
    lineHeight: 0.9
  item:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(28px, 2.4vw, 34px)"
    fontWeight: 900
    lineHeight: 0.9
  lead:
    fontFamily: "Karla, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.45
  prose:
    fontFamily: "Karla, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Karla, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Karla, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  tag:
    fontFamily: "Karla, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.25
  label:
    fontFamily: "'DM Mono', monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.05em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter-sm: "20px"
  gutter: "28px"
  row: "20px"
  block: "36px"
  section: "80px"
  section-lg: "96px"
  page: "1360px"
components:
  button-primary:
    backgroundColor: "{colors.grape}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "15px 22px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  button-coral:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "15px 22px"
  button-coral-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "13px 20px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  button-outline-light:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "13px 20px"
  button-outline-light-hover:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.grape}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  price-tag:
    backgroundColor: "{colors.grape}"
    textColor: "{colors.cream}"
    typography: "{typography.tag}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  session-chip:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 11px"
  session-chip-next:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  filter-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "44px"
  filter-toggle-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  select:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "44px"
  nav-bar:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "80px"
  event-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "20px 0"
  event-row-hover:
    backgroundColor: "{colors.peach}"
    padding: "20px 0"
  newsletter-card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "30px"
  free-badge:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.grape}"
    rounded: "{rounded.full}"
    width: "clamp(220px, calc(160px + 18vw), 400px)"
---

# Design System: Our Moving Stories

## Overview

**Creative North Star: "The Community Zine"**

The site reads like a zine made by the people who run the sessions: photocopy-cream paper, condensed headlines
loud enough to read from across the hall, ruled listings, and pasted-on cut-outs (leaves, paper wings, a
spinning "Free" badge, a scissor-marked newsletter coupon). It is joyful, loud and local. The loudness belongs
to the type and the two saturated colours, grape and coral. The layout underneath stays plain, so a parent on a
phone still finds when, where, who it's for and that it's free in one glance.

Hand-made touches go on the edges, never on the facts. Photos tilt a degree and a half, leaves turn ±18–30°
next to section labels, and a coral block sits offset behind the event poster. Dates, times, venues and buttons
stay square and straight, and the facts are set in plain Karla rather than in caps. Everything is flat: no box
shadows, no gradients except the hero's legibility overlay, no rounded corners except the badge circle. Depth
comes from overlap and rotation, like layers of paper.

Density depends on the job. Section openers are big and sparse (a display heading over a short intro). Listings
are tight rows divided by rules. Proof is always real: consented footage and photos from the organisation's own
sessions, the team's portraits, families' own words. Never stock imagery of children.

**Key Characteristics:**
- Big Shoulders Display at weight 900, uppercase, line-height 0.9, balanced, for every heading and every date.
- Five display roles and four text roles, named in `@theme`; no ad-hoc sizes.
- Three grounds only: cream, grape and ink. Each one has its own fixed text and rule colours.
- Coral carries the heading's starred words, the main call to action and the next date.
- Listings are ruled rows (a 3px ink top rule, 1.5px dividers) with a peach hover band.
- Square corners, 2px ink outlines, DM Mono caps for labels and buttons, and square-ended SVG icons.
- Cut-out decoration (leaves, paper wings, a dashed coupon edge, tilted photos) sits only at the edges.

## Colors

A two-colour zine print (grape and coral) on cream paper, with a deep violet ink. Lilac and mauve tints exist
only for text on the purple and dark grounds.

### Primary
- **Zine Grape** (grape): the brand colour. Section and page headings on cream, primary buttons, the "What's on"
  nav button, the "Free" price tag, the eyebrow labels on cream, and the logo. It is also a full section ground
  (the purple theme and the event "Details" band), with cream headings on it.

### Secondary
- **Signal Coral** (coral): the loud accent. The starred word in a heading, the "Book a free session" button,
  the "Details" row button, the next session chip, the focus ring on dark grounds and text selection. Ink text
  on coral (6.23:1).
- **Soft Coral** (coral-soft): coral for ink grounds. Eyebrows on ink, the footer email (bold, underlined),
  link hovers on ink.
- **Light Coral** (coral-light): coral for grape grounds (5.24:1, so 14px labels pass). Eyebrows, detail
  labels and link hovers on grape; coral-soft is only 4.39:1 there.
- **Brick Coral** (coral-deep): kept as a token but not used. It is the coral that passes AA as text on cream
  (4.41:1, display sizes); the site chose the original coral there instead (the Coral Text Rule).

### Tertiary
- **Pale Lilac** (lilac): body copy after the first paragraph on grape and ink, muted lines, the outline of
  upcoming session chips.
- **Lavender** (lilac-light): secondary notes and the struck-through cancelled dates on grape.
- **Mid Lilac** (lilac-mid): the ground behind team portraits (it shows through the grayscale multiply) and
  the dashed border on cancelled chips.
- **Dash Lilac** (lilac-dash): dashed dividers inside grape sections.

### Neutral
- **Midnight Ink** (ink): all text on cream, every rule and outline, the footer and dark section ground, and
  the hover state of every filled button. It is violet-black, never pure black.
- **Paper Cream** (cream): the page. The nav bar, the newsletter coupon, cream text on grape and ink.
- **Peach Wash** (peach): the hover band on listing rows.
- **Sand Card** (sand): the placeholder behind event thumbnails and posters before they load, or when an event
  has no image.
- **Small-Print Mauve** (mauve), **Dim Mauve** (mauve-dim), **Night Rule** (mauve-line): footer small print,
  the legal line, and the footer's top rule on ink.

The leaf and wing illustrations add a marigold (#E9B949) and a pale butter (#F6E7B8) that exist only inside
those SVGs. Don't promote them to UI colours.

### Named Rules
**The Three Grounds Rule.** A section sits on cream, grape or ink, nothing else. On cream: grape headings,
coral starred words, ink text and rules. On grape and ink: cream headings, lilac body, coral-light
(grape) or coral-soft (ink) eyebrows,
cream solid rules and lilac-dash (grape) or mauve-line (ink) dashed rules.

**The Coral Text Rule.** Coral words are the original coral (#FF6B57) on every ground, at display sizes only:
6.2:1 on ink and 3.6:1 on grape pass AA for large text. On cream they measure 2.41:1, below AA even for large
text: a deliberate exception, chosen for the brand's look (16 Nov 2026) over coral-deep (4.41:1). Keep coral
text on cream to display sizes, never body text or labels, and don't extend the exception: small coral text on
grape uses coral-light, and the focus ring on cream is ink. `highlight()` in `src/lib/text.ts` and
TextSection's `accent` class carry it.

**The Focus Ring Rule.** Focus is a 2px outline with a 3px offset: ink on light grounds (15:1 on cream), coral
inside sections marked `.on-dark` (the hero, grape and ink sections, the footer: 6.2:1 on ink, 3.6:1 on grape).
Coral on cream is 2.4:1, below the 3:1 a focus indicator needs. Mark any new dark section `.on-dark`.

**The Hover-to-Ink Rule.** Every filled or outlined control turns ink with cream text on hover (outline-light
on grape turns cream with grape text). Hover changes colour; nothing lifts, grows or casts a shadow.

## Typography

**Display Font:** Big Shoulders Display, weight 900, self-hosted from `src/assets/fonts/`
**Body Font:** Karla, weights 400 and 700
**Label/Mono Font:** DM Mono, weight 400, one size

**Character:** A tall, condensed poster face that shouts, a friendly humanist sans that explains and states
the facts, and a typewriter mono for labels. Together they read like a gig poster with handwritten notes on it.

Every size is a named role in the `@theme` block of `src/styles/tailwind.css` (`text-title`, `text-heading`,
`text-sub`, `text-item`, `text-lead`, `text-prose`, `text-body`, `text-small`), and each role sets its own
line-height. Display roles pair with the `.display` utility (Big Shoulders 900, uppercase, line-height 0.9,
`text-wrap: balance`). Paragraphs, list items and definitions get `text-wrap: pretty`.

### Hierarchy
- **Hero** (900, clamp(34px, 4.5vw, 68px), 0.9): the homepage hero's cream lead. Its starred accent is sized
  in `Hero.astro` to fill the heading's width (up to 10vw and 150px; up to 64px on phones), so the slogan leaves
  the footage room, in coral with a cream
  brush swash under it. A conjunction before the accent ("art & *movement.*") moves onto the accent's line.
- **Title** (900, clamp(56px, 7.5vw, 112px), 0.9): a page's h1 when there's no hero (What's on, All sessions,
  a person's name, editor pages, 404).
- **Heading** (900, clamp(44px, 5.25vw, 76px), 0.9): section h2s, and h1s that share a column, such as the
  event name beside its poster (long names must leave the booking button in the first screen).
- **Sub** (900, clamp(32px, 3.6vw, 52px), 0.9): pillars, the next date on an event page, the newsletter
  heading, mobile menu items, h2 in prose.
- **Item** (900, clamp(28px, 2.4vw, 34px), 0.9): dates in listings, team names, the "Next up" title, h3 in
  prose.
- **Lead** (Karla 400, 21px, 1.45): intros under a title, max 30em. In bold, every event name in a listing.
- **Prose** (Karla 400, 19px, 1.6): editor rich text, max 40em, with 2px coral underlines on links. FAQ
  questions are prose in bold.
- **Body** (Karla 400, 17px, 1.5): everything else, including times, venues, FAQ answers and intros beside
  headings (max 22em).
- **Small** (Karla 400, 15px, 1.5): session notes, card bios, footer small print.
- **Tag** (Karla 700, 15px, 1.25, the editor's own case): "Who it's for", repeat pattern and price tags.
- **Label** (DM Mono 400, 14px, 0.05em, uppercase; `.label`): eyebrows, nav, buttons, kickers ("Next date"),
  detail labels, session chips, filters.

### Named Rules
**The Shout, Say, Label Rule.** Big Shoulders shouts (headings, dates, names). Karla says: every sentence, and
every fact a family needs (event names, times, venues, who it's for). DM Mono labels: kickers, buttons, nav,
filters. A sentence never goes in display or mono, and facts never go in mono caps.

**The One Mono Size Rule.** DM Mono has one job and one size: the 14px `.label`. Smaller mono caps are hard to
read on phones. Its `font-normal` is deliberate: only a 400 file exists, so mono inside bold text would be
faked.

**The Named Role Rule.** Size text with a role class, never a pixel value. The only sizes outside the roles are
the hero's lead and accent, and the badge text that scales with its container (`9.5cqi`).

**The Weights-in-Config Rule.** Only 800/900 display, 400/700 Karla and 400 mono are loaded, and nothing uses
800 now. Add a weight to the `fonts` config in `astro.config.mjs` before using it, or the browser fakes it.

**The Unbroken Compound Rule.** Editor text that is shown as a fact or lead ("under-5s", "grown-ups") goes
through `keepCompounds()` (`src/lib/text.ts`), so short hyphenated words never break at the hyphen.

## Layout

The page is a single 1360px column (`.wrap`) with 20px side gutters (28px from 640px). Sections stack full
width and alternate grounds. Vertical rhythm: 80px section padding (96px from 768px), 36–44px between a
section header and its content, 20px row padding in listings.

Section headers put the heading and intro side by side: an eyebrow, then the display heading on the left and a
short intro on the right, aligned to the bottom (`flex items-end justify-between flex-wrap`). Split text
sections use two equal columns from 768px with a 64px gap; their text is an introduction, so it shows the first
paragraph and opens the rest under a "Read more" toggle (a native `<details>`). Stacked text sections show
everything at up to 34em (about 70 characters a line). Card grids use `auto-fill` with a 230px minimum from
640px, so they reflow without breakpoints; the team grid is two columns on phones.

On the homepage, booking comes before the story: hero, Coming up, then About and the team (the order is the
editors' page builder). "Coming up" is the one list of dates: every session in the next two weeks as an event
row, labelled "Today", "Tomorrow", "This week" or "Next week" over its date (or the next four sessions when
those weeks are empty). Its footer links "All dates" (/sessions) and counts events not in the list ("3 more
events later on", /events), so nothing is dropped silently. The diary block repeats it and isn't used on the
homepage; on its own it lists the coming 7 days and hides when the week is empty.

Listings are CSS grids, not tables. The event row is a 72px thumbnail and text on phones, 104px from 640px,
and from 1024px a four-column row: thumb, date block (176px), name and details, then "Book free". Session rows
stack on phones and become four columns (date, time, name, venue) on wider screens: 180/170px from 640px in the
homepage diary, 230/150px from 1024px on the sessions page, where dates carry a year.

The nav is sticky, 64px tall (80px from 768px). The hero fills the screen under it: `100svh` minus the nav,
min 560px, max 1080px. Breakpoints are Tailwind's defaults: 640, 768, 1024.

**The Ruled List Rule.** Every list of events, sessions or people starts with a 3px ink rule. Rows are divided
by 1.5px solid ink on cream, or 1.5px dashed lilac-dash or mauve-line on dark grounds. The last row keeps its
divider. Lists never sit in boxes.

## Elevation & Depth

Flat. There are no box shadows in the site's pages. Depth is paper layered on paper: an image tilted -1.5°
over a coral block tilted +2° and offset 18px; paper wings overlapping the edge of the newsletter coupon; a
badge rotated -8° pinned over the hero video; leaves overlapping the corner of a portrait. The one shadow is a
legibility aid, a soft ink text-shadow (`0 2px 24px rgba(30,20,51,0.35)`) on the hero title over video, and
the hero's ink gradient overlay does the same job. (The draft-mode "exit preview" button for editors has a
shadow; it isn't part of the public site.)

**The Flat Paper Rule.** If something needs to stand out, change its ground, rule weight or rotation, not its
shadow.

## Shapes

Square corners everywhere (0px). The only curve is the "Free" badge circle, with its spinning ring of mono text.
Outlines are 2px ink (buttons, filter toggles, selects, the nav's bottom border, the mobile menu button);
1.5px marks tags, chips and row dividers; 3px marks the top of a list. The newsletter coupon has a 2px dashed
cream outline 8px outside it, like a cut line, with a scissors icon in its eyebrow.

Icons (`src/components/Icon.astro`) follow the same form language: drawn on a 24-unit grid in `currentColor`
with square line caps, sized 1em so they scale with their text, at stroke 2.25 beside labels and about 3 beside
display type. Pause and play are solid blocks.

Rotation is the zine's hand-made gesture, kept to small set angles: -1.5° for thumbnails and posters, +2° for
the coral block behind a poster, -8° for the badge, ±8–14° for paper wings, ±18–30° for leaves (`leaf(i)` in
`src/lib/text.ts` cycles six of them with fixed angles). Text, icons and controls are never rotated.

## Components

### Buttons
Printed and direct: a flat block of colour or a 2px ink outline, mono caps, square corners.
- **Shape:** square (0px), 15px × 22px padding, the 14px label, laid out `inline-flex` with a 0.6em gap for an
  icon. Anything tappable is at least 44px tall.
- **Primary** (`.btn-primary`): grape with cream text. The default action (Eventbrite booking links, such as
  "Book free on Eventbrite" in Next up and on the event page).
- **Coral** (`.btn-coral`): coral with ink text. The page's single loudest action, "Find a free session" in
  the hero (it leads to the list, so it says "find"), and "Book free" on event rows.
- **Outline** (`.btn-outline`): 2px ink outline, ink text. The second action beside a primary ("Newsletter",
  "Directions", a person's social links).
- **Outline light** (`.btn-outline-light`): 2px cream outline on grape or ink; hover fills cream with grape
  text.
- **Hover / Focus:** the Hover-to-Ink Rule, a colour transition only. Focus is a 2px outline, 3px offset,
  on every focusable element: ink on light grounds, coral on `.on-dark` ones (the Focus Ring Rule).
- **Icons:** arrow-right after links within the site, arrow-up-right after anything that leaves it
  (Eventbrite, Maps, Instagram), arrow-left before back links ("All events", "The team"). After display text,
  a no-break space keeps the arrow with the last word.

### Tags
- **Style** (`.tag`): an outline in `currentColor`, 1.5px, Karla bold 15px in the editor's own case, 4px ×
  10px padding. Used for "Who it's for" and the repeat pattern ("Every Wed"), so the facts read at a glance,
  including for readers whose first language isn't English.
- **Price tag:** the same tag filled grape with a grape border and cream text, always saying "Free" up front.

### Session chips
On the event page's grape band, every date as a 14px label chip: the next one filled coral with ink text and
"· next"; upcoming ones with a 1.5px lilac outline; cancelled ones with a dashed lilac-mid outline, lavender
text, a line through them, and a screen-reader "Cancelled:".

### Event row (signature)
The heart of the site, used for events (/events: the event's next date under "Next date") and for single
sessions (the homepage: that session's date and time, any session note, and when it is). The whole row opens the event (the name's link is stretched over it), and its focus
ring outlines the row. A tilted 3:4 thumbnail on sand; a "Next date" label over a grape item
date and the repeat label; the event name in bold lead with the time and venue in body and a "Who it's for"
tag; then a coral "Book free" link (arrow-up-right) straight to the booking page, under the tag on phones and
at the row's end from 1024px. Rows that can't be booked from the list show an outline "Details" on wide screens. On hover the row fills peach, the fill reaching 16px past
the text on each side (`.row-hover`, 150ms); nothing inside it moves. With nothing coming up, the list shows a plain sentence pointing to Instagram
and the newsletter, never an empty box.

### Session row
A lighter row for the diary (this week on the homepage, everything on the sessions page): the date as a grape item ("Today", "Tomorrow", or the short date, plus the year
as a label on the sessions page), the time in body, the event name in bold lead with any note in small ink at
70%, and the venue in body. A cancelled session strikes through its date (in ink at 70%) and shows "Cancelled" as a
small coral chip with ink text (6.2:1), never by fading the whole row.

### Section header
An eyebrow (the label in grape, coral-light on grape, or coral-soft on ink) with a 24px leaf cut-out before it, then the
display heading. Editors star a word to make it coral (`Made by people, *for people.*`). An intro of up to
22em sits bottom-right on wide screens.

### Inputs / Fields
- **Filter toggles** (sessions page, `aria-pressed`; the What's on tabs, `aria-selected`): 44px tall, a 2px
  ink outline, the label; the selected one is filled ink with cream text.
- **Selects:** the same box on cream, the native control kept.
- **Newsletter:** the beehiiv embed in an iframe, inside the cream coupon. Its own styling is beehiiv's.

### Navigation
A sticky cream bar with a 2px ink bottom border. The purple logo is on the left (44px tall, 62px from 768px).
Editor nav items are labels in ink, turning grape on hover, then a grape "What's on" block that turns ink on
hover (an editor item pointing at the same list is left out, so it never appears twice). On phones a "Menu"/"Close" outline button opens a full-width list of display sub-size items divided by
1.5px ink rules, ending in a primary "What's on". Escape closes it.

### Team cards
A 4:5 portrait in grayscale at 115% contrast, multiplied onto mid lilac so it turns violet, with a leaf
cut-out overlapping its top-right corner. On hover it eases back to full colour (300ms) and the name turns
grape. Below it: the name (item), the role (a grape label), and a small excerpt from 640px. On phones the cards sit
two to a row without the excerpt; the full bio is on the person's page.

### Hero
Full-bleed session footage (video with a poster, or an editor image) under an ink gradient from the bottom and
left. Over it go the cream hero lead, the coral accent line with its cream brush swash, a coral "Find a free
session" (only when something is bookable), an Instagram label link, and a 44px outline toggle that shows
Pause or Play with its icon. The "Free" badge sits top right: a cream circle with a 2px ink edge, rotated -8°,
between two paper wings, and its ring text ("All ages · All abilities · Free") spins once every 20s. Under the
hero, on cream, comes a lead intro, primary and outline buttons, and a "Next up" block under a 2px rule (a
label, the event name as an item linking to its page, the time and venue in body, then a primary "Book free on
Eventbrite" straight to the booking page when it can be booked).

### Newsletter coupon
In the ink footer: a cream card (30px padding) with a dashed cream cut-line 8px outside it, framed by the
paper wings, a scissors icon and "Newsletter" as its eyebrow, and a sub-size display heading over the beehiiv
field.

## Do's and Don'ts

### Do:
- **Do** take every colour from the `@theme` tokens in `src/styles/tailwind.css` (`bg-grape`, `text-ink`,
  `border-lilac-dash`).
- **Do** size type with the role classes (`text-title`, `text-heading`, `text-sub`, `text-item`, `text-lead`,
  `text-prose`, `text-body`, `text-small`) and use `.label` for every mono label.
- **Do** start every listing with a 3px ink rule and divide its rows with 1.5px rules (the Ruled List Rule).
- **Do** set every date in display type, grape or coral (the next date) on cream, coral on dark, and say "Free" up front
  with the grape price tag or the badge.
- **Do** keep coral text to display sizes (the Coral Text Rule, including its AA exception on cream), and use
  coral-light for small coral text on grape; plain coral also serves fills and dark-ground focus rings.
- **Do** draw arrows, play/pause and scissors with `Icon.astro`; the fonts are Latin-only subsets with no
  arrow glyphs.
- **Do** pass editor text shown as a fact or lead through `keepCompounds()`.
- **Do** keep every tap target at least 44px tall.
- **Do** keep the 2px focus outline with its 3px offset on everything focusable: ink on light, coral inside
  `.on-dark` (the Focus Ring Rule).
- **Do** let long text from Sanity wrap: links in `.rich` break anywhere, so a pasted URL can't widen the page.
- **Do** stop all motion under `prefers-reduced-motion`: the badge ring stops, and the hero video waits for
  Play.
- **Do** let editors' asterisks choose the coral words. Don't hard-code coral spans in headings that come from
  Sanity.
- **Do** use only consented footage and photos from the organisation's own sessions.

### Don't:
- **Don't** round corners, add box shadows, or add gradients outside the hero overlay (the Flat Paper Rule).
- **Don't** put a section on any ground other than cream, grape or ink, or introduce new hues. The marigold
  and butter in the leaf SVGs stay inside the illustrations.
- **Don't** use the legacy colour names (`text`, `primary`, `dark`, `light`) in new code; `primary` is coral,
  not grape.
- **Don't** type Unicode arrows or symbols (→ ↗ ← ▶ ❚❚ ✂); they fall back to another font, thinner and off
  the baseline.
- **Don't** set mono below 14px, or put sentences, times, venues or event names in mono or display.
- **Don't** use pixel sizes for text, or a font weight that isn't in the fonts config.
- **Don't** rotate text, icons, buttons, dates or form controls; tilt only images, colour blocks and cut-outs.
- **Don't** make hover lift, scale or cast a shadow; it changes colour (and a listing row moves in 16px).
- **Don't** use stock imagery of children, or invent statistics or badges of proof.
- **Don't** box listings in cards; they are ruled rows on the page.
