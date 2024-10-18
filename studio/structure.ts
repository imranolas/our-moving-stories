import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Base")
    .items([
      // list all document types except 'siteSettings'
      ...S.documentTypeListItems().filter(
        (item) => !["settings", "footer", "nav"].includes(item.getId())
      ),
      S.divider(),

      S.listItem().title("Settings").id("settings").child(
        // Instead of rendering a list of documents, we render a single
        // document, specifying the `documentId` manually to ensure
        // that we're editing the single instance of the document
        S.document().schemaType("settings").documentId("settings")
      ),

      S.listItem()
        .title("Footer Links")
        .id("footer")
        .child(S.document().schemaType("footer").documentId("footer")),

      S.listItem()
        .title("Main Navigation")
        .id("nav")
        .child(S.document().schemaType("nav").documentId("nav")),
    ]);
