import { useEffect, useRef } from "react";
import type { InputProps } from "sanity";

const PREVIEW_ORIGIN = new URL(process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:4321").origin;

/**
 * Live preview as you type, for the Presentation tool. Presentation only tells the preview about a change
 * once the Studio has saved it (Content Lake listener), so text lags until you pause. This wraps every
 * form input (form.components.input in sanity.config.ts); at the document root it posts the unsaved
 * document to the site's preview iframe on every change, at most once per frame. The site patches its
 * text in place (web/src/components/live-text.ts) and accepts the message only from this window and a
 * known Studio origin. Without a preview iframe open (e.g. in Structure), it does nothing.
 */
export function LivePreviewInput(props: InputProps) {
  const isRoot = props.path.length === 0;
  const value = props.value as { _id?: unknown } | undefined;
  const frame = useRef(0);

  useEffect(() => {
    if (!isRoot || typeof value?._id !== "string") return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      for (const iframe of document.querySelectorAll("iframe")) {
        let origin: string;
        try {
          origin = new URL(iframe.src, window.location.href).origin;
        } catch {
          continue;
        }
        if (origin === PREVIEW_ORIGIN) {
          iframe.contentWindow?.postMessage({ type: "oms/live-document", document: value }, PREVIEW_ORIGIN);
        }
      }
    });
  }, [isRoot, value]);

  return props.renderDefault(props);
}
