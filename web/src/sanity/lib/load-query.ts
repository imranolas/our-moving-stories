import { type QueryParams } from "sanity";
import { sanityClient } from "sanity:client";

const isPreview = process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED;
const perspective = isPreview ? "previewDrafts" : "published";

export async function loadQuery<QueryResponse>({
  query,
  params,
}: {
  query: string;
  params?: QueryParams;
}) {
  const { result, resultSourceMap } = await sanityClient.fetch<QueryResponse>(
    query,

    params ?? {},
    {
      filterResponse: false,
      perspective,
      resultSourceMap: isPreview ? "withKeyArraySelector" : undefined,
    }
  );

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
  };
}
