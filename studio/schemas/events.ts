import { defineField, defineType, defineArrayMember, type SanityDocument } from "sanity";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { SessionGeneratorInput } from "../components/SessionGenerator";

/** Fields the Eventbrite sync owns are read-only on synced events: edit them on Eventbrite instead. */
const fromEventbrite = ({ document }: { document?: SanityDocument }) => Boolean(document?.eventbriteId);
const SYNCED = "On events synced from Eventbrite, edit this on Eventbrite; it updates here within a minute.";

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Event Name",
      description: `The name of the event as it will appear on the site. ${SYNCED}`,
      readOnly: fromEventbrite,
    }),

    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description:
        "URL path for this event's detail page (auto-generated from name).",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "audience",
      type: "string",
      title: "Who it's for",
      description: "Short tag shown on the listing, e.g. 'Under-5s + grown-ups' or 'Everyone'.",
    }),

    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      title: "Summary",
      description: `One or two sentences shown under the title on the event page. ${SYNCED}`,
      readOnly: fromEventbrite,
    }),

    defineField({
      name: "photo",
      type: "image",
      title: "Card photo",
      description:
        "A photo from the sessions, used on listings and the event page. If empty, the poster is used instead.",
      options: { hotspot: true },
    }),

    defineField({
      name: "poster",
      type: "image",
      title: "Poster Image",
      description: `A promotional image or poster for the event. ${SYNCED} For a photo of your own, use the card photo.`,
      readOnly: fromEventbrite,
      fields: [
        // Which Eventbrite image this is, so the sync only uploads a new one when it changes.
        defineField({ name: "eventbriteId", type: "string", hidden: true }),
      ],
    }),

    defineField({
      name: "link",
      type: "url",
      title: "Booking Link",
      description:
        "External URL for tickets or registration (e.g. Eventbrite, Google Forms). Set by the Eventbrite sync on synced events.",
      readOnly: fromEventbrite,
    }),

    defineField({
      name: "eventbriteId",
      type: "string",
      title: "Eventbrite ID",
      description:
        "Set by the Eventbrite sync (workers/eventbrite-sync). The fields marked as coming from Eventbrite, and the sessions' dates and times, are kept in step with this Eventbrite event or series.",
      readOnly: true,
    }),
    defineField({
      name: "venue",
      type: "reference",
      title: "Venue",
      description: `Where the event takes place. Select from existing venues or create a new one. ${SYNCED} Synced events get a venue made from Eventbrite's.`,
      to: [{ type: "venue" }],
      readOnly: fromEventbrite,
    }),

    defineField({
      name: "description",
      type: "portableText",
      title: "Description",
      description: `Full description of the event, including what to expect and who it's for. ${SYNCED} (Eventbrite's "Overview").`,
      readOnly: fromEventbrite,
    }),

    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      description: `Questions and answers shown on the event page. ${SYNCED}`,
      readOnly: fromEventbrite,
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", type: "string", title: "Question", validation: (Rule) => Rule.required() }),
            defineField({ name: "answer", type: "text", rows: 3, title: "Answer", validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),

    defineField({
      name: "sessions",
      type: "array",
      title: "Sessions",
      description:
        "Individual session dates for this event. Use the generator to create dates from a recurrence pattern.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "date",
              type: "date",
              title: "Date",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "startTime",
              type: "string",
              title: "Start Time",
              description:
                "e.g. 09:30 (24h format).",
            }),
            defineField({
              name: "endTime",
              type: "string",
              title: "End Time",
              description:
                "e.g. 11:30 (24h format).",
            }),
            defineField({
              name: "note",
              type: "string",
              title: "Note",
              description:
                "Optional note for this session (e.g. 'Guest artist: Jane Doe').",
            }),
            defineField({
              name: "cancelled",
              type: "boolean",
              title: "Cancelled",
              description:
                "Mark this session as cancelled. It still appears, crossed out, with the note as the reason (e.g. 'Half term').",
              initialValue: false,
            }),
          ],
          preview: {
            select: { date: "date", note: "note", cancelled: "cancelled" },
            prepare({ date, note, cancelled }) {
              return {
                title: cancelled ? `[CANCELLED] ${date}` : date || "No date",
                subtitle: note || "",
              };
            },
          },
        }),
      ],
      components: {
        input: SessionGeneratorInput,
      },
    }),

    defineField({
      name: "info",
      type: "array",
      title: "Key details",
      description: "Rows such as Who / Access / Facilities shown on the event page. 'Where' and 'Cost' are added automatically.",
      of: [
        defineArrayMember({
          type: "object",
          name: "infoRow",
          fields: [
            defineField({ name: "label", type: "string", title: "Label", validation: (Rule) => Rule.required() }),
            defineField({ name: "value", type: "string", title: "Value", validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),

    defineField({
      name: "price",
      type: "number",
      title: "Price",
      description: `Ticket price in GBP. Leave at 0 or empty for free events. ${SYNCED}`,
      readOnly: fromEventbrite,
      validation: (Rule) => Rule.min(0) && Rule.precision(2),
    }),
  ],
});
