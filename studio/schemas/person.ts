import { defineField, defineType, defineArrayMember } from "sanity";
import { UserIcon } from "@sanity/icons";

export const personType = defineType({
  name: "person",
  title: "Person",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Full Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      type: "string",
      title: "Role",
      description: "E.g. Founder, Director, Facilitator, etc.",
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email",
    }),

    // Rich text field
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      validation: (Rule) => Rule.required(),
      of: [
        {
          type: "block",
        },
      ],
    }),
    defineField({
      name: "profile",
      type: "image",
      title: "Profile Image",
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "qual",
      type: "array",
      title: "Qualifications",
      of: [
        defineArrayMember({
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "social",
      type: "array",
      title: "Social Media",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            // Platform should be a select field
            defineField({
              name: "platform",
              type: "string",
              title: "Platform",
              options: {
                list: [
                  { title: "Twitter", value: "twitter" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                ],
              },
            }),
            defineField({
              name: "handle",
              type: "string",
              title: "Handle",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "sortOrder",
      type: "number",
      title: "Sort Order",
      description: "Used to sort the list of people.",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
