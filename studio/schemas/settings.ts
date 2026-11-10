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
      description: "The title shown in browser tabs and search engine results.",
    }),

    defineField({
      name: "companyName",
      type: "string",
      title: "Company Name",
      description: "Full registered company name, displayed in the footer.",
    }),

    defineField({
      name: "companyNumber",
      type: "string",
      title: "Company Number",
      description: "8-digit Companies House registration number.",
      validation: (Rule) => Rule.regex(/^\d{8}$/),
    }),

    defineField({
      name: "url",
      type: "url",
      title: "Site URL",
      description: "The live website URL (e.g. https://ourmovingstories.org). Used for SEO and canonical links.",
    }),

    defineField({
      name: "email",
      type: "email",
      title: "Contact Email",
      description: "Public contact email displayed on the site and linked in the footer.",
    }),

    defineField({
      name: "instagram",
      type: "string",
      title: "Instagram Handle",
      description: "Instagram username without the @ symbol.",
    }),

    defineField({
      name: "gaId",
      type: "string",
      title: "Google Analytics ID",
      description: "Measurement ID for Google Analytics (e.g. G-XXXXXXXXXX).",
    }),
  ],
});
