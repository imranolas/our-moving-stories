import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { googleMapsInput } from "@sanity/google-maps-input";
import { structure } from "./structure";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
} from "sanity/presentation";

export const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;
export const dataset = process.env.SANITY_STUDIO_DATASET!;

// Define the actions that should be available for singleton documents
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

// Define the singleton document types
export const singletonTypes = new Set(["settings", "footer", "nav"]);

export default defineConfig({
  name: "our-moving-stories",
  title: "Our Moving Stories",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure,
    }),
    presentationTool({
      previewUrl:
        process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:4321",
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/:slug",
            filter: `_type == "page" && slug.current == $slug`,
            resolve: (doc) => ({
              title: doc?.title,
              description: doc?.description,
            }),
          },
          {
            route: "/",
            filter: `_type == "page" && slug.current == "index"`,
          },
        ]),
        locations: {
          page: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title,
                  href: doc?.slug === "index" ? "/" : `/${doc?.slug}`,
                },
              ],
            }),
          }),
        },
      },
    }),
    visionTool(),
    googleMapsInput({
      apiKey: process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY!,
      defaultLocation: {
        lat: 51.5074,
        lng: 0.1278,
      },
    }),
  ],
  schema: {
    types: schemaTypes,

    // Filter out singleton types from the global “New document” menu options
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // For singleton types, filter out actions that are not explicitly included
    // in the `singletonActions` list defined above
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
