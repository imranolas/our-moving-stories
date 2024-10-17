// ./schemas/textWithIllustration.js

import { ImageIcon, TextIcon } from "@sanity/icons";
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
      type: "array",
      of: [
        {
          type: "block",
        },
      ],
    }),
  ],

  icon: TextIcon,
});
