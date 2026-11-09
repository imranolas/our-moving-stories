import { defineField, defineType, defineArrayMember } from "sanity";
import { UserIcon } from "@sanity/icons/User";

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
      description: "The person's full name as it should appear on the site.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description:
        "URL path for this person's profile page (auto-generated from name).",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      type: "string",
      title: "Role",
      description: "E.g. Founder, Director, Facilitator, Artist, etc.",
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email",
      description: "Contact email (not displayed publicly, used for internal reference).",
    }),
    defineField({
      name: "excerpt",
      type: "text",
      title: "Short Bio",
      rows: 3,
      description:
        "A short summary (40-80 words) shown on the team card. If empty, the full bio will be truncated instead.",
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "bio",
      title: "Full Bio",
      type: "portableText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "profile",
      type: "image",
      title: "Profile Image",
      description:
        "A square headshot works best. Use the hotspot tool to set the focal point for cropping.",
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "qual",
      type: "array",
      title: "Qualifications",
      description: "Degrees, certifications, or professional memberships.",
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
      description: "Links to social media profiles displayed alongside this person.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
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
              description: "Username or handle without the @ symbol.",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "sortOrder",
      type: "number",
      title: "Sort Order",
      description:
        "Controls the display order on the site. Lower numbers appear first.",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
