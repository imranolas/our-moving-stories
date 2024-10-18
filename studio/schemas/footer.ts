import { defineField, defineType } from "sanity";

export const footerType = defineType({
  name: "footer",
  title: "Footer Links",
  type: "document",
  fields: [
    defineField({
      name: "items",
      type: "array",
      title: "Navigation items",
      of: [{ type: "navigationItem" }],
    }),

    defineField({
      name: "funders",
      type: "array",
      title: "Funders",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              type: "string",
              title: "Funder Name",
            }),
            defineField({
              name: "logo",
              type: "image",
              title: "Funder Logo",
              options: {
                hotspot: true,
              },
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Footer Links",
      };
    },
  },
});
