import { defineField, defineType, defineArrayMember } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";

export const peopleSection = defineType({
  name: "peopleSection",
  title: "People Section",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Label",
      type: "string",
      description: "Small label above the heading. Default: The people.",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Heading above the team grid. Wrap words in *asterisks* for coral, e.g. 'A small, *mighty* team'.",
    }),
    defineField({
      name: "description",
      title: "Introduction",
      type: "text",
      rows: 3,
      description:
        "A short introductory paragraph displayed above the team grid.",
    }),
    defineField({
      name: "people",
      title: "People",
      type: "array",
      description: "Select and order team members to display in this section.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "person" }],
        }),
      ],
    }),
  ],
});
