import { defineField, defineType, defineArrayMember } from "sanity";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { UsersIcon } from "@sanity/icons/Users";

export const eventsSectionType = defineType({
  name: "eventsSection",
  title: "Events Section",
  type: "object",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Label",
      type: "string",
      description: "Small label above the heading. Default: What's on.",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Heading, e.g. 'Coming up'. Wrap words in *asterisks* for coral.",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 2,
      description: "Short line beside the heading.",
    }),
    defineField({
      name: "events",
      title: "Latest Events",
      type: "number",
      description:
        "No longer used: the list now shows every session in the next two weeks (see EventsSection.astro).",
      initialValue: 3,
      // Kept so existing documents stay valid; hidden because the site ignores it.
      hidden: true,
    }),
  ],
});
