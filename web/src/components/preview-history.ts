import { withoutSecretSearchParams } from "@sanity/preview-url-secret/without-secret-search-params";
import type { HistoryAdapter } from "@sanity/visual-editing/react";

/**
 * Keeps Presentation's URL bar and the framed page in step (Visual Editing's `history` option). The Studio
 * re-sends the current URL, relative, on every reconnect; only navigate when it's really another page.
 * (@sanity/astro 3.6.1's adapter compares it with the absolute location.href and reloads every time.)
 */

/** The page a URL points at, ignoring Presentation's own query params and a trailing slash. */
function pageKey(url: string | URL) {
  const u = withoutSecretSearchParams(new URL(url, location.href));
  return `${u.origin}${u.pathname.replace(/(.)\/+$/, "$1")}${u.search}`;
}

export const history: HistoryAdapter = {
  subscribe(navigate) {
    let reported = "";
    const report = () => {
      const url = `${location.pathname}${location.search}${location.hash}`;
      if (url === reported) return;
      reported = url;
      navigate({ type: "push", title: document.title, url });
    };
    report();
    // Pages are separate documents, so only in-page changes (e.g. "/#about" links) need watching.
    addEventListener("popstate", report);
    addEventListener("hashchange", report);
    return () => {
      removeEventListener("popstate", report);
      removeEventListener("hashchange", report);
    };
  },
  update(update) {
    if (update.type === "pop") return window.history.back();
    const target = new URL(update.url, location.href);
    if (pageKey(target) === pageKey(location.href)) {
      if (target.hash !== location.hash) location.hash = target.hash;
      return;
    }
    console.info(`[preview] Studio navigated to ${update.url}`);
    if (update.type === "push") location.assign(target);
    else location.replace(target);
  },
};
