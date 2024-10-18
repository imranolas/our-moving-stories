import { defineField, defineType, defineArrayMember } from "sanity";
import { UsersIcon } from "@sanity/icons";

export const peopleSection = defineType({
  name: "peopleSection",
  title: "People Section",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "people",
      title: "People",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "person" }],
        }),
      ],
    }),
  ],
});
