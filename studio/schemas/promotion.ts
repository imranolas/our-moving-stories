// ./schemas/promotionType.ts

import { StarIcon } from "@sanity/icons/Star";
import { defineField, defineType } from "sanity";

export const promotionType = defineType({
  name: "promotion",
  type: "object",
  title: "Promotion",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Promotional headline or message text.",
    }),
    defineField({
      name: "link",
      type: "url",
      title: "Link",
      description: "URL the promotion links to (e.g. a booking page or event).",
    }),
  ],
  icon: StarIcon,
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Untitled",
        subtitle: "Promotion",
        media: StarIcon,
      };
    },
  },
});
