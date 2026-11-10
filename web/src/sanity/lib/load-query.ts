import type { QueryParams, StegaConfig } from "@sanity/client";
import { SANITY_READ_TOKEN } from "astro:env/server";
import { sanityClient } from "sanity:client";
import type { Preview } from "./draft-mode";
import { STUDIO_URL } from "./studio";

/**
 * Stega hides invisible source markers in strings, which breaks any string the code compares or parses.
 * The client's default filter already skips slugs, URLs, dates, `layout`, `theme`, `*type*` and similar;
 * these are the extra fields this site's code parses or puts in attributes (times, link anchors, section ids,
 * social handles). A match anywhere in the path counts, so `anchorId.current` is covered too.
 */
const NOT_STEGA = new Set(["startTime", "endTime", "anchor", "anchorId", "instagram", "platform", "handle"]);
const stega: StegaConfig = {
  enabled: true,
  studioUrl: STUDIO_URL,
  filter: (props) =>
    !props.sourcePath.some((segment) => typeof segment === "string" && NOT_STEGA.has(segment)) &&
    props.filterDefault(props),
};

/**
 * Every Sanity read goes through here. `preview` is Astro.locals.preview: undefined means published content
 * from the CDN; set (draft mode, see draft-mode.ts) means uncached reads of the editor's perspective, with
 * stega for Visual Editing. It's required, so a new caller can't forget it; pass undefined to always read
 * published content.
 */
export async function loadQuery<QueryResponse>({
  query,
  params,
  preview,
}: {
  query: string;
  params?: QueryParams;
  preview: Preview | undefined;
}) {
  const client = preview
    ? sanityClient.withConfig({ token: SANITY_READ_TOKEN, perspective: preview.perspective, useCdn: false, stega })
    : sanityClient;
  const { result } = await client.fetch<QueryResponse>(query, params ?? {}, { filterResponse: false });
  return { data: result };
}
