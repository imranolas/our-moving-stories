import { getDraftId, getPublishedId, getVersionFromId, isDraftId, isVersionId, studioPath } from "@sanity/client/csm";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import { decodeSanityNodeData } from "@sanity/visual-editing-csm";
import { VERCEL_STEGA_REGEX, vercelStegaDecode } from "@vercel/stega";
import { STUDIO_ORIGINS } from "../sanity/lib/studio";

/**
 * Text that changes as the editor types. The Studio only reports edits once saved, so its form posts the
 * unsaved document to us on every change (studio/components/LivePreviewInput.tsx). The page is
 * server-rendered and can't re-render from that document, but every Sanity string on it ends in a stega
 * marker naming its document and field, so the matching text nodes are rewritten in place. Everything
 * else (images, lists, formatted text) waits for the refresh after the save (preview-refresh.ts).
 *
 * Only text rendered verbatim is rewritten: a node that shows the field's value, or a small edit of it (the
 * first keystroke). Formatted text, such as "*accent*" headings, doesn't match and is left alone.
 */

/** For how long after the last keystroke local text beats the server's HTML (which lags until saved). */
const HOLD_MS = 10_000;

type Source = { id: string; path: string };
const sources = new Map<string, Source | null>(); // stega payload → the field it marks
const latest = new Map<string, { doc: unknown; at: number }>(); // published id → newest unsaved copy
const shown = new WeakMap<Text, string>(); // text nodes known to show a field's value verbatim

export const readPerspectiveCookie = () => {
  const raw = document.cookie.match(new RegExp(`(?:^|; )${perspectiveCookieName}=([^;]*)`))?.[1];
  return raw && decodeURIComponent(raw);
};

/** The single stega payload ending a text node, and the field it marks. */
function sourceOf(text: string) {
  const matches = text.match(VERCEL_STEGA_REGEX);
  if (matches?.length !== 1 || !text.endsWith(matches[0])) return undefined;
  const payload = matches[0];
  let source = sources.get(payload);
  if (source === undefined) {
    const node = decodeSanityNodeData(vercelStegaDecode(payload) as Parameters<typeof decodeSanityNodeData>[0]);
    source = node && "id" in node && node.id && node.path ? { id: getPublishedId(node.id), path: node.path } : null;
    sources.set(payload, source);
  }
  return source ? { visible: text.slice(0, -payload.length), payload, source } : undefined;
}

/** The field's value in the unsaved copy, while that copy is fresh. */
function localValue(source: Source): string | undefined {
  const entry = latest.get(source.id);
  if (!entry || Date.now() - entry.at > HOLD_MS) return undefined;
  const value = studioPath.get(entry.doc, source.path);
  return typeof value === "string" ? value : undefined;
}

/** True when b differs from a by at most 3 characters in one place (a keystroke or two). */
function smallEdit(a: string, b: string) {
  if (!a) return false;
  const max = Math.min(a.length, b.length);
  let start = 0;
  while (start < max && a[start] === b[start]) start++;
  let end = 0;
  while (end < max - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++;
  return a.length - start - end <= 3 && b.length - start - end <= 3;
}

/** Rewrites every text node the unsaved copies cover. */
export function applyLocalEdits() {
  if (!latest.size) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const hit = sourceOf(node.data);
    const value = hit && localValue(hit.source);
    if (!hit || value === undefined) continue;
    if (hit.visible !== value) {
      if (shown.get(node) !== hit.visible && !smallEdit(hit.visible, value)) continue;
      node.data = value + hit.payload;
    }
    shown.set(node, value);
  }
}

/** For the refresh's morph: true if this node shows typing the server's (older) copy doesn't have yet. */
export function keepLocalText(current: Text, incoming: Text) {
  const hit = sourceOf(current.data);
  if (!hit || localValue(hit.source) !== hit.visible) return false;
  const next = sourceOf(incoming.data);
  return next?.payload === hit.payload && next.visible !== hit.visible;
}

/** Whether an edited draft (or release version) is what this page shows, given the editor's perspective. */
function inPerspective(id: string) {
  const perspective = readPerspectiveCookie() || "drafts";
  if (perspective === "published") return false;
  return isVersionId(id) ? perspective.split(",").includes(getVersionFromId(id)!) : isDraftId(id);
}

/** Listens for the Studio form's unsaved documents; returns a function that stops listening. */
export function startLiveText() {
  let frame = 0;
  let announced = false;
  const onMessage = (event: MessageEvent) => {
    // Only the Studio window framing this page.
    if (event.source !== window.parent || !STUDIO_ORIGINS.includes(event.origin)) return;
    const data = event.data as { type?: unknown; document?: { _id?: unknown } } | null;
    if (data?.type !== "oms/live-document" || typeof data.document?._id !== "string") return;
    // The form edits a draft or a release version; a bare id means the draft doesn't exist yet.
    const id = isDraftId(data.document._id) || isVersionId(data.document._id) ? data.document._id : getDraftId(data.document._id);
    if (!inPerspective(id)) return;
    if (!announced) console.info("[preview] Live typing connected to the Studio");
    announced = true;
    latest.set(getPublishedId(id), { doc: data.document, at: Date.now() });
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(applyLocalEdits);
  };
  addEventListener("message", onMessage);
  return () => {
    removeEventListener("message", onMessage);
    cancelAnimationFrame(frame);
  };
}
