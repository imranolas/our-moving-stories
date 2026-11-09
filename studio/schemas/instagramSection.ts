import { defineField, defineType, defineArrayMember } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";

export const instagramSection = defineType({
  name: "instagramSection",
  title: "Instagram Section",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      description: "Toggle the Instagram feed section on or off.",
    }),
    defineField({
      name: "eyebrow",
      title: "Label",
      type: "string",
      description: "Default: On Instagram.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "Default: @our.movingstories.",
    }),
  ],
  preview: {
    select: {
      enabled: "enabled",
    },
    prepare({ enabled }) {
      return {
        title: `Instagram Section ${enabled ? "✅" : "❌"}`,
      };
    },
  },
});
