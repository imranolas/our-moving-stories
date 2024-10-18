import { defineField, defineType } from "sanity";

export const navType = defineType({
  name: "nav",
  title: "Main Navigation",
  type: "document",
  fields: [
    defineField({
      name: "items",
      type: "array",
      title: "Navigation items",
      of: [{ type: "navigationItem" }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Main Navigation",
      };
    },
  },
});
