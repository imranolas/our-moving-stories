import { defineField, defineType, defineArrayMember } from "sanity";
import { CalendarIcon, UsersIcon } from "@sanity/icons";

export const eventsSectionType = defineType({
  name: "eventsSection",
  title: "Events Section",
  type: "object",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "events",
      title: "Latest Events",
      type: "number",
      description: "Number of events to show",
      initialValue: 3,
    }),
  ],
});
