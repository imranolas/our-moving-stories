import { defineField, defineType, defineArrayMember } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),

    defineField({
      name: "poster",
      type: "image",
    }),

    defineField({
      name: "link",
      type: "url",
    }),

    defineField({
      name: "venue",
      type: "reference",
      to: [{ type: "venue" }],
    }),

    defineField({
      name: "description",
      type: "array",
      of: [{ type: "block" }],
    }),

    defineField({
      name: "startDate",
      type: "datetime",
      title: "Start Date & Time",
    }),

    defineField({
      name: "endDate",
      type: "datetime",
      title: "End Date & Time",
    }),

    defineField({
      name: "isRecurring",
      type: "boolean",
      title: "Recurring Event",
    }),

    // Optional field
    defineField({
      name: "recurrence",
      title: "Recurrence",
      type: "object",
      hidden: ({ parent }) => !parent.isRecurring,
      fields: [
        defineField({
          name: "frequency",
          type: "string",
          options: {
            list: [
              { title: "Daily", value: "daily" },
              { title: "Weekly", value: "weekly" },
              { title: "Monthly", value: "monthly" },
              { title: "Yearly", value: "yearly" },
            ],
          },
        }),
        defineField({
          name: "interval",
          type: "number",
          description:
            "The interval between recurrences. For example, an interval of 2 with a frequency of weekly means every 2 weeks.",
        }),
        defineField({
          name: "endDate",
          type: "date",
          description: "The end date of the recurrence.",
        }),
      ],
    }),

    defineField({
      name: "price",
      type: "number",
      validation: (Rule) => Rule.min(0) && Rule.precision(2),
    }),
  ],
});
