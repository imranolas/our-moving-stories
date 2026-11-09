import { defineField, defineType, defineArrayMember } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";

export const venueType = defineType({
  name: "venue",
  title: "Venue",
  type: "document",
  description: "A physical location where events take place.",
  icon: PinIcon,
  groups: [
    {
      name: "location",
      title: "Location",
    },
  ],
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      description: "The venue name (e.g. Southall Community Centre).",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "address",
      title: "Address",
      type: "object",
      description: "Full postal address of the venue.",
      group: "location",
      fields: [
        { name: "address1", type: "string", title: "Address Line 1" },
        { name: "address2", type: "string", title: "Address Line 2" },
        { name: "city", type: "string", title: "City" },
        { name: "region", type: "string", title: "Region / County" },
        { name: "postalCode", type: "string", title: "Postcode" },
      ],
    },
    {
      name: "googleMapsLink",
      title: "Google Maps Link",
      type: "url",
      description: "A shareable Google Maps URL so visitors can find directions.",
      group: "location",
    },
    {
      name: "location",
      type: "geopoint",
      group: "location",
      description:
        "This can be used to display the location of the venue when using a mapping service",
    },
  ],
  preview: {
    select: {
      title: "name",
      address: "address",
    },
    prepare(selection) {
      const { title, address } = selection;

      const formattedAddress = Object.keys(address)
        .map((key) => address[key])
        .filter((e) => e.trim().length > 0)
        .join(", ");

      return {
        title: title,
        subtitle: formattedAddress,
      };
    },
  },
});
