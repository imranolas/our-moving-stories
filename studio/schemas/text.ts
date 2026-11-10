import { TextIcon } from "@sanity/icons/Text";
import { defineArrayMember, defineField, defineType } from "sanity";

export const textSectionType = defineType({
  name: "textSection",
  type: "object",
  title: "Text Section",
  icon: TextIcon,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Label",
      description: "Small label above the heading, e.g. 'About'.",
    }),
    defineField({
      name: "heading",
      type: "string",
      title: "Heading",
      description: "Wrap words in *asterisks* to make them coral, e.g. 'Made by people, *for people.*'",
    }),
    defineField({
      name: "excerpt",
      type: "portableText",
      title: "Content",
      description: "The main body text for this section.",
    }),
    defineField({
      name: "theme",
      type: "string",
      title: "Colour",
      options: {
        list: [
          { title: "Cream", value: "cream" },
          { title: "Purple", value: "purple" },
          { title: "Dark", value: "dark" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "cream",
    }),
    defineField({
      name: "layout",
      type: "string",
      title: "Layout",
      description: "Side by side suits short intros; stacked suits long text such as policies.",
      options: {
        list: [
          { title: "Heading beside text", value: "split" },
          { title: "Stacked", value: "stacked" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "pillars",
      type: "array",
      title: "Highlights",
      description: "Big statement rows under the text, e.g. 'Always free'.",
      of: [
        defineArrayMember({
          type: "object",
          name: "pillar",
          fields: [
            defineField({ name: "title", type: "string", title: "Statement", validation: (Rule) => Rule.required() }),
            defineField({ name: "text", type: "string", title: "Supporting line" }),
            defineField({ name: "accent", type: "boolean", title: "Coral", initialValue: false }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
    }),
    defineField({
      name: "anchorId",
      type: "slug",
      title: "Anchor ID",
      description: "Used for in-page links (e.g. #about). Auto-generated from the heading.",
      options: { source: "heading" },
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
    prepare: ({ title, subtitle }) => ({ title: (title || "Text").replace(/\*/g, ""), subtitle: subtitle || "Text section" }),
  },
});
