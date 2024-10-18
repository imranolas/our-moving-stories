import { defineField, defineType, defineArrayMember } from "sanity";

export const settingsType = defineType({
  name: "settings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Site Title",
    }),

    defineField({
      name: "companyName",
      type: "string",
      title: "Company Name",
    }),

    defineField({
      name: "companyNumber",
      type: "string",
      title: "Company Number",
      validation: (Rule) => Rule.regex(/^\d{8}$/),
    }),

    defineField({
      name: "url",
      type: "url",
      title: "Site URL",
    }),

    defineField({
      name: "email",
      type: "email",
      title: "Contact Email",
    }),

    defineField({
      name: "instagram",
      type: "string",
      title: "Instagram",
    }),

    defineField({
      name: "beholdFeedUrl",
      type: "url",
      title: "Behold Feed URL",
    }),

    defineField({
      name: "gaId",
      type: "string",
      title: "Google Analytics ID",
    }),
  ],
});
