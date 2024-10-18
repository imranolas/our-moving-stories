import { type QueryParams } from "sanity";
import { sanityClient } from "sanity:client";

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
      resultSourceMap: "withKeyArraySelector",
    }
  );

  return {
    data: result,
    sourceMap: resultSourceMap,
  };
}
