import { defineField, defineType } from "sanity";

export const footerType = defineType({
  name: "footer",
  title: "Footer Links",
  type: "document",
  fields: [
    defineField({ name: "contactEyebrow", type: "string", title: "Contact label", description: "Default: Get in touch." }),
    defineField({
      name: "contactHeading",
      type: "string",
      title: "Contact heading",
      description: "Wrap words in *asterisks* for coral. Default: 'Bring movement to your *community.*'",
    }),
    defineField({ name: "contactText", type: "text", rows: 3, title: "Contact text" }),
    defineField({ name: "newsletterHeading", type: "string", title: "Newsletter heading", description: "Default: Stay in the loop." }),
    defineField({ name: "newsletterText", type: "string", title: "Newsletter text" }),
    defineField({
      name: "partnersLine",
      type: "string",
      title: "Partners line",
      description: "e.g. 'In partnership with Peabody & Ealing Council · Supported by National Lottery & London Sport'. Defaults to the funder names.",
    }),
    defineField({
      name: "items",
      type: "array",
      title: "Footer Links",
      description: "Navigation links displayed in the site footer.",
      of: [{ type: "navigationItem" }],
    }),

    defineField({
      name: "funders",
      type: "array",
      title: "Funders",
      description: "Logos and names of funding organisations displayed in the footer.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              type: "string",
              title: "Funder Name",
              description: "Name of the funding organisation.",
            }),
            defineField({
              name: "logo",
              type: "image",
              title: "Funder Logo",
              description:
                "Logo image, shown as-is on the dark footer: use a transparent PNG or SVG, in the version made for dark backgrounds (often white or \"reversed\").",
              options: {
                hotspot: true,
              },
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Footer Links",
      };
    },
  },
});
