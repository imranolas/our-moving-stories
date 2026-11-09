import morphPlugin from "@alpinejs/morph";
import type { HistoryRefresh } from "@sanity/visual-editing/react";
import { applyLocalEdits, keepLocalText } from "./live-text";

/**
 * Visual Editing's `refresh`, called after each save in the Studio. Its default reloads the page; instead,
 * fetch the page again (the server renders the draft) and morph the new <body> into the current one, so
 * scroll position, Alpine state (menu, tabs, session filters) and the playing hero video survive.
 *
 * - Alpine's morph plugin, because the site's interactivity is Alpine and it keeps component state.
 * - `astro-island` elements (this island) are never touched; the overlays live outside <body>.
 * - `data-preview-keep` marks elements whose state a script owns (the hero video and its button). They're
 *   left alone; the attribute lists the attributes worth a real reload if they change (the video sources).
 * - Text the editor has typed since the save (live-text.ts) beats the server's slightly older copy.
 * - One refresh at a time; anything that arrives meanwhile gets one more pass.
 * - The Studio's refresh button, and anything unexpected, does a full reload.
 */
const morph = {} as { morph: (from: Element, to: Element, options: object) => void };
(morphPlugin as (alpine: object) => void)(morph); // registers .morph on the object it's given

class NeedsReload extends Error {}

async function morphOnce() {
  const res = await fetch(location.href, { cache: "no-store" });
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  if (!doc.querySelector("astro-island[component-url*='SanityVisualEditing']")) {
    throw new NeedsReload("draft mode is off in the refreshed page");
  }

  morph.morph(document.body, doc.body, {
    updating(el: Node, toEl: Node, _childrenOnly: () => void, skip: () => void) {
      if (el instanceof Text && toEl instanceof Text) return keepLocalText(el, toEl) ? skip() : undefined;
      if (!(el instanceof Element) || !(toEl instanceof Element)) return;
      if (el.localName === "astro-island") return skip();
      const keep = el.getAttribute("data-preview-keep");
      if (keep === null) return;
      for (const name of keep.split(/\s+/).filter(Boolean)) {
        if (el.getAttribute(name) !== toEl.getAttribute(name)) throw new NeedsReload(`${name} changed`);
      }
      skip();
    },
    removing(el: Node, skip: () => void) {
      if (el instanceof Element && el.localName === "astro-island") skip();
    },
  });
  document.title = doc.title || document.title;
  applyLocalEdits();
}

let running: Promise<void> | undefined;
let again = false;

function run(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        again = false;
        await morphOnce();
      } while (again);
    } catch (err) {
      if (err instanceof NeedsReload) console.info(`[preview] Reloading: ${err.message}`);
      else console.warn("[preview] In-place refresh failed, reloading", err);
      location.reload();
    } finally {
      running = undefined;
    }
  })();
  return running;
}

// For debugging in the browser console in draft mode: `await __previewRefresh()`.
Object.assign(window, { __previewRefresh: run });

export function refresh(payload: HistoryRefresh): false | Promise<void> {
  if (payload.source === "manual") {
    console.info("[preview] Studio refresh button, reloading");
    location.reload();
    return new Promise(() => {}); // stays "refreshing" until the page goes away
  }
  return run();
}
