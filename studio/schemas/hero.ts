import { defineField, defineType, defineArrayMember } from "sanity";
import { BoltIcon } from "@sanity/icons";

export const heroType = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  icon: BoltIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
    }),
    defineField({
      name: "backgroundImage",
      type: "image",
      title: "Background Image",
    }),
    defineField({
      name: "cta",
      title: "Call to Action",
      type: "object",
      fields: [
        defineField({
          name: "title",
          type: "string",
          title: "Title",
        }),
        defineField({
          name: "link",
          type: "string",
          title: "Link",
        }),
      ],
    }),
  ],
});
