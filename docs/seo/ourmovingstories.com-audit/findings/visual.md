# Visual / mobile rendering audit (9 Nov 2026)

Screenshots: `screenshots/live/` and `screenshots/local/` (`<page>-{desktop 1440x900,mobile 390x844}-{fold,full}.png`).
Method: headless Chromium, mobile = touch + is_mobile. LOCAL waited 5s for hero video (readyState 4, playing, poster set).
LOCAL runs `astro dev`: the dark pill at the bottom of every LOCAL screenshot is the Astro dev toolbar, not part of the site.

## Scores
| | Score |
|---|---|
| LIVE | **48/100** |
| LOCAL | **82/100** |

## Summary table
| Check | LIVE | LOCAL |
|---|---|---|
| Horizontal overflow (390px) | none | none |
| Broken images | none | none (but see footer logos) |
| Fold: what/who/free/where/book (mobile) | Only "Community - Arts - Creativity" + SUBSCRIBE. No who, free, where, or booking | Strong: "Free movement, art & community events across Ealing", FREE badge, giant H1. Booking CTA is below the fold |
| Visible H1 | 5 H1s (every section heading "About", "What's On"...); hero tagline is not a heading | 1 H1 on `/`; none on `/testimonials` |
| Primary CTA in first screen | SUBSCRIBE (wrong goal) | None on `/` mobile fold; desktop has JOIN IN in nav |
| Layout shift | CLS ~0 | `/sessions` desktop CLS 0.41 (dev); others 0 |

## Findings

### LIVE
- **High, LIVE: mobile first screen does not say what/who/free/where/how to book.** `/` shows logo, menu icon, "Community - Arts - Creativity" and SUBSCRIBE over decorative blobs. Nothing about families, free, West London or Eventbrite. Replaced by LOCAL hero.
- **High, LIVE: Instagram section is empty** (heading "Instagram" followed by blank space, `/` full page at ~y=10029 mobile) and the newsletter embed is blank (beehiiv iframe 342x52 renders empty in headless; verify in a real browser). Footer "SUBSCRIBE TO OUR NEWSLETTER" is also a gap.
- **Medium, LIVE: multiple H1s** (5 on `/`: About, What's On, People, Instagram, Get in touch) and no H1 for the hero.
- **Medium, LIVE: tap targets too small.** Mobile "Menu" hamburger 40x24px; subscribe buttons 32-38px high; desktop nav links 43px high, Instagram icon 32x21.
- **Medium, LIVE: mobile page is very long** (11,622px) and text-heavy; the hero is a flat colour block with a large empty gap above and below the heading.
- **Low, LIVE:** font sizes OK (no text under 14px); no overflow; no layout shift.
- Unknown URLs are blank 0-byte pages (see recon); not a visual page at all.

### LOCAL
- **High, LOCAL: no booking/primary CTA in the mobile first screen on `/`.** The fold (390x844) shows eyebrow, H1, "Filmed at our sessions" and PAUSE; "See what's on" and "Newsletter" buttons start at ~y=1070. Fix in `web/src/components/Hero.astro`: surface a "Book free sessions" CTA (to `/events`) inside the hero, or shorten the hero to ~85svh on mobile so the next-up block peeks in. The eventual toolbar-free viewport is slightly taller but still does not reach it.
- ~~Medium, LOCAL: footer funder logos render as four blank cream rectangles.~~ **Corrected by the orchestrator: screenshot artifact, not a site bug.** The logos (and the team photos, which were also blank in the full-page captures) are `loading="lazy"` and never entered the viewport during the full-page capture. Verified: all four Sanity logo URLs return 200 PNGs, and a 1440x7600 headless Chrome capture (everything in view) renders all four logos and all five team photos.
- **Low, LOCAL: the National Lottery Community Fund logo is white-on-cream and nearly invisible** in its cream chip (`web/src/components/Footer.astro:83`, `bg-cream`). Upload the dark/colour version of the logo in Sanity (`footer.funders[].logo`) or drop the cream chip for that logo. Funders usually have logo-usage rules, so worth fixing before launch.
- **Medium, LOCAL: newsletter embed blank** (beehiiv iframe 302x52, empty box on `/` "Stay in the loop" with dashed border and big empty card). Same as LIVE; confirm in a real browser. If it truly loads blank, add a fallback link.
- **Medium, LOCAL: Instagram section is just a heading + "Follow us" button**, no grid (not broken, but no feed). Acceptable; the live site's is empty too.
- **Medium, LOCAL: `/testimonials` has no H1 in the DOM** (the visual "TESTIMONIALS" is not an `h1`). `web/src/pages/[...slug].astro` / `TextSection.astro`.
- **Medium, LOCAL: small text.** Nav/button/labels at 12-13px (mono uppercase): nav links, "Menu", "Details ->", filter chips, footer legal (12px). Raise to >=14px for body-adjacent labels (`web/src/styles/tailwind.css`, Nav/Footer/EventsSection). Hero eyebrow is ~13px over video.
- **Medium, LOCAL: tap targets under 44px high:** mobile MENU button 57x36; "<- ALL EVENTS" 94x20; "<- THE TEAM" 78x20; "Instagram" link 122x43; footer links ~16px tall; PAUSE 90x36; desktop nav links 20px tall (text-only, JOIN IN 36px). Add padding to reach 44px.
- **Low, LOCAL: `/sessions` desktop CLS 0.41** in dev (list/filters hydrate after paint). Re-measure on a production build; reserve height for the list if it persists. Not observed on mobile.
- **Low, LOCAL: hero video text legibility** is good (gradient scrim); desktop MOVEMENT headline is huge but fine. Autoplay + Pause control present (good).
- **Info, LOCAL good:** event detail (`/events/story-space`) fold on mobile is excellent: FREE tag, "every Thu", next date, venue, and "Book free on Eventbrite" CTA all in the first screen. `/events`, `/sessions`, people page, 404 ("WRONG TURN.") render cleanly, no overflow, no broken images. Unknown URL ends at `/404` (status 404).
- **Info, LOCAL: H1 computed font-size reads 17px on `/`** (wrapper element); actual rendered headline is ~60px mobile / ~190px desktop. Not an issue.

## What the redesign fixes vs. leaves
- Fixes: first-screen messaging (free, Ealing, families), single H1 on `/`, richer visual identity, real 404 page, working event detail CTAs, no flat empty blobs.
- Still wrong: no CTA above the mobile fold on `/`, near-invisible Community Fund logo, blank newsletter iframe (unconfirmed in a real browser), small tap targets/12-13px text, missing H1 on `/testimonials`.
