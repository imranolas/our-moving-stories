import { validation } from "sanity";

export default {
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    {
      title: "Internal Link",
      name: "internalLink",
      description: "Select pages for navigation",
      type: "object",
      fields: [
        {
          name: "reference",
          title: "Reference",
          type: "reference",
          to: [{ type: "page" }],
        },
        {
          name: "anchor",
          title: "Anchor",
          type: "string",
          description: "Use the ID of the element you want to link to",
        },
      ],
    },
    {
      name: "externalUrl",
      title: "External URL",
      description: "Use fully qualified URLS for external link",
      type: "url",
    },
  ],
};
