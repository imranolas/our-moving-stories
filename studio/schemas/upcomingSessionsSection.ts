import { defineField, defineType } from "sanity";
import { ClockIcon } from "@sanity/icons/Clock";

export const upcomingSessionsSectionType = defineType({
  name: "upcomingSessionsSection",
  title: "Upcoming Sessions Section",
  type: "object",
  icon: ClockIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Label",
      type: "string",
      description: "Small label above the heading. Default: Diary.",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Heading for the upcoming sessions list.",
      initialValue: "Upcoming sessions",
    }),
    defineField({
      name: "limit",
      title: "Max Sessions",
      type: "number",
      description: "Most sessions to show. Only sessions in the coming 7 days are listed; the section hides when there are none.",
      initialValue: 8,
      validation: (Rule) => Rule.min(1).max(50),
    }),
  ],
});
