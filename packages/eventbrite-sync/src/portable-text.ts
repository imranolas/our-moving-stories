/**
 * Eventbrite's event overview (HTML from its rich text editor) → Portable Text for Studio's `portableText`
 * type. Covers what that editor produces: paragraphs, headings, bullet and numbered lists, bold, italic,
 * underline, strikethrough, links and line breaks. Other tags keep their text and lose the formatting.
 * No DOM needed, so it runs in Workers. Keys come from position, so the same HTML always gives the same
 * blocks and the sync can compare them.
 */
export type Span = { _type: "span"; _key: string; text: string; marks: string[] };
export type LinkDef = { _type: "link"; _key: string; href: string };
export type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: LinkDef[];
  children: Span[];
  listItem?: "bullet" | "number";
  level?: number;
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, e: string) => {
    if (e[0] !== "#") return ENTITIES[e.toLowerCase()] ?? match;
    const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
    return code === 0xa0 ? " " : String.fromCodePoint(code);
  });

const DECORATORS: Record<string, string> = { strong: "strong", b: "strong", em: "em", i: "em", u: "underline", s: "strike-through", strike: "strike-through", del: "strike-through" };
const STYLES: Record<string, string> = { p: "normal", div: "normal", h1: "h2", h2: "h2", h3: "h3", h4: "h4", h5: "h4", h6: "h4", blockquote: "blockquote" };
const attr = (attrs: string, name: string) => decode(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(attrs)?.slice(2).find((v) => v !== undefined) ?? "");

export function htmlToPortableText(html: string): Block[] {
  const blocks: Block[] = [];
  const lists: ("bullet" | "number")[] = [];
  const inline: { tag: string; mark?: string; href?: string }[] = [];
  let style = "normal";
  let inItem = false;
  let parts: { text: string; marks: string[]; href?: string }[] = [];

  function flush() {
    // Trim the edges, drop empty pieces, merge neighbours with the same formatting.
    const pieces = parts.map((p) => ({ ...p }));
    parts = [];
    while (pieces.length && !pieces[0].text.replace(/^[ \n]+/, "")) pieces.shift();
    while (pieces.length && !pieces[pieces.length - 1].text.replace(/[ \n]+$/, "")) pieces.pop();
    if (!pieces.length) return;
    pieces[0].text = pieces[0].text.replace(/^[ \n]+/, "");
    pieces[pieces.length - 1].text = pieces[pieces.length - 1].text.replace(/[ \n]+$/, "");

    const _key = `b${blocks.length}`;
    const block: Block = { _type: "block", _key, style: inItem ? "normal" : style, markDefs: [], children: [] };
    if (inItem && lists.length) Object.assign(block, { listItem: lists[lists.length - 1], level: lists.length });
    for (const piece of pieces) {
      const marks = [...new Set(piece.marks)];
      if (piece.href) {
        let def = block.markDefs.find((d) => d.href === piece.href);
        if (!def) block.markDefs.push((def = { _type: "link", _key: `${_key}l${block.markDefs.length}`, href: piece.href }));
        marks.push(def._key);
      }
      const prev = block.children[block.children.length - 1];
      if (prev && prev.marks.join() === marks.join()) prev.text += piece.text;
      else block.children.push({ _type: "span", _key: `${_key}s${block.children.length}`, text: piece.text, marks });
    }
    blocks.push(block);
  }

  for (const [, close, rawTag, attrs, text] of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi)) {
    if (text !== undefined) {
      const clean = decode(text.replace(/\s+/g, " "));
      if (clean.trim() || parts.length) {
        const href = [...inline].reverse().find((i) => i.href)?.href;
        parts.push({ text: clean, marks: inline.flatMap((i) => (i.mark ? [i.mark] : [])), href });
      }
      continue;
    }
    const tag = rawTag.toLowerCase();
    if (tag === "br") {
      if (parts.length) parts.push({ text: "\n", marks: [] });
    } else if (tag === "ul" || tag === "ol") {
      flush();
      if (close) lists.pop();
      else lists.push(tag === "ul" ? "bullet" : "number");
      inItem = false;
    } else if (tag === "li") {
      flush();
      inItem = !close;
    } else if (tag in STYLES) {
      // A paragraph inside a list item is part of the item.
      if (inItem && (tag === "p" || tag === "div")) continue;
      flush();
      style = close ? "normal" : STYLES[tag];
    } else if (tag in DECORATORS || tag === "a") {
      if (close) {
        const i = inline.map((x) => x.tag).lastIndexOf(tag);
        if (i >= 0) inline.splice(i, 1);
      } else {
        const href = tag === "a" ? attr(attrs, "href") : undefined;
        inline.push({ tag, mark: DECORATORS[tag], href: href && /^(https?:|mailto:|tel:)/i.test(href) ? href : undefined });
      }
    }
  }
  flush();
  return blocks;
}
