import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { googleMapsInput } from "@sanity/google-maps-input";
import { structure } from "./structure";
import { LivePreviewInput } from "./components/LivePreviewInput";
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
    visionTool(),
    presentationTool({
      // The site, framed. Presentation calls previewMode.enable (web/src/pages/api/draft-mode/enable.ts)
      // first, which turns draft mode on for this editor only. Set SANITY_STUDIO_PREVIEW_URL to the
      // deployed site when running `sanity deploy`.
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:4321",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/:slug",
            filter: `_type == "page" && slug.current == $slug`,
          },
          {
            route: "/",
            filter: `_type == "page" && slug.current == "index"`,
          },
          {
            route: "/events/:slug",
            filter: `_type == "event" && slug.current == $slug`,
          },
          {
            route: "/people/:slug",
            filter: `_type == "person" && slug.current == $slug`,
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
          event: defineLocations({
            select: { name: "name", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                ...(doc?.slug ? [{ title: doc.name || "Event", href: `/events/${doc.slug}` }] : []),
                { title: "Events", href: "/events" },
                { title: "Sessions", href: "/sessions" },
              ],
            }),
          }),
          person: defineLocations({
            select: { name: "name", slug: "slug.current" },
            resolve: (doc) =>
              doc?.slug ? { locations: [{ title: doc.name || "Person", href: `/people/${doc.slug}` }] } : null,
          }),
        },
      },
    }),
    googleMapsInput({
      apiKey: process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY!,
      defaultLocation: {
        lat: 51.5074,
        lng: 0.1278,
      },
    }),
  ],
  // Streams unsaved edits to the Presentation preview as you type (see the component).
  form: { components: { input: LivePreviewInput } },

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
