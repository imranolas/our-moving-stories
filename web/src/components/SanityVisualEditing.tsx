import type { ClientPerspective } from "@sanity/client";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import { VisualEditing, useIsPresentationTool } from "@sanity/visual-editing/react";
import { useEffect } from "react";
import { readPerspectiveCookie, startLiveText } from "./live-text";
import { history } from "./preview-history";
import { refresh } from "./preview-refresh";

/**
 * The browser side of draft mode; Layout.astro mounts it only in draft mode.
 * - Visual Editing's click-to-edit overlays, with our own URL sync (preview-history.ts) and an in-place
 *   refresh after each save (preview-refresh.ts) in place of its page reloads.
 * - Text that changes as the editor types (live-text.ts, fed by studio/components/LivePreviewInput.tsx).
 * - Opened outside Presentation (e.g. in a new tab), an "Exit preview" button.
 */
export default function SanityVisualEditing() {
  const inPresentation = useIsPresentationTool();
  useEffect(startLiveText, []);
  return (
    <>
      <VisualEditing portal zIndex={1000} history={history} refresh={refresh} onPerspectiveChange={onPerspectiveChange} />
      {inPresentation === false && (
        <a
          href={`/api/draft-mode/disable?to=${encodeURIComponent(window.location.pathname)}`}
          className="fixed bottom-4 right-4 z-1000 border-2 border-ink bg-ink px-4 py-2 font-mono text-sm uppercase text-cream shadow-lg hover:bg-coral hover:border-coral"
        >
          Previewing drafts · Exit
        </a>
      )}
    </>
  );
}

/** The editor picked another perspective (drafts, published, a release): store it and load the page again. */
function onPerspectiveChange(perspective: ClientPerspective) {
  const value = Array.isArray(perspective) ? perspective.join(",") : perspective;
  if (readPerspectiveCookie() === value) return;
  // Same attributes as the enable route; framed by the Studio means cross-site, where Safari needs Partitioned.
  const partitioned = window.self !== window.top ? "; Partitioned" : "";
  document.cookie = `${perspectiveCookieName}=${encodeURIComponent(value)}; Path=/; Secure; SameSite=None${partitioned}`;
  // Safari drops Secure cookies on http://localhost, and reloading then would loop.
  if (readPerspectiveCookie() !== value) return;
  console.info("[preview] Perspective changed, reloading");
  window.location.reload();
}
