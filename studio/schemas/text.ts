// ./schemas/textWithIllustration.js

import { TextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const textSectionType = defineType({
  name: "textSection",
  type: "object",
  title: "Text Section",
  fields: [
    defineField({
      name: "heading",
      type: "string",
    }),

    // Rich text field
    defineField({
      name: "excerpt",
      type: "portableText",
    }),

    defineField({
      name: "anchorId",
      type: "slug",
      title: "Anchor ID",
      options: {
        source: "heading",
      },
    }),
  ],

  icon: TextIcon,
});
