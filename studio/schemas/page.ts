import { defineField, defineType, defineArrayMember } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";

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
      description: "The page title, shown in the browser tab and used for SEO.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description:
        "The URL path for this page (e.g. 'about' becomes /about). Use 'index' for the homepage.",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoTitle",
      type: "string",
      title: "SEO title",
      description:
        "Optional. The full title shown in search results and browser tabs (about 60 characters). Leave empty to use “Title · Our Moving Stories”.",
      validation: (Rule) => Rule.max(70).warning("Search results cut titles off at about 60 characters."),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Meta Description",
      description:
        "Short description for search engines and social sharing (recommended 120-160 characters).",
      rows: 3,
    }),

    defineField({
      name: "pageBuilder",
      type: "array",
      title: "Page Builder",
      description: "Add and arrange content sections to build the page layout.",
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
          name: "upcomingSessions",
          type: "upcomingSessionsSection",
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
