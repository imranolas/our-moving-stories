import { stegaClean } from "@sanity/client/stega";

/**
 * In draft mode (Studio's Presentation tool) every Sanity string ends in an invisible "stega" payload of
 * zero-width characters that powers click-to-edit. One of them, U+FEFF, counts as whitespace for trim() and
 * \s, so trimming or collapsing whitespace corrupts it. Split it off, work on the visible text, re-attach it.
 * Outside draft mode the payload is always "".
 */
const STEGA_TAIL = /[​‌‍﻿]{4,}$/;
export function splitStega(text = ""): [visible: string, payload: string] {
  const m = STEGA_TAIL.exec(text);
  return m ? [text.slice(0, m.index), m[0]] : [text, ""];
}

/** trim() that keeps the stega payload. Returns "" when there's no visible text. */
export function trimVisible(text = ""): string {
  const [visible, payload] = splitStega(text);
  const trimmed = visible.trim();
  return trimmed ? trimmed + payload : "";
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text = ""): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/**
 * Editors mark the words they want in coral by wrapping them in asterisks,
 * e.g. "Made by people, *for people.*". Returns safe HTML.
 */
export function highlight(text = "", className = "text-coral"): string {
  return escapeHtml(text).replace(
    /\*([^*]+)\*/g,
    (_, inner) => `<span class="${className}">${inner}</span>`
  );
}

/** Splits "Lead words *Highlight.*" into its two parts. The stega payload stays on the lead (or the accent). */
export function splitHighlight(text = ""): { lead: string; accent: string } {
  const [visible, payload] = splitStega(text);
  const m = visible.match(/^(.*?)\s*\*([^*]+)\*\s*$/s);
  if (!m) return { lead: visible.replace(/\*/g, "") + payload, accent: "" };
  const lead = m[1].replace(/\*/g, "");
  return lead ? { lead: lead + payload, accent: m[2] } : { lead, accent: m[2] + payload };
}

export function stripStars(text = ""): string {
  return text.replace(/\*/g, "");
}

/** Shortens text to at most `max` characters at a word boundary (for meta descriptions, so no stega). */
export function clip(text = "", max = 155): string {
  const t = stegaClean(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

/** Decorative leaves, cycled through so neighbouring items differ. */
export const LEAVES = [
  { src: "/img/leaves/leaf-3.svg", rot: 24 },
  { src: "/img/leaves/leaf-1.svg", rot: -18 },
  { src: "/img/leaves/leaf-5.svg", rot: 30 },
  { src: "/img/leaves/leaf-6.svg", rot: -26 },
  { src: "/img/leaves/leaf-2.svg", rot: 20 },
  { src: "/img/leaves/leaf-4.svg", rot: -30 },
];

export const leaf = (i: number) => LEAVES[((i % LEAVES.length) + LEAVES.length) % LEAVES.length];
