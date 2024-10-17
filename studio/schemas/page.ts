import { defineField, defineType, defineArrayMember } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "pageBuilder",
      type: "array",
      title: "Page builder",
      of: [
        defineArrayMember({
          name: "hero",
          type: "hero",
        }),
        defineArrayMember({
          name: "textSection",
          type: "textSection",
        }),
        defineArrayMember({
          name: "people",
          type: "peopleSection",
        }),
        defineArrayMember({
          name: "events",
          type: "eventsSection",
        }),
        defineArrayMember({
          name: "instagram",
          type: "instagramSection",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare({ title, slug }) {
      return {
        title: title || "Untitled",
        subtitle: slug,
        media: DocumentIcon,
      };
    },
  },
});
