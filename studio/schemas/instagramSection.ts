import { defineField, defineType, defineArrayMember } from "sanity";
import { UsersIcon } from "@sanity/icons";

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
